import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "node:crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Security & Crypto Secrets Configuration (Server-Side Authority)
const SESSION_SECRET = process.env.SESSION_SECRET || "docupulse_secure_session_secret_2026_fallback";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@docupulse.io").trim().toLowerCase();

// Default admin password SHA256 hash for secure server-side constant-time comparison
// Precomputed SHA256 of "Admin@DocuPulse2026!"
const DEFAULT_ADMIN_HASH = "8f399f6d713cfa018bb9cefb9b87a419eb8bbbb8579ad04e578c7b8e5a794e77";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;

// Stripe Client (Lazy Initialization)
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }
  return stripeClient;
}

/**
 * Creates an HMAC signed session token for a given user identifier and plan
 */
function createSignedToken(userId: string, email: string, role: "user" | "admin", plan: "free" | "pro" | "business"): string {
  const payload = JSON.stringify({
    uid: userId,
    em: email,
    rl: role,
    pl: plan,
    iat: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `dp_${encodedPayload}.${signature}`;
}

/**
 * Validates an HMAC signed session token
 */
function verifySignedToken(token: string): { valid: boolean; payload?: { uid: string; em: string; rl: "user" | "admin"; pl: "free" | "pro" | "business"; iat: number } } {
  if (!token || !token.startsWith("dp_")) return { valid: false };
  const parts = token.substring(3).split(".");
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// -----------------------------------------------------------------------------
// SERVER-AUTHORITATIVE IN-MEMORY QUOTA & RATE LIMITING ENGINE
// Zero Trust on Client: browser state is never considered authoritative.
// -----------------------------------------------------------------------------

interface QuotaRecord {
  ip: string;
  plan: "free" | "pro" | "business";
  usedToday: number;
  lastResetDate: string;
  totalConversions: number;
  lastActive: number;
}

const quotaStore = new Map<string, QuotaRecord>();

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Periodic memory purge of stale quota records (every 6 hours)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  for (const [key, record] of quotaStore.entries()) {
    if (now - record.lastActive > maxAge) {
      quotaStore.delete(key);
    }
  }
}, 6 * 60 * 60 * 1000);

function getClientIdentifier(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const rawToken = authHeader.substring(7).trim();
    // Verify cryptographic HMAC signature
    const verification = verifySignedToken(rawToken);
    if (verification.valid && verification.payload) {
      return `user:${verification.payload.uid}`;
    }
  }

  // Fallback to real client IP (Protected against arbitrary Bearer header rotation)
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket.remoteAddress || "127.0.0.1";
  return `ip:${ip}`;
}

function getOrCreateQuota(clientId: string, defaultPlan: "free" | "pro" | "business" = "free"): QuotaRecord {
  const today = getTodayString();
  let record = quotaStore.get(clientId);

  if (!record) {
    record = {
      ip: clientId,
      plan: defaultPlan,
      usedToday: 0,
      lastResetDate: today,
      totalConversions: 0,
      lastActive: Date.now(),
    };
    quotaStore.set(clientId, record);
  } else {
    record.lastActive = Date.now();
    if (record.lastResetDate !== today) {
      record.usedToday = 0;
      record.lastResetDate = today;
    }
  }

  return record;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: 500,
  business: 5000,
};

// Rate limiting map for DoS protection (Requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(limit: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    let clientRate = rateLimitMap.get(clientId);

    if (!clientRate || now > clientRate.resetTime) {
      clientRate = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(clientId, clientRate);
    } else {
      clientRate.count++;
      if (clientRate.count > limit) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please slow down your requests.",
          retryAfterSeconds: Math.ceil((clientRate.resetTime - now) / 1000),
        });
      }
    }
    next();
  };
}

// -----------------------------------------------------------------------------
// AI CLIENT INITIALIZATION
// -----------------------------------------------------------------------------
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "DocuPulse SaaS Server",
    version: "2.5.0",
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
    activeSessions: quotaStore.size,
  });
});

// Authoritative Quota Check Endpoint
app.get("/api/user/quota", rateLimiter(120), (req, res) => {
  const clientId = getClientIdentifier(req);
  const quota = getOrCreateQuota(clientId);
  const limit = PLAN_LIMITS[quota.plan] || 3;
  const remaining = Math.max(0, limit - quota.usedToday);

  res.json({
    authoritative: true,
    clientId,
    plan: quota.plan,
    usedToday: quota.usedToday,
    dailyLimit: limit,
    remaining,
    isAllowed: remaining > 0,
    resetsAt: `${getTodayString()}T23:59:59.999Z`,
  });
});

// Authoritative Quota Consume Endpoint
app.post("/api/user/quota/consume", rateLimiter(60), (req, res) => {
  const clientId = getClientIdentifier(req);
  const quota = getOrCreateQuota(clientId);
  const limit = PLAN_LIMITS[quota.plan] || 3;

  if (quota.usedToday >= limit) {
    return res.status(403).json({
      error: "Daily conversion quota exhausted.",
      plan: quota.plan,
      usedToday: quota.usedToday,
      limit,
      upgradeRequired: quota.plan === "free",
    });
  }

  quota.usedToday++;
  quota.totalConversions++;

  return res.json({
    success: true,
    usedToday: quota.usedToday,
    remaining: limit - quota.usedToday,
    limit,
  });
});

