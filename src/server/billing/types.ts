/**
 * DocuPulse Payment & Billing Domain Types
 * Strict decoupling of payment providers (Stripe, Merchant of Record, Mobile Money)
 */

export type SubscriptionPlan = "free" | "pro" | "business";
export type BillingInterval = "monthly" | "annual";

export interface CreateCheckoutParams {
  clientId: string;
  userId: string;
  userEmail?: string;
  plan: "pro" | "business";
  billingInterval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId: string;
  provider: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  isSandbox: boolean;
  message?: string;
}

export interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  rawBody: Buffer;
  body: any;
}

export type WebhookEventType =
  | "payment_success"
  | "subscription_created"
  | "subscription_renewed"
  | "payment_failed"
  | "subscription_canceled"
  | "ignored";

export interface WebhookEventResult {
  success: boolean;
  eventId: string;
  eventType: WebhookEventType;
  clientId?: string;
  userEmail?: string;
  plan?: SubscriptionPlan;
  billingInterval?: BillingInterval;
  subscriptionId?: string;
  periodEnd?: number; // Unix timestamp in ms
  inGracePeriod?: boolean;
  gracePeriodExpiresAt?: number; // Unix timestamp in ms
  metadata?: Record<string, any>;
  error?: string;
  providerName: string;
}

export interface SubscriptionStatusResult {
  status: "active" | "past_due" | "canceled" | "trialing" | "unpaid" | "unknown";
  plan: SubscriptionPlan;
  currentPeriodEnd: number; // Unix timestamp in ms
  inGracePeriod: boolean;
  gracePeriodExpiresAt?: number;
  cancelAtPeriodEnd?: boolean;
  provider: string;
}

/**
 * Universal decoupled payment provider interface
 */
export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyAndParseWebhook(req: WebhookRequest): Promise<WebhookEventResult>;
  getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult>;
  cancelSubscription?(subscriptionId: string): Promise<boolean>;
}
