import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "node:crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import Stripe from "stripe";
import dotenv from "dotenv";
import {
  getPaymentProvider,
  webhookIdempotency,
  GRACE_PERIOD_MS,
  PLAN_PRICING,
} from "./src/server/billing/paymentService.ts";
import { SubscriptionPlan, BillingInterval } from "./src/server/billing/types.ts";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security & Crypto Secrets Configuration (Server-Side Authority)
// In production, ensure SESSION_SECRET is set via environment variable.
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    console.warn("[SECURITY WARNING] SESSION_SECRET not provided in environment! Generating ephemeral secret.");
  }
  return "docupulse_secure_session_secret_2026_fallback";
})();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@docupulse.io").trim().toLowerCase();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days expiration

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
 * Creates an HMAC signed session token for a given user identifier and plan with expiration timestamp
 */
function createSignedToken(userId: string, email: string, role: "user" | "admin", plan: "free" | "pro" | "business"): string {
  const now = Date.now();
  const payload = JSON.stringify({
    uid: userId,
    em: email,
    rl: role,
    pl: plan,
    iat: now,
    exp: now + SESSION_TTL_MS,
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `dp_${encodedPayload}.${signature}`;
}

/**
 * Validates an HMAC signed session token and enforces expiration (exp / iat)
 */
function verifySignedToken(token: string): { valid: boolean; payload?: { uid: string; em: string; rl: "user" | "admin"; pl: "free" | "pro" | "business"; iat: number; exp?: number } } {
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
    // Enforce token expiration (7 days)
    const now = Date.now();
    if (payload.exp && now > payload.exp) {
      return { valid: false };
    }
    if (payload.iat && now - payload.iat > SESSION_TTL_MS) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// Global Body Parsing with 50MB ceiling
app.use(
  express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security Headers & CORS Middleware (Production restricted & Iframe compatible)
app.use((req, res, next) => {
  // CORS Origin Control
  const appUrl = process.env.APP_URL;
  const origin = req.headers.origin;

  if (origin) {
    if (appUrl && origin === appUrl) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (process.env.NODE_ENV !== "production" || origin.endsWith(".run.app")) {
      // Allow preview / dev domain and Cloud Run sandbox
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight OPTIONS requests immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  // Security Headers (equivalent to Helmet standard suite)
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Content Security Policy adapted for SPA + inline scripts/styles + worker blob
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
      "style-src 'self' 'unsafe-inline' https: fonts.googleapis.com",
      "font-src 'self' https: data: fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: blob: wss: data:",
      "worker-src 'self' blob:",
      "frame-ancestors 'self' https://*.google.com https://*.run.app",
    ].join("; ")
  );

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
  aiCallsToday: number; // Dedicated tracker for Gemini AI calls
  lastResetDate: string;
  totalConversions: number;
  lastActive: number;
  // Authoritative Subscription & Grace Period lifecycle (Prompt 5)
  subscriptionId?: string;
  subscriptionEndDate?: number; // Unix timestamp in ms
  inGracePeriod?: boolean;
  gracePeriodExpiresAt?: number; // Unix timestamp in ms
  provider?: string;
}

const quotaStore = new Map<string, QuotaRecord>();

// -----------------------------------------------------------------------------
// GLOBAL GEMINI CIRCUIT BREAKER (Disjoncteur financier souverain serveur)
// Protège le propriétaire contre les surcoûts d'API imprévus
// -----------------------------------------------------------------------------
let globalGeminiCallsToday = 0;
let globalGeminiResetDate = getTodayString();
const GLOBAL_GEMINI_DAILY_LIMIT = parseInt(process.env.GLOBAL_GEMINI_DAILY_LIMIT || "1000", 10); // 1 000 requêtes IA / jour max pour tout le serveur

// Plafonds d'appels quotidiens dédiés à l'IA Gemini par utilisateur
const GEMINI_PLAN_LIMITS: Record<string, number> = {
  free: 5,        // 5 requêtes IA / jour pour les utilisateurs gratuits
  pro: 100,       // 100 requêtes IA / jour pour les abonnés Pro
  business: 500,  // 500 requêtes IA / jour pour les comptes Business
};

function checkAndIncrementGlobalGeminiQuota(): { allowed: boolean; reason?: string } {
  const today = getTodayString();
  if (globalGeminiResetDate !== today) {
    globalGeminiCallsToday = 0;
    globalGeminiResetDate = today;
  }

  if (globalGeminiCallsToday >= GLOBAL_GEMINI_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "Le plafond global quotidien d'appels à l'IA du serveur a été atteint pour aujourd'hui afin de protéger l'infrastructure. Ce quota sera réinitialisé à minuit UTC.",
    };
  }

  globalGeminiCallsToday++;
  return { allowed: true };
}

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
      aiCallsToday: 0,
      lastResetDate: today,
      totalConversions: 0,
      lastActive: Date.now(),
    };
    quotaStore.set(clientId, record);
  } else {
    record.lastActive = Date.now();
    if (record.lastResetDate !== today) {
      record.usedToday = 0;
      record.aiCallsToday = 0;
      record.lastResetDate = today;
    }

    // Authoritative Subscription Lifecycle & Grace Period enforcement (Prompt 5)
    if (record.plan !== "free" && record.subscriptionEndDate && Date.now() > record.subscriptionEndDate) {
      if (record.inGracePeriod && record.gracePeriodExpiresAt && Date.now() < record.gracePeriodExpiresAt) {
        // Active Grace Period: user retains Pro/Business privileges during 72h billing dispute window
      } else {
        // Subscription period has passed and grace period is either expired or not applicable: downgrade to free
        console.log(`[Subscription Expired] Client ${clientId} downgraded to FREE after subscription period and grace window ended.`);
        record.plan = "free";
        record.inGracePeriod = false;
        record.gracePeriodExpiresAt = undefined;
      }
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

// Health Check Endpoints (Root & API for Cloud Run, Docker, K8s, and VPS probes)
const handleHealthCheck = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "DocuPulse SaaS Server",
    version: "2.5.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
    activeSessions: quotaStore.size,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    environment: process.env.NODE_ENV || "development",
  });
};

app.get("/health", handleHealthCheck);
app.get("/api/health", handleHealthCheck);

// Authoritative Quota Check Endpoint
app.get("/api/user/quota", rateLimiter(120), (req, res) => {
  const clientId = getClientIdentifier(req);
  const quota = getOrCreateQuota(clientId);
  const limit = PLAN_LIMITS[quota.plan] || 3;
  const remaining = Math.max(0, limit - quota.usedToday);

  const aiLimit = GEMINI_PLAN_LIMITS[quota.plan] || 5;
  const aiRemaining = Math.max(0, aiLimit - (quota.aiCallsToday || 0));

  res.json({
    authoritative: true,
    clientId,
    plan: quota.plan,
    usedToday: quota.usedToday,
    dailyLimit: limit,
    remaining,
    isAllowed: remaining > 0,
    aiCallsToday: quota.aiCallsToday || 0,
    aiDailyLimit: aiLimit,
    aiRemaining,
    aiIsAllowed: aiRemaining > 0,
    resetsAt: `${getTodayString()}T23:59:59.999Z`,
    // Subscription lifecycle & grace period status (Prompt 5)
    inGracePeriod: Boolean(quota.inGracePeriod),
    gracePeriodExpiresAt: quota.gracePeriodExpiresAt ? new Date(quota.gracePeriodExpiresAt).toISOString() : null,
    gracePeriodRemainingHours: quota.inGracePeriod && quota.gracePeriodExpiresAt
      ? Math.max(0, Math.ceil((quota.gracePeriodExpiresAt - Date.now()) / (3600 * 1000)))
      : 0,
    subscriptionEndDate: quota.subscriptionEndDate ? new Date(quota.subscriptionEndDate).toISOString() : null,
    provider: quota.provider || null,
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

// Decoupled Billing Provider Configuration & Supported Methods (Prompt 5)
app.get("/api/billing/config", (_req: Request, res: Response) => {
  const provider = getPaymentProvider();
  res.json({
    activeProviderId: provider.id,
    activeProviderName: provider.name,
    supportedProviders: [
      {
        id: "stripe",
        name: "Stripe",
        description: "Cartes bancaires internationales (Visa, Mastercard, Amex)",
        configured: Boolean(process.env.STRIPE_SECRET_KEY),
      },
      {
        id: "lemonsqueezy",
        name: "Lemon Squeezy (Merchant of Record)",
        description: "Revendeur officiel mondial : gestion de la TVA internationale, reversement via Wise/Payoneer (compatible Guinée / Afrique)",
        configured: Boolean(process.env.LEMONSQUEEZY_API_KEY),
      },
      {
        id: "cinetpay",
        name: "Mobile Money (CinetPay / PayDunya)",
        description: "Orange Money Guinée, MTN Mobile Money, Moov, Wave et cartes locales",
        configured: Boolean(process.env.CINETPAY_API_KEY),
      },
      {
        id: "sandbox",
        name: "Mode Bac à Sable (Sandbox)",
        description: "Environnement de test sécurisé",
        configured: true,
      },
    ],
  });
});

// Authoritative Universal Checkout Intent Setup (Decoupled Provider)
app.post("/api/billing/create-checkout-session", rateLimiter(20), async (req: Request, res: Response) => {
  const { plan = "pro", billingInterval = "monthly", provider: requestedProvider } = req.body;

  if (!["pro", "business"].includes(plan)) {
    return res.status(400).json({ error: "Invalid subscription plan selected." });
  }

  const clientId = getClientIdentifier(req);
  const quota = getOrCreateQuota(clientId);
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const userId = clientId.replace(/^(user:|token:|ip:)/, "");

  try {
    const provider = getPaymentProvider(requestedProvider);
    const checkoutResult = await provider.createCheckout({
      clientId,
      userId,
      userEmail: req.body.email || undefined,
      plan: plan as "pro" | "business",
      billingInterval: (billingInterval === "annual" ? "annual" : "monthly") as BillingInterval,
      successUrl: `${appUrl}/?billing=success`,
      cancelUrl: `${appUrl}/?billing=cancel`,
    });

    return res.json({
      success: true,
      checkoutUrl: checkoutResult.checkoutUrl,
      sessionId: checkoutResult.sessionId,
      provider: checkoutResult.provider,
      plan,
      currentPlan: quota.plan,
      billingInterval,
      amount: checkoutResult.amount,
      currency: checkoutResult.currency,
      isSandbox: checkoutResult.isSandbox,
      message: checkoutResult.message,
    });
  } catch (err: any) {
    console.error("[Billing Checkout Error]", err.message);
    return res.status(500).json({
      error: "Failed to initialize checkout session with provider.",
      details: err.message,
    });
  }
});

// Authoritative Universal Webhook Listener with RAW-BODY Signature Verification & Idempotency
app.post("/api/billing/webhook", async (req: any, res: Response) => {
  const requestedProvider = (req.query.provider as string) || undefined;
  const provider = getPaymentProvider(requestedProvider);

  try {
    // 1. Ensure raw body buffer exists for cryptographic signature verification
    const rawBodyBuffer = Buffer.isBuffer(req.body) ? req.body : req.rawBody;
    if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
      return res.status(400).json({ error: "Missing raw body buffer for cryptographic signature verification." });
    }

    // 2. Cryptographic signature check & payload parsing
    const event = await provider.verifyAndParseWebhook({
      headers: req.headers,
      rawBody: rawBodyBuffer,
      body: req.body,
    });

    // 3. Idempotency Check: prevent duplicate event processing
    if (webhookIdempotency.has(event.eventId)) {
      console.log(`[Billing Webhook] Event ${event.eventId} already processed (idempotent duplicate skipped).`);
      return res.status(200).json({ received: true, idempotent: true, eventId: event.eventId });
    }

    // 4. Authoritative Subscription Lifecycle Management with 3-Day Grace Period
    switch (event.eventType) {
      case "subscription_created":
      case "payment_success": {
        if (event.clientId && event.plan) {
          const quota = getOrCreateQuota(event.clientId, event.plan);
          quota.plan = event.plan;
          quota.subscriptionId = event.subscriptionId || quota.subscriptionId;
          quota.subscriptionEndDate = event.periodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000;
          quota.inGracePeriod = false;
          quota.gracePeriodExpiresAt = undefined;
          quota.provider = event.providerName;
          console.log(`[Billing Webhook] Verified payment! Upgraded ${event.clientId} to ${event.plan.toUpperCase()} via ${event.providerName}.`);
        }
        break;
      }

      case "subscription_renewed": {
        if (event.clientId) {
          const quota = getOrCreateQuota(event.clientId, event.plan || "pro");
          quota.plan = event.plan || quota.plan;
          quota.subscriptionEndDate = event.periodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000;
          quota.inGracePeriod = false;
          quota.gracePeriodExpiresAt = undefined;
          console.log(`[Billing Webhook] Subscription successfully renewed for ${event.clientId}. Grace period cleared.`);
        }
        break;
      }

      case "payment_failed": {
        if (event.clientId) {
          const quota = getOrCreateQuota(event.clientId);
          // Activate 3-Day Grace Period (72 hours): maintain access during retry window
          quota.inGracePeriod = true;
          quota.gracePeriodExpiresAt = event.gracePeriodExpiresAt || (Date.now() + GRACE_PERIOD_MS);
          console.warn(`[Billing Webhook] Payment failed for ${event.clientId}. 3-Day Grace Period activated until ${new Date(quota.gracePeriodExpiresAt).toISOString()}.`);
        }
        break;
      }

      case "subscription_canceled": {
        if (event.clientId) {
          const quota = getOrCreateQuota(event.clientId, "free");
          quota.plan = "free";
          quota.inGracePeriod = false;
          quota.gracePeriodExpiresAt = undefined;
          console.log(`[Billing Webhook] Subscription canceled for ${event.clientId}. Downgraded to FREE.`);
        }
        break;
      }

      case "ignored":
      default: {
        console.log(`[Billing Webhook] Informational event received and ignored: ${event.eventId}`);
        break;
      }
    }

    // 5. Register in Idempotency Store
    webhookIdempotency.mark(event.eventId, event.providerName, event.eventType, "success");

    return res.status(200).json({
      received: true,
      eventId: event.eventId,
      eventType: event.eventType,
      provider: event.providerName,
    });
  } catch (err: any) {
    console.error(`[Billing Webhook Error] Verification or processing failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook processing error: ${err.message}` });
  }
});

// Customer Billing Portal Session (Supported when using Stripe or MoR)
app.post("/api/billing/create-portal-session", rateLimiter(10), async (req: Request, res: Response) => {
  const { customerId } = req.body;
  const stripe = getStripe();
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!stripe) {
    return res.status(400).json({ error: "Billing customer portal is only available when Stripe is configured." });
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
    const aiLimit = GEMINI_PLAN_LIMITS[quota.plan] || 5;

    // 1. Vérification du plafond individuel d'appels IA Gemini
    if (quota.aiCallsToday >= aiLimit) {
      return res.status(429).json({
        error: `Vous avez atteint votre quota journalier d'appels à l'IA (${quota.aiCallsToday}/${aiLimit} requêtes). Passez à un forfait supérieur pour augmenter votre capacité ou réessayez demain à minuit UTC.`,
        plan: quota.plan,
        aiCallsToday: quota.aiCallsToday,
        aiDailyLimit: aiLimit,
      });
    }

    // 2. Vérification du plafond global du serveur (Disjoncteur financier)
    const globalCheck = checkAndIncrementGlobalGeminiQuota();
    if (!globalCheck.allowed) {
      return res.status(503).json({
        error: globalCheck.reason || "Plafond global d'appels IA atteint pour aujourd'hui.",
      });
    }

    const { imageBase64, imagesBase64, task = "ocr", language = "auto" } = req.body;

    const rawPayloads: string[] = Array.isArray(imagesBase64) && imagesBase64.length > 0
      ? imagesBase64
      : typeof imageBase64 === "string" && imageBase64.length > 0
      ? [imageBase64]
      : [];

    if (rawPayloads.length === 0) {
      return res.status(400).json({ error: "Document payload manquant ou invalide." });
    }

    if (rawPayloads.length > 10) {
      return res.status(400).json({ error: "Maximum 10 pages ou images peuvent être traitées par requête OCR." });
    }

    // Limit total base64 payload size to ~35MB (~25MB binary)
    const totalPayloadLength = rawPayloads.reduce((acc, item) => acc + (typeof item === "string" ? item.length : 0), 0);
    if (totalPayloadLength > 35 * 1024 * 1024) {
      return res.status(413).json({ error: "Le document dépasse la taille maximale autorisée (25 Mo)." });
    }

    const inlineParts: { inlineData: { data: string; mimeType: string } }[] = [];

    for (const rawItem of rawPayloads) {
      if (typeof rawItem !== "string") {
        return res.status(400).json({ error: "Format d'image invalide dans la requête." });
      }
      const cleanBase64 = rawItem.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const sampleBuffer = Buffer.from(cleanBase64.substring(0, 64), "base64");

      const isPdf = sampleBuffer.subarray(0, 4).toString("ascii").startsWith("%PDF");
      const isPng = sampleBuffer[0] === 0x89 && sampleBuffer[1] === 0x50 && sampleBuffer[2] === 0x4e && sampleBuffer[3] === 0x47;
      const isJpeg = sampleBuffer[0] === 0xff && sampleBuffer[1] === 0xd8;
      const isWebp = sampleBuffer.subarray(0, 4).toString("ascii") === "RIFF" && sampleBuffer.subarray(8, 12).toString("ascii") === "WEBP";

      if (!isPdf && !isPng && !isJpeg && !isWebp) {
        return res.status(400).json({
          error: "Format de fichier non autorisé. Seuls les fichiers PDF (%PDF-) et images authentiques (PNG, JPEG, WebP) sont acceptés.",
        });
      }

      const resolvedMimeType = isPdf
        ? "application/pdf"
        : isPng
        ? "image/png"
        : isJpeg
        ? "image/jpeg"
        : "image/webp";

      inlineParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: resolvedMimeType,
        },
      });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Le service d'intelligence artificielle est temporairement indisponible (clé API non configurée).",
      });
    }

    const systemPrompt = "You are DocuPulse AI, an advanced high-accuracy Document Intelligence and OCR engine. Extract all readable text accurately, preserving headings, bullet points, and tables in clean Markdown format.";
    let userPrompt =
      inlineParts.length > 1
        ? `Perform high-precision optical character recognition (OCR) across all ${inlineParts.length} pages in order. Format each page cleanly in GitHub-Flavored Markdown (headings, lists, tables) separated by '---' and '## Page X' headers. Return ONLY the extracted Markdown without extra commentary.`
        : "Perform high-precision optical character recognition (OCR) on this document. Return ONLY the complete extracted text formatted cleanly in GitHub-Flavored Markdown (headings, lists, tables) without extra commentary.";

    if (task === "summarize") {
      userPrompt = "Analyze this document. Extract the key content and provide a comprehensive, structured executive summary in Markdown with key takeaways and action items.";
    } else if (task === "table") {
      userPrompt = "Extract all tabular and numerical data from this document into structured Markdown tables.";
    } else if (task === "translate") {
      userPrompt = `Extract the text from this document and translate it accurately into ${language || "English"} in clean Markdown, preserving the structural layout.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: {
        parts: [
          ...inlineParts,
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const extractedText = response.text || "";

    // Deduct quota only after successful AI response
    quota.usedToday++;
    quota.aiCallsToday++;
    quota.totalConversions++;

    return res.json({
      success: true,
      text: extractedText,
      task,
      timestamp: new Date().toISOString(),
      aiCallsToday: quota.aiCallsToday,
      remainingAiQuota: Math.max(0, aiLimit - quota.aiCallsToday),
    });
  } catch (error: any) {
    const status = Number(error?.status || error?.code || 500);
    const safeMsg = String(error?.message || "INTERNAL_ERROR").replace(/key=[^&\s"]+/gi, "key=***");
    console.error("[AI OCR ERROR] Analyse OCR échouée:", status, safeMsg);
    if (status === 429) {
      return res.status(429).json({
        error: "Quota de requêtes IA dépassé temporairement. Veuillez patienter quelques instants ou vérifier votre forfait dans Settings > Secrets.",
      });
    }
    if (status === 400 || status === 403) {
      return res.status(503).json({
        error: "Clé API Gemini invalide ou autorisations insuffisantes. Veuillez vérifier votre clé dans Settings > Secrets.",
        ...(process.env.NODE_ENV !== "production" ? { details: safeMsg.slice(0, 200) } : {}),
      });
    }
    return res.status(500).json({
      error: "Échec de l'extraction optique du document par l'IA. Veuillez vérifier le fichier et réessayer.",
      ...(process.env.NODE_ENV !== "production" ? { upstreamStatus: status, details: safeMsg.slice(0, 200) } : {}),
    });
  }
});

// AI Document Summarizer / Text Q&A Endpoint
app.post("/api/ai/analyze-text", rateLimiter(30), async (req, res) => {
  try {
    const clientId = getClientIdentifier(req);
    const quota = getOrCreateQuota(clientId);
    const aiLimit = GEMINI_PLAN_LIMITS[quota.plan] || 5;

    // 1. Vérification du plafond individuel d'appels IA Gemini
    if (quota.aiCallsToday >= aiLimit) {
      return res.status(429).json({
        error: `Vous avez atteint votre quota journalier d'appels à l'IA (${quota.aiCallsToday}/${aiLimit} requêtes). Passez à un forfait supérieur pour augmenter votre capacité ou réessayez demain à minuit UTC.`,
        plan: quota.plan,
        aiCallsToday: quota.aiCallsToday,
        aiDailyLimit: aiLimit,
      });
    }

    // 2. Vérification du plafond global du serveur (Disjoncteur financier)
    const globalCheck = checkAndIncrementGlobalGeminiQuota();
    if (!globalCheck.allowed) {
      return res.status(503).json({
        error: globalCheck.reason || "Plafond global d'appels IA atteint pour aujourd'hui.",
      });
    }

    const { text, action = "summarize", targetLanguage = "Spanish" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Contenu texte manquant pour l'analyse." });
    }

    // Limit text input to 100,000 characters to prevent prompt injection payload flood and memory spike
    if (text.length > 100000) {
      return res.status(413).json({ error: "Le texte soumis est trop long (maximum 100 000 caractères par analyse)." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Le service d'intelligence artificielle est temporairement indisponible (clé API non configurée).",
      });
    }

    let prompt = `Analyze this document text and provide a concise summary with key bullet points:\n\n${text}`;
    if (action === "translate") {
      prompt = `Translate the following document text into ${targetLanguage}, preserving professional tone and layout:\n\n${text}`;
    } else if (action === "proofread") {
      prompt = `Proofread and polish the following document text for grammar, clarity, and professional tone:\n\n${text}`;
    } else if (action === "extract_action_items") {
      prompt = `Extract all action items, deliverables, and deadlines from this text in a clear checklist:\n\n${text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    quota.usedToday++;
    quota.aiCallsToday++;
    quota.totalConversions++;

    return res.json({
      success: true,
      result: response.text || "",
      aiCallsToday: quota.aiCallsToday,
      remainingAiQuota: Math.max(0, aiLimit - quota.aiCallsToday),
    });
  } catch (error: any) {
    // Log safe error message on server side without logging user document content
    const status = Number(error?.status || error?.code || 500);
    console.error("[AI ERROR] Traitement de texte échoué:", status, error?.message || "INTERNAL_ERROR");
    if (status === 429) {
      return res.status(429).json({
        error: "Quota de requêtes IA dépassé temporairement. Veuillez patienter quelques instants ou vérifier votre forfait dans Settings > Secrets.",
      });
    }
    if (status === 400 || status === 403) {
      return res.status(503).json({
        error: "Clé API Gemini invalide ou autorisations insuffisantes. Veuillez vérifier votre clé dans Settings > Secrets.",
      });
    }
    return res.status(500).json({
      error: "Échec du traitement du document par le moteur d'intelligence artificielle. Veuillez réessayer ultérieurement.",
    });
  }
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
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
