/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  Check,
  ChevronDown,
  ChartNoAxesCombined,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { createElement, useState } from "react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Entenda seu dinheiro sem complicar sua vida." },
      { name: "description", content: "Registre do seu jeito, veja o que realmente importa e comece grátis no FINANZZI." },
    ],
  }),
  component: Landing,
});

function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`animate-fin-fade-up ${className}`}>{children}</div>;
}

function LiveCanvas() {
  return (
    <div className="fin-live-canvas relative mx-auto w-full max-w-[720px]">
      <div className="pointer-events-none absolute inset-x-12 -top-16 h-48 rounded-full bg-[#FF5A1F]/25 blur-[90px]" />
      <div className="fin-live-panel relative overflow-hidden rounded-[32px] border border-white/10 bg-[#121212]/95 p-3 shadow-[0_30px_100px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF7A4A] to-transparent opacity-80" />
        <div className="grid gap-3 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[24px] border border-white/8 bg-[#181818] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#FF8B62]">Agora mesmo</p><p className="mt-1 text-sm font-semibold">Você só conta.</p></div>
              <span className="grid size-10 place-items-center rounded-2xl bg-[#FF5A1F] shadow-[0_10px_30px_rgba(255,90,31,.25)]"><Mic className="size-5" /></span>
            </div>
            <div className="mt-8 space-y-3">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#FF5A1F] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(255,90,31,.18)]">Uber 32 reais</div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/8 bg-[#222222] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-xs font-black text-black">U</span>
                  <div className="min-w-0"><p className="text-sm font-bold">Uber</p><p className="text-xs text-white/45">Transporte · Hoje</p></div>
                  <span className="ml-auto text-sm font-bold text-[#FF8B62]">R$ 32</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/50"><Check className="size-3.5 text-[#FF5A1F]" /> Registrado automaticamente</div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="relative overflow-hidden rounded-[24px] border border-[#FF5A1F]/20 bg-gradient-to-br from-[#2A1710] via-[#181818] to-[#181818] p-5">
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-[#FF5A1F]/15 blur-3xl" />
              <p className="relative text-[10px] font-bold uppercase tracking-[.18em] text-white/45">Disponível hoje</p>
              <p className="relative mt-3 font-display text-4xl font-semibold tracking-[-.07em] text-white">R$ 327</p>
              <p className="relative mt-2 text-xs leading-5 text-white/55">Depois do que já está comprometido.</p>
              <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full w-[64%] rounded-full bg-[#FF5A1F]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/8 bg-[#181818] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/40">Registrado</p><p className="mt-2 text-xl font-bold tracking-[-.04em]">12</p><p className="mt-1 text-[11px] text-white/45">este mês</p></div>
              <div className="rounded-[22px] border border-white/8 bg-[#181818] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/40">Próximo</p><p className="mt-2 text-sm font-bold">Netflix</p><p className="mt-1 text-[11px] text-[#FF8B62]">amanhã</p></div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-[20px] border border-white/8 bg-[#181818] px-4 py-3 text-xs text-white/55">
          <span className="size-2 rounded-full bg-[#FF5A1F] shadow-[0_0_0_5px_rgba(255,90,31,.12)]" />
          <span>Seu dinheiro ficando claro, lançamento por lançamento.</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, number }: { icon: React.ElementType; title: string; text: string; number: string }) {
  return <article className="group relative overflow-hidden rounded-[28px] border border-white/8 bg-[#181818] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF5A1F]/30 sm:p-7">
    <span className="absolute right-5 top-5 text-[11px] font-bold tracking-[.18em] text-white/15">{number}</span>
    <span className="grid size-12 place-items-center rounded-2xl bg-[#FF5A1F]/10 text-[#FF7A4A]"><Icon className="size-5" /></span>
    <h3 className="mt-7 font-display text-2xl font-semibold tracking-[-.045em]">{title}</h3>
    <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">{text}</p>
  </article>;
}

function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";
  const startCheckout = () => trackProductEvent("checkout_started");

  const faqs = [
    ["Posso começar sem pagar?", "Sim. Você pode criar sua conta e começar pelo acesso gratuito disponível no FINANZZI. Os recursos pagos podem ser contratados quando fizer sentido para você."],
    ["Preciso preencher planilhas?", "Não. A proposta do FINANZZI é registrar de um jeito natural: escrevendo ou falando o que aconteceu."],
    ["Meus dados ficam seguros?", "O acesso usa autenticação e a infraestrutura do produto mantém os dados de cada conta separados e protegidos."],
    ["Posso cancelar o plano pago?", "Sim. O plano mensal e o anual seguem as condições da assinatura e você não precisa manter um plano pago para sempre."],
  ];

  return (
    <div className="fin-landing min-h-screen overflow-x-hidden bg-[#0A0A0A] font-sans text-white">
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/50 lg:flex">
            <a className="transition-colors hover:text-white" href="#como-funciona">Como funciona</a>
            <a className="transition-colors hover:text-white" href="#planos">Planos</a>
            <a className="transition-colors hover:text-white" href="#faq">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" search={{ mode: "login" }} className="inline-flex h-10 items-center justify-center rounded-full px-3.5 text-sm font-bold text-white/80 transition hover:bg-white/[.06] hover:text-white sm:px-4">Entrar</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#FF5A1F] px-4 text-xs font-black uppercase tracking-[.08em] text-white shadow-[0_10px_28px_rgba(255,90,31,.22)] transition hover:-translate-y-0.5 hover:bg-[#FF6A35] sm:px-5">Começar grátis <ArrowRight className="size-3.5" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="fin-hero relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="fin-hero-grid pointer-events-none absolute inset-0 -z-10" />\n          <div className="fin-orb fin-orb-a pointer-events-none absolute -left-24 top-24 -z-10 size-72 rounded-full bg-[#FF5A1F]/15 blur-[90px]" />\n          <div className="fin-orb fin-orb-b pointer-events-none absolute right-0 top-0 -z-10 size-80 rounded-full bg-orange-400/10 blur-[110px]" />\n          <div className="fin-beam pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-[760px] -translate-x-1/2" />
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <SectionReveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FF5A1F]/20 bg-[#FF5A1F]/[.07] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#FF9A78]"><Sparkles className="size-3.5" /> Comece gratuitamente</span>
                <h1 className="mx-auto mt-7 max-w-4xl font-display text-[3.35rem] font-semibold leading-[.9] tracking-[-.075em] sm:text-7xl lg:text-[6.2rem]">Seu dinheiro acompanha <span className="fin-gradient-text">seu ritmo.</span></h1>
                <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">Registre em segundos. Entenda seus gastos. Organize sem complicação. O FINANZZI acompanha o que acontece para você enxergar o próximo passo.</p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/auth" search={{ mode: "signup" }} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-[0_16px_40px_rgba(255,90,31,.24)] transition hover:-translate-y-0.5 hover:bg-[#FF6A35]">Começar grátis <ArrowRight className="size-4" /></Link>
                  <a href="#como-funciona" className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/[.03] px-8 text-sm font-bold text-white/80 transition hover:bg-white/[.07]">Ver como funciona</a>
                </div>
                <p className="mt-4 text-xs text-white/35">Crie sua conta e comece sem compromisso.</p>
              </SectionReveal>
            </div>
            <SectionReveal className="fin-live-stage mt-14 sm:mt-20"><LiveCanvas /></SectionReveal>
          </div>
        </section>

        <section className="border-y border-white/[.07] bg-[#111111] px-4 py-6 sm:px-6">
          <div className="mx-auto grid max-w-5xl gap-5 text-center sm:grid-cols-3">
            {[["Você fala como fala", "Texto ou voz, sem formulário cansativo"], ["Você entende o momento", "Veja o que está disponível e comprometido"], ["Você começa grátis", "Conheça o FINANZZI antes de decidir"]].map(([title, text], index) => <div key={title} className={`px-4 ${index < 2 ? "sm:border-r sm:border-white/[.07]" : ""}`}><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-white/45">{text}</p></div>)}
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionReveal className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF7A4A]">Um jeito diferente de cuidar do dinheiro</p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-7xl">Menos controle manual. Mais clareza.</h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/55">O FINANZZI foi pensado para reduzir o atrito entre viver a vida e acompanhar o próprio dinheiro.</p>
            </SectionReveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <FeatureCard number="01" icon={MessageCircle} title="Conte o que aconteceu." text="“Uber 32”, “paguei a academia”, “recebi meu salário”. Comece pela forma mais natural." />
              <FeatureCard number="02" icon={BrainCircuit} title="Deixe o FINANZZI organizar." text="O lançamento ganha contexto para sua vida financeira ficar menos espalhada." />
              <FeatureCard number="03" icon={ChartNoAxesCombined} title="Veja o que importa agora." text="Entenda sua movimentação, seus compromissos e a margem disponível sem procurar em várias telas." />
            </div>
          </div>
        </section>

        <section className="border-y border-white/[.07] bg-[#111111] px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <SectionReveal>
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF7A4A]">Feito para a vida real</p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl">Seu dinheiro acontece rápido. Registrar também deveria.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/55">Não é sobre montar uma planilha perfeita. É sobre conseguir registrar algo no momento em que aconteceu e voltar para sua vida.</p>
              <div className="mt-8 space-y-3">
                {[[Mic, "Texto e voz", "Registre da forma que for mais rápida para você."], [BellRing, "Compromissos à vista", "Não deixe contas e assinaturas dependerem só da memória."], [WalletCards, "Tudo com contexto", "Veja movimentações e compromissos como partes da mesma história."]].map(([Icon, title, text]) => <div key={String(title)} className="flex gap-4 rounded-2xl border border-white/[.07] bg-[#181818] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F]/10 text-[#FF7A4A]">{createElement(Icon as React.ElementType, { className: "size-4.5" })}</span><div><p className="font-semibold">{title as string}</p><p className="mt-1 text-sm leading-6 text-white/45">{text as string}</p></div></div>)}
              </div>
            </SectionReveal>

            <SectionReveal>
              <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[#181818] p-5 sm:p-7">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_80%_0%,rgba(255,90,31,.18),transparent_55%)]" />
                <div className="relative flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#FF8B62]">Uma visão de verdade</p><h3 className="mt-2 font-display text-2xl font-semibold">O que está acontecendo agora.</h3></div><span className="grid size-11 place-items-center rounded-2xl bg-[#FF5A1F]"><Zap className="size-5" /></span></div>
                <div className="relative mt-7 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
                  <div className="rounded-[24px] border border-white/8 bg-[#111111] p-5"><p className="text-xs font-bold text-white/45">Gastos recentes</p><div className="mt-5 space-y-4">{[["Uber", "R$ 32,00"], ["Prime Video", "R$ 19,90"], ["Academia", "R$ 119,90"]].map(([name, value], index) => <div key={name} className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/[.06] text-[11px] font-black">{index === 0 ? "U" : index === 1 ? "P" : "A"}</span><span className="flex-1 text-sm font-semibold">{name}</span><span className="text-sm font-bold text-white/70">{value}</span></div>)}</div></div>
                  <div className="rounded-[24px] border border-[#FF5A1F]/15 bg-[#2A1710] p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#FF9A78]">Leitura rápida</p><p className="mt-4 text-sm leading-6 text-white/70">Você já tem <strong className="text-white">R$ 327</strong> comprometidos nos próximos dias.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full w-[72%] rounded-full bg-[#FF5A1F]" /></div></div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <section id="planos" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionReveal className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF7A4A]">Comece do seu jeito</p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-7xl">Entre sem pagar. Evolua quando quiser.</h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/55">A primeira decisão não precisa ser uma cobrança. Conheça o FINANZZI e escolha um plano pago quando fizer sentido.</p>
            </SectionReveal>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <article className="rounded-[28px] border border-white/8 bg-[#181818] p-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Começar</p><h3 className="mt-4 font-display text-3xl font-semibold">Grátis</h3><p className="mt-3 text-sm leading-6 text-white/50">Crie sua conta e conheça o FINANZZI sem compromisso.</p><Link to="/auth" search={{ mode: "signup" }} className="mt-8 flex h-12 items-center justify-center rounded-full bg-white text-sm font-bold text-black transition hover:bg-white/90">Começar grátis</Link></article>
              <article className="rounded-[28px] border border-white/8 bg-[#181818] p-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Mensal</p><h3 className="mt-4 font-display text-3xl font-semibold">{BILLING_PLANS.pro_monthly.name}</h3><p className="mt-5 text-4xl font-bold tracking-[-.06em]">{BILLING_PLANS.pro_monthly.priceLabel}</p><p className="mt-2 text-sm text-white/45">Mais flexibilidade para você.</p><a href={monthlyCheckout} onClick={startCheckout} className="mt-8 flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-sm font-bold transition hover:bg-white/[.08]">Ver plano mensal</a></article>
              <article className="relative overflow-hidden rounded-[28px] border border-[#FF5A1F]/55 bg-[#21120D] p-7"><div className="absolute -right-10 -top-10 size-32 rounded-full bg-[#FF5A1F]/15 blur-3xl" /><span className="relative inline-flex rounded-full bg-[#FF5A1F] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em]">Melhor valor</span><p className="relative mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Anual</p><h3 className="relative mt-4 font-display text-3xl font-semibold">{BILLING_PLANS.pro_annual.name}</h3><p className="relative mt-5 text-4xl font-bold tracking-[-.06em]">{BILLING_PLANS.pro_annual.priceLabel}</p><p className="relative mt-2 text-sm text-[#FF9A78]">{BILLING_PLANS.pro_annual.monthlyEquivalentLabel}</p><a href={annualCheckout} onClick={startCheckout} className="relative mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-[#FF5A1F] text-sm font-bold transition hover:bg-[#FF6A35]">Ver plano anual <ArrowRight className="size-4" /></a></article>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-white/[.07] bg-[#111111] px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <SectionReveal><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF7A4A]">Sem esconder o jogo</p><h2 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl">Antes de começar, as dúvidas mais comuns.</h2></SectionReveal>
            <div className="mt-10 divide-y divide-white/[.08] border-y border-white/[.08]">
              {faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-bold sm:text-lg"><span>{question}</span><ChevronDown className={`size-5 shrink-0 text-[#FF7A4A] transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="animate-fin-fade-up max-w-2xl pb-6 text-sm leading-7 text-white/55">{answer}</p>}</div>)}
            </div>
          </div>
        </section>

        <section className="fin-final-cta relative overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5A1F]/15 blur-[100px]" />
          <SectionReveal className="relative mx-auto max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF7A4A]">Seu dinheiro, com mais clareza</p>
            <h2 className="mt-6 font-display text-5xl font-semibold leading-[.92] tracking-[-.07em] sm:text-7xl">Comece pequeno.<br />Entenda muito mais.</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/55">Crie sua conta gratuitamente e descubra se o FINANZZI faz sentido para a sua rotina.</p>
            <Link to="/auth" search={{ mode: "signup" }} className="mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-[0_16px_40px_rgba(255,90,31,.24)] transition hover:-translate-y-0.5 hover:bg-[#FF6A35]">Criar conta grátis <ArrowRight className="size-4" /></Link>
          </SectionReveal>
        </section>
      </main>

      <footer className="border-t border-white/[.07] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-xs text-white/35 sm:flex-row sm:text-left">
          <Logo />
          <span>FINANZZI — inteligência para o seu dinheiro.</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#FF7A4A]" /> Feito para decidir com mais clareza</span>
        </div>
      </footer>
    </div>
  );
}
