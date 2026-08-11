import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CreditCard,
  Lightbulb,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";

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
  { icon: Target, title: "Crie metas", text: "Planeje viagens, compras, reservas e outros objetivos." },
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
  { n: "04", title: "Melhore", text: "Receba orientações práticas baseadas nos seus próprios dados." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
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
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Organizador financeiro pessoal
            </span>
            <h1 className="mt-5 text-4xl font-bold text-foreground sm:text-6xl">FINANZZI</h1>
            <p className="mt-3 text-lg font-medium text-primary sm:text-xl">
              Inteligência para o seu dinheiro.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Entenda para onde seu dinheiro está indo, organize seus gastos e tome decisões
              financeiras melhores.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Tudo o que você precisa para organizar sua vida financeira
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="surface-card p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <b.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card/60 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">Como funciona</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="rounded-xl border border-border bg-background p-6">
                  <span className="font-display text-sm font-bold text-primary">{s.n}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
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
