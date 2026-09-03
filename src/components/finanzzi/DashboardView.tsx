/* eslint-disable prettier/prettier */
import { useMemo } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, CircleHelp, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { nextCommitments } from "@/lib/commitments";
import { buildInsights, buildPeriod, spendCapacity } from "@/lib/finance";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import type { Account, Bill, Category, Goal, Profile, Transaction } from "@/types/finance";
import { QuickEntry, type QuickEntryPreviewData } from "@/components/finanzzi/QuickEntry";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/finanzzi/Reveal";
import { TransactionBrandLogo } from "@/components/finanzzi/TransactionBrandLogo";

type DashboardViewProps = {
  profile?: Profile | null;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  bills: Bill[];
  goals: Goal[];
  isLoading?: boolean;
  capacityPerDay?: number;
  previewMode?: boolean;
  quickEntryPreviewData?: QuickEntryPreviewData;
};

export function DashboardView({ profile, transactions, categories, accounts, bills, goals, isLoading = false, capacityPerDay, previewMode = false, quickEntryPreviewData }: DashboardViewProps) {
  const period = useMemo(() => buildPeriod("current", monthRange()), []);
  const capacity = useMemo(() => spendCapacity({ accounts, transactions, bills, goals }), [accounts, transactions, bills, goals]);
  const commitments = useMemo(() => nextCommitments(bills, categories, 3), [bills, categories]);
  const insights = useMemo(() => buildInsights({ transactions, categories, bills, period, monthlyIncome: Number(profile?.monthly_income ?? 0) }), [transactions, categories, bills, period, profile?.monthly_income]);
  const firstName = profile?.name?.split(" ")[0] || "você";
  const dailyCapacity = capacityPerDay ?? capacity.perDay;
  const hasPressure = dailyCapacity <= 0;
  const available = Math.max(0, dailyCapacity);
  const insight = insights.opportunities[0] ?? insights.actions[0];
  const commitmentsTotal = commitments.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-7">
        <Reveal className="pb-2 sm:pb-4">
          <section className="relative overflow-hidden rounded-[26px] border border-border/70 bg-card px-5 py-5 shadow-[0_10px_32px_rgba(0,0,0,0.045)] sm:px-7 sm:py-6">
            <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-muted-foreground">{getGreeting()}, {firstName}</p>
                <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-4xl">Vamos organizar seu dinheiro.</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Veja o que importa agora ou registre algo em poucos segundos.</p>
              </div>
              <span className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/15 bg-fin-brand-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] text-fin-brand-hover">
                <span className="size-1.5 rounded-full bg-primary" />
                Ao vivo
              </span>
            </div>
          </section>
        </Reveal>

        <Reveal delay={45} className="mt-4">
          <section aria-labelledby="quick-entry-title">
            <h2 id="quick-entry-title" className="sr-only">Registrar algo</h2>
            <QuickEntry previewMode={previewMode} previewData={quickEntryPreviewData ?? {}} />
          </section>
        </Reveal>

        <Reveal delay={85} className="mt-5">
          <section aria-labelledby="capacity-title">
            {isLoading ? <Skeleton className="h-40 rounded-[28px] bg-muted" /> : <div className={`relative overflow-hidden rounded-[28px] border p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-6 ${hasPressure ? "border-fin-danger/30 bg-fin-danger-soft" : "border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)/0.15),hsl(var(--card))_48%,hsl(var(--primary)/0.06))]"}`}>
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Seu limite de hoje</p>
                  <h2 id="capacity-title" className="mt-1 text-sm font-medium text-muted-foreground">Quanto cabe no seu dia sem apertar o mês</h2>
                </div>
                <Link to="/posso-comprar" className="grid size-10 shrink-0 place-items-center rounded-full border border-border/70 bg-background/75 text-fin-brand-hover shadow-sm transition-transform duration-200 hover:-translate-y-0.5" aria-label="Ver detalhes">
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <p className="relative mt-4 font-display text-[2.9rem] font-semibold leading-none tracking-[-0.07em] text-foreground sm:text-6xl">{formatBRL(available)}</p>
              <p className={`relative mt-3 max-w-sm text-sm leading-5 ${hasPressure ? "text-fin-danger" : "text-muted-foreground"}`}>{hasPressure ? "Seus compromissos já ocupam praticamente toda a sua margem." : "Já considerando suas contas e compromissos conhecidos."}</p>
            </div>}
          </section>
        </Reveal>

        <Reveal delay={125} className="mt-7">
          <section aria-labelledby="recent-title">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Movimentação</p>
                <h2 id="recent-title" className="mt-1 text-xl font-semibold tracking-[-0.04em]">Últimos lançamentos</h2>
              </div>
              <Link to="/lancamentos" className="inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-fin-brand-hover transition-transform duration-200 hover:-translate-y-0.5">Ver histórico <ArrowRight className="size-3.5" /></Link>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-card/70">
                <EmptyState title="Seu histórico começa aqui" description="Registre um gasto ou recebimento para começar a enxergar seu dinheiro." />
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                {recentTransactions.map((tx, index) => {
                  const isIncome = tx.type === "income";
                  return <div key={tx.id} className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 ${index > 0 ? "border-t border-border/70" : ""}`}>
                    <TransactionBrandLogo description={tx.description} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{tx.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateBR(tx.date)}</p>
                    </div>
                    <div className={`flex shrink-0 items-center gap-1 text-sm font-bold ${isIncome ? "text-primary" : "text-foreground"}`}>
                      {isIncome ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5 text-muted-foreground" />}
                      {isIncome ? "+" : "-"}{formatBRL(Number(tx.amount))}
                    </div>
                  </div>;
                })}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={165} className="mt-7">
          <section aria-labelledby="commitments-title">
            <div className="mb-3 flex items-end justify-between gap-3"><div><h2 id="commitments-title" className="text-xl font-semibold tracking-[-0.03em]">Próximas contas</h2>{commitments.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{formatBRL(commitmentsTotal)} nos próximos pagamentos.</p>}</div><Link to="/contas" className="inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-fin-brand-hover transition-transform duration-200 hover:-translate-y-0.5">Ver tudo <ArrowRight className="size-3.5" /></Link></div>
            {commitments.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/70"><EmptyState title="Você ainda não tem contas cadastradas" description="Cadastre uma conta para acompanhar vencimentos e não esquecer o pagamento." /></div> : <div className="surface-card overflow-hidden">{commitments.map((bill, index) => { const days = daysUntil(bill.due_date); return <div key={bill.id} className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 ${index > 0 ? "border-t border-border" : ""}`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-fin-brand-soft text-fin-brand-hover"><CalendarClock className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{bill.description}</p><p className="mt-0.5 text-xs text-muted-foreground">{days <= 0 ? "vence hoje" : days === 1 ? "vence amanhã" : `vence em ${days} dias`} · {formatDateBR(bill.due_date)}</p></div><p className="shrink-0 text-sm font-bold">{formatBRL(Number(bill.amount))}</p></div>; })}</div>}
          </section>
        </Reveal>

        <Reveal delay={170} className="mt-7 pb-12">
          <section aria-labelledby="fin-insight-title">
            <div className="mb-3"><h2 id="fin-insight-title" className="text-xl font-semibold tracking-[-0.03em]">Uma informação para você.</h2></div>
            <div className="surface-card flex items-start gap-3 p-4 transition-transform duration-300 hover:-translate-y-0.5 sm:p-5"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-fin-brand-soft text-fin-brand-hover"><Sparkles className="size-4" /></span>{insight ? <div><p className="text-sm font-semibold">{insight.title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{insight.description}</p></div> : <div className="flex items-start gap-3"><CircleHelp className="mt-0.5 size-4 shrink-0 text-fin-brand-hover" /><p className="text-sm leading-6 text-muted-foreground">Registre seus gastos e recebimentos. Com alguns dados, o FINANZZI mostra o que merece sua atenção.</p></div>}</div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

function getGreeting() { const hour = new Date().getHours(); if (hour < 12) return "Bom dia"; if (hour < 18) return "Boa tarde"; return "Boa noite"; }
function daysUntil(date: string) { const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime(); const target = new Date(`${date}T12:00:00`).getTime(); return Math.round((target - today) / 86_400_000); }
