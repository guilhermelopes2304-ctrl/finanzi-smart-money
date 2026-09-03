/* eslint-disable prettier/prettier */
import { useMemo } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatBRL, formatDateBR } from "@/lib/format";
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

export function DashboardView({ profile, transactions, categories, accounts, bills, goals, isLoading = false, previewMode = false, quickEntryPreviewData }: DashboardViewProps) {
  void categories; void accounts; void bills; void goals;
  const firstName = profile?.name?.split(" ")[0] || "você";
  const recentTransactions = useMemo(() => [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3), [transactions]);

  return (
    <div className="fin-screen fin-dashboard fin-product-home min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-3 sm:px-6 sm:pb-10 sm:pt-5">
        <Reveal>
          <section className="fin-home-intro relative overflow-hidden rounded-[30px] border border-white/[0.07] px-5 py-6 sm:px-8 sm:py-8">
            <div className="fin-home-grid pointer-events-none absolute inset-0" />
            <div className="fin-home-orb pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/80">Seu dinheiro, no seu ritmo</p>
              <h1 className="mt-3 max-w-xl text-[2rem] font-semibold leading-[1.02] tracking-[-0.065em] sm:text-5xl">
                Olá, {firstName}. <span className="fin-gradient-text">O que aconteceu hoje?</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Escreva ou fale naturalmente. O FINANZZI transforma isso em um lançamento organizado.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal delay={40} className="relative z-[1] -mt-4 sm:-mt-5">
          <section aria-labelledby="quick-entry-title" className="fin-home-entry">
            <h2 id="quick-entry-title" className="sr-only">Registrar lançamento</h2>
            <QuickEntry previewMode={previewMode} previewData={quickEntryPreviewData ?? {}} />
          </section>
        </Reveal>

        <Reveal delay={90} className="mt-6">
          <section aria-labelledby="recent-title">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/75">Agora</p>
                <h2 id="recent-title" className="mt-1 text-xl font-semibold tracking-[-0.045em]">Últimos lançamentos</h2>
              </div>
              <Link to="/lancamentos" className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-bold text-foreground/80 fin-interactive hover:border-primary/30 hover:text-primary">
                Ver tudo <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {isLoading ? <Skeleton className="h-52 rounded-[26px] bg-muted" /> : recentTransactions.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-border bg-card/55">
                <EmptyState title="Seu histórico começa aqui" description="Registre algo acima. Em poucos segundos o FINANZZI começa a entender sua rotina." />
              </div>
            ) : (
              <div className="overflow-hidden rounded-[26px] border border-white/[0.07] bg-card/75 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                {recentTransactions.map((tx, index) => {
                  const isIncome = tx.type === "income";
                  return <div key={tx.id} className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${index > 0 ? "border-t border-white/[0.06]" : ""}`}>
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
      </div>
    </div>
  );
}
