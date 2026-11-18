import crypto from "node:crypto";
import Stripe from "stripe";
import {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
  WebhookRequest,
  WebhookEventResult,
  SubscriptionStatusResult,
  SubscriptionPlan,
  BillingInterval,
} from "./types.js";

// Duration constants
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days grace period (72 hours)
export const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Pricing lookup in USD
export const PLAN_PRICING: Record<"pro" | "business", Record<BillingInterval, number>> = {
  pro: {
    monthly: 9,
    annual: 84, // $7/month billed annually
  },
  business: {
    monthly: 24,
    annual: 228, // $19/month billed annually
  },
};

// -----------------------------------------------------------------------------
// IDEMPOTENCY STORE
// Prevents duplicate processing of replayed or retried webhooks
// -----------------------------------------------------------------------------
interface ProcessedEvent {
  processedAt: number;
  provider: string;
  eventType: string;
  status: "success" | "ignored" | "failed";
}

class WebhookIdempotencyStore {
  private events = new Map<string, ProcessedEvent>();
  private readonly MAX_EVENTS = 5000;
  private readonly RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  public has(eventId: string): boolean {
    const entry = this.events.get(eventId);
    if (!entry) return false;
    // Check if expired
    if (Date.now() - entry.processedAt > this.RETENTION_MS) {
      this.events.delete(eventId);
      return false;
    }
    return true;
  }

  public get(eventId: string): ProcessedEvent | undefined {
    return this.events.get(eventId);
  }

  public mark(eventId: string, provider: string, eventType: string, status: "success" | "ignored" | "failed"): void {
    if (this.events.size >= this.MAX_EVENTS) {
      // Purge oldest 500 entries
      let purged = 0;
      for (const key of this.events.keys()) {
        this.events.delete(key);
        purged++;
        if (purged >= 500) break;
      }
    }
    this.events.set(eventId, {
      processedAt: Date.now(),
      provider,
      eventType,
      status,
    });
  }
}

export const webhookIdempotency = new WebhookIdempotencyStore();

// -----------------------------------------------------------------------------
// 1. STRIPE PAYMENT PROVIDER
// -----------------------------------------------------------------------------
export class StripePaymentProvider implements PaymentProvider {
  public readonly id = "stripe";
  public readonly name = "Stripe Payments";
  private stripeClient: Stripe | null = null;

