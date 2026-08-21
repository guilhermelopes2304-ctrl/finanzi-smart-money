import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/finanzzi/AppShell";
import { getBillingSnapshot } from "@/lib/billing.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "login" } });

    try {
      const billing = await getBillingSnapshot();
      const paymentApproved = billing.is_pro === true && billing.status === "active";
      if (!paymentApproved) {
        throw redirect({ to: "/oferta", search: { reason: "payment_required" } });
      }
    } catch (billingError) {
      if (billingError && typeof billingError === "object" && "to" in billingError)
        throw billingError;
      console.error("[Billing] Não foi possível validar o acesso pago", billingError);
      throw redirect({ to: "/oferta", search: { reason: "billing_unavailable" } });
    }

    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
