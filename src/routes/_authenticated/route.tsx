import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShellV2 as AppShell } from "@/components/finanzzi/AppShellV2";

/**
 * The authenticated shell only verifies identity.
 * Free users are allowed into the app; feature-level restrictions remain
 * handled by the plan/entitlement layer instead of blocking the whole product.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { mode: "login" } });
    }

    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
