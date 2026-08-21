import { PRO_FEATURE_LABELS, type Plan, type ProFeature } from "@/lib/plan";

export type BillingInterval = "monthly" | "annual";
export type BillingProvider = "hubla" | "stripe" | "mercadopago" | "manual";
export type SubscriptionStatus =
  "free" | "trialing" | "active" | "past_due" | "canceled" | "expired" | "checkout_pending";

export type BillingPlan = "free" | "pro";

export type SubscriptionSnapshot = {
  plan: BillingPlan;
  status: SubscriptionStatus;
  billingInterval: BillingInterval | null;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  isPro: boolean;
};

export const HUBLA_CHECKOUT_URLS: Record<"pro_monthly" | "pro_annual", string> = {
  pro_monthly: import.meta.env?.["VITE_HUBLA_CHECKOUT_MONTHLY_URL"] ?? "",
  pro_annual: import.meta.env?.["VITE_HUBLA_CHECKOUT_ANNUAL_URL"] ?? "",
};

export type BillingOrderBump = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

// Future catalog only. No add-on is sold or displayed until it is configured and enabled.
export const BILLING_ORDER_BUMPS: readonly BillingOrderBump[] = [];

export const BILLING_PLANS: Record<
  "pro_monthly" | "pro_annual",
  {
    id: "pro_monthly" | "pro_annual";
    name: string;
    interval: BillingInterval;
    priceCents: number;
    priceLabel: string;
    monthlyEquivalentLabel: string;
    savingsLabel: string;
  }
> = {
  pro_monthly: {
    id: "pro_monthly",
    name: "FINANZZI Mensal",
    interval: "monthly",
    priceCents: 1990,
    priceLabel: "R$ 19,90/mês",
    monthlyEquivalentLabel: "R$ 19,90 por mês",
    savingsLabel: "Flexível, cancele quando quiser",
  },
  pro_annual: {
    id: "pro_annual",
    name: "FINANZZI Anual",
    interval: "annual",
    priceCents: 14990,
    priceLabel: "R$ 149,90/ano",
    monthlyEquivalentLabel: "equivale a R$ 12,49/mês",
    savingsLabel: "Economize cerca de 37% no anual",
  },
};

// Kept as a compatibility export for existing billing code. The product does not
// expose a free application tier; pre-payment access is limited to public demos.
export const PREPAYMENT_ENTITLEMENTS = ["public_demo"] as const;
export const FREE_ENTITLEMENTS = PREPAYMENT_ENTITLEMENTS;

export const PRO_ENTITLEMENTS: readonly ProFeature[] = Object.keys(
  PRO_FEATURE_LABELS,
) as ProFeature[];

export function isSubscriptionPro(
  subscription: Pick<SubscriptionSnapshot, "plan" | "status" | "currentPeriodEndsAt">,
) {
  const activeStatus = subscription.status === "active" || subscription.status === "trialing";
  const periodIsValid =
    !subscription.currentPeriodEndsAt ||
    new Date(subscription.currentPeriodEndsAt).getTime() > Date.now();
  return subscription.plan === "pro" && activeStatus && periodIsValid;
}

export function normalizeSubscriptionSnapshot(
  value?: Partial<SubscriptionSnapshot> | null,
): SubscriptionSnapshot {
  const plan: BillingPlan = value?.plan === "pro" ? "pro" : "free";
  const status = value?.status ?? "free";
  const currentPeriodEndsAt = value?.currentPeriodEndsAt ?? null;
  return {
    plan,
    status,
    billingInterval: value?.billingInterval ?? null,
    trialEndsAt: value?.trialEndsAt ?? null,
    currentPeriodEndsAt,
    cancelAtPeriodEnd: value?.cancelAtPeriodEnd ?? false,
    isPro: isSubscriptionPro({ plan, status, currentPeriodEndsAt }),
  };
}

