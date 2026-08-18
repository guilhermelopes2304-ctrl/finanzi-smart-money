import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarClock, Check, CreditCard, MessageCircle, ShieldCheck, Sparkles, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

export const Route = createFileRoute("/")({ head: () => ({ meta: [{ title: "FINANZZI — Inteligência para o seu dinheiro" }, { name: "description", content: "Organize sua vida financeira com simplicidade e conte com o Fin para tomar decisões melhores." }] }), component: Landing });

const features = [
  [Wallet, "Lançamentos simples", "Registre entradas e saídas em poucos segundos."],
  [CalendarClock, "Contas em dia", "Tenha vencimentos e compromissos financeiros sempre à vista."],
  [CreditCard, "Cartões sob controle", "Acompanhe faturas, limites e compras parceladas."],
  [Target, "Metas que fazem sentido", "Transforme seus planos em objetivos acompanháveis."],
  [BarChart3, "Entenda seus números", "Veja para onde seu dinheiro está indo sem complicação."],
  [MessageCircle, "Converse com o Fin", "Pergunte, registre gastos e receba ajuda pelo assistente."],
] as const;

function Landing() {
  return <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2"><ThemeToggle /><Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/auth" search={{ mode: "login" }}>Entrar</Link></Button><Button asChild className="rounded-full px-5"><Link to="/auth" search={{ mode: "signup" }}>Começar</Link></Button></div>
      </div>
    </header>
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-primary)_13%,transparent),transparent_48%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="text-center lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground lg:mx-0"><Sparkles className="size-3.5 text-primary" /> Seu dinheiro, mais simples.</div>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-6xl">Organize seu dinheiro.<br /><span className="text-primary">Viva com mais tranquilidade.</span></h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">O FINANZZI reúne sua vida financeira em um só lugar e coloca o <strong className="text-foreground">Fin</strong> ao seu lado para ajudar nas decisões do dia a dia.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"><Button asChild size="lg" className="h-12 rounded-full px-7 text-base"><Link to="/auth" search={{ mode: "signup" }}>Criar minha conta <ArrowRight className="ml-1 size-4" /></Link></Button><Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base"><Link to="/auth" search={{ mode: "login" }}>Já tenho uma conta</Link></Button></div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground lg:justify-start"><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-primary" /> Fácil de usar</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Seus dados protegidos</span></div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative rounded-[2rem] border border-border bg-card p-4 shadow-[var(--shadow-lift)]">
              <div className="rounded-[1.5rem] bg-primary p-5 text-primary-foreground">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">Olá, Guilherme 👋</span><span className="rounded-full bg-primary-foreground/15 px-2 py-1 text-[10px]">Hoje</span></div>
                <p className="mt-8 text-xs opacity-75">Saldo disponível</p><p className="mt-1 font-display text-3xl font-bold">R$ 4.582,90</p>
                <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-primary-foreground/10 p-3"><p className="text-[11px] opacity-70">Entradas</p><p className="mt-1 font-semibold">R$ 6.200</p></div><div className="rounded-2xl bg-primary-foreground/10 p-3"><p className="text-[11px] opacity-70">Saídas</p><p className="mt-1 font-semibold">R$ 1.617</p></div></div>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><MessageCircle className="size-5" /></span><div><p className="text-sm font-semibold">Fale com o Fin</p><p className="text-xs text-muted-foreground">“Posso gastar R$ 200 hoje?”</p></div><ArrowRight className="ml-auto size-4 text-muted-foreground" /></div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-card/50"><div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold text-primary">Tudo em um só lugar</p><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Feito para facilitar, não para complicar</h2><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Você não precisa entender de finanças para começar a cuidar melhor do seu dinheiro.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,text]) => <div key={title} className="surface-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></section>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"><ShieldCheck className="mx-auto size-8 text-primary" /><h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Comece no seu ritmo</h2><p className="mt-3 text-muted-foreground">Registre uma despesa, acompanhe seu saldo e deixe o Fin ajudar no restante.</p><Button asChild size="lg" className="mt-7 h-12 rounded-full px-7"><Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight className="ml-1 size-4" /></Link></Button></section>
    </main>
    <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center"><Logo /><p className="text-xs text-muted-foreground">Inteligência para o seu dinheiro.</p></div></footer>
  </div>;
}
