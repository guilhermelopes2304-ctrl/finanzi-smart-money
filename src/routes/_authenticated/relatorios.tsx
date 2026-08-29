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
import { ViralMomentCard } from "@/components/finanzzi/ViralMomentCard";
import { PlanGate } from "@/components/finanzzi/PlanGate";
import {
  BalanceEvolutionChart,
  CategoryPieChart,
  IncomeExpenseChart,
} from "@/components/finanzzi/charts";
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
      {
        name: "description",
        content: "Analise seus gastos por período, categoria, conta e cartão.",
      },
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
      <PageHeader title="Resumo" subtitle="Veja o que entrou, o que saiu e onde seu dinheiro foi parar." />

      <div className="surface-card mb-4 flex flex-wrap gap-3 p-4">
        <PeriodSelect
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Entrou</SelectItem>
            <SelectItem value="expense">Saiu</SelectItem>
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
          <p className="font-display text-xl font-semibold text-success">
            {formatBRL(totals.income)}
          </p>
          <p className="text-xs text-muted-foreground">No período anterior: {formatBRL(prev.income)}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="font-display text-xl font-semibold text-danger">
            {formatBRL(totals.expense)}
          </p>
          <p className="text-xs text-muted-foreground">Antes: {formatBRL(prev.expense)}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Resultado do período</p>
          <p className="font-display text-xl font-semibold">{formatBRL(totals.balance)}</p>
          <p className="text-xs text-muted-foreground">Antes: {formatBRL(prev.balance)}</p>
        </div>
      </div>

      {slices[0] && (
        <ViralMomentCard
          className="mt-4"
          eyebrow="Para onde o dinheiro foi"
          title="Descobri para onde meu dinheiro vai."
          value={`${Math.round(slices[0].share)}%`}
          detail={`${slices[0].name} representa ${formatBRL(slices[0].value)} das despesas no período`}
          shareText={`Descobri para onde meu dinheiro vai: ${slices[0].name} representa ${Math.round(slices[0].share)}% dos meus gastos no período. Organizei essa descoberta com o FINANZZI.`}
          event="category_moment_shared"
        />
      )}

      <PlanGate feature="advanced_reports" className="mt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <h2 className="mb-3 text-base font-semibold">Como seu dinheiro mudou</h2>
            {filtered.length > 0 ? (
              <IncomeExpenseChart data={series} />
            ) : (
              <EmptyState title="Ainda não há dados para mostrar aqui" />
            )}
          </div>
          <div className="surface-card p-5">
            <h2 className="mb-3 text-base font-semibold">Gastos por categoria</h2>
            {slices.length > 0 ? (
              <CategoryPieChart data={slices} />
            ) : (
              <EmptyState title="Ainda não há gastos neste período" />
            )}
          </div>
          <div className="surface-card p-5">
            <h2 className="mb-3 text-base font-semibold">Seu saldo ao longo do tempo</h2>
            {filtered.length > 0 ? (
              <BalanceEvolutionChart data={series} />
            ) : (
              <EmptyState title="Sem dados no filtro atual" />
            )}
          </div>
          <div className="surface-card p-5">
            <h2 className="mb-3 text-base font-semibold">Onde você mais gastou</h2>
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
      </PlanGate>
    </div>
  );
}