export function getHublaCheckoutUrl(planId: "pro_monthly" | "pro_annual") {
  const url = HUBLA_CHECKOUT_URLS[planId];
  if (!url) return null;
  try {
    const checkoutUrl = new URL(url);
    checkoutUrl.searchParams.set("utm_source", "finanzzi");
    checkoutUrl.searchParams.set("utm_medium", "landing");
    checkoutUrl.searchParams.set("utm_campaign", planId);
    return checkoutUrl.toString();
  } catch {
    return null;
  }
}

export function planFromInterval(interval: BillingInterval): "pro" {
  void interval;
  return "pro";
}

export type BillingWebhookType =
  | "subscription_created"
  | "subscription_updated"
  | "payment_approved"
  | "payment_failed"
  | "subscription_canceled"
  | "subscription_expired";

export type BillingWebhookEvent = {
  id: string;
  type: BillingWebhookType;
  occurredAt: string;
  data: {
    userId?: string;
    externalCustomerId?: string;
    externalSubscriptionId?: string;
    interval?: BillingInterval;
    currentPeriodStartAt?: string | null;
    currentPeriodEndAt?: string | null;
    trialEndsAt?: string | null;
    cancelAtPeriodEnd?: boolean;
    provider?: BillingProvider;
    providerProductId?: string;
    providerOfferId?: string;
    buyerEmail?: string;
    buyerName?: string;
  };
};

export type HublaWebhookPayload = {
  type?: string;
  version?: string;
  event?: {
    product?: { id?: string; name?: string };
    products?: Array<{
      id?: string;
      name?: string;
      offers?: Array<{ id?: string; name?: string }>;
    }>;
    user?: { id?: string; email?: string; firstName?: string; lastName?: string; phone?: string };
    subscription?: {
      id?: string;
      type?: string;
      status?: string;
      billingCycleMonths?: number;
      credits?: number;
      paymentMethod?: string;
      autoRenew?: boolean;
      freeTrial?: boolean;
      activatedAt?: string;
      inactivatedAt?: string;
      deactivatedAutoRenewAt?: string;
      modifiedAt?: string;
      createdAt?: string;
      version?: number;
    };
    subscriptions?: Array<{
      id?: string;
      type?: string;
      billingCycleMonths?: number;
      quantity?: number;
    }>;
    invoice?: {
      id?: string;
      subscriptionId?: string;
      payerId?: string;
      status?: string;
      modifiedAt?: string;
      createdAt?: string;
      saleDate?: string;
      payer?: {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
      };
    };
  };
};

function addDays(iso: string | undefined, days: number | undefined) {
  if (!iso || !Number.isFinite(days)) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + Math.max(0, days ?? 0));
  return date.toISOString();
}

type HublaSubscription = {
  id?: string;
  type?: string;
  status?: string;
  billingCycleMonths?: number;
  credits?: number;
  paymentMethod?: string;
  autoRenew?: boolean;
  freeTrial?: boolean;
  activatedAt?: string;
  inactivatedAt?: string;
  deactivatedAutoRenewAt?: string;
  modifiedAt?: string;
  createdAt?: string;
  version?: number;
};

