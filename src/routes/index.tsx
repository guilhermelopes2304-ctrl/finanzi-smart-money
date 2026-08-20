import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarClock, Check, CreditCard, MessageCircle, ShieldCheck, Sparkles, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "FINANZZI — Inteligência para o seu dinheiro" }, { name: "description", content: "Organize sua vida financeira com simplicidade e conte com o Fin para tomar decisões melhores." }] }),
  component: Landing,
});

const features = [
  [Wallet, "Lançamentos simples", "Registre entradas e saídas em poucos segundos."],
  [CalendarClock, "Contas em dia", "Tenha vencimentos e compromissos sempre à vista."],
  [CreditCard, "Cartões sob controle", "Acompanhe faturas, limites e parcelamentos."],
  [Target, "Metas que fazem sentido", "Transforme seus planos em objetivos acompanháveis."],
  [BarChart3, "Entenda seus números", "Veja para onde seu dinheiro está indo sem complicação."],
  [MessageCircle, "Converse com o Fin", "Pergunte, registre gastos e receba ajuda pelo assistente."],
] as const;

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="animate-fin-fade-up"><Logo /></Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex"><Link to="/auth" search={{ mode: "login" }}>Entrar</Link></Button>
            <Button asChild className="rounded-full px-5 shadow-soft transition-transform duration-300 hover:-translate-y-0.5"><Link to="/auth" search={{ mode: "signup" }}>Começar <ArrowRight className="ml-1 size-4" /></Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute -left-32 top-10 size-80 rounded-full bg-primary/15 blur-3xl animate-float-slower" />
          <div className="pointer-events-none absolute -right-24 top-20 size-96 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-primary)_15%,transparent),transparent_52%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_.97fr] lg:py-28">
            <div className="text-center lg:text-left">
              <div className="animate-fin-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3.5 py-2 text-xs font-semibold text-primary shadow-soft lg:mx-0">
                <Sparkles className="size-3.5 animate-fin-pulse" /> Inteligência para o seu dinheiro
              </div>
              <h1 className="animate-fin-fade-up mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
                Seu dinheiro.<br /><span className="text-primary">Mais inteligente.</span>
              </h1>
              <p className="animate-fin-fade-up mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0" style={{ animationDelay: "140ms" }}>
                O FINANZZI organiza sua vida financeira e coloca o <strong className="text-foreground">Fin</strong> ao seu lado para transformar números em decisões melhores.
              </p>
              <div className="animate-fin-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "200ms" }}>
                <Button asChild size="lg" className="h-13 rounded-full px-8 text-base shadow-lift transition-all duration-300 hover:-translate-y-1">
                  <Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight className="ml-1 size-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-8 text-base bg-background/60 backdrop-blur transition-all duration-300 hover:-translate-y-1">
                  <Link to="/auth" search={{ mode: "login" }}>Já tenho uma conta</Link>
                </Button>
              </div>
              <div className="animate-fin-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start" style={{ animationDelay: "260ms" }}>
                <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-primary" /> Fácil de usar</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Seus dados protegidos</span>
                <span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> Fin com IA</span>
              </div>
            </div>

            <div className="animate-fin-scale-in relative mx-auto w-full max-w-lg" style={{ animationDelay: "120ms" }}>
              <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-border/70 bg-card/80 p-3 shadow-lift backdrop-blur-xl transition-transform duration-700 hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-[1.6rem] bg-primary p-5 text-primary-foreground sm:p-7">
                  <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary-foreground/10 blur-2xl animate-float-slow" />
                  <div className="relative flex items-center justify-between"><span className="text-sm font-semibold">Olá 👋</span><span className="rounded-full bg-primary-foreground/12 px-2.5 py-1 text-[10px]">Visão financeira</span></div>
                  <p className="relative mt-9 text-xs opacity-70">Saldo disponível</p>
                  <p className="relative mt-1 font-display text-3xl font-bold sm:text-4xl">R$ 4.582,90</p>
                  <div className="relative mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 p-3.5 backdrop-blur"><p className="text-[11px] opacity-70">Entradas</p><p className="mt-1 font-semibold">R$ 6.200</p></div>
                    <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 p-3.5 backdrop-blur"><p className="text-[11px] opacity-70">Saídas</p><p className="mt-1 font-semibold">R$ 1.617</p></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-4 shadow-soft transition-transform duration-300 hover:scale-[1.015]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary animate-fin-pulse"><MessageCircle className="size-5" /></span>
                  <div><p className="text-sm font-semibold">Fale com o Fin</p><p className="text-xs text-muted-foreground">“Posso gastar R$ 200 hoje?”</p></div>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/35">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center animate-fin-fade-up">
              <p className="text-sm font-semibold text-primary">Tudo em um só lugar</p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Feito para facilitar, não para complicar</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Você não precisa entender de finanças para começar a cuidar melhor do seu dinheiro.</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, title, text], index) => (
                <div key={title} className="surface-card animate-fin-fade-up group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift" style={{ animationDelay: `${index * 60}ms` }}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110"><Icon className="size-5" /></span>
                  <h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="pointer-events-none absolute inset-x-1/4 top-1/3 -z-10 h-32 rounded-full bg-primary/10 blur-3xl" />
          <ShieldCheck className="mx-auto size-9 text-primary animate-fin-pulse" />
          <h2 className="mt-5 font-display text-2xl font-bold sm:text-4xl">Comece no seu ritmo.</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Registre uma despesa, acompanhe seu saldo e deixe o Fin ajudar no restante.</p>
          <Button asChild size="lg" className="mt-8 h-13 rounded-full px-8 shadow-lift transition-transform duration-300 hover:-translate-y-1"><Link to="/auth" search={{ mode: "signup" }}>Criar minha conta <ArrowRight className="ml-1 size-4" /></Link></Button>
        </section>
      </main>

      <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center"><Logo /><p className="text-xs text-muted-foreground">Inteligência para o seu dinheiro.</p></div></footer>
    </div>
  );
}
