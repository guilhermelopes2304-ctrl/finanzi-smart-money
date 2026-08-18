import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CreditCard,
  Eye,
  Lightbulb,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";
import { Reveal } from "@/components/finanzzi/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Inteligência para o seu dinheiro" },
      {
        name: "description",
        content:
          "Entenda para onde seu dinheiro está indo, organize seus gastos e tome decisões financeiras melhores com o FINANZZI.",
      },
      { property: "og:title", content: "FINANZZI — Inteligência para o seu dinheiro" },
      {
        property: "og:description",
        content:
          "Organizador financeiro pessoal: receitas, despesas, contas, cartões, metas e análises automáticas.",
      },
    ],
  }),
  component: Landing,
});

const benefits = [
  {
    icon: Wallet,
    title: "Controle seus gastos",
    text: "Registre receitas e despesas de forma simples.",
  },
  {
    icon: BarChart3,
    title: "Entenda seu dinheiro",
    text: "Veja exatamente para onde sua renda está indo.",
  },
  {
    icon: CalendarClock,
    title: "Organize suas contas",
    text: "Nunca perca de vista seus próximos vencimentos.",
  },
  {
    icon: CreditCard,
    title: "Controle seus cartões",
    text: "Acompanhe limite, faturas e compras parceladas.",
  },
  {
    icon: Target,
    title: "Crie metas",
    text: "Planeje viagens, compras, reservas e outros objetivos.",
  },
  {
    icon: Lightbulb,
    title: "Receba orientações",
    text: "O FINANZZI analisa seus dados e mostra oportunidades de melhoria.",
  },
];

const steps = [
  { n: "01", title: "Registre", text: "Lance suas receitas, despesas e compras em segundos." },
  { n: "02", title: "Organize", text: "Contas, cartões, categorias e vencimentos em um só lugar." },
  { n: "03", title: "Analise", text: "Gráficos e relatórios mostram a sua realidade financeira." },
  {
    n: "04",
    title: "Melhore",
    text: "Receba orientações práticas baseadas nos seus próprios dados.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "login" }}>
                Entrar
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar conta
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,var(--color-accent),transparent)] opacity-70" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2 lg:gap-8">
            <div className="text-center lg:text-left">
              <span className="inline-flex animate-in fade-in slide-in-from-bottom-3 items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground duration-700">
                <Sparkles className="size-3.5 text-gold" />
                Organizador financeiro pessoal
              </span>
              <h1 className="mt-5 animate-in fade-in slide-in-from-bottom-3 text-4xl font-bold text-foreground duration-700 [animation-delay:100ms] [animation-fill-mode:backwards] sm:text-6xl">
                FINANZZI
              </h1>
              <p className="mt-3 animate-in fade-in slide-in-from-bottom-3 text-lg font-medium text-primary duration-700 [animation-delay:180ms] [animation-fill-mode:backwards] sm:text-xl">
                Inteligência para o seu dinheiro.
              </p>
              <p className="mx-auto mt-5 animate-in fade-in slide-in-from-bottom-3 max-w-2xl text-base text-muted-foreground duration-700 [animation-delay:260ms] [animation-fill-mode:backwards] sm:text-lg lg:mx-0">
                Entenda para onde seu dinheiro está indo, organize seus gastos e tome decisões
                financeiras melhores.
              </p>
              <div className="mt-8 flex animate-in fade-in slide-in-from-bottom-3 flex-col items-center justify-center gap-3 duration-700 [animation-delay:340ms] [animation-fill-mode:backwards] sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Começar gratuitamente <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/auth" search={{ mode: "login" }}>
                    Entrar
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-1000 [animation-delay:200ms] [animation-fill-mode:backwards]">
              <div
                aria-hidden
                className="animate-float-slow pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-[oklch(0.78_0.14_82_/_0.35)] blur-2xl"
              />
              <div
                aria-hidden
                className="animate-float-slower pointer-events-none absolute -bottom-10 -left-8 size-32 rounded-full bg-primary/20 blur-2xl"
              />

              <div className="gradient-hero relative overflow-hidden rounded-[2rem] p-5 text-white shadow-[var(--shadow-lift)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.14_82_/_0.6)] to-transparent"
                />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-white/15">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M4 18V9m5 9V5m5 13v-6m5 6V8" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="font-display text-sm font-bold tracking-tight">FINANZZI</span>
                  </span>
                  <Eye className="size-4 text-white/70" />
                </div>
                <p className="mt-6 text-sm text-white/75">Saldo disponível</p>
                <p className="font-display mt-1 text-3xl font-bold tracking-tight">R$ 4.582,90</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-white/75">
                      <ArrowUpRight className="size-3.5" />
                      <span className="text-xs font-medium">Receitas</span>
                    </div>
                    <p className="mt-1 text-base font-semibold">R$ 6.200,00</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-white/75">
                      <Wallet className="size-3.5" />
                      <span className="text-xs font-medium">Despesas</span>
                    </div>
                    <p className="mt-1 text-base font-semibold">R$ 1.617,10</p>
                  </div>
                </div>
              </div>

              <div className="animate-float-slow absolute -bottom-5 -left-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-lift)] [animation-delay:1.5s]">
                <span className="grid size-7 place-items-center rounded-full bg-gold/25 text-[oklch(0.5_0.13_82)] dark:text-gold">
                  <Target className="size-3.5" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">Meta: Viagem</p>
                  <p className="text-xs font-semibold">68% concluída</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <Reveal>
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Tudo o que você precisa para organizar sua vida financeira
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="surface-card group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-transform group-hover:scale-110">
                    <b.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/60 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold sm:text-3xl">Como funciona</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="h-full rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/30">
                    <span className="font-display text-sm font-bold text-primary">{s.n}</span>
                    <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Reveal>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Comece a organizar sua vida financeira
            </h2>
            <p className="mt-3 text-muted-foreground">
              Leva menos de dois minutos para dar o primeiro passo.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar minha conta gratuita <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">Inteligência para o seu dinheiro.</p>
          <p className="text-xs text-muted-foreground">
            O FINANZZI é uma ferramenta educativa de organização financeira e não substitui
            aconselhamento profissional.
          </p>
        </div>
      </footer>
    </div>
  );
}
