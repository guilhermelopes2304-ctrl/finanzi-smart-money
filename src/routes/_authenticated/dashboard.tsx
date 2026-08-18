import { useMemo, type ReactNode, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, MessageCircle, PiggyBank, ShieldCheck, Sparkles, Target, WalletCards } from "lucide-react";
import { useAccounts, useCategories, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { availableBalance, buildPeriod, expensesByCategory, financialHealth, monthlySeries, previousPeriod, totalsFor, type PeriodPreset } from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import { BalanceEvolutionChart, CategoryPieChart, IncomeExpenseChart } from "@/components/finanzzi/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — FINANZZI" },
    { name: "description", content: "Seu assistente financeiro pessoal." },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const [preset, setPreset] = useState<PeriodPreset>("current");
  const [custom, setCustom] = useState(monthRange());
  const period = useMemo(() => buildPeriod(preset, custom), [preset, custom]);
  const totals = useMemo(() => totalsFor(transactions, period), [transactions, period]);
  const prev = useMemo(() => totalsFor(transactions, previousPeriod(period)), [transactions, period]);
  const slices = useMemo(() => expensesByCategory(transactions, categories, period), [transactions, categories, period]);
  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const balance = availableBalance(accounts, transactions);
  const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0);
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const commitment = income > 0 ? Math.round((totals.expense / income) * 100) : 0;
  const firstName = profile?.name?.split(" ")[0] || "você";
  const hasData = transactions.length > 0;
  const variation = (current: number, before: number) => {
    if (!before) return "Novo período";
    const diff = Math.round(((current - before) / before) * 100);
    return `${diff >= 0 ? "+" : ""}${diff}% vs. anterior`;
  };
  const assistantMessage = commitment > 90
    ? "Seus gastos estão apertados. Eu encontrei pontos para reduzir e posso te ajudar agora."
    : commitment > 70
      ? "Seus gastos merecem atenção. Quer que eu encontre oportunidades de economia?"
      : "Sua vida financeira está em um bom ritmo. Vamos fazer seu dinheiro trabalhar melhor?";

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] bg-[oklch(0.105_0.022_155)] text-white shadow-[0_30px_100px_oklch(0.1_0.02_155_/_0.28)]">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-emerald-400/[0.09] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-1/4 size-[28rem] rounded-full bg-lime-300/[0.045] blur-3xl" />

      <div className="relative p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80"><span className="grid size-7 place-items-center rounded-xl bg-emerald-400/10"><Sparkles className="size-3.5" /></span> Seu dinheiro, sob controle</div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Olá, {firstName}.</h1>
            <p className="mt-1.5 text-sm text-white/45">Aqui está o que está acontecendo com seu dinheiro.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/[0.045] p-1 backdrop-blur-xl sm:self-auto [&_button]:border-white/10 [&_button]:bg-transparent [&_button]:text-white">
            <CalendarDays className="ml-2 size-4 text-white/40" />
            <PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
          </div>
        </header>

        {isLoading ? <Skeleton className="h-80 rounded-[1.75rem] bg-white/10" /> : (
          <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-400/[0.16] via-emerald-950/70 to-black p-5 sm:p-7">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-400/[0.07] to-transparent" />
              <div className="relative flex items-center justify-between"><span className="text-sm font-medium text-white/45">Saldo disponível</span><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> saudável</span></div>
              <p className="relative mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{formatBRL(balance)}</p>
              <div className="relative mt-8 grid grid-cols-2 gap-3">
                <Metric label="Entrou" value={formatBRL(totals.income)} icon={ArrowUpRight} />
                <Metric label="Saiu" value={formatBRL(totals.expense)} icon={ArrowDownRight} expense />
              </div>
            </div>

            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="group relative min-h-[280px] overflow-hidden rounded-[1.75rem] border border-emerald-300/15 bg-[#061810] text-left shadow-2xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25">
              <img src="/fin-assistente.png" alt="Fin, assistente financeiro do FINANZZI" loading="lazy" decoding="async" fetchPriority="low" className="absolute inset-0 h-full w-full object-cover object-[50%_28%] opacity-75 transition duration-500 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03100a] via-[#03100a]/70 to-transparent" />
              <div className="relative flex h-full min-h-[280px] flex-col justify-between p-5 sm:p-6">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /> Fin está online</span><MessageCircle className="size-5 text-white/60" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">Seu assistente financeiro</p><h2 className="mt-1 font-display text-2xl font-bold tracking-tight">Eu cuido das contas com você.</h2><p className="mt-1.5 max-w-md text-sm leading-5 text-white/60">{assistantMessage}</p><span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#032013] shadow-lg shadow-emerald-400/20">Conversar com o Fin <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></div>
              </div>
            </button>
          </section>
        )}

        <div className="relative mt-4"><QuickEntry /></div>

        {!isLoading && <>
          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniCard icon={ArrowUpRight} label="Receitas" value={formatBRL(totals.income)} hint={variation(totals.income, prev.income)} />
            <MiniCard icon={ArrowDownRight} label="Despesas" value={formatBRL(totals.expense)} hint={variation(totals.expense, prev.expense)} danger />
            <MiniCard icon={PiggyBank} label="Comprometimento" value={`${commitment}%`} hint="da sua renda" warning={commitment > 70} />
            <MiniCard icon={ShieldCheck} label="Saúde financeira" value={health.title} hint="análise atual" />
          </section>

          <section className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3"><span className={cn("grid size-9 place-items-center rounded-xl", health.level === "healthy" ? "bg-emerald-400/10 text-emerald-300" : health.level === "attention" ? "bg-amber-300/10 text-amber-200" : "bg-red-400/10 text-red-300")}><ShieldCheck className="size-4" /></span><div><p className="text-xs uppercase tracking-wider text-white/35">Diagnóstico do Fin</p><h2 className="font-display text-lg font-semibold">{health.title}</h2></div></div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{health.message}</p>
          </section>
        </>}

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <DarkChartCard title="Receitas x Despesas" icon={BarChart3}>{hasData ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento para ver este gráfico." />}</DarkChartCard>
          <DarkChartCard title="Onde seu dinheiro está indo" icon={PiggyBank}>{slices.length > 0 ? <CategoryPieChart data={slices} /> : <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão distribuídos aqui." />}</DarkChartCard>
          <div className="lg:col-span-2"><DarkChartCard title="Evolução do seu saldo" icon={WalletCards}>{hasData ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Ainda não há evolução para mostrar" description="Comece registrando receitas e despesas." />}</DarkChartCard></div>
        </section>

        <footer className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/25"><Sparkles className="size-3" /> FINANZZI · inteligência para o seu dinheiro</footer>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, expense = false }: { label: string; value: string; icon: typeof ArrowUpRight; expense?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-3 backdrop-blur-md"><div className={cn("flex items-center gap-1.5 text-xs", expense ? "text-red-300" : "text-emerald-300")}><Icon className="size-3.5" /> {label}</div><p className="mt-1 text-base font-semibold text-white">{value}</p></div>;
}

function MiniCard({ icon: Icon, label, value, hint, danger, warning }: { icon: typeof ArrowUpRight; label: string; value: string; hint: string; danger?: boolean; warning?: boolean }) {
  return <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.055]"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35"><Icon className="size-4" /> {label}</div><p className={cn("mt-2 truncate text-xl font-bold tracking-tight", danger ? "text-red-300" : warning ? "text-amber-200" : "text-white")}>{value}</p><p className="mt-1 truncate text-xs text-white/35">{hint}</p></div>;
}

function DarkChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: ReactNode }) {
  return <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon className="size-4" /></span><h2 className="font-display text-base font-semibold">{title}</h2></div></div><div className="[&_text]:fill-white/55 [&_.recharts-cartesian-grid_horizontal]:stroke-white/10 [&_.recharts-cartesian-grid_vertical]:stroke-white/5">{children}</div></div>;
}