  private getClient(): Stripe | null {
    if (!this.stripeClient && process.env.STRIPE_SECRET_KEY) {
      this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia" as any,
      });
    }
    return this.stripeClient;
  }

  public isAvailable(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }

  public async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const stripe = this.getClient();
    const unitPrice = PLAN_PRICING[params.plan][params.billingInterval];

    if (!stripe) {
      throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY in environment.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `DocuPulse ${params.plan === "pro" ? "Pro" : "Business / Entreprise"}`,
              description: `Accès illimité aux outils PDF, conversions par lots et OCR IA haute résolution (${params.billingInterval === "annual" ? "Annuel" : "Mensuel"}).`,
            },
            unit_amount: unitPrice * 100,
            recurring: {
              interval: params.billingInterval === "annual" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: params.clientId,
      customer_email: params.userEmail,
      metadata: {
        clientId: params.clientId,
        userId: params.userId,
        plan: params.plan,
        billingInterval: params.billingInterval,
      },
      subscription_data: {
        metadata: {
          clientId: params.clientId,
          userId: params.userId,
          plan: params.plan,
          billingInterval: params.billingInterval,
        },
      },
      success_url: `${params.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
    });

    return {
      success: true,
      checkoutUrl: session.url || undefined,
      sessionId: session.id,
      provider: this.id,
      amount: unitPrice,
      currency: "usd",
      plan: params.plan,
      billingInterval: params.billingInterval,
      isSandbox: false,
      message: `Session Stripe Checkout initialisée pour le forfait ${params.plan.toUpperCase()}.`,
    };
  }

  public async verifyAndParseWebhook(req: WebhookRequest): Promise<WebhookEventResult> {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = this.getClient();

    if (!stripe || !webhookSecret) {
      throw new Error("Stripe secret key or STRIPE_WEBHOOK_SECRET is unconfigured.");
    }

    if (!sig) {
      throw new Error("Missing stripe-signature header in webhook request.");
    }

    // Cryptographic signature check on RAW body buffer
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    const eventId = event.id;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.client_reference_id || (session.metadata?.clientId as string);
        const plan = ((session.metadata?.plan as SubscriptionPlan) || "pro");
        const billingInterval = ((session.metadata?.billingInterval as BillingInterval) || "monthly");
        const durationMs = billingInterval === "annual" ? YEAR_MS : MONTH_MS;

        return {
          success: true,
          eventId,
          eventType: "subscription_created",
          clientId,
          userEmail: session.customer_details?.email || undefined,
          plan,
          billingInterval,
          subscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          periodEnd: Date.now() + durationMs,
          inGracePeriod: false,
          providerName: this.name,
        };
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : undefined;
        const clientId = (invoice.subscription_details?.metadata?.clientId || invoice.metadata?.clientId) as string | undefined;
        const plan = ((invoice.subscription_details?.metadata?.plan || invoice.metadata?.plan) as SubscriptionPlan) || "pro";

        return {
          success: true,
          eventId,
          eventType: "subscription_renewed",
          clientId,
          subscriptionId,
          plan,
          periodEnd: Date.now() + MONTH_MS,
          inGracePeriod: false,
          providerName: this.name,
        };
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : undefined;
        const clientId = (invoice.subscription_details?.metadata?.clientId || invoice.metadata?.clientId) as string | undefined;
        const plan = ((invoice.subscription_details?.metadata?.plan || invoice.metadata?.plan) as SubscriptionPlan) || "pro";

        // Trigger 3-day grace period
        const gracePeriodExpiresAt = Date.now() + GRACE_PERIOD_MS;

        return {
          success: true,
          eventId,
          eventType: "payment_failed",
          clientId,
          subscriptionId,
          plan,
          inGracePeriod: true,
          gracePeriodExpiresAt,
          providerName: this.name,
          metadata: {
            reason: invoice.last_finalization_error?.message || "Card declined or insufficient funds",
          },
        };
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientId = subscription.metadata?.clientId;

        return {
          success: true,
          eventId,
          eventType: "subscription_canceled",
          clientId,
          subscriptionId: subscription.id,
          plan: "free",
          periodEnd: Date.now(),
          inGracePeriod: false,
          providerName: this.name,
        };
      }

      default:
        return {
          success: true,
          eventId,
          eventType: "ignored",
          providerName: this.name,
        };
    }
  }

  public async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    const stripe = this.getClient();
    if (!stripe) throw new Error("Stripe client unavailable");

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const plan = ((sub.metadata?.plan as SubscriptionPlan) || "pro");
    const currentPeriodEnd = (sub as any).current_period_end ? (sub as any).current_period_end * 1000 : Date.now() + MONTH_MS;
    const isPastDue = sub.status === "past_due";
    const gracePeriodExpiresAt = isPastDue ? currentPeriodEnd + GRACE_PERIOD_MS : undefined;

    return {
      status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
      plan,
      currentPeriodEnd,
      inGracePeriod: isPastDue,
      gracePeriodExpiresAt,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      provider: this.id,
    };
  }
}

// -----------------------------------------------------------------------------
// 2. MERCHANT OF RECORD PROVIDER (Lemon Squeezy / Paddle)
// Ideal for international domiciliation (Guinea, Africa, cross-border SaaS)
// Handles global sales tax, VAT, compliance, and pays out via Wise/Payoneer
// -----------------------------------------------------------------------------
export class MerchantOfRecordProvider implements PaymentProvider {
  public readonly id = "lemonsqueezy";
  public readonly name = "Lemon Squeezy / Paddle (Merchant of Record)";

  public isAvailable(): boolean {
    return Boolean(process.env.LEMONSQUEEZY_API_KEY || process.env.PADDLE_API_KEY);
  }

  public async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY || process.env.PADDLE_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env[`LEMONSQUEEZY_${params.plan.toUpperCase()}_VARIANT_ID`] || "mock_variant_id";
    const unitPrice = PLAN_PRICING[params.plan][params.billingInterval];

    if (!apiKey) {
      throw new Error("Merchant of Record provider is unconfigured. Missing LEMONSQUEEZY_API_KEY.");
    }

    try {
      // Direct call to Lemon Squeezy API v1
      const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              custom_price: unitPrice * 100,
              product_options: {
                redirect_url: `${params.successUrl}&provider=lemonsqueezy`,
              },
              checkout_data: {
                email: params.userEmail,
                custom: {
                  client_id: params.clientId,
                  user_id: params.userId,
                  plan: params.plan,
                  billing_interval: params.billingInterval,
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantId,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lemon Squeezy API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const checkoutUrl = data.data?.attributes?.url;

      return {
        success: true,
        checkoutUrl,
        sessionId: data.data?.id || `ls_${Date.now()}`,
        provider: this.id,
        amount: unitPrice,
        currency: "usd",
        plan: params.plan,
        billingInterval: params.billingInterval,
        isSandbox: false,
        message: `Session Merchant of Record créée pour ${params.plan.toUpperCase()}.`,
      };
    } catch (err: any) {
      console.error("[MoR Checkout Error]", err.message);
      throw err;
    }
  }

  public async verifyAndParseWebhook(req: WebhookRequest): Promise<WebhookEventResult> {
    const signature = (req.headers["x-signature"] || req.headers["paddle-signature"]) as string | undefined;
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing LEMONSQUEEZY_WEBHOOK_SECRET or PADDLE_WEBHOOK_SECRET.");
    }

    if (!signature) {
      throw new Error("Missing x-signature header.");
    }

    // Cryptographic HMAC SHA256 verification on rawBody
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error("Invalid Merchant of Record webhook signature.");
    }

    const payload = JSON.parse(req.rawBody.toString("utf8"));
    const eventName = payload.meta?.event_name || payload.event_type || "unknown";
    const eventId = payload.meta?.webhook_id || `ls_evt_${Date.now()}`;
    const custom = payload.meta?.custom_data || payload.data?.attributes?.first_order_item?.custom || {};
    const clientId = custom.client_id;
    const plan = (custom.plan as SubscriptionPlan) || "pro";

    if (eventName === "order_created" || eventName === "subscription_created") {
      return {
        success: true,
        eventId,
        eventType: "subscription_created",
        clientId,
        plan,
        periodEnd: Date.now() + MONTH_MS,
        inGracePeriod: false,
        providerName: this.name,
      };
    } else if (eventName === "subscription_payment_success") {
      return {
        success: true,
        eventId,
        eventType: "subscription_renewed",
        clientId,
        plan,
        periodEnd: Date.now() + MONTH_MS,
        inGracePeriod: false,
        providerName: this.name,
      };
    } else if (eventName === "subscription_payment_failed") {
      return {
        success: true,
        eventId,
        eventType: "payment_failed",
        clientId,
        plan,
        inGracePeriod: true,
        gracePeriodExpiresAt: Date.now() + GRACE_PERIOD_MS,
        providerName: this.name,
      };
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      return {
        success: true,
        eventId,
        eventType: "subscription_canceled",
        clientId,
        plan: "free",
        periodEnd: Date.now(),
        inGracePeriod: false,
        providerName: this.name,
      };
    }

    return {
      success: true,
      eventId,
      eventType: "ignored",
      providerName: this.name,
    };
  }

  public async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      status: "active",
      plan: "pro",
      currentPeriodEnd: Date.now() + MONTH_MS,
      inGracePeriod: false,
      provider: this.id,
    };
  }
}

// -----------------------------------------------------------------------------
// 3. REGIONAL MOBILE MONEY PROVIDER (Orange Money / MTN Mobile Money / CinetPay / PayDunya)
// Suitable for Guinea and West African UEMOA / ECOWAS subscribers
// -----------------------------------------------------------------------------
export class MobileMoneyProvider implements PaymentProvider {
  public readonly id = "cinetpay";
  public readonly name = "CinetPay / PayDunya (Orange Money & MTN Mobile Money)";

  public isAvailable(): boolean {
    return Boolean(process.env.CINETPAY_API_KEY || process.env.PAYDUNYA_MASTER_KEY);
  }

  public async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const siteId = process.env.CINETPAY_SITE_ID;
    const apiKey = process.env.CINETPAY_API_KEY;
    const unitPriceUSD = PLAN_PRICING[params.plan][params.billingInterval];
    // Approximate conversion for local currency (GNF - Guinean Franc or XOF)
    const amountGNF = Math.round(unitPriceUSD * 8600); // Guinean Franc conversion estimate

    if (!siteId || !apiKey) {
      throw new Error("CinetPay Mobile Money is unconfigured. Missing CINETPAY_SITE_ID or CINETPAY_API_KEY.");
    }

    const transactionId = `dp_gn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
        amount: amountGNF,
        currency: "GNF",
        description: `DocuPulse ${params.plan.toUpperCase()} - Orange Money / MTN`,
        return_url: `${params.successUrl}&provider=cinetpay&transaction_id=${transactionId}`,
        notify_url: `${process.env.APP_URL || "https://ais-dev-afr3igwfzomeqm3r7zp5fh-217289239755.europe-west3.run.app"}/api/billing/webhook?provider=cinetpay`,
        channels: "ALL", // MOBILE_MONEY, WALLET, CREDIT_CARD
        metadata: JSON.stringify({
          clientId: params.clientId,
          userId: params.userId,
          plan: params.plan,
          billingInterval: params.billingInterval,
        }),
      }),
    });

    const data = await response.json();
    if (data.code !== "201" && !data.data?.payment_url) {
      throw new Error(`CinetPay Mobile Money init failed: ${data.message || JSON.stringify(data)}`);
    }

    return {
      success: true,
      checkoutUrl: data.data.payment_url,
      sessionId: transactionId,
      provider: this.id,
      amount: unitPriceUSD,
      currency: "usd",
      plan: params.plan,
      billingInterval: params.billingInterval,
      isSandbox: false,
      message: `Guichet Mobile Money (Orange Money / MTN Guinée) initialisé.`,
    };
  }

  public async verifyAndParseWebhook(req: WebhookRequest): Promise<WebhookEventResult> {
    const token = req.headers["x-token"] || req.body?.cpm_trans_id;
    const transactionId = req.body?.cpm_trans_id || req.body?.transaction_id || `mm_evt_${Date.now()}`;
    const siteId = process.env.CINETPAY_SITE_ID;
    const apiKey = process.env.CINETPAY_API_KEY;

    if (!apiKey || !siteId) {
      throw new Error("Missing CinetPay credentials.");
    }

    // Server-to-server check of transaction status
    const checkRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
      }),
    });

    const verification = await checkRes.json();
    const isSuccess = verification.code === "00" && verification.data?.status === "ACCEPTED";
    const custom = JSON.parse(verification.data?.metadata || "{}");
    const clientId = custom.clientId;
    const plan = (custom.plan as SubscriptionPlan) || "pro";

    if (isSuccess) {
      return {
        success: true,
        eventId: transactionId,
        eventType: "payment_success",
        clientId,
        plan,
        periodEnd: Date.now() + MONTH_MS,
        inGracePeriod: false,
        providerName: this.name,
      };
    } else {
      return {
        success: true,
        eventId: transactionId,
        eventType: "payment_failed",
        clientId,
        plan,
        inGracePeriod: true,
        gracePeriodExpiresAt: Date.now() + GRACE_PERIOD_MS,
        providerName: this.name,
      };
    }
  }

  public async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      status: "active",
      plan: "pro",
      currentPeriodEnd: Date.now() + MONTH_MS,
      inGracePeriod: false,
      provider: this.id,
    };
  }
}

