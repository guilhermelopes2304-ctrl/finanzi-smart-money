import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import {
  useAccounts,
  useCategories,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import {
  availableBalance,
  buildPeriod,
  expensesByCategory,
  financialHealth,
  monthlySeries,
  previousPeriod,
  totalsFor,
  type PeriodPreset,
} from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { StatCard } from "@/components/finanzzi/StatCard";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import {
  BalanceEvolutionChart,
  CategoryPieChart,
  IncomeExpenseChart,
} from "@/components/finanzzi/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FINANZZI" },
      { name: "description", content: "Veja como está sua vida financeira em um só painel." },
      { property: "og:title", content: "Dashboard — FINANZZI" },
      { property: "og:description", content: "Seu panorama financeiro completo." },
    ],
  }),
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
  const prev = useMemo(
    () => totalsFor(transactions, previousPeriod(period)),
    [transactions, period],
  );
  const slices = useMemo(
    () => expensesByCategory(transactions, categories, period),
    [transactions, categories, period],
  );
  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const balance = availableBalance(accounts, transactions);
  const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0);
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const commitment = income > 0 ? Math.round((totals.expense / income) * 100) : 0;

  const variation = (current: number, before: number) => {
    if (!before) return undefined;
    const diff = Math.round(((current - before) / before) * 100);
    return `${diff >= 0 ? "+" : ""}${diff}% vs. período anterior`;
  };

  const hasData = transactions.length > 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Olá, {profile?.name?.split(" ")[0] || "tudo bem"}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Veja como está sua vida financeira.</p>
        </div>
        <PeriodSelect
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saldo disponível" value={formatBRL(balance)} icon={Wallet} />
          <StatCard
            label="Receitas"
            value={formatBRL(totals.income)}
            icon={ArrowUpRight}
            tone="income"
            hint={variation(totals.income, prev.income)}
          />
          <StatCard
            label="Despesas"
            value={formatBRL(totals.expense)}
            icon={ArrowDownRight}
            tone="expense"
            hint={variation(totals.expense, prev.expense)}
          />
          <StatCard
            label="Comprometido"
            value={`${commitment}%`}
            icon={PiggyBank}
            tone={commitment > 90 ? "expense" : commitment > 70 ? "warning" : "income"}
            hint="da sua renda no período"
          />
        </div>
      )}

      <div className="surface-card mt-4 p-5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "size-3 rounded-full",
              health.level === "healthy"
                ? "bg-success"
                : health.level === "attention"
                  ? "bg-warning"
                  : "bg-danger",
            )}
          />
          <h2 className="text-lg font-semibold">Como está sua vida financeira?</h2>
          <span className="ml-auto text-sm font-medium text-muted-foreground">{health.title}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{health.message}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Receitas x Despesas</h2>
          {hasData ? (
            <IncomeExpenseChart data={series} />
          ) : (
            <EmptyState title="Sem dados ainda" description="Registre seu primeiro lançamento para ver este gráfico." />
          )}
        </div>
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Gastos por categoria</h2>
          {slices.length > 0 ? (
            <CategoryPieChart data={slices} />
          ) : (
            <EmptyState title="Nenhuma despesa no período" description="Seus gastos aparecerão distribuídos aqui." />
          )}
        </div>
        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Evolução do saldo</h2>
          {hasData ? (
            <BalanceEvolutionChart data={series} />
          ) : (
            <EmptyState title="Ainda não há evolução para mostrar" description="Comece registrando receitas e despesas." />
          )}
        </div>
      </div>
    </div>
  );
}