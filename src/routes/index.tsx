import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CreditCard,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assinar FINANZZI — Seu dinheiro mais simples" },
      {
        name: "description",
        content:
          "Registre, organize, lembre, entenda e oriente sua vida financeira com o acesso completo ao FINANZZI.",
      },
    ],
  }),
  component: Landing,
});

const features: { icon: LucideIcon; eyebrow: string; title: string; text: string }[] = [
  {
    icon: Wallet,
    eyebrow: "Clareza",
    title: "Uma visão que faz sentido",
    text: "Receitas, despesas e compromissos organizados para você entender o momento, não apenas consultar números.",
  },
  {
    icon: MessageCircle,
    eyebrow: "Copiloto",
    title: "O Fin pensa com você",
    text: "Pergunte, registre por texto ou voz e receba respostas no contexto do seu próprio dinheiro.",
  },
  {
    icon: Target,
    eyebrow: "Direção",
    title: "Metas que viram próximos passos",
    text: "Acompanhe o que falta, o ritmo necessário e as escolhas que aproximam você dos seus objetivos.",
  },
  {
    icon: CreditCard,
    eyebrow: "Futuro",
    title: "Cartões sem surpresas",
    text: "Veja o peso dos parcelamentos e quanto cada decisão compromete os próximos meses.",
  },
  {
    icon: BarChart3,
    eyebrow: "Insights",
    title: "Padrões que você não percebe",
    text: "O Fin encontra variações, vazamentos e oportunidades sem transformar sua vida em uma planilha.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Confiança",
    title: "Seu dinheiro permanece seu",
    text: "Autenticação, isolamento por usuário e uma experiência transparente para decisões mais tranquilas.",
  },
];

