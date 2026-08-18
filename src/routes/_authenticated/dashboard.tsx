import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, BarChart3, MessageCircle, PiggyBank, Sparkles, Target, WalletCards } from "lucide-react";
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
    { name: "description", content: "Veja como está sua vida financeira em um só painel." },
    { property: "og:title", content: "Dashboard — FINANZZI" },
    { property: "og:description", content: "Seu panorama financeiro completo." },
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
  const firstName = profile?.name?.split(" ")[0] || "tudo bem";
  const hasData = transactions.length > 0;
  const variation = (current: number, before: number) => {
    if (!before) return "Novo período";
    const diff = Math.round(((current - before) / before) * 100);
    return `${diff >= 0 ? "+" : ""}${diff}% vs. período anterior`;
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.12_0.025_155)] p-4 text-white shadow-[0_24px_80px_oklch(0.12_0.025_155_/_0.22)] sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[oklch(0.55_0.18_150_/_0.18)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 size-96 rounded-full bg-[oklch(0.7_0.18_90_/_0.08)] blur-3xl" />
      <header className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-200"><Sparkles className="size-3.5" /> FINANZZI · inteligência para o seu dinheiro</div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Olá, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-white/55">Seu dinheiro em um só lugar. Vamos organizar?</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl [&_button]:text-white [&_button]:border-white/10 [&_button]:bg-transparent"><PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} /></div>
      </header>

      {isLoading ? <Skeleton className="h-64 rounded-[1.75rem] bg-white/10" /> : (
        <section className="relative grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-500/25 via-emerald-950/70 to-black p-5 shadow-2xl sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex items-center gap-2 text-sm text-white/60"><WalletCards className="size-4 text-emerald-300" /> Saldo disponível</div>
            <div className="relative mt-2 flex items-end justify-between gap-4"><p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{formatBRL(balance)}</p><span className="hidden items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:flex"><ArrowUpRight className="size-3.5" /> FINANZZI ativo</span></div>
            <div className="relative mt-7 grid grid-cols-2 gap-3"><Metric label="Receitas" value={formatBRL(totals.income)} icon={ArrowUpRight} /><Metric label="Despesas" value={formatBRL(totals.expense)} icon={ArrowDownRight} expense /></div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[1.75rem] border border-emerald-300/15 bg-[#061b13] shadow-2xl">
            <img src="/fin-assistente.png" alt="Fin, assistente financeiro do FINANZZI" className="absolute inset-0 h-full w-full object-cover object-[50%_30%] opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04110c] via-[#04110c]/65 to-[#04110c]/10" />
            <div className="relative flex h-full min-h-[260px] flex-col justify-end p-5 sm:p-6">
              <div className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-black/30 px-3 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md"><span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]" /> Fin · seu assistente financeiro</div>
              <h2 className="font-display max-w-sm text-xl font-bold sm:text-2xl">Bora organizar suas finanças?</h2>
              <p className="mt-1 max-w-md text-sm text-white/65">{commitment > 90 ? "Seus gastos estão apertados. Vamos encontrar onde reduzir agora." : commitment > 70 ? "Seus gastos estão altos. Posso mostrar onde dá para economizar." : "Sua vida financeira está no caminho certo. Vamos melhorar ainda mais."}</p>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#032013] shadow-lg shadow-emerald-400/20 transition hover:scale-[1.02]"><MessageCircle className="size-4" /> Falar com o Fin</button>
            </div>
          </div>
        </section>
      )}

      <div className="relative mt-4"><QuickEntry /></div>

      {!isLoading && <section className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard icon={ArrowUpRight} label="Receitas" value={formatBRL(totals.income)} hint={variation(totals.income, prev.income)} />
        <MiniCard icon={ArrowDownRight} label="Despesas" value={formatBRL(totals.expense)} hint={variation(totals.expense, prev.expense)} danger />
        <MiniCard icon={PiggyBank} label="Comprometimento" value={`${commitment}%`} hint="da sua renda" warning={commitment > 70} />
        <MiniCard icon={Target} label="Saúde financeira" value={health.title} hint="análise atual" />
      </section>}

      <section className="relative mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center gap-3"><span className={cn("size-3 rounded-full shadow-lg", health.level === "healthy" ? "bg-emerald-400" : health.level === "attention" ? "bg-amber-300" : "bg-red-400")} /><h2 className="font-display text-lg font-semibold">Como está sua vida financeira?</h2><span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/65">{health.title}</span></div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{health.message}</p>
      </section>

      <section className="relative mt-4 grid gap-4 lg:grid-cols-2">
        <DarkChartCard title="Receitas x Despesas" icon={BarChart3}>{hasData ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento para ver este gráfico." />}</DarkChartCard>
        <DarkChartCard title="Gastos por categoria" icon={PiggyBank}>{slices.length > 0 ? <CategoryPieChart data={slices} /> : <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão distribuídos aqui." />}</DarkChartCard>
        <div className="lg:col-span-2"><DarkChartCard title="Evolução do saldo" icon={WalletCards}>{hasData ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Ainda não há evolução para mostrar" description="Comece registrando receitas e despesas." />}</DarkChartCard></div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon, expense = false }: { label: string; value: string; icon: typeof ArrowUpRight; expense?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md"><div className={cn("flex items-center gap-1.5 text-xs", expense ? "text-red-300" : "text-emerald-300")}><Icon className="size-3.5" /> {label}</div><p className="mt-1 text-base font-semibold text-white">{value}</p></div>;
}

function MiniCard({ icon: Icon, label, value, hint, danger, warning }: { icon: typeof ArrowUpRight; label: string; value: string; hint: string; danger?: boolean; warning?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.07]"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/45"><Icon className="size-4" /> {label}</div><p className={cn("mt-2 truncate text-lg font-bold", danger ? "text-red-300" : warning ? "text-amber-200" : "text-white")}>{value}</p><p className="mt-1 truncate text-xs text-white/40">{hint}</p></div>;
}

function DarkChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: ReactNode }) {
  return <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl sm:p-6"><div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-emerald-300" /><h2 className="font-display text-base font-semibold">{title}</h2></div><div className="[&_text]:fill-white/60 [&_.recharts-cartesian-grid_horizontal]:stroke-white/10 [&_.recharts-cartesian-grid_vertical]:stroke-white/5">{children}</div></div>;
}
