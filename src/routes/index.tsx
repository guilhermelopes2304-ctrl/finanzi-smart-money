import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Mic, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FINANZZI — Pare de organizar tudo. Comece a entender." },
    { name: "description", content: "Controle financeiro simples: você conta o que aconteceu e o FINANZZI organiza." },
  ] }),
  component: Landing,
});

const PRINTS = {
  hero: ["/prints/hero.png"],
  registro: ["/prints/registro-1.png", "/prints/registro-2.png", "/prints/registro-3.png"],
  clareza: ["/prints/clareza-1.png"],
  fin: ["/prints/fin-1.png", "/prints/fin-2.png"],
  compromissos: ["/prints/compromissos-1.png", "/prints/compromissos-2.png"],
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduced ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function PhoneMockup({ prints, alt }: { prints: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (prints.length < 2 || reduced) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % prints.length), 3400);
    return () => window.clearInterval(timer);
  }, [prints.length, reduced]);
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="rounded-[38px] border-[8px] border-[#333333] bg-[#18181A] p-[3px]">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[28px] bg-[#262626]">
          <AnimatePresence mode="sync">
            <motion.img key={prints[index]} src={prints[index]} alt={alt} loading="lazy" decoding="async" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0.01 : 0.6 }} className="absolute inset-0 h-full w-full object-cover" />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-[#0A0A0A]" />
        </div>
      </div>
      {prints.length > 1 && <div className="mt-4 flex justify-center gap-1.5">{prints.map((print, dot) => <span key={print} className={dot === index ? "h-1.5 w-5 rounded-full bg-[#F3612D]" : "size-1.5 rounded-full bg-[#333333]"} />)}</div>}
    </div>
  );
}

function Scene({ number, eyebrow, title, side, reverse = false }: { number: string; eyebrow: string; title: string; side: React.ReactNode; reverse?: boolean }) {
  return <section className="px-4 py-24 sm:px-6 sm:py-32"><div className={"mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 " + (reverse ? "lg:[&>*:first-child]:order-2" : "")}><Reveal><div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#F3612D]">{number} · {eyebrow}</p><h2 className="mt-5 max-w-xl text-5xl font-bold leading-[.94] tracking-[-.06em] text-[#FFFFFF] sm:text-7xl">{title}</h2></div></Reveal><Reveal>{side}</Reveal></div></section>;
}

