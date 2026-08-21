import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CircleHelp,
  CreditCard,
  Lightbulb,
  MessageCircle,
  PiggyBank,
  ShieldCheck,
  Share2,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  useAccounts,
  useBills,
  useCategories,
  useGoals,
  useProfile,
  useTransactions,
} from "@/hooks/useFinanceData";
import {
  buildInsights,
  buildPeriod,
  expensesByCategory,
  financialHealth,
  monthlySeries,
  spendCapacity,
  totalsFor,
  type PeriodPreset,
} from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { PeriodSelect } from "@/components/finanzzi/PeriodSelect";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";
import {
  BalanceEvolutionChart,
  CategoryPieChart,
  IncomeExpenseChart,
} from "@/components/finanzzi/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — FINANZZI" },
      { name: "description", content: "Sua situação financeira, sua próxima decisão." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const [preset, setPreset] = useState<PeriodPreset>("current");
  const [custom, setCustom] = useState(monthRange());
  const [showCapacityDetails, setShowCapacityDetails] = useState(false);
  const period = useMemo(() => buildPeriod(preset, custom), [preset, custom]);
  const totals = useMemo(() => totalsFor(transactions, period), [transactions, period]);
  const slices = useMemo(
    () => expensesByCategory(transactions, categories, period),
    [transactions, categories, period],
  );
  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const balance = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }).balance,
    [accounts, transactions, bills, goals],
  );
  const capacity = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }),
    [accounts, transactions, bills, goals],
  );
  const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0);
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const insights = useMemo(
    () =>
      buildInsights({
        transactions,
        categories,
        bills,
        period,
        monthlyIncome: Number(profile?.monthly_income ?? 0),
      }),
    [transactions, categories, bills, period, profile?.monthly_income],
  );
  const score = useMemo(
    () => calculateFinScore({ health, capacity, goals, transactions, income }),
    [health, capacity, goals, transactions, income],
  );
  const firstName = profile?.name?.split(" ")[0] || "você";
  const hasData = transactions.length > 0;
  const hero = getHeroCopy(capacity.level, health.level);

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-1 py-1 sm:px-2 lg:py-2">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7 animate-fade-up">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Visão geral
            </p>
            <h1 className="mt-2 truncate font-display text-2xl font-semibold tracking-tight sm:text-4xl">
              Olá, {firstName}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{hero.subtitle}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 shadow-soft sm:flex">
            <CalendarDays className="ml-2 size-4 text-muted-foreground" />
            <PeriodSelect
              preset={preset}
              onPresetChange={setPreset}
              custom={custom}
              onCustomChange={setCustom}
            />
          </div>
        </header>

        {isLoading ? (
          <Skeleton className="h-72 rounded-[2rem]" />
        ) : (
          <section className="grid gap-3 lg:grid-cols-[1.45fr_.75fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#071a12] p-5 text-white shadow-lift sm:p-8 animate-scale-in">
              <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-emerald-300/15 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-72 rounded-full bg-primary/25 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        capacity.level === "critical"
                          ? "bg-red-300"
                          : capacity.level === "attention"
                            ? "bg-amber-300"
                            : "bg-emerald-300",
                      )}
                    />
                    {hero.label}
                  </div>
                  <h2 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                    {hero.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
                    {hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                  className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-emerald-200 transition-all hover:bg-white/[0.14] active:scale-95"
                  aria-label="Perguntar ao Fin"
                >
                  <MessageCircle className="size-5" />
                </button>
              </div>
              <div className="relative mt-8 grid gap-6 border-t border-white/10 pt-5 sm:grid-cols-[1.1fr_.9fr] sm:items-end">
                <div>
                  <p className="text-xs text-white/50">Saldo disponível</p>
                  <p className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {formatBRL(balance)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DarkMetric
                    label="Entrou"
                    value={formatBRL(totals.income)}
                    positive
                    icon={ArrowUpRight}
                  />
                  <DarkMetric
                    label="Saiu"
                    value={formatBRL(totals.expense)}
                    icon={ArrowDownRight}
                  />
                </div>
              </div>
            </div>

            <FinScoreCard score={score} healthTitle={health.title} />
          </section>
        )}

        <section className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary p-5 text-primary-foreground shadow-soft sm:p-7 animate-fade-up">
            <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/65">
                  <Sparkles className="size-3.5" /> Decisão do dia
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  Posso gastar hoje?
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/70">
                  Depois das contas, parcelas e da reserva das suas metas, este é o valor seguro
                  para o dia.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-primary-foreground/10 p-3 sm:block">
                <WalletCards className="size-5" />
              </div>
            </div>
            <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs text-primary-foreground/60">Você pode gastar até</p>
                <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
                  {formatBRL(capacity.perDay)}
                </p>
              </div>
              <Link
                to="/posso-comprar"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-foreground px-4 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Ver como calculamos <ArrowRight className="size-4" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowCapacityDetails((value) => !value)}
              className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/70 hover:text-primary-foreground"
            >
              <CircleHelp className="size-3.5" />{" "}
              {showCapacityDetails ? "Ocultar detalhes" : "Entender o cálculo"}
            </button>
            {showCapacityDetails && (
              <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-primary-foreground/15 pt-3 text-xs text-primary-foreground/70">
                <div>
                  <p>Contas</p>
                  <p className="mt-1 font-semibold text-primary-foreground">
                    {formatBRL(capacity.upcomingBills)}
                  </p>
                </div>
                <div>
                  <p>Parcelas</p>
                  <p className="mt-1 font-semibold text-primary-foreground">
                    {formatBRL(capacity.upcomingInstallments)}
                  </p>
                </div>
                <div>
                  <p>Metas</p>
                  <p className="mt-1 font-semibold text-primary-foreground">
                    {formatBRL(capacity.goalsReserve)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div
            className="surface-card p-5 sm:p-7 animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Fin · contexto
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">O que merece atenção?</h2>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
                className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform hover:scale-105"
                aria-label="Abrir Fin"
              >
                <MessageCircle className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{health.message}</p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Perguntar ao Fin <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <div className="mt-3 animate-fade-up">
          <QuickEntry />
        </div>

        {!isLoading && (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniCard
                icon={ArrowUpRight}
                label="Receitas"
                value={formatBRL(totals.income)}
                tone="positive"
              />
              <MiniCard
                icon={ArrowDownRight}
                label="Despesas"
                value={formatBRL(totals.expense)}
                tone="negative"
              />
              <MiniCard
                icon={PiggyBank}
                label="Comprometido"
                value={`${health.commitment}%`}
                tone={health.commitment > 70 ? "warning" : "neutral"}
              />
              <MiniCard
                icon={Target}
                label="Metas ativas"
                value={`${goals.length}`}
                tone="neutral"
              />
            </section>

            <section className="mt-7 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
              <div className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Lightbulb className="size-4" />
                    </span>
                    <h2 className="text-base font-semibold">Feed do seu dinheiro</h2>
                  </div>
                  <Link
                    to="/inteligencia"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver análises
                  </Link>
                </div>
                <div className="mt-5 space-y-4">
                  {[...insights.opportunities.slice(0, 2), ...insights.actions.slice(0, 1)].length >
                  0 ? (
                    [...insights.opportunities.slice(0, 2), ...insights.actions.slice(0, 1)].map(
                      (insight, index) => (
                        <InsightItem key={`${insight.title}-${index}`} {...insight} />
                      ),
                    )
                  ) : (
                    <EmptyState
                      title="Seu feed começa aqui"
                      description="Registre alguns lançamentos para o Fin encontrar padrões úteis."
                    />
                  )}
                </div>
              </div>
              <div className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                      <CreditCard className="size-4" />
                    </span>
                    <h2 className="text-base font-semibold">Próximos compromissos</h2>
                  </div>
                  <Link to="/contas" className="text-xs font-semibold text-primary hover:underline">
                    Ver contas
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {bills
                    .filter((bill) => bill.status !== "paid")
                    .slice(0, 3)
                    .map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-muted/45 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{bill.description}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Vence em {formatDate(bill.due_date)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold">
                          {formatBRL(Number(bill.amount))}
                        </p>
                      </div>
                    ))}
                  {bills.filter((bill) => bill.status !== "paid").length === 0 && (
                    <EmptyState
                      title="Nenhuma conta pendente"
                      description="Você está em dia por enquanto."
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="mt-7 hidden gap-4 lg:grid lg:grid-cols-2">
              <ChartCard title="Receitas x despesas" icon={BarChart3}>
                {hasData ? (
                  <IncomeExpenseChart data={series} />
                ) : (
                  <EmptyState
                    title="Sem dados ainda"
                    description="Registre seu primeiro lançamento."
                  />
                )}
              </ChartCard>
              <ChartCard title="Para onde seu dinheiro está indo" icon={PiggyBank}>
                {slices.length > 0 ? (
                  <CategoryPieChart data={slices} />
                ) : (
                  <EmptyState
                    title="Nenhuma despesa no período"
                    description="Seus gastos aparecerão aqui."
                  />
                )}
              </ChartCard>
              <div className="lg:col-span-2">
                <ChartCard title="Evolução do seu saldo" icon={WalletCards}>
                  {hasData ? (
                    <BalanceEvolutionChart data={series} />
                  ) : (
                    <EmptyState
                      title="Ainda não há evolução"
                      description="Comece registrando receitas e despesas."
                    />
                  )}
                </ChartCard>
              </div>
            </section>
            <div className="mt-6 hidden items-center justify-center gap-2 text-xs text-muted-foreground lg:flex">
              <Sparkles className="size-3.5 text-primary" /> Fin acompanha seus hábitos para ajudar
              nas suas decisões.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getHeroCopy(
  capacityLevel: "healthy" | "attention" | "critical",
  healthLevel: "healthy" | "attention" | "critical",
) {
  if (capacityLevel === "critical" || healthLevel === "critical")
    return {
      label: "Atenção necessária",
      title: "Vamos recuperar espaço para respirar.",
      subtitle: "Seus compromissos estão pesando mais do que o ideal.",
      description:
        "O Fin encontrou um momento que merece atenção. Vamos olhar para as próximas decisões sem culpa e com clareza.",
    };
  if (capacityLevel === "attention" || healthLevel === "attention")
    return {
      label: "Momento de atenção",
      title: "Você está no controle, mas com pouco espaço.",
      subtitle: "Uma pequena revisão pode deixar o seu mês mais leve.",
      description:
        "Sua situação está acompanhável. O próximo passo é proteger sua margem e evitar que pequenos excessos se acumulem.",
    };
  return {
    label: "Dentro do plano",
    title: "Você está no controle.",
    subtitle: "Aqui está a sua situação e a próxima decisão mais segura.",
    description:
      "Seu dinheiro está seguindo um ritmo saudável. Continue registrando o dia a dia e deixe o Fin encontrar oportunidades.",
  };
}

function calculateFinScore({
  health,
  capacity,
  goals,
  transactions,
  income,
}: {
  health: ReturnType<typeof financialHealth>;
  capacity: ReturnType<typeof spendCapacity>;
  goals: { target_amount: number; current_amount: number }[];
  transactions: { type: string; date: string }[];
  income: number;
}) {
  const control = health.level === "healthy" ? 34 : health.level === "attention" ? 24 : 12;
  const margin = capacity.level === "healthy" ? 28 : capacity.level === "attention" ? 18 : 8;
  const goalProgress = goals.length
    ? Math.min(
        22,
        Math.round(
          (goals.reduce(
            (sum, goal) =>
              sum +
              Math.min(1, Number(goal.current_amount) / Math.max(1, Number(goal.target_amount))),
            0,
          ) /
            goals.length) *
            22,
        ),
      )
    : 8;
  const activity = transactions.length > 0 ? 10 : 4;
  const incomeBonus = income > 0 ? 4 : 0;
  return Math.max(0, Math.min(100, control + margin + goalProgress + activity + incomeBonus));
}

function FinScoreCard({ score, healthTitle }: { score: number; healthTitle: string }) {
  const message =
    score >= 80 ? "Muito bom" : score >= 60 ? "Em evolução" : "Vamos construir juntos";
  return (
    <div
      className="surface-card relative overflow-hidden p-5 sm:p-7 animate-fade-up"
      style={{ animationDelay: "80ms" }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Indicador FINANZZI
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">FIN Score</h2>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
      </div>
      <div className="relative mt-8 flex items-end gap-3">
        <p className="font-display text-5xl font-semibold tracking-tight text-primary">{score}</p>
        <p className="pb-1 text-sm text-muted-foreground">/ 100</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{message}</span>
        <span className="text-xs text-muted-foreground">{healthTitle}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Uma leitura do seu momento, baseada nos dados que você registrou. Não é julgamento: é
        direção.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/inteligencia"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          Como chegar mais longe <ArrowRight className="size-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => void shareFinScore(score)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Share2 className="size-3.5" /> Compartilhar
        </button>
      </div>
    </div>
  );
}

async function shareFinScore(score: number) {
  const text = `Meu FIN Score está em ${score}/100 no FINANZZI.`;
  try {
    if (typeof navigator.share === "function")
      await navigator.share({ title: "Meu FIN Score", text });
    else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    trackProductEvent("score_shared");
    toast.success("Card de evolução preparado", {
      description: "A partilha inclui apenas o seu score.",
    });
  } catch {
    // Cancelar a partilha não deve gerar erro de produto.
  }
}

function DarkMetric({
  label,
  value,
  icon: Icon,
  positive = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  positive?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 text-xs",
          positive ? "text-emerald-200" : "text-white/55",
        )}
      >
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-white sm:text-base">{value}</p>
    </div>
  );
}
function MiniCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "positive" | "negative" | "warning" | "neutral";
}) {
  return (
    <div className="surface-card min-w-0 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            tone === "positive"
              ? "text-primary"
              : tone === "negative"
                ? "text-red-500"
                : tone === "warning"
                  ? "text-amber-500"
                  : "text-muted-foreground",
          )}
        />
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          "mt-2 truncate text-base font-semibold sm:text-lg",
          tone === "positive"
            ? "text-primary"
            : tone === "negative"
              ? "text-red-500"
              : tone === "warning"
                ? "text-amber-500"
                : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
function InsightItem({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "positive" | "neutral" | "warning";
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-muted/40 p-3">
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
          tone === "positive"
            ? "bg-primary/10 text-primary"
            : tone === "warning"
              ? "bg-amber-500/10 text-amber-600"
              : "bg-muted text-muted-foreground",
        )}
      >
        <Check className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card overflow-hidden p-5 transition-shadow duration-300 hover:shadow-lift sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
function formatDate(value: string) {
  return new Date(`${value}T12:00:00`)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(" de ", " ");
}
