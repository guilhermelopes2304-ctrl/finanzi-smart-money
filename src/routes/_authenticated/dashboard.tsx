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
      { name: "description", content: "Conte o que aconteceu. O FINANZZI organiza e lembra do resto." },
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
    <div className="min-h-full bg-[#F7F7F2] text-[#161815]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-start justify-between gap-6 pb-7 sm:pb-9">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#697164]">{getGreeting()}, {firstName}</p>
            <h1 className="mt-2 font-display text-[2.65rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              {hasPressure ? "Vamos organizar essa semana." : "Seu dinheiro, sem complicação."}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#697164] sm:text-base">
              Registre do seu jeito. O FINANZZI organiza, lembra e mostra o que merece sua atenção.
            </p>
          </div>
          <FinMascot
            expression={hasPressure ? "atento" : "normal"}
            className="hidden h-16 w-16 shrink-0 sm:block"
          />
        </header>

        {isLoading ? (
          <Skeleton className="h-56 rounded-[2rem] bg-white" />
        ) : (
          <section className="relative overflow-hidden rounded-[2rem] border border-[#E4E7DE] bg-white p-6 shadow-[0_18px_50px_rgba(20,25,18,0.06)] sm:p-8">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#9EEB45]" />
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#77806F]">Você pode gastar hoje</p>
                <p className="mt-2 font-display text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-7xl">
                  {formatBRL(available)}
                </p>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#697164]">
                  {hasPressure
                    ? "Sua margem está apertada. Vamos olhar primeiro os compromissos."
                    : "Depois dos compromissos que já conhecemos."}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  to="/posso-comprar"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#161815] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  Entender minha margem <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold text-[#53604E] transition-colors hover:bg-[#F0F3EA]"
                >
                  Perguntar ao FIN <MessageCircle className="size-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-9 sm:mt-11">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#77806F]">Registrar</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.045em]">O que aconteceu?</h2>
            </div>
            <span className="hidden rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#77806F] sm:block">
              texto · voz · foto
            </span>
          </div>
          <div className="rounded-[1.75rem] border border-[#E4E7DE] bg-white p-2 shadow-[0_14px_40px_rgba(20,25,18,0.04)] sm:p-3">
            <QuickEntry />
          </div>
        </section>

        <section className="mt-9 sm:mt-11">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#77806F]">Lembrar</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.045em]">Próximos compromissos</h2>
              {commitments.length > 0 && (
                <p className="mt-1 text-sm text-[#697164]">{formatBRL(commitmentsTotal)} nos próximos pagamentos.</p>
              )}
            </div>
            <Link to="/contas" className="inline-flex items-center gap-1 text-xs font-bold text-[#394238] hover:underline">
              Ver tudo <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {commitments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#D5DACD] bg-white/70">
              <EmptyState title="Nada vencendo por agora" description="Registre uma conta fixa e o FINANZZI lembra por você." />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-[#E4E7DE] bg-white">
              {commitments.map((bill, index) => {
                const days = daysUntil(bill.due_date);
                return (
                  <div key={bill.id} className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${index > 0 ? "border-t border-[#EEF0EA]" : ""}`}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F1F4EB] text-[#5C6856]">
                      <CalendarClock className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{bill.description}</p>
                      <p className="mt-0.5 text-xs text-[#7A8274]">
                        {days <= 0 ? "vence hoje" : days === 1 ? "vence amanhã" : `vence em ${days} dias`} · {formatDateBR(bill.due_date)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold">{formatBRL(Number(bill.amount))}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-9 pb-8 sm:mt-11">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#77806F]">Orientar</p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.045em]">Uma coisa que merece sua atenção</h2>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#394238] shadow-sm ring-1 ring-[#E4E7DE] transition-colors hover:bg-[#F0F3EA]"
            >
              Perguntar <MessageCircle className="size-3.5" />
            </button>
          </div>
          <div className="flex items-start gap-4 rounded-[1.5rem] border border-[#E4E7DE] bg-white p-5 shadow-[0_12px_34px_rgba(20,25,18,0.04)] sm:p-6">
            <FinMascot expression={insight ? "pensando" : "normal"} className="h-14 w-14 shrink-0" />
            {insight ? (
              <div>
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#697164]">{insight.description}</p>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 size-4 shrink-0 text-[#718068]" />
                <p className="text-sm leading-6 text-[#697164]">
                  Registre alguns dias e o FIN começa a encontrar padrões importantes para você.
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
