import { PRO_FEATURE_LABELS, type Plan, type ProFeature } from "@/lib/plan";

export type BillingInterval = "monthly" | "annual";
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
    name: "FIN Pro Mensal",
    interval: "monthly",
    priceCents: 1990,
    priceLabel: "R$ 19,90/mês",
    monthlyEquivalentLabel: "R$ 19,90 por mês",
    savingsLabel: "Flexível, cancele quando quiser",
  },
  pro_annual: {
    id: "pro_annual",
    name: "FIN Pro Anual",
    interval: "annual",
    priceCents: 14990,
    priceLabel: "R$ 149,90/ano",
    monthlyEquivalentLabel: "equivale a R$ 12,49/mês",
    savingsLabel: "Economize cerca de 37% no anual",
  },
};

export const FREE_ENTITLEMENTS = [
  "dashboard",
  "accounts",
  "transactions",
  "categories",
  "cards",
  "basic_goals",
  "quick_entry_basic",
  "basic_insights",
] as const;

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
  };
};

export function subscriptionPatchFromWebhook(event: BillingWebhookEvent) {
  const base = {
    external_customer_id: event.data.externalCustomerId ?? null,
    external_subscription_id: event.data.externalSubscriptionId ?? null,
    billing_interval: event.data.interval ?? null,
    current_period_start_at: event.data.currentPeriodStartAt ?? null,
    current_period_end_at: event.data.currentPeriodEndAt ?? null,
    trial_end_at: event.data.trialEndsAt ?? null,
    cancel_at_period_end: event.data.cancelAtPeriodEnd ?? false,
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