// Session & Auth Verification (Strict Server Authority & Role Protection)
app.post("/api/auth/session", rateLimiter(30), (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address format." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isTargetingAdmin = normalizedEmail === ADMIN_EMAIL || normalizedEmail === "camarabadraalicamara@gmail.com";

  let role: "user" | "admin" = "user";
  let plan: "free" | "pro" | "business" = "free";

  // If targeting administrator access, password must be strictly verified on server
  if (isTargetingAdmin) {
    if (!password || typeof password !== "string") {
      return res.status(401).json({
        error: "Administrator authentication requires a valid password.",
        code: "AUTH_REQUIRED",
      });
    }

    const providedHash = crypto.createHash("sha256").update(password.trim()).digest("hex");
    const providedBuffer = Buffer.from(providedHash);
    const expectedBuffer = Buffer.from(ADMIN_PASSWORD_HASH);

    const isMatch = providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid administrator credentials. Access denied.",
        code: "INVALID_CREDENTIALS",
      });
    }

    role = "admin";
    plan = "business";
  }

  const userId = `usr_${role === "admin" ? "admin_001" : crypto.randomBytes(6).toString("hex")}`;
  const token = createSignedToken(userId, normalizedEmail, role, plan);

  const clientId = `user:${userId}`;
  const quota = getOrCreateQuota(clientId, plan);
  quota.plan = plan;

  return res.json({
    success: true,
    token,
    user: {
      id: userId,
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0],
      role,
      plan,
      createdAt: new Date().toISOString(),
    },
    quota: {
      usedToday: quota.usedToday,
      dailyLimit: PLAN_LIMITS[plan],
      plan,
    },
  });
});

// Authoritative Stripe Checkout Intent Setup
app.post("/api/billing/create-checkout-session", rateLimiter(20), async (req: Request, res: Response) => {
  const { plan = "pro", billingInterval = "monthly" } = req.body;

  if (!["pro", "business"].includes(plan)) {
    return res.status(400).json({ error: "Invalid subscription plan selected." });
  }

  const clientId = getClientIdentifier(req);
  const quota = getOrCreateQuota(clientId);
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const unitPrice = plan === "pro" 
    ? (billingInterval === "annual" ? 84 : 9) 
    : (billingInterval === "annual" ? 228 : 24);

  const stripe = getStripe();

  // If Stripe is configured with live/test API keys, create real Stripe Checkout Session
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `DocuPulse ${plan === "pro" ? "Pro" : "Business / Enterprise"}`,
                description: `Full access to all PDF tools, batch conversions, and unlimited AI OCR (${billingInterval}).`,
              },
              unit_amount: unitPrice * 100, // Amount in cents
              recurring: {
                interval: billingInterval === "annual" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        client_reference_id: clientId,
        metadata: {
          clientId,
          userId: clientId.replace(/^(user:|token:|ip:)/, ""),
          plan,
          billingInterval,
        },
        subscription_data: {
          metadata: {
            clientId,
            userId: clientId.replace(/^(user:|token:|ip:)/, ""),
            plan,
            billingInterval,
          },
        },
        success_url: `${appUrl}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?billing=cancel`,
      });

      return res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        plan,
        currentPlan: quota.plan,
        billingInterval,
        amount: unitPrice,
        currency: "usd",
        isLiveStripe: true,
        message: `Stripe Checkout session initialized for ${plan.toUpperCase()}.`,
      });
    } catch (err: any) {
      console.error("[Stripe Checkout Error]", err);
      return res.status(500).json({
        error: "Failed to create Stripe checkout session.",
        details: err.message,
      });
    }
  }

  // Fallback response when STRIPE_SECRET_KEY is not yet provided in runtime configuration
  return res.json({
    success: true,
    sessionId: `cs_test_${crypto.randomBytes(12).toString("hex")}`,
    plan,
    currentPlan: quota.plan,
    billingInterval,
    amount: unitPrice,
    currency: "usd",
    isLiveStripe: false,
    message: `Stripe sandbox ready. Add STRIPE_SECRET_KEY in Settings to enable live payments. Plan upgrade requires verified payment.`,
  });
});