function Landing() {
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";
  const beginCheckout = () => trackProductEvent("checkout_started");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    ["Meus dados ficam seguros?", "Sim. O FINANZZI usa autenticação e infraestrutura do Supabase para manter os dados da sua conta protegidos."],
    ["Funciona por voz?", "Sim. Você pode registrar do seu jeito: falando ou escrevendo o que aconteceu."],
    ["Posso cancelar quando quiser?", "Sim. Você mantém o controle da sua assinatura e pode cancelar conforme as condições do plano."],
    ["Quanto custa?", "Você pode começar pelo plano disponível na página e escolher a opção que fizer mais sentido para você."],
  ];
  return <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] font-sans text-[#FFFFFF]">
    <header className="sticky top-0 z-40 border-b border-[#333333] bg-[#0A0A0A]"><div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6"><Link to="/" aria-label="FINANZZI — início"><Logo /></Link><nav className="hidden gap-7 text-sm font-semibold text-[#A3A3A3] lg:flex"><a href="#produto">Produto</a><a href="#planos">Planos</a><a href="#faq">Dúvidas</a></nav><div className="flex items-center gap-2"><Link to="/auth" search={{ mode: "login" }} className="hidden px-4 py-2 text-sm font-semibold text-[#A3A3A3] sm:inline-flex">Entrar</Link><a href={annualCheckout} onClick={beginCheckout} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#F3612D] px-5 text-xs font-bold text-white">COMEÇAR <ArrowRight className="size-4" /></a></div></div></header>

    <main>
      <section className="px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-20"><div className="mx-auto flex max-w-5xl flex-col items-center text-center"><Reveal><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#F3612D]">FINANZZI · dinheiro com clareza</p><h1 className="mx-auto mt-5 max-w-4xl text-5xl font-bold leading-[.9] tracking-[-.075em] sm:text-7xl lg:text-[6rem]">Pare de organizar tudo.<br />Comece a entender.</h1><p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-[#A3A3A3]">Você conta o que aconteceu. O FINANZZI organiza.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href={annualCheckout} onClick={beginCheckout} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#F3612D] px-8 text-sm font-bold">QUERO O FINANZZI <ArrowRight className="size-4" /></a><a href="#produto" className="inline-flex h-14 items-center justify-center rounded-full bg-[#262626] px-8 text-sm font-bold">VER COMO FUNCIONA</a></div></Reveal><Reveal className="mt-14 w-full"><PhoneMockup prints={PRINTS.hero} alt="Tela inicial do FINANZZI" /></Reveal></div></section>

      <section className="border-y border-[#333333] bg-[#18181A] px-4 py-8 sm:px-6"><Reveal className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">{[["Seguro", "Infraestrutura Supabase"],["Grátis pra começar", "Sem compromisso complicado"],["Sem planilha", "Você só conta o que aconteceu"]].map(([title, text]) => <div key={title} className="text-center sm:border-r sm:border-[#333333] sm:last:border-0"><p className="text-lg font-bold">{title}</p><p className="mt-1 text-sm text-[#A3A3A3]">{text}</p></div>)}</Reveal></section>

      <div id="produto">
        <Scene number="01" eyebrow="Registro" title="Você não preenche. Você conta." side={<div><PhoneMockup prints={PRINTS.registro} alt="Registro rápido de uma movimentação" /><div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full bg-[#262626] px-5 py-4 text-sm text-[#A3A3A3]"><Mic className="size-5 text-[#F3612D]" /><span>“30 reais Uber”</span><span className="ml-auto size-8 rounded-full bg-[#F3612D]" /></div></div>} />
        <Scene number="02" eyebrow="Clareza" title="Você vê para onde o dinheiro vai." reverse side={<PhoneMockup prints={PRINTS.clareza} alt="Resumo financeiro por categoria" />} />
        <Scene number="03" eyebrow="FIN percebeu" title="O FINANZZI chama sua atenção na hora certa." side={<PhoneMockup prints={PRINTS.fin} alt="Insight proativo do FINANZZI" />} />
        <Scene number="04" eyebrow="Compromissos" title="Nada te pega de surpresa." reverse side={<PhoneMockup prints={PRINTS.compromissos} alt="Compromissos dos próximos dias" />} />
      </div>

      <section id="planos" className="border-y border-[#333333] bg-[#18181A] px-4 py-24 sm:px-6 sm:py-32"><div className="mx-auto max-w-5xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#F3612D]">Planos</p><h2 className="mt-5 max-w-3xl text-5xl font-bold leading-[.94] tracking-[-.06em] sm:text-7xl">Menos uma coisa para pensar.</h2></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-2"><Reveal><article className="rounded-[24px] border border-[#333333] bg-[#18181A] p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#A3A3A3]">Mensal</p><h3 className="mt-3 text-3xl font-bold">{BILLING_PLANS.pro_monthly.name}</h3><p className="mt-8 text-5xl font-bold tracking-[-.07em]">{BILLING_PLANS.pro_monthly.priceLabel}</p><a href={monthlyCheckout} onClick={beginCheckout} className="mt-8 flex h-14 items-center justify-center rounded-full bg-[#262626] text-sm font-bold">ASSINAR MENSAL</a></article></Reveal><Reveal><article className="rounded-[24px] border border-[#F3612D] bg-[#18181A] p-8"><span className="inline-flex rounded-[8px] bg-[#F3612D] px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em]">melhor valor</span><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#A3A3A3]">Anual</p><h3 className="mt-3 text-3xl font-bold">{BILLING_PLANS.pro_annual.name}</h3><p className="mt-8 text-5xl font-bold tracking-[-.07em]">{BILLING_PLANS.pro_annual.priceLabel}</p><p className="mt-2 text-sm text-[#F3612D]">{BILLING_PLANS.pro_annual.monthlyEquivalentLabel}</p><a href={annualCheckout} onClick={beginCheckout} className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-[#F3612D] text-sm font-bold">ASSINAR ANUAL <ArrowRight className="size-4" /></a></article></Reveal></div></div></section>

      <section id="faq" className="px-4 py-24 sm:px-6 sm:py-32"><div className="mx-auto max-w-3xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#F3612D]">Dúvidas</p><h2 className="mt-5 text-5xl font-bold leading-[.94] tracking-[-.06em] sm:text-7xl">Sem letra miúda.</h2></Reveal><div className="mt-10 divide-y divide-[#333333] border-y border-[#333333]">{faqs.map(([question, answer], index) => <div key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-bold"><span>{question}</span><ChevronDown className={openFaq === index ? "size-5 rotate-180 text-[#F3612D]" : "size-5 text-[#A3A3A3]"} /></button><AnimatePresence>{openFaq === index && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-6 leading-7 text-[#A3A3A3]">{answer}</p></motion.div>}</AnimatePresence></div>)}</div></div></section>

      <section className="border-t border-[#333333] bg-[#18181A] px-4 py-24 text-center sm:px-6 sm:py-32"><Reveal><h2 className="mx-auto max-w-4xl text-5xl font-bold leading-[.92] tracking-[-.07em] sm:text-7xl">Pare de organizar tudo.<br />Comece a entender.</h2><p className="mx-auto mt-6 max-w-xl text-lg text-[#A3A3A3]">Seu dinheiro não precisa de mais uma planilha.</p><a href={annualCheckout} onClick={beginCheckout} className="mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[#F3612D] px-8 text-sm font-bold">COMEÇAR AGORA <ArrowRight className="size-4" /></a></Reveal></section>
    </main>

    <footer className="border-t border-[#333333] px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#A3A3A3] sm:flex-row sm:items-center sm:justify-between"><Link to="/"><Logo /></Link><span>FINANZZI — inteligência para o seu dinheiro.</span><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-[#F3612D]" /> Feito para decidir com clareza</span></div></footer>
  </div>;
}
