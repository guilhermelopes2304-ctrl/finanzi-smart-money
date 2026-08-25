import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, MessageCircle, PiggyBank, ShieldCheck, WalletCards, Sparkles } from "lucide-react";
import { useAccounts, useCategories, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { availableBalance, buildPeriod, expensesByCategory, financialHealth, monthlySeries, totalsFor } from "@/lib/finance";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import { CanISpend } from "@/components/finanzzi/CanISpend";
import { BalanceEvolutionChart, CategoryPieChart, IncomeExpenseChart } from "@/components/finanzzi/charts";
import { Skeleton } from "@/components/ui/skeleton";
import type { PeriodPreset } from "@/lib/finance";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ head: () => ({ meta: [{ title: "Início — FINANZZI" }, { name: "description", content: "Seu assistente financeiro pessoal." }] }) }),
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
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const firstName = profile?.name?.split(" ")[0] || "você";
  const recent = useMemo(() => [...transactions].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5), [transactions]);
  const maxCategory = slices.length ? Math.max(...slices.map((slice) => slice.value)) : 0;
  const hasData = transactions.length > 0;
  const assistantMessage = health.level === "critical" ? "Seus gastos estão apertados. Quer que eu encontre onde dá para economizar?" : health.level === "attention" ? "Tem alguns gastos pedindo atenção. Quer revisar comigo?" : "Registre uma movimentação e eu organizo o resto.";

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Registro rápido</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Registre. O FINANZZI organiza.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Você não precisa preencher planilhas. Diga o que aconteceu e confirme.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 shadow-soft sm:flex">
            <PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
          </div>
        </header>

        {isLoading ? <Skeleton className="h-72 rounded-[1.75rem]" /> : <>
          <section className="rounded-[1.75rem] border border-primary/15 bg-card p-4 shadow-soft sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Ação principal</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">O que aconteceu?</h2></div>
              <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">texto · voz</span>
            </div>
            <QuickEntry />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {["gastei 82 no mercado", "recebi 2.500 do salário", "netflix 39,90 todo mês"].map((example) => <div key={example} className="rounded-2xl border border-border bg-background/70 px-3.5 py-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Ex.: </span>{example}</div>)}
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-soft sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Saldo disponível</p>
              <p className="mt-2 font-display text-5xl font-semibold leading-none tracking-[-0.07em] sm:text-6xl">{formatBRL(balance)}</p>
              <p className="mt-3 text-xs text-muted-foreground">Atualizado com base no que você registrou.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <Metric label="Entrou" value={formatBRL(totals.income)} icon={ArrowUpRight} />
              <Metric label="Saiu" value={formatBRL(totals.expense)} icon={ArrowDownRight} expense />
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Seu histórico</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Movimentações recentes</h2></div><Link to="/movimentacoes" className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-xs font-bold text-primary">Ver tudo <ArrowRight className="size-3.5" /></Link></div>
            {recent.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/70"><EmptyState title="Sua primeira movimentação começa aqui" description="Use o registro acima para lançar qualquer entrada ou saída." /></div> : <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-soft">{recent.map((transaction, index) => { const income = transaction.type === "income"; const category = categories.find((item) => item.id === transaction.category_id)?.name ?? "Sem categoria"; return <div key={transaction.id} className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 ${index ? "border-t border-border" : ""}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${income ? "bg-primary/8 text-primary" : "bg-red-500/10 text-red-600"}`}>{income ? "+" : "−"}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{category} · {formatDateBR(transaction.date)}</p></div><p className={`shrink-0 text-sm font-bold tabular-nums ${income ? "text-primary" : "text-red-600"}`}>{income ? "+" : "−"}{formatBRL(Number(transaction.amount))}</p></div>; })}</div>}
          </section>

          <section className="mt-8 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Depois de registrar</p><h2 className="mt-1 text-xl font-semibold">Posso gastar?</h2><p className="mt-1 text-sm text-muted-foreground">Veja quanto está livre depois dos compromissos que já conhece.</p></div><Link to="/posso-comprar" className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Abrir</Link></div><div className="mt-4"><CanISpend /></div></section>

          <section className="mt-8"><div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Leitura automática</p><h2 className="mt-1 text-xl font-semibold">Onde estou gastando</h2></div>{slices.length ? <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-soft sm:p-5">{slices.slice(0,6).map((slice) => <div key={slice.id}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{slice.name}</span><span className="font-semibold tabular-nums">{formatBRL(slice.value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${Math.max(5, maxCategory ? (slice.value / maxCategory) * 100 : 0)}%`, backgroundColor: slice.color }} /></div></div>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card/70"><EmptyState title="Ainda não há gastos por categoria" description="Registre algumas movimentações para começar a ver seu padrão." /></div>}</section>

          <section className="mt-8 rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-soft"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><MessageCircle className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-primary">Fin · seu assistente</p><h2 className="text-lg font-semibold">Quer entender alguma coisa?</h2><p className="mt-1 text-sm text-muted-foreground">{assistantMessage}</p></div><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))} className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Perguntar</button></div></section>

          <section className="mt-8 hidden gap-4 lg:grid lg:grid-cols-2"><ChartCard title="Receitas x Despesas" icon={BarChart3}>{hasData ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento." />}</ChartCard><ChartCard title="Onde seu dinheiro está indo" icon={PiggyBank}>{slices.length ? <CategoryPieChart data={slices} /> : <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão aqui." />}</ChartCard><div className="lg:col-span-2"><ChartCard title="Evolução do seu saldo" icon={WalletCards}>{hasData ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Ainda não há evolução" description="Comece registrando receitas e despesas." />}</ChartCard></div></section>
          <div className="mt-6 hidden items-center justify-center gap-2 text-xs text-muted-foreground lg:flex"><Sparkles className="size-3.5 text-primary" /> Fin acompanha seus hábitos para ajudar nas suas decisões.</div>
        </>}
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, expense = false }: { label: string; value: string; icon: typeof ArrowUpRight; expense?: boolean }) { return <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"><div className={`flex items-center gap-1 text-xs font-semibold ${expense ? "text-red-600" : "text-primary"}`}><Icon className="size-3.5" />{label}</div><p className="mt-2 text-lg font-bold tabular-nums">{value}</p></div>; }
function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: React.ReactNode }) { return <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-soft sm:p-6"><div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-4" /></span><h2 className="text-base font-semibold">{title}</h2></div>{children}</div>; }