// Authoritative Stripe Webhook Listener with Cryptographic Signature Verification
app.post("/api/billing/webhook", async (req: any, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  if (!stripe || !webhookSecret) {
    console.warn("[Stripe Webhook] Received webhook call, but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is unconfigured.");
    return res.status(200).json({ received: true, note: "Webhook received in passive mode." });
  }

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header." });
  }

  let event: Stripe.Event;
  try {
    const rawBodyBuffer = Buffer.isBuffer(req.body) ? req.body : req.rawBody;
    event = stripe.webhooks.constructEvent(rawBodyBuffer, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook Error] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Authoritative event handling
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.client_reference_id || session.metadata?.clientId;
        const plan = (session.metadata?.plan as "pro" | "business") || "pro";

        if (clientId) {
          const quota = getOrCreateQuota(clientId, plan);
          quota.plan = plan;
          console.log(`[Stripe Webhook] Verified payment! Upgraded ${clientId} to ${plan.toUpperCase()}`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientId = subscription.metadata?.clientId;
        if (clientId) {
          const quota = getOrCreateQuota(clientId, "free");
          quota.plan = "free";
          console.log(`[Stripe Webhook] Subscription canceled. Downgraded ${clientId} to FREE`);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        console.log("[Stripe Webhook] Invoice payment confirmed:", (event.data.object as any).id);
        break;
      }
      case "invoice.payment_failed": {
        console.warn("[Stripe Webhook] Invoice payment failed:", (event.data.object as any).id);
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook] Error processing event:", err);
    return res.status(500).json({ error: "Internal webhook processing error" });
  }
});

// Customer Billing Portal Session
app.post("/api/billing/create-portal-session", rateLimiter(10), async (req: Request, res: Response) => {
  const { customerId } = req.body;
  const stripe = getStripe();
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!stripe) {
    return res.status(400).json({ error: "Stripe is not configured on this server." });
  }

  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId." });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/`,
    });
    return res.json({ url: portalSession.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// AI OCR & Text Extraction Endpoint (Protected by Quota & Server Authority)
app.post("/api/ai/ocr", rateLimiter(30), async (req, res) => {
  try {
    const clientId = getClientIdentifier(req);
    const quota = getOrCreateQuota(clientId);
    const limit = PLAN_LIMITS[quota.plan] || 3;

    if (quota.usedToday >= limit) {
      return res.status(403).json({
        error: "Daily conversion quota exhausted. Please upgrade to Pro for unlimited AI OCR.",
        plan: quota.plan,
        usedToday: quota.usedToday,
        limit,
      });
    }

    const { imageBase64, mimeType = "image/png", task = "ocr", language = "auto" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 document payload" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return explicit server error without synthetic business data
      return res.status(503).json({
        error: "AI Service Unavailable",
        details: "Google Gemini API key is not configured on the server. Please set GEMINI_API_KEY in server environment.",
      });
    }

    // Deduct quota atomically upon verified execution
    quota.usedToday++;
    quota.totalConversions++;

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");

    const systemPrompt = "You are DocuPulse AI, an advanced high-accuracy Document Intelligence and OCR engine. Extract all readable text accurately, preserving headings, bullet points, and tables in clean Markdown format.";
    let userPrompt = "Perform high-precision optical character recognition (OCR) on this document image. Return the complete extracted text in clean Markdown.";

    if (task === "summarize") {
      userPrompt = "Analyze this document image. Extract the key content and provide a comprehensive, structured executive summary with key takeaways and action items.";
    } else if (task === "table") {
      userPrompt = "Extract all tabular and numerical data from this document image into structured Markdown tables or formatted CSV.";
    } else if (task === "translate") {
      userPrompt = `Extract the text from this document image and translate it accurately into ${language || "English"}. Provide both the translation and structural layout.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const extractedText = response.text || "";

    return res.json({
      success: true,
      text: extractedText,
      task,
      timestamp: new Date().toISOString(),
      remainingQuota: limit - quota.usedToday,
    });
  } catch (error: any) {
    console.error("AI OCR error:", error);
    return res.status(500).json({
      error: "Failed to process document with AI",
      details: error?.message || "Unknown error",
    });
  }
});

// AI Document Summarizer / Text Q&A Endpoint
app.post("/api/ai/analyze-text", rateLimiter(30), async (req, res) => {
  try {
    const clientId = getClientIdentifier(req);
    const quota = getOrCreateQuota(clientId);
    const limit = PLAN_LIMITS[quota.plan] || 3;

    if (quota.usedToday >= limit) {
      return res.status(403).json({
        error: "Daily AI analysis quota exhausted.",
        plan: quota.plan,
        usedToday: quota.usedToday,
        limit,
      });
    }

    const { text, action = "summarize", targetLanguage = "Spanish" } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Missing text content for analysis." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "AI Service Unavailable",
        details: "Google Gemini API key is not configured on the server.",
      });
    }

    quota.usedToday++;
    quota.totalConversions++;

    let prompt = `Analyze this document text and provide a concise summary with key bullet points:\n\n${text}`;
    if (action === "translate") {
      prompt = `Translate the following document text into ${targetLanguage}, preserving professional tone and layout:\n\n${text}`;
    } else if (action === "proofread") {
      prompt = `Proofread and polish the following document text for grammar, clarity, and professional tone:\n\n${text}`;
    } else if (action === "extract_action_items") {
      prompt = `Extract all action items, deliverables, and deadlines from this text in a clear checklist:\n\n${text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      result: response.text || "",
      remainingQuota: limit - quota.usedToday,
    });
  } catch (error: any) {
    console.error("AI text analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze document text",
      details: error?.message || "Unknown error",
    });
  }
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DocuPulse SaaS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
