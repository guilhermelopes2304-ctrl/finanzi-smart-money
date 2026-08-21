import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BILLING_PLANS } from "@/lib/billing";

const allowedPlanIds = new Set(Object.keys(BILLING_PLANS));

export const getBillingSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("get_current_entitlements");
    if (error) throw new Error(`Unable to load billing entitlements: ${error.message}`);
    const { data: subscription, error: subscriptionError } = await context.supabase
      .from("subscriptions")
      .select("provider")
      .maybeSingle();
    if (subscriptionError) {
      console.warn("[Billing] Não foi possível identificar o provider interno", subscriptionError.message);
    }

    const snapshot = data?.[0] ?? {
      plan: "free",
      status: "free",
      billing_interval: null,
      trial_ends_at: null,
      current_period_ends_at: null,
      cancel_at_period_end: false,
      is_pro: false,
    };
    return {
      ...snapshot,
      is_internal_test: subscription?.provider === "internal_test",
    };
  });

export const prepareBillingCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { planId: string }) => {
    if (!allowedPlanIds.has(data.planId)) throw new Error("Unsupported billing plan");
    return data as { planId: "pro_monthly" | "pro_annual" };
  })
  .handler(async ({ data, context }) => {
    const { data: checkoutId, error } = await context.supabase.rpc("prepare_billing_checkout", {
      p_plan_id: data.planId,
    });
    if (error) throw new Error(`Unable to prepare checkout: ${error.message}`);

    return {
      checkoutId,
      planId: data.planId,
      status: "checkout_pending" as const,
      message: "Checkout preparado — aguardando configuração do provedor.",
    };
  });