export function billingEventFromHubla(
  payload: HublaWebhookPayload,
  idempotencyKey: string,
): BillingWebhookEvent | null {
  const event = payload.event;
  if (!payload.type || !event) return null;
  const subscription = (event.subscription ?? event.subscriptions?.[0]) as
    HublaSubscription | undefined;
  const invoice = event.invoice;
  const user = event.user ?? invoice?.payer;
  const externalSubscriptionId = subscription?.id ?? invoice?.subscriptionId;
  const externalCustomerId = user?.id ?? invoice?.payerId;
  const occurredAt =
    subscription?.modifiedAt ??
    invoice?.modifiedAt ??
    invoice?.saleDate ??
    new Date().toISOString();
  const interval: BillingInterval | undefined =
    subscription?.billingCycleMonths === 12
      ? "annual"
      : subscription?.billingCycleMonths === 1
        ? "monthly"
        : undefined;
  const periodStart =
    subscription?.activatedAt ?? subscription?.createdAt ?? invoice?.createdAt ?? null;
  const periodEnd = addDays(periodStart ?? undefined, subscription?.credits);
  const status = subscription?.status ?? invoice?.status;

  let type: BillingWebhookType;
  if (
    ["customer.member_added", "subscription.activated", "invoice.payment_succeeded"].includes(
      payload.type,
    ) ||
    (payload.type === "invoice.status_updated" && status === "paid")
  ) {
    type = "payment_approved";
  } else if (
    [
      "customer.member_removed",
      "subscription.expired",
      "subscription.deactivated",
      "invoice.refunded",
      "invoice.expired",
    ].includes(payload.type)
  ) {
    type = "subscription_expired";
  } else if (
    ["invoice.payment_failed"].includes(payload.type) ||
    ["overdue", "canceled", "disputed", "chargeback"].includes(status ?? "")
  ) {
    type = "payment_failed";
  } else if (payload.type === "subscription.created" && status === "active") {
    type = "subscription_created";
  } else if (payload.type === "subscription.auto_renewal_disabled") {
    type = "subscription_canceled";
  } else {
    return null;
  }

  const data: BillingWebhookEvent["data"] = {
    cancelAtPeriodEnd: subscription?.autoRenew === false,
    provider: "hubla",
  };
  if (externalCustomerId) data.externalCustomerId = externalCustomerId;
  if (externalSubscriptionId) data.externalSubscriptionId = externalSubscriptionId;
  if (interval) data.interval = interval;
  if (periodStart) data.currentPeriodStartAt = periodStart;
  if (periodEnd) data.currentPeriodEndAt = periodEnd;
  if (event.product?.id) data.providerProductId = event.product.id;
  if (event.products?.[0]?.offers?.[0]?.id) data.providerOfferId = event.products[0].offers[0].id;
  if (user?.email) data.buyerEmail = user.email;
  const buyerName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  if (buyerName) data.buyerName = buyerName;

  return { id: idempotencyKey, type, occurredAt, data };
}

export function subscriptionPatchFromWebhook(event: BillingWebhookEvent) {
  const base = {
    external_customer_id: event.data.externalCustomerId ?? null,
    external_subscription_id: event.data.externalSubscriptionId ?? null,
    billing_interval: event.data.interval ?? null,
    current_period_start_at: event.data.currentPeriodStartAt ?? null,
    current_period_end_at: event.data.currentPeriodEndAt ?? null,
    trial_end_at: event.data.trialEndsAt ?? null,
    cancel_at_period_end: event.data.cancelAtPeriodEnd ?? false,
    provider: event.data.provider ?? null,
    provider_product_id: event.data.providerProductId ?? null,
    provider_offer_id: event.data.providerOfferId ?? null,
    last_webhook_id: event.id,
    last_webhook_at: event.occurredAt,
  };

  if (event.type === "subscription_created" || event.type === "subscription_updated") {
    return {
      ...base,
      plan: "pro" as const,
      status: event.data.trialEndsAt ? ("trialing" as const) : ("active" as const),
    };
  }
  if (event.type === "payment_approved")
    return { ...base, plan: "pro" as const, status: "active" as const };
  if (event.type === "payment_failed")
    return { ...base, plan: "pro" as const, status: "past_due" as const };
  if (event.type === "subscription_canceled")
    return {
      ...base,
      plan: "pro" as const,
      status: "canceled" as const,
      canceled_at: event.occurredAt,
    };
  return {
    ...base,
    plan: "free" as const,
    status: "expired" as const,
    canceled_at: event.occurredAt,
  };
}

export function normalizePlanFromBilling(plan?: string | null): Plan {
  return plan === "pro" ? "pro" : "free";
}
