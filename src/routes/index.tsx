import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";
import { Reveal } from "@/components/finanzzi/Reveal";
import { PhoneMockup } from "@/components/finanzzi/landing/PhoneMockup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Inteligência para o seu dinheiro" },
      { name: "description", content: "Organize sua vida financeira com simplicidade e conte com o Fin para tomar decisões melhores todos os dias." },
      { property: "og:title", content: "FINANZZI — Inteligência para o seu dinheiro" },
      { property: "og:description", content: "Saldo, contas, cartões e metas em um só lugar — com o assistente Fin ao seu lado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  [Wallet, "Lançamentos simples", "Registre entradas e saídas em poucos segundos, até por texto solto."],
  [CalendarClock, "Contas em dia", "Vencimentos e compromissos sempre à vista, antes de virarem problema."],
  [CreditCard, "Cartões sob controle", "Faturas, limites e compras parceladas acompanhados de perto."],
  [Target, "Metas que fazem sentido", "Transforme planos em objetivos com valor mensal calculado."],
  [BarChart3, "Entenda seus números", "Veja para onde seu dinheiro vai, sem planilha e sem jargão."],
  [MessageCircle, "Converse com o Fin", "Pergunte, registre gastos e receba respostas com seus dados reais."],
] as const;

const steps = [
  ["01", "Crie sua conta", "Leva menos de um minuto. Nada de configuração complicada."],
  ["02", "Registre o essencial", "Saldo, contas do mês e cartões. Ou escreva “gastei 40 no mercado”."],
  ["03", "Pergunte ao Fin", "“Posso gastar R$ 200 hoje?” — e receba a resposta com números reais."],
] as const;

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full border border-border bg-card/85 px-3 pl-5 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:h-16">
          <Logo />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex"><Link to="/auth" search={{ mode: "login" }}>Entrar</Link></Button>
            <Button asChild className="rounded-full px-5"><Link to="/auth" search={{ mode: "signup" }}>Começar</Link></Button>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_62%)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="animate-fin-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"><Sparkles className="size-3.5 text-primary" /> Inteligência para o seu dinheiro</span>
            <h1 className="animate-fin-fade-up mt-6 font-display text-[2.65rem] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance sm:text-7xl">Organize seu dinheiro.<br /><span className="text-primary">Viva com tranquilidade.</span></h1>
            <p className="animate-fin-fade-up mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg">O FINANZZI reúne saldo, contas, cartões e metas em um só lugar — e coloca o <strong className="font-semibold text-foreground">Fin</strong> ao seu lado para ajudar nas decisões do dia a dia.</p>
            <div className="animate-fin-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 w-full rounded-full px-7 text-base sm:w-auto"><Link to="/auth" search={{ mode: "signup" }}>Criar minha conta <ArrowRight className="ml-1 size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full px-7 text-base sm:w-auto"><Link to="/auth" search={{ mode: "login" }}>Já tenho uma conta</Link></Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-primary" /> Fácil de usar</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> Seus dados protegidos</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> Assistente incluído</span>
            </div>
          </div>
          <div className="relative mt-16 sm:mt-20"><PhoneMockup /></div>
        </section>
        <section className="border-y border-border bg-card/60"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Tudo em um só lugar</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-5xl">Feito para facilitar, não para complicar</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Você não precisa entender de finanças para começar a cuidar melhor do seu dinheiro.</p></Reveal>
          <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, text], i) => <Reveal key={title} delay={i * 70}><div className="surface-card h-full p-6 transition-transform hover:-translate-y-1"><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span><h3 className="mt-5 font-display text-lg font-bold tracking-tight">{title}</h3><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div>
        </div></section>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"><Reveal className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Como funciona</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-5xl">Três passos até a clareza</h2></Reveal><div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3">{steps.map(([num, title, text], i) => <Reveal key={num} delay={i * 90}><div className="surface-card h-full p-6"><span className="font-display text-4xl font-extrabold tracking-tight text-primary/25">{num}</span><h3 className="mt-3 font-display text-lg font-bold tracking-tight">{title}</h3><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div></section>
        <section className="px-4 pb-16 sm:px-6 sm:pb-24"><Reveal className="mx-auto max-w-5xl"><div className="gradient-stage relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-20"><div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" /><span className="relative inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-semibold"><MessageCircle className="size-3.5" /> Converse com o Fin</span><h2 className="relative mt-6 font-display text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-5xl">“Posso gastar R$ 200 hoje?”</h2><p className="relative mx-auto mt-5 max-w-xl text-sm leading-7 opacity-85 sm:text-base">O Fin olha seu saldo, as contas que ainda vencem, as parcelas do cartão e o que está reservado para as suas metas — e responde com um número claro.</p><Button asChild size="lg" variant="secondary" className="relative mt-8 h-12 rounded-full px-7 text-base"><Link to="/auth" search={{ mode: "signup" }}>Experimentar agora <ArrowRight className="ml-1 size-4" /></Link></Button></div></Reveal></section>
        <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6 sm:pb-28"><Reveal><ShieldCheck className="mx-auto size-8 text-primary" /><h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-4xl">Comece no seu ritmo</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">Registre uma despesa, acompanhe seu saldo e deixe o Fin ajudar no restante.</p><Button asChild size="lg" className="mt-8 h-12 rounded-full px-7 text-base"><Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight className="ml-1 size-4" /></Link></Button></Reveal></section>
      </main>
      <footer className="border-t border-border py-10"><div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center"><Logo /><p className="text-xs text-muted-foreground">Inteligência para o seu dinheiro.</p></div></footer>
    </div>
  );
}
