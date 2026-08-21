import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  useAccounts,
  useBills,
  useGoals,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import { spendCapacity } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      {
        name: "description",
        content: "Registre uma entrada ou saída e veja quanto você pode gastar hoje.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const capacity = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }),
    [accounts, transactions, bills, goals],
  );

  const firstName = profile?.name?.split(" ")[0] || "você";
  const available = Math.max(0, capacity.perDay);
  const hasPressure = capacity.perDay <= 0;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
        <header className="flex items-center justify-between gap-4 pb-5 sm:pb-7">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {getGreeting()}, {firstName}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Início
            </h1>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-foreground">
            hoje
          </span>
        </header>

        <section aria-labelledby="register-title" className="surface-card p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Registrar
            </p>
            <h2 id="register-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
              Entrada ou saída
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escreva do seu jeito e o FIN organiza.
            </p>
          </div>
          <QuickEntry />
        </section>

        <section aria-labelledby="capacity-title" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl bg-muted" />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Margem de hoje
                  </p>
                  <h2 id="capacity-title" className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                    Quanto posso gastar hoje?
                  </h2>
                </div>
                <Link
                  to="/posso-comprar"
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary transition-colors hover:bg-accent"
                >
                  Entender <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <p className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-5xl">
                {formatBRL(available)}
              </p>
              <div className="mt-3 flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                <span className="mt-2 h-1.5 w-8 shrink-0 rounded-full bg-primary" />
                <span>
                  {hasPressure
                    ? "Sua margem está apertada. Veja os compromissos antes de gastar."
                    : "Depois dos compromissos que já conhecemos, esta é a sua margem de hoje."}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
