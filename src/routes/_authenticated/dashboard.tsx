import { createFileRoute } from "@tanstack/react-router";
import {
  useAccounts,
  useBills,
  useCategories,
  useGoals,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import { DashboardView } from "@/components/finanzzi/DashboardView";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      {
        name: "description",
        content: "Registre uma entrada ou saída. O FINANZZI organiza e lembra do resto.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-7">
        <Skeleton className="h-10 w-48 rounded-xl bg-muted" />
        <Skeleton className="mt-5 h-48 rounded-2xl bg-muted" />
        <Skeleton className="mt-5 h-36 rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <DashboardView
      profile={profile ?? null}
      transactions={transactions}
      categories={categories}
      accounts={accounts}
      bills={bills}
      goals={goals}
      isLoading={false}
    />
  );
}
