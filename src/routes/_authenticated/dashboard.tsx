import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  CircleHelp,
  MessageCircle,
  Sparkles,
} from "lucide-react";
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
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      { name: "description", content: "Você registra. O FINANZZI organiza." },
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
  const greeting = getGreeting();
  const insight = insights.opportunities[0] ?? insights.actions[0] ?? reminders[0];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-1 py-1 sm:px-2 lg:py-4">
        <header className="mb-8 flex items-end justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {greeting}, {firstName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Você registra. O FINANZZI organiza. E cuida do resto.
            </h1>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
            className="hidden size-11 place-items-center rounded-full border border-border bg-card text-primary shadow-soft transition-transform hover:-translate-y-0.5 sm:grid"
            aria-label="Falar com o Fin"
          >
            <MessageCircle className="size-5" />
          </button>
        </header>

        {isLoading ? (
          <Skeleton className="h-56 rounded-[2rem]" />
        ) : (
          <section className="relative overflow-hidden rounded-[2rem] bg-[#071a12] p-6 text-white shadow-lift sm:p-8 animate-scale-in">
            <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
                Sua margem de hoje
              </p>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Você tem {formatBRL(capacity.perDay)} para gastar hoje.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
                Uma estimativa depois das contas, parcelas e compromissos que já estão no seu
                caminho.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/posso-comprar"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-300 px-4 text-sm font-bold text-[#032013] transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  Entender minha margem <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Perguntar ao Fin <MessageCircle className="size-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 animate-fade-up">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Registrar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                O que aconteceu?
              </h2>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Texto ou voz, do seu jeito.
            </span>
          </div>
          <QuickEntry />
        </section>

        <section className="mt-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Lembrar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Próximos compromissos
              </h2>
            </div>
            <Link to="/contas" className="text-xs font-semibold text-primary hover:underline">
              Ver contas
            </Link>
          </div>
          {commitments.length === 0 ? (
            <EmptyState
              title="Nada vencendo por agora"
              description="Registre uma conta fixa e o FINANZZI lembra por você."
            />
          ) : (
            <div className="space-y-2">
              {commitments.map((bill) => {
                const days = daysUntil(bill.due_date);
                return (
                  <div key={bill.id} className="surface-card flex items-center gap-3 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
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

        <section className="mt-8 animate-fade-up" style={{ animationDelay: "140ms" }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Orientar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Uma coisa que você deveria saber
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
              className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"
              aria-label="Perguntar ao Fin"
            >
              <Sparkles className="size-4" />
            </button>
          </div>
          <div className="surface-card p-5 sm:p-6">
            {insight ? (
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  {insights.opportunities[0] || insights.actions[0] ? (
                    <Check className="size-4" />
                  ) : (
                    <Bell className="size-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CircleHelp className="size-4" />
                </span>
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
