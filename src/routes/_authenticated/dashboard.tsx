import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CalendarClock, Check, CircleHelp, MessageCircle } from "lucide-react";
import {
  useAccounts,
  useBills,
  useCategories,
  useGoals,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import { buildInsights, buildPeriod, spendCapacity } from "@/lib/finance";
import { buildCommitmentReminders, nextCommitments } from "@/lib/commitments";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import { FinMascot } from "@/components/finanzzi/FinMascot";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      {
        name: "description",
        content: "Conte para o FINANZZI o que aconteceu. Ele cuida do resto.",
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
  const reminders = useMemo(() => buildCommitmentReminders(bills, categories), [bills, categories]);
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
  const insight = insights.opportunities[0] ?? insights.actions[0] ?? reminders[0];
  const commitmentsTotal = commitments.reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-1 py-1 sm:px-2 lg:py-3">
        <header className="flex items-start justify-between gap-4 pb-7 pt-1 sm:pb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-muted-foreground">
              {getGreeting()}, {firstName}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-[2.35rem] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl">
              {hasPressure ? "Atenção: sua semana está pesada." : "Você está no controle."}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Você conta para o FINANZZI o que aconteceu. Ele organiza e lembra do resto.
            </p>
          </div>
          <FinMascot
            expression={hasPressure ? "atento" : "normal"}
            className="hidden h-20 w-20 shrink-0 sm:block"
          />
        </header>

        {isLoading ? (
          <Skeleton className="h-60 rounded-[2rem]" />
        ) : (
          <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-lift sm:p-9">
            <div className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Você pode gastar hoje
                </p>
                <p className="mt-3 font-display text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-7xl">
                  {formatBRL(available)}
                </p>
                <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/65">
                  sem comprometer os próximos compromissos.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-primary-foreground/65 sm:max-w-[180px] sm:text-right">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-foreground/10">
                  <Check className="size-4" />
                </span>
                {hasPressure
                  ? "Vamos olhar o que pesa primeiro."
                  : "Sua margem já considera o que vem pela frente."}
              </div>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link
                to="/posso-comprar"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Entender minha margem <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary-foreground/20 px-4 text-sm font-semibold text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10"
              >
                Perguntar ao Fin <MessageCircle className="size-4" />
              </button>
            </div>
          </section>
        )}

        <section className="mt-8 sm:mt-10">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Registrar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                O que aconteceu?
              </h2>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              texto, voz ou foto
            </span>
          </div>
          <QuickEntry />
        </section>

        <section className="mt-10 sm:mt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Lembrar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
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
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {commitments.length === 0 ? (
            <EmptyState
              title="Nada vencendo por agora"
              description="Registre uma conta fixa e o FINANZZI lembra por você."
            />
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-card">
              {commitments.map((bill) => {
                const days = daysUntil(bill.due_date);
                return (
                  <div key={bill.id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
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

        <section className="mt-10 pb-8 sm:mt-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Orientar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Uma coisa que você deveria saber
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 text-xs font-bold text-secondary-foreground transition-colors hover:bg-accent"
            >
              Perguntar <MessageCircle className="size-3.5" />
            </button>
          </div>
          <div className="surface-card flex items-start gap-4 p-5 sm:p-6">
            <FinMascot
              expression={insight ? "pensando" : "normal"}
              className="h-16 w-16 shrink-0"
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
                  Registre alguns dias e o Fin vai encontrar uma coisa importante para você.
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
