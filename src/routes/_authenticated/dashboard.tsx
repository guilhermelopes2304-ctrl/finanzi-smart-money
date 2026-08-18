import { useMemo, type ReactNode, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, MessageCircle, PiggyBank, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
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
    { title: "Início — FINANZZI" },
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
  const assistantMessage = commitment > 90
    ? "Seus gastos estão apertados. Posso encontrar onde economizar."
    : commitment > 70
      ? "Seus gastos merecem atenção. Quer que eu encontre oportunidades de economia?"
      : "Está tudo bem por aqui. Quer saber quanto pode gastar hoje?";

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.105_0.022_155)] text-white shadow-[0_24px_80px_oklch(0.1_0.02_155_/_0.22)]">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-emerald-400/[0.09] blur-3xl" />
      <div className="relative p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/80 sm:text-xs"><Sparkles className="size-3.5" /> FINANZZI</div>
            <h1 className="truncate text-[1.55rem] font-bold tracking-[-0.04em] sm:text-4xl">Olá, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-white/50">Vamos cuidar do seu dinheiro juntos.</p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-1 sm:flex [&_button]:border-white/10 [&_button]:bg-transparent [&_button]:text-white">
            <CalendarDays className="ml-2 size-4 text-white/40" />
            <PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
          </div>
        </header>

        {isLoading ? <Skeleton className="h-64 rounded-[1.5rem] bg-white/10" /> : (
          <>
            <section className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-400/[0.16] via-emerald-950/70 to-black p-5 sm:p-7">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-white/50">Saldo disponível</span><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> {health.level === "healthy" ? "Tudo bem" : "Atenção"}</span></div>
              <p className="mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">{formatBRL(balance)}</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <Metric label="Entrou" value={formatBRL(totals.income)} icon={ArrowUpRight} />
                <Metric label="Saiu" value={formatBRL(totals.expense)} icon={ArrowDownRight} expense />
              </div>
            </section>

            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="group relative mt-3 min-h-[190px] w-full overflow-hidden rounded-[1.5rem] border border-emerald-300/15 bg-[#061810] text-left shadow-xl active:scale-[0.99] sm:min-h-[280px]">
              <img src="/fin-assistente.png" alt="Fin, assistente financeiro do FINANZZI" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[50%_25%] opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03100a] via-[#03100a]/75 to-transparent" />
              <div className="relative flex h-full min-h-[190px] flex-col justify-between p-5 sm:min-h-[280px] sm:p-6">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-emerald-200"><span className="size-1.5 rounded-full bg-emerald-400" /> Fin está online</span><MessageCircle className="size-5 text-white/70" /></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 sm:text-xs">Seu assistente financeiro</p><h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Fale com o Fin.</h2><p className="mt-1 max-w-md text-sm leading-5 text-white/65">{assistantMessage}</p><span className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#032013]">Conversar com o Fin <MessageCircle className="size-4" /></span></div>
              </div>
            </button>
          </>
        )}

        <div className="relative mt-3"><QuickEntry /></div>

        {!isLoading && <>
          <section className="mt-3 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 sm:p-6">
            <div className="flex items-center gap-3"><span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", health.level === "healthy" ? "bg-emerald-400/10 text-emerald-300" : health.level === "attention" ? "bg-amber-300/10 text-amber-200" : "bg-red-400/10 text-red-300")}><ShieldCheck className="size-5" /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Como estou?</p><h2 className="truncate text-base font-semibold">{health.title}</h2></div></div>
            <p className="mt-3 text-sm leading-6 text-white/55">{health.message}</p>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold text-emerald-300 active:bg-emerald-400/10">Perguntar ao Fin →</button>
          </section>

          <section className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <MiniCard icon={ArrowUpRight} label="Entradas" value={formatBRL(totals.income)} />
            <MiniCard icon={ArrowDownRight} label="Saídas" value={formatBRL(totals.expense)} danger />
            <MiniCard icon={PiggyBank} label="Comprometido" value={`${commitment}%`} warning={commitment > 70} />
            <MiniCard icon={ShieldCheck} label="Saúde" value={health.title} />
          </section>

          <section className="mt-4 hidden gap-4 lg:grid lg:grid-cols-2">
            <DarkChartCard title="Receitas x Despesas" icon={BarChart3}>{hasData ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento." />}</DarkChartCard>
            <DarkChartCard title="Onde seu dinheiro está indo" icon={PiggyBank}>{slices.length > 0 ? <CategoryPieChart data={slices} /> : <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão aqui." />}</DarkChartCard>
            <div className="lg:col-span-2"><DarkChartCard title="Evolução do seu saldo" icon={WalletCards}>{hasData ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Ainda não há evolução" description="Comece registrando receitas e despesas." />}</DarkChartCard></div>
          </section>
        </>}

        <footer className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/25 sm:text-[11px]"><Sparkles className="size-3" /> inteligência para o seu dinheiro</footer>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, expense = false }: { label: string; value: string; icon: typeof ArrowUpRight; expense?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-3"><div className={cn("flex items-center gap-1.5 text-xs", expense ? "text-red-300" : "text-emerald-300")}><Icon className="size-3.5" /> {label}</div><p className="mt-1 text-base font-semibold text-white">{value}</p></div>;
}

function MiniCard({ icon: Icon, label, value, danger, warning }: { icon: typeof ArrowUpRight; label: string; value: string; danger?: boolean; warning?: boolean }) {
  return <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 sm:p-4"><div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35"><Icon className="size-3.5 shrink-0" /> <span className="truncate">{label}</span></div><p className={cn("mt-1.5 truncate text-base font-bold sm:text-xl", danger ? "text-red-300" : warning ? "text-amber-200" : "text-white")}>{value}</p></div>;
}

function DarkChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: ReactNode }) {
  return <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6"><div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon className="size-4" /></span><h2 className="text-base font-semibold">{title}</h2></div><div className="[&_text]:fill-white/55 [&_.recharts-cartesian-grid_horizontal]:stroke-white/10 [&_.recharts-cartesian-grid_vertical]:stroke-white/5">{children}</div></div>;
}
