import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useBills, useCategories, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { buildInsights, buildPeriod, expensesByCategory, type PeriodPreset } from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { cn } from "@/lib/utils";
import { PlanGate } from "@/components/finanzzi/PlanGate";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/_authenticated/inteligencia")({
  head: () => ({
    meta: [
      { title: "Inteligência Finanzzi — FINANZZI" },
      {
        name: "description",
        content: "Diagnóstico e orientações educativas baseadas nos seus próprios dados.",
      },
      { property: "og:title", content: "Inteligência Finanzzi" },
      { property: "og:description", content: "Análises automáticas dos seus dados financeiros." },
    ],
  }),
  component: IntelligencePage,
});

function IntelligencePage() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: bills = [] } = useBills();
  const { data: profile } = useProfile();
  const [preset, setPreset] = useState<PeriodPreset>("current");
  const [custom, setCustom] = useState(monthRange());
  const period = useMemo(() => buildPeriod(preset, custom), [preset, custom]);

  const insights = useMemo(
    () =>
      buildInsights({
        transactions,
        categories,
        bills,
        period,
        monthlyIncome: Number(profile?.monthly_income ?? 0),
      }),
    [transactions, categories, bills, period, profile],
  );
  const slices = expensesByCategory(transactions, categories, period);

  useEffect(() => {
    if (transactions.length > 0) trackProductEvent("insight_viewed");
  }, [transactions.length]);

  if (transactions.length === 0) {
    return (
      <div>
        <PageHeader
          title="Inteligência Finanzzi"
          subtitle="Análises feitas com os seus dados reais."
        />
        <EmptyState
          title="Ainda não temos dados suficientes."
          description="Registre alguns lançamentos e voltaremos com um diagnóstico completo."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Inteligência Finanzzi"
        subtitle="Análises feitas com os seus dados reais."
      />
      <div className="mb-4">
        <PeriodSelect
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
        />
      </div>

      <div className="surface-card p-5">
        <h2 className="text-base font-semibold">Diagnóstico financeiro</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {insights.diagnosis.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Principais gastos</h2>
          <div className="mt-3 space-y-2">
            {slices.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-medium">
                  {formatBRL(s.value)} · {Math.round(s.share)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Oportunidades</h2>
          <div className="mt-3 space-y-3">
            {insights.opportunities.map((o) => (
              <div key={o.title}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    o.tone === "positive"
                      ? "text-success"
                      : o.tone === "warning"
                        ? "text-warning"
                        : "",
                  )}
                >
                  {o.title}
                </p>
                <p className="text-sm text-muted-foreground">{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PlanGate feature="advanced_insights" className="mt-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Acesso completo
              </p>
              <h2 className="mt-1 text-base font-semibold">Próximas ações avançadas</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              Ativo
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {insights.actions.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border p-4">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </PlanGate>

      <p className="mt-4 text-xs text-muted-foreground">
        As orientações do FINANZZI são educativas e baseadas apenas nos dados que você registrou.
      </p>
    </div>
  );
}
