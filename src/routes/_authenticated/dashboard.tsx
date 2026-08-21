import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, CircleHelp, MessageCircle } from "lucide-react";
import {
  useAccounts,
  useBills,
  useCategories,
  useGoals,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import { buildInsights, buildPeriod, spendCapacity } from "@/lib/finance";
import { nextCommitments } from "@/lib/commitments";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import { FinMascot } from "@/components/finanzzi/FinMascot";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      {
        name: "description",
        content: "Conte o que aconteceu. O FINANZZI organiza e lembra do resto.",
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
  const period = useMemo(() => buildPeriod("current", monthRange()), []);
  const capacity = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }),
    [accounts, transactions, bills, goals],
  );
  const commitments = useMemo(() => nextCommitments(bills, categories, 3), [bills, categories]);
  const insights = useMemo(
    () =>
      buildInsights({
        transactions,
        categories,
        bills,
        period,
        monthlyIncome: Number(profile?.monthly_income ?? 0),
      }),
    [transactions, categories, bills, period, profile?.monthly_income],
  );

  const firstName = profile?.name?.split(" ")[0] || "você";
  const available = Math.max(0, capacity.perDay);
  const hasPressure = capacity.perDay <= 0;
  const insight = insights.opportunities[0] ?? insights.actions[0];
  const commitmentsTotal = commitments.reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <header className="flex items-start justify-between gap-4 pb-7 sm:pb-9">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-semibold text-muted-foreground">
              {getGreeting()}, {firstName}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              {hasPressure ? "Vamos organizar essa semana." : "Seu dinheiro, sem complicação."}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Registre do seu jeito. O FINANZZI organiza, lembra e mostra o que merece sua atenção.
            </p>
          </div>
          <FinMascot
            expression={hasPressure ? "atento" : "normal"}
            className="h-14 w-14 shrink-0 sm:h-20 sm:w-20"
          />
        </header>

        {isLoading ? (
          <Skeleton className="h-64 rounded-[1.75rem] bg-muted" />
        ) : (
          <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-hero p-5 text-primary-foreground shadow-lift sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
                  Posso gastar hoje?
                </p>
                <p className="mt-2 font-display text-[3.25rem] font-semibold leading-none tracking-[-0.07em] sm:text-7xl">
                  {formatBRL(available)}
                </p>
                <div className="mt-4 flex max-w-md items-start gap-2 text-sm leading-6 text-primary-foreground/75">
                  <span className="mt-2 h-1.5 w-10 shrink-0 rounded-full bg-primary" />
                  <span>
                    {hasPressure
                      ? "A sua margem está apertada. Vamos olhar primeiro os compromissos."
                      : "Depois dos compromissos que já conhecemos, esta é a sua margem de hoje."}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                <Link
                  to="/posso-comprar"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
                >
                  Entender minha margem <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-xs font-bold text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  Perguntar ao FIN <MessageCircle className="size-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 sm:mt-11">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Registrar
              </p>
              <h2 className="mt-1 font-display text-[1.85rem] font-semibold tracking-[-0.045em] sm:text-3xl">
                O que aconteceu?
              </h2>
            </div>
            <span className="hidden rounded-full bg-accent px-3 py-1.5 text-[11px] font-semibold text-accent-foreground sm:block">
              texto · voz · foto
            </span>
          </div>
          <div className="surface-card p-2 sm:p-3">
            <QuickEntry />
          </div>
        </section>

        <section className="mt-8 sm:mt-11">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Lembrar
              </p>
              <h2 className="mt-1 font-display text-[1.85rem] font-semibold tracking-[-0.045em] sm:text-3xl">
                Próximos compromissos
              </h2>
              {commitments.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatBRL(commitmentsTotal)} nos próximos pagamentos.
                </p>
              )}
            </div>
            <Link
              to="/contas"
              className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary transition-colors hover:bg-accent"
            >
              Ver tudo <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {commitments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-card/70">
              <EmptyState
                title="Nada vencendo por agora"
                description="Registre uma conta fixa e o FINANZZI lembra por você."
              />
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              {commitments.map((bill, index) => {
                const days = daysUntil(bill.due_date);
                return (
                  <div
                    key={bill.id}
                    className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${index > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <CalendarClock className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{bill.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {days <= 0
                          ? "vence hoje"
                          : days === 1
                            ? "vence amanhã"
                            : `vence em ${days} dias`}{" "}
                        · {formatDateBR(bill.due_date)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold">{formatBRL(Number(bill.amount))}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 pb-8 sm:mt-11">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Orientar
              </p>
              <h2 className="mt-1 max-w-xl font-display text-[1.85rem] font-semibold tracking-[-0.045em] sm:text-3xl">
                Uma coisa que merece a sua atenção
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-card px-4 text-xs font-bold text-primary shadow-sm ring-1 ring-border transition-colors hover:bg-accent"
            >
              Perguntar <MessageCircle className="size-3.5" />
            </button>
          </div>
          <div className="surface-card flex items-start gap-4 p-5 sm:p-6">
            <FinMascot
              expression={insight ? "pensando" : "normal"}
              className="h-14 w-14 shrink-0"
            />
            {insight ? (
              <div>
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Registe alguns dias e o FIN encontra padrões importantes para você.
                </p>
              </div>
            )}
          </div>
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

function daysUntil(date: string) {
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime();
  const target = new Date(`${date}T12:00:00`).getTime();
  return Math.round((target - today) / 86_400_000);
}
