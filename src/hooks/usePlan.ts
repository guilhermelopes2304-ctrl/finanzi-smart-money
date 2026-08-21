import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useFinanceData";
import { getBillingSnapshot } from "@/lib/billing.functions";
import { canAccess, normalizePlan, type Plan, type ProFeature } from "@/lib/plan";

export function usePlan() {
  const profileQuery = useProfile();
  const getSnapshot = useServerFn(getBillingSnapshot);
  const entitlementsQuery = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: () => getSnapshot(),
    staleTime: 60_000,
    retry: false,
  });

  const plan = useMemo<Plan>(
    () => normalizePlan(entitlementsQuery.data?.plan ?? profileQuery.data?.plan),
    [entitlementsQuery.data?.plan, profileQuery.data?.plan],
  );
  const isPro = entitlementsQuery.data?.is_pro === true && plan === "pro";

  return {
    data: profileQuery.data,
    error: profileQuery.error ?? entitlementsQuery.error,
    isLoading: profileQuery.isLoading || entitlementsQuery.isLoading,
    isFetching: profileQuery.isFetching || entitlementsQuery.isFetching,
    refetch: async () => {
      await Promise.all([profileQuery.refetch(), entitlementsQuery.refetch()]);
    },
    plan,
    subscription: entitlementsQuery.data,
    isPro,
    can: (feature: ProFeature) => isPro && canAccess(plan, feature),
  };
}
