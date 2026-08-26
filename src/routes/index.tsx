import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Mic, Play, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";
import { Reveal } from "@/components/finanzzi/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FINANZZI — Seu dinheiro sem complicação" },
    { name: "description", content: "Registre seu dinheiro do seu jeito. O FINANZZI organiza, lembra e ajuda você a decidir." },
  ] }),
  component: Landing,
});

const examples = [
  { text: "mercado 82", amount: "R$ 82,00", context: "Mercado · Alimentação" },
  { text: "uber 27", amount: "R$ 27,00", context: "Uber · Transporte" },
  { text: "Netflix 39,90 todo mês", amount: "R$ 39,90", context: "Netflix · Assinatura" },
];

function Landing() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";
  const example = examples[exampleIndex];
  const checkout = (url: string) => { trackProductEvent("checkout_started"); return url; };
  const nextExample = () => setExampleIndex((value) => (value + 1) % examples.length);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFCF8] text-[#111827] selection:bg-[#19C96B] selection:text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-[#E1E7E3] bg-[#FCFCF8]/95">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#556070] lg:flex">
            <a href="#como-funciona" className="transition-colors duration-200 hover:text-[#111827]">Como funciona</a>
            <a href="#contas" className="transition-colors duration-200 hover:text-[#111827]">Compromissos</a>
            <a href="#oferta" className="transition-colors duration-200 hover:text-[#111827]">Oferta</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth" search={{ mode: "login" }} className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#556070] transition-transform duration-200 hover:-translate-y-0.5 hover:text-[#111827] sm:inline-flex">Entrar</Link>
            <a href={checkout(annualCheckout)} className="inline-flex items-center gap-1.5 rounded-full bg-[#19C96B] px-4 py-2.5 text-xs font-bold transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:px-5 sm:text-sm">QUERO O FINANZZI <ArrowRight className="size-3.5" /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-20">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Seu dinheiro, do seu jeito</p>
              <h1 className="mt-5 max-w-2xl font-display text-[3.7rem] font-semibold leading-[.9] tracking-[-0.075em] sm:text-7xl lg:text-[6.4rem]">Seu dinheiro não precisa dar trabalho.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#556070] sm:text-xl">Você fala o que aconteceu. O FINANZZI registra, organiza e lembra do que merece sua atenção.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={checkout(annualCheckout)} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#19C96B] px-7 text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:text-base">QUERO O FINANZZI <ArrowRight className="size-4" /></a>
                <a href="#como-funciona" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#E1E7E3] bg-white px-7 text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5 sm:text-base"><Play className="size-4 fill-current" /> VER COMO FUNCIONA</a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#556070]"><span>✓ registro manual</span><span>✓ texto ou voz</span><span>✓ feito para celular</span></div>
            </Reveal>

            <Reveal delay={90} className="mx-auto w-full max-w-[470px] lg:justify-self-end">
              <div className="rounded-[2.5rem] border border-[#E1E7E3] bg-white p-3 shadow-[0_24px_70px_rgba(33,38,29,0.10)] sm:p-4">
                <div className="rounded-[2rem] bg-[#F4F6F5] p-4 sm:p-5">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Registro rápido</p><p className="mt-1 text-sm font-semibold">Fale como você falaria.</p></div><span className="grid size-9 place-items-center rounded-full bg-[#19C96B]"><Mic className="size-4" /></span></div>
                  <button type="button" onClick={nextExample} className="mt-5 w-full rounded-[1.35rem] bg-[#111827] px-4 py-4 text-left text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">“{example.text}”</button>
                  <div key={example.text} className="mt-4 animate-[fin-result-in_300ms_ease-out] rounded-[1.35rem] border border-[#E1E7E3] bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Entendi assim</p><p className="mt-3 font-display text-5xl font-semibold leading-none tracking-[-0.07em]">{example.amount}</p><p className="mt-2 text-sm font-medium text-[#556070]">{example.context}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#0F9F52]"><span className="grid size-6 place-items-center rounded-full bg-[#EAF9F0]"><Check className="size-3.5" /></span> registrado</div>
                  </div>
                  <div className="mt-4 border-t border-[#E1E7E3] pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Depois do registro</p><p className="mt-1 font-display text-2xl font-semibold tracking-[-0.05em]">Você entende o que cabe hoje.</p></div>
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#556070]"><span>Registrar</span><span>Organizar</span><span>Orientar</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-white px-4 py-7 sm:px-6"><div className="mx-auto grid max-w-6xl gap-4 text-sm font-semibold text-[#556070] sm:grid-cols-3 sm:gap-0"><div className="sm:border-r sm:border-[#E1E7E3] sm:pr-6">Você fala do seu jeito.</div><div className="sm:border-r sm:border-[#E1E7E3] sm:px-6">O FINANZZI organiza.</div><div className="sm:pl-6">Você decide com mais clareza.</div></div></section>

        <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">01 · Registrar</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.93] tracking-[-0.065em] sm:text-7xl">Você não preenche. Você conta.</h2></Reveal><Reveal delay={80}><p className="max-w-2xl text-lg leading-8 text-[#556070]">Mercado, Uber, salário, assinatura, compra parcelada. Escreva ou fale do jeito que faria normalmente. O registro continua manual e fica sob seu controle.</p></Reveal></div><div className="mt-12 grid gap-4 sm:grid-cols-3">{[['“mercado 82”','R$ 82,00','Mercado · Alimentação'],['“recebi 2.500”','+ R$ 2.500,00','Receita'],['“tênis 399 em 4x”','4 × R$ 99,75','Compra parcelada']].map(([input,result,detail],i)=><Reveal key={input} delay={i*70}><article className="rounded-[1.8rem] border border-[#E1E7E3] bg-[#F4F6F5] p-5 transition-transform duration-300 hover:-translate-y-1"><p className="text-sm font-semibold text-[#556070]">{input}</p><p className="mt-10 font-display text-4xl font-semibold tracking-[-0.06em]">{result}</p><p className="mt-2 text-xs font-semibold text-[#556070]">{detail}</p></article></Reveal>)}</div></div></section>

        <section id="contas" className="border-y border-[#E1E7E3] bg-[#111827] px-4 py-20 text-white sm:px-6 sm:py-28"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#19C96B]">02 · Compromissos</p><h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.93] tracking-[-0.065em] sm:text-7xl">O que você não quer esquecer fica visível.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Contas, cartões, assinaturas e compromissos futuros entram no contexto das suas decisões — sem transformar a Home em uma planilha.</p></Reveal><Reveal delay={90}><div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Próximos compromissos</p>{[['Netflix','R$ 39,90','amanhã'],['Aluguel','R$ 1.200,00','em 5 dias'],['Cartão','R$ 205,00','em 8 dias']].map(([name,amount,date],i)=><div key={name} className={`flex items-center justify-between gap-4 py-4 ${i>0?'border-t border-white/10':''}`}><div><p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-white/45">{date}</p></div><p className="text-sm font-bold">{amount}</p></div>)}</div></Reveal></div></section>

        <section className="px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">03 · Insights</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.93] tracking-[-0.065em] sm:text-7xl">O FIN percebe uma coisa. Você decide o que fazer com ela.</h2></Reveal><Reveal delay={80} className="mt-12 max-w-3xl rounded-[2rem] border border-[#E1E7E3] bg-[#EAF9F0] p-7 sm:p-9"><p className="text-sm font-semibold text-[#0F9F52]">O FIN percebeu uma coisa.</p><p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.05em]">“Seus gastos com transporte subiram nas últimas semanas.”</p><p className="mt-4 text-sm leading-6 text-[#556070]">Uma observação baseada no que você registrou, não um alerta genérico.</p></Reveal></div></section>

        <section className="border-y border-[#E1E7E3] bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Decisão, não relatório</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.93] tracking-[-0.065em] sm:text-7xl">Quanto posso gastar hoje?</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">O FINANZZI considera o que você já registrou e os compromissos conhecidos para mostrar uma margem prática.</p></Reveal><Reveal delay={100}><div className="rounded-[2.2rem] bg-white p-7 shadow-[0_20px_55px_rgba(17,24,39,.07)] sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Sua margem de hoje</p><p className="mt-4 font-display text-7xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">R$ 327</p><p className="mt-3 text-sm font-semibold text-[#556070]">depois dos compromissos que já conhecemos</p></div></Reveal></div></section>

        <section className="px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Como visto em</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Em breve, aqui estarão as histórias do FINANZZI.</h2></Reveal><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">{['LOGO','LOGO','LOGO','LOGO'].map((item,i)=><Reveal key={i} delay={i*50}><div className="grid h-24 place-items-center rounded-2xl border border-dashed border-[#E1E7E3] bg-white text-xs font-bold tracking-[0.2em] text-[#556070]">{item}</div></Reveal>)}</div></div></section>

        <section id="oferta" className="border-t border-[#E1E7E3] bg-[#19C96B] px-4 py-20 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Comece agora</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.93] tracking-[-0.065em] sm:text-7xl">Menos esforço para registrar. Mais clareza para decidir.</h2><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href={checkout(annualCheckout)} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#111827] px-7 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-0.5">QUERO O FINANZZI <ArrowRight className="size-4" /></a><a href={checkout(monthlyCheckout)} className="inline-flex h-14 items-center justify-center rounded-full border border-[#0F9F52]/30 bg-white/50 px-7 text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5">VER PLANO MENSAL</a></div></Reveal></div></section>

        <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-3xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Dúvidas</p>{['Preciso conectar meu banco?','Posso registrar por voz?','O FINANZZI funciona no celular?'].map((q)=><details key={q} className="group border-b border-[#E1E7E3] py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold"><span>{q}</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" /></summary><p className="pt-3 text-sm leading-6 text-[#556070]">O FINANZZI foi pensado para registro manual, por texto ou voz, sem conexão automática com bancos.</p></details>)}</Reveal></div></section>
      </main>

      <footer className="border-t border-[#E1E7E3] bg-white px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#556070] sm:flex-row sm:items-center sm:justify-between"><Logo /><span>FINANZZI — inteligência para o seu dinheiro.</span><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> seus registros sob seu controle</span></div></footer>
      <style>{`@keyframes fin-result-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`}</style>
    </div>
  );
}
