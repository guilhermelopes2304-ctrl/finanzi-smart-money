export const PLAN_VALUES = {
  FREE: "free",
  PRO: "pro",
} as const;

export type Plan = (typeof PLAN_VALUES)[keyof typeof PLAN_VALUES];

export type ProFeature =
  | "fin_advanced"
  | "fin_score_full"
  | "financial_forecast"
  | "advanced_insights"
  | "card_analysis"
  | "goal_projection"
  | "advanced_reports"
  | "voice_entry"
  | "smart_limits"
  | "advanced_history";

export const PRO_FEATURE_LABELS: Record<
  ProFeature,
  { title: string; benefit: string; example: string }
> = {
  fin_advanced: {
    title: "FIN avançado",
    benefit: "Converse com o Fin sobre cenários e decisões mais complexas.",
    example: "“Como fico daqui a seis meses se reduzir delivery?”",
  },
  fin_score_full: {
    title: "FIN Score completo",
    benefit: "Entenda os fatores que movem sua pontuação e como evoluir.",
    example: "Veja o que aumentou ou reduziu seu score este mês.",
  },
  financial_forecast: {
    title: "Previsões financeiras",
    benefit: "Visualize cenários futuros antes de tomar decisões importantes.",
    example: "Projete sua margem até o fim do semestre.",
  },
  advanced_insights: {
    title: "Insights personalizados",
    benefit: "Receba padrões, oportunidades e explicações mais profundas.",
    example: "Descubra qual hábito está a atrasar a sua meta.",
  },
  card_analysis: {
    title: "Análise de cartões",
    benefit: "Veja o peso dos parcelamentos no seu futuro financeiro.",
    example: "Entenda quanto do próximo mês já está comprometido.",
  },
  goal_projection: {
    title: "Projeção de metas",
    benefit: "Descubra quando alcança cada objetivo no ritmo atual.",
    example: "Saiba se está à frente ou atrás do plano.",
  },
  advanced_reports: {
    title: "Relatórios avançados",
    benefit: "Compare períodos e encontre mudanças relevantes com mais detalhe.",
    example: "Compare a evolução das categorias nos últimos seis meses.",
  },
  voice_entry: {
    title: "Entrada por voz",
    benefit: "Fale com o Fin e transforme sua voz em lançamento confirmado.",
    example: "“Comprei 120 reais de gasolina no cartão.”",
  },
  smart_limits: {
    title: "Limites inteligentes",
    benefit: "Receba uma margem diária que considera os seus compromissos.",
    example: "Saiba quanto pode gastar hoje sem atrasar seus objetivos.",
  },
  advanced_history: {
    title: "Histórico avançado",
    benefit: "Explore a sua evolução financeira por mais tempo.",
    example: "Observe padrões que aparecem ao longo do ano.",
  },
};

export function normalizePlan(value?: string | null): Plan {
  return value?.trim().toLowerCase() === PLAN_VALUES.PRO ? PLAN_VALUES.PRO : PLAN_VALUES.FREE;
}

export function canAccess(plan: Plan, feature: ProFeature): boolean {
  // The authoritative value is read from profiles.plan through RLS-protected Supabase data.
  // The frontend only presents the experience; billing or server actions must re-check plan server-side.
  void feature;
  return plan === PLAN_VALUES.PRO;
}
