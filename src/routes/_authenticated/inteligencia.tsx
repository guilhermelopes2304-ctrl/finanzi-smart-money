import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useBills, useCategories, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { buildInsights, buildPeriod, expensesByCategory, type PeriodPreset } from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { PlanGate } from "@/components/finanzzi/PlanGate";
import { cn } from "@/lib/utils";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/_authenticated/inteligencia")({
  head: () => ({
    meta: [
      { title: "Ajuda e orientações — FINANZZI" },
      {
        name: "description",
        content: "Explicações simples baseadas nos seus próprios dados financeiros.",
      },
      { property: "og:title", content: "Ajuda e orientações — FINANZZI" },
      { property: "og:description", content: "O que seus dados estão tentando te contar." },
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
          title="Entenda seu dinheiro"
          subtitle="Informações simples para ajudar você a perceber o que merece atenção."
        />
        <EmptyState
          title="Ainda estou conhecendo seu dinheiro."
          description="Registre alguns gastos ou recebimentos. Quando houver dados suficientes, vou mostrar o que merece sua atenção."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Entenda seu dinheiro"
        subtitle="Informações simples para ajudar você a perceber o que merece atenção."
      />

      <section className="mb-5 rounded-2xl border border-fin-line bg-fin-brand-soft p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-[10px] font-black uppercase tracking-[0.16em] text-primary-foreground">
            FIN
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
              Vale a pena olhar isto
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Uma informação que pode ajudar você agora.
            </h2>
            <p className="mt-1 text-sm leading-6 text-fin-copy">
              Explicações curtas para você entender sua situação sem precisar interpretar gráficos
              ou termos financeiros.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-fin-line bg-white px-3 text-xs font-bold text-fin-brand-hover transition-colors hover:bg-fin-brand-soft"
          >
            <MessageCircle className="size-3.5" />{" "}
            <span className="hidden sm:inline">Tirar dúvida</span>
          </button>
        </div>
      </section>

      <div className="mb-5">
        <PeriodSelect
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
        />
      </div>

      <section aria-labelledby="fin-feed-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
              Seu feed de clareza
            </p>
            <h2 id="fin-feed-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
              O FIN encontrou isto.
            </h2>
          </div>
          <Sparkles className="size-5 text-fin-brand-hover" />
        </div>

        <div className="space-y-3">
          {insights.opportunities.slice(0, 3).map((insight) => (
            <article key={insight.title} className="surface-card p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-fin-brand-soft text-fin-brand-hover">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      insight.tone === "positive"
                        ? "text-fin-success"
                        : insight.tone === "warning"
                          ? "text-fin-warning"
                          : "text-foreground",
                    )}
                  >
                    {insight.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-fin-copy">{insight.description}</p>
                </div>
              </div>
            </article>
          ))}

          {insights.diagnosis.slice(0, 3).map((line) => (
            <article key={line} className="rounded-2xl border border-fin-line bg-card p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
                O FIN entende
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">{line}</p>
            </article>
          ))}
        </div>
      </section>

      {slices[0] && (
        <section className="mt-6 rounded-2xl border border-fin-line bg-card p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
            Uma descoberta do período
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {slices[0].name} representa {Math.round(slices[0].share)}% dos seus gastos.
              </h2>
              <p className="mt-1 text-sm text-fin-copy">
                Foram {formatBRL(slices[0].value)} no período.
              </p>
            </div>
            <ArrowRight className="size-5 text-fin-brand-hover" />
          </div>
        </section>
      )}

      <PlanGate feature="advanced_insights" className="mt-6">
        <section className="surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
                Acesso completo
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                O FINANZZI pode continuar ajudando você.
              </h2>
            </div>
            <span className="rounded-full bg-fin-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-fin-brand-hover">
              Ativo
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {insights.actions.slice(0, 3).map((action) => (
              <div
                key={action.title}
                className="border-t border-border pt-3 first:border-t-0 first:pt-0"
              >
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-fin-copy">{action.description}</p>
              </div>
            ))}
          </div>
        </section>
      </PlanGate>

      <p className="mt-4 text-xs text-fin-copy">
        Estas orientações servem para ajudar você a entender seus próprios registros. Elas não
        substituem uma decisão financeira profissional quando ela for necessária.
      </p>
    </div>
  );
}