function Landing() {
  const [income, setIncome] = useState("3500");
  const [expenses, setExpenses] = useState("2600");
  const margin = useMemo(
    () => Math.max(0, Number(income.replace(",", ".")) - Number(expenses.replace(",", "."))),
    [income, expenses],
  );
  const marginPercent = Number(income) > 0 ? Math.round((margin / Number(income)) * 100) : 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="animate-fin-fade-up">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link to="/auth" search={{ mode: "login" }}>
                Entrar
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full px-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <Link to="/oferta">
                Assinar FINANZZI <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#071a12] text-white">
          <div className="fin-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-emerald-300/12 blur-3xl animate-float-slower" />
          <div className="pointer-events-none absolute -right-24 top-20 size-[28rem] rounded-full bg-primary/25 blur-3xl animate-float-slow" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.94fr_1.06fr] lg:py-28">
            <div className="text-center lg:text-left">
              <div className="animate-fin-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-emerald-200 lg:mx-0">
                <Sparkles className="size-3.5" /> Copiloto financeiro pessoal
              </div>
              <h1
                className="animate-fin-fade-up mt-7 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
                style={{ animationDelay: "80ms" }}
              >
                Seu dinheiro não precisa ser complicado.
                <br />
                <span className="text-emerald-300">Comece a entendê-lo.</span>
              </h1>
              <p
                className="animate-fin-fade-up mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg lg:mx-0"
                style={{ animationDelay: "140ms" }}
              >
                Registre seus gastos por texto ou voz. O FINANZZI organiza tudo, lembra das suas
                contas e ajuda você a decidir com o <strong className="text-white">Fin</strong> ao
                seu lado.
              </p>
              <div
                className="animate-fin-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
                style={{ animationDelay: "200ms" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full bg-emerald-300 px-8 text-base text-[#062117] shadow-[0_12px_40px_rgba(110,231,183,.2)] hover:bg-emerald-200"
                >
                  <Link to="/oferta">
                    Assinar FINANZZI <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-white/15 bg-white/[0.06] px-8 text-base text-white hover:bg-white/[0.12] hover:text-white"
                >
                  <a href="#fin">
                    Conhecer o Fin <ChevronRight className="ml-1 size-4" />
                  </a>
                </Button>
              </div>
              <div
                className="animate-fin-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/55 lg:justify-start"
                style={{ animationDelay: "260ms" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-300" /> Sem complicação
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-300" /> Dados protegidos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-4 text-emerald-300" /> Fin com IA
                </span>
              </div>
            </div>

            <div
              className="animate-fin-scale-in relative mx-auto w-full max-w-xl"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute -inset-7 rounded-[3rem] bg-emerald-300/10 blur-3xl" />
              <div className="relative rounded-[2.25rem] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">
                <div className="overflow-hidden rounded-[1.8rem] bg-[#0d2d20] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                        Visão financeira
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        Seu dinheiro. Sua próxima decisão.
                      </p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald-300 text-[#062117]">
                      <Wallet className="size-5" />
                    </span>
                  </div>
                  <div className="mt-9 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/45">Saldo disponível</p>
                      <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
                        R$ 4.582,90
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                      Dentro do plano
                    </span>
                  </div>
                  <div className="mt-7 grid grid-cols-3 gap-2">
                    <PreviewMetric label="Entradas" value="R$ 6.200" />
                    <PreviewMetric label="Saídas" value="R$ 1.617" />
                    <PreviewMetric label="Hoje" value="R$ 327" />
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-300 text-[#062117]">
                      <MessageCircle className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">O Fin já entendeu o seu mês</p>
                      <p className="mt-1 text-xs text-white/50">“Você pode gastar R$ 327 hoje.”</p>
                    </div>
                  </div>
                  <div className="hidden items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-center sm:flex">
                    <p className="text-xs leading-5 text-white/55">
                      Clareza
                      <br />
                      <strong className="text-emerald-200">em segundos</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fin" className="relative border-b border-border/70 bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_65%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:py-28">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Veja o Fin em ação
              </p>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Seu dinheiro pode explicar o que fazer a seguir.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Antes de criar uma conta, experimente a lógica que transforma números em uma
                conversa útil.
              </p>
              <div className="mt-7 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="mt-1 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  Margem mensal estimada em poucos segundos.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-1 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  Explicações simples, sem julgamento.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-1 grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  Os dados reais só entram quando você decidir.
                </p>
              </div>
            </div>
            <div className="surface-card fin-glow rounded-[2rem] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    Simulação pública
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Como está sua margem?</h3>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="size-5" />
                </span>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold">
                  Renda mensal
                  <input
                    type="number"
                    min="0"
                    value={income}
                    onChange={(event) => setIncome(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold">
                  Gastos médios
                  <input
                    type="number"
                    min="0"
                    value={expenses}
                    onChange={(event) => setExpenses(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>
              <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground">
                <p className="text-xs text-primary-foreground/65">O Fin diria:</p>
                <p className="mt-2 font-display text-2xl font-semibold leading-tight">
                  Você tem uma margem de {formatCurrency(margin)}.
                </p>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                  Isso representa {marginPercent}% da sua renda. Com o FINANZZI, você acompanha para
                  onde essa margem vai e decide com mais segurança.
                </p>
              </div>
              <Button asChild className="mt-5 h-12 w-full rounded-xl">
                <Link to="/oferta">
                  Ver a oferta completa <ArrowRight className="ml-auto size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-card/35">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Um sistema, não uma planilha
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Clareza para o agora. Direção para o depois.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Tudo o que você já precisa para organizar a vida financeira, com uma camada de
                inteligência que ajuda a transformar registro em decisão.
              </p>
            </div>
            <div className="fin-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, eyebrow, title, text }) => (
                <div
                  key={title}
                  className="surface-card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/65">
                      {eyebrow}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <div className="pointer-events-none absolute inset-x-1/4 top-1/3 -z-10 h-40 rounded-full bg-primary/12 blur-3xl" />
          <ShieldCheck className="mx-auto size-9 text-primary" />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Comece no seu ritmo
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-5xl">
            Seu próximo passo pode ser mais simples.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Registre uma despesa, acompanhe seu saldo e deixe o Fin ajudar no restante.
          </p>
          <Button asChild size="lg" className="mt-8 h-13 rounded-full px-8 shadow-lift">
            <Link to="/oferta">
              Assinar agora <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Meu dinheiro. Minha situação. Minha próxima decisão.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-[10px] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
