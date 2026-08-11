import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCategories, useTransactions } from "@/hooks/useFinanceData";
import {
  buildPeriod,
  expensesByCategory,
  inPeriod,
  monthlySeries,
  previousPeriod,
  totalsFor,
  type PeriodPreset,
} from "@/lib/finance";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { BalanceEvolutionChart, CategoryPieChart, IncomeExpenseChart } from "@/components/finanzzi/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — FINANZZI" },
      { name: "description", content: "Analise seus gastos por período, categoria, conta e cartão." },
      { property: "og:title", content: "Relatórios — FINANZZI" },
      { property: "og:description", content: "Relatórios financeiros completos dos seus dados." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const [preset, setPreset] = useState<PeriodPreset>("current");
  const [custom, setCustom] = useState(monthRange());
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  const period = useMemo(() => buildPeriod(preset, custom), [preset, custom]);
  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        if (category !== "all" && tx.category_id !== category) return false;
        if (type !== "all" && tx.type !== type) return false;
        return true;
      }),
    [transactions, category, type],
  );
  const totals = totalsFor(filtered, period);
  const prev = totalsFor(filtered, previousPeriod(period));
  const slices = expensesByCategory(filtered, categories, period);
  const series = monthlySeries(filtered);
  const biggest = filtered
    .filter((tx) => tx.type === "expense" && inPeriod(tx, period))
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Analise seus números com profundidade." />

      <div className="surface-card mb-4 flex flex-wrap gap-3 p-4">
        <PeriodSelect preset={preset} onPresetChange={setPreset} custom={custom} onCustomChange={setCustom} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Receitas</p>
          <p className="font-display text-xl font-semibold text-success">{formatBRL(totals.income)}</p>
          <p className="text-xs text-muted-foreground">Antes: {formatBRL(prev.income)}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="font-display text-xl font-semibold text-danger">{formatBRL(totals.expense)}</p>
          <p className="text-xs text-muted-foreground">Antes: {formatBRL(prev.expense)}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Saldo do período</p>
          <p className="font-display text-xl font-semibold">{formatBRL(totals.balance)}</p>
          <p className="text-xs text-muted-foreground">Antes: {formatBRL(prev.balance)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Evolução mensal</h2>
          {filtered.length > 0 ? <IncomeExpenseChart data={series} /> : <EmptyState title="Sem dados no filtro atual" />}
        </div>
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Gastos por categoria</h2>
          {slices.length > 0 ? <CategoryPieChart data={slices} /> : <EmptyState title="Sem despesas no período" />}
        </div>
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Evolução do saldo</h2>
          {filtered.length > 0 ? <BalanceEvolutionChart data={series} /> : <EmptyState title="Sem dados no filtro atual" />}
        </div>
        <div className="surface-card p-5">
          <h2 className="mb-3 text-base font-semibold">Maiores gastos do período</h2>
          {biggest.length === 0 ? (
            <EmptyState title="Nenhuma despesa registrada" />
          ) : (
            <div className="space-y-2">
              {biggest.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {tx.description}{" "}
                    <span className="text-xs text-muted-foreground">{formatDateBR(tx.date)}</span>
                  </span>
                  <span className="font-medium">{formatBRL(Number(tx.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}