// -----------------------------------------------------------------------------
// 4. SECURE SANDBOX / DEV PAYMENT PROVIDER
// Fallback for development, testing, or environment without live API keys
// Zero synthetic data in production, clear sandbox indicator
// -----------------------------------------------------------------------------
export class SandboxPaymentProvider implements PaymentProvider {
  public readonly id = "sandbox";
  public readonly name = "DocuPulse Sandbox Engine";

  public async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const unitPrice = PLAN_PRICING[params.plan][params.billingInterval];
    const sessionId = `cs_sandbox_${crypto.randomBytes(8).toString("hex")}`;
    const redirectUrl = `${params.successUrl}&session_id=${sessionId}&sandbox=true`;

    return {
      success: true,
      checkoutUrl: redirectUrl,
      sessionId,
      provider: this.id,
      amount: unitPrice,
      currency: "usd",
      plan: params.plan,
      billingInterval: params.billingInterval,
      isSandbox: true,
      message: `Environnement Sandbox actif (clés de paiement non configurées). Redirection simulée vers l'activation du compte.`,
    };
  }

  public async verifyAndParseWebhook(req: WebhookRequest): Promise<WebhookEventResult> {
    const eventId = req.body?.id || `sandbox_evt_${Date.now()}`;
    const plan = (req.body?.plan as SubscriptionPlan) || "pro";
    const clientId = req.body?.clientId;

    return {
      success: true,
      eventId,
      eventType: "payment_success",
      clientId,
      plan,
      periodEnd: Date.now() + MONTH_MS,
      inGracePeriod: false,
      providerName: this.name,
    };
  }

  public async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      status: "active",
      plan: "pro",
      currentPeriodEnd: Date.now() + MONTH_MS,
      inGracePeriod: false,
      provider: this.id,
    };
  }
}

// -----------------------------------------------------------------------------
// PROVIDER FACTORY (Decoupled Switching)
// -----------------------------------------------------------------------------
const stripeProvider = new StripePaymentProvider();
const morProvider = new MerchantOfRecordProvider();
const mobileMoneyProvider = new MobileMoneyProvider();
const sandboxProvider = new SandboxPaymentProvider();

export function getPaymentProvider(requestedProvider?: string): PaymentProvider {
  const chosen = (requestedProvider || process.env.BILLING_PROVIDER || "").toLowerCase();

  // If a specific provider is explicitly requested, route to it directly
  if (chosen === "stripe") {
    return stripeProvider;
  }
  if (chosen === "lemonsqueezy" || chosen === "paddle") {
    return morProvider;
  }
  if (chosen === "cinetpay" || chosen === "mobilemoney" || chosen === "paydunya") {
    return mobileMoneyProvider;
  }
  if (chosen === "sandbox") {
    return sandboxProvider;
  }

  // Automatic preference selection based on available environment credentials
  if (stripeProvider.isAvailable()) {
    return stripeProvider;
  }

  if (morProvider.isAvailable()) {
    return morProvider;
  }

  if (mobileMoneyProvider.isAvailable()) {
    return mobileMoneyProvider;
  }

  // Safe fallback to Sandbox for test runs
  return sandboxProvider;
}
