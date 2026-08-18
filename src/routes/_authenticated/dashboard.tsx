import { useMemo, type ReactNode, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, MessageCircle, PiggyBank, ShieldCheck, WalletCards } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Início — FINANZZI" }, { name: "description", content: "Seu assistente financeiro pessoal." }] }),
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
  const slices = useMemo(() => expensesByCategory(transactions, categories, period), [transactions, categories, period]);
  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const balance = availableBalance(accounts, transactions);
  const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0);
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const commitment = income > 0 ? Math.round((totals.expense / income) * 100) : 0;
  const firstName = profile?.name?.split(" ")[0] || "você";
  const hasData = transactions.length > 0;
  const assistantMessage = commitment > 90 ? "Seus gastos estão apertados. Posso ajudar a encontrar onde economizar." : commitment > 70 ? "Seus gastos merecem atenção. Quer uma ajuda para economizar?" : "Está tudo bem por aqui. Quer saber quanto pode gastar hoje?";

  return (
    <div className="min-h-full bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-6xl p-3 sm:p-5 lg:p-8">
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Seu dinheiro, de um jeito simples</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">Olá, {firstName} 👋</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm sm:flex">
            <CalendarDays className="ml-2 size-4 text-slate-400" />
            <PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
          </div>
        </header>

        {isLoading ? <Skeleton className="h-48 rounded-3xl" /> : <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-500">Saldo disponível</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />{health.level === "healthy" ? "Tudo bem" : "Atenção"}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{formatBRL(balance)}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Metric label="Entrou" value={formatBRL(totals.income)} icon={ArrowUpRight} />
              <Metric label="Saiu" value={formatBRL(totals.expense)} icon={ArrowDownRight} expense />
            </div>
          </section>

          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="mt-3 w-full rounded-3xl border border-emerald-100 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md active:scale-[0.995] sm:p-5">
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-emerald-50 sm:size-20"><img src="/fin-assistente.png" alt="Fin, assistente financeiro" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_20%]" /></div>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium text-emerald-700">Fin · seu assistente financeiro</p><h2 className="mt-0.5 text-lg font-semibold tracking-tight">Como posso ajudar?</h2><p className="mt-0.5 truncate text-sm text-slate-500">{assistantMessage}</p></div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><MessageCircle className="size-5" /></span>
            </div>
          </button>
        </>}

        <div className="mt-3"><QuickEntry /></div>

        {!isLoading && <>
          <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", health.level === "healthy" ? "bg-emerald-50 text-emerald-600" : health.level === "attention" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")}><ShieldCheck className="size-5" /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-400">Como estou?</p><h2 className="text-base font-semibold">{health.title}</h2></div></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{health.message}</p>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold text-emerald-700 active:bg-emerald-50">Perguntar ao Fin →</button>
          </section>

          <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniCard icon={ArrowUpRight} label="Entradas" value={formatBRL(totals.income)} />
            <MiniCard icon={ArrowDownRight} label="Saídas" value={formatBRL(totals.expense)} danger />
            <MiniCard icon={PiggyBank} label="Comprometido" value={`${commitment}%`} warning={commitment > 70} />
            <MiniCard icon={ShieldCheck} label="Saúde" value={health.title} />
          </section>

          <section className="mt-5 hidden gap-4 lg:grid lg:grid-cols-2">
            <ChartCard title="Receitas x Despesas" icon={BarChart3}>{hasData ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento." />}</ChartCard>
            <ChartCard title="Onde seu dinheiro está indo" icon={PiggyBank}>{slices.length > 0 ? <CategoryPieChart data={slices} /> : <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão aqui." />}</ChartCard>
            <div className="lg:col-span-2"><ChartCard title="Evolução do seu saldo" icon={WalletCards}>{hasData ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Ainda não há evolução" description="Comece registrando receitas e despesas." />}</ChartCard></div>
          </section>
        </>}
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, expense = false }: { label: string; value: string; icon: typeof ArrowUpRight; expense?: boolean }) {
  return <div><div className={cn("flex items-center gap-1 text-xs font-medium", expense ? "text-red-600" : "text-emerald-700")}><Icon className="size-3.5" />{label}</div><p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">{value}</p></div>;
}

function MiniCard({ icon: Icon, label, value, danger, warning }: { icon: typeof ArrowUpRight; label: string; value: string; danger?: boolean; warning?: boolean }) {
  return <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><Icon className="size-3.5 shrink-0" /><span className="truncate">{label}</span></div><p className={cn("mt-1.5 truncate text-base font-semibold sm:text-lg", danger ? "text-red-600" : warning ? "text-amber-600" : "text-slate-800")}>{value}</p></div>;
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: ReactNode }) {
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span><h2 className="text-base font-semibold text-slate-800">{title}</h2></div><div>{children}</div></div>;
}
