import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Mic, Play, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";
import { Reveal } from "@/components/finanzzi/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Seu dinheiro sem complicação" },
      {
        name: "description",
        content: "Registre seu dinheiro do seu jeito. O FINANZZI organiza, lembra e ajuda você a decidir.",
      },
    ],
  }),
  component: Landing,
});

const examples = [
  { text: "gastei 82 no mercado", amount: "R$ 82,00", context: "Mercado · Alimentação" },
  { text: "uber 27", amount: "R$ 27,00", context: "Uber · Transporte" },
  { text: "netflix 39,90 todo mês", amount: "R$ 39,90", context: "Netflix · Assinatura" },
];

const faqs = [
  ["Preciso conectar meu banco?", "Não. O FINANZZI trabalha com registro manual por texto ou voz. Seus dados continuam sob seu controle."],
  ["Posso registrar por voz?", "Sim. Você pode registrar falando normalmente e confirmar o que foi entendido antes de salvar."],
  ["Funciona no celular?", "Sim. A experiência é pensada primeiro para celular e pode ser usada como PWA."],
];

function Landing() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const example = examples[exampleIndex];
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";

  const selectExample = (index: number) => {
    setExampleIndex(index);
  };

  const beginCheckout = () => {
    trackProductEvent("checkout_started");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFCF8] text-[#111827] selection:bg-[#EAF9F0] selection:text-[#111827]">
      <style>{`
        @keyframes fin-result-in {
          from { opacity: 0; transform: translateY(12px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fin-hero-in {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-[#E1E7E3] bg-[#FCFCF8]/95">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#556070] lg:flex">
            <a href="#como-funciona" className="transition-[transform,color] duration-200 ease-in-out hover:-translate-y-0.5 hover:text-[#111827]">Como funciona</a>
            <a href="#compromissos" className="transition-[transform,color] duration-200 ease-in-out hover:-translate-y-0.5 hover:text-[#111827]">Compromissos</a>
            <a href="#planos" className="transition-[transform,color] duration-200 ease-in-out hover:-translate-y-0.5 hover:text-[#111827]">Planos</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth" search={{ mode: "login" }} className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#556070] transition-[transform,color] duration-200 hover:-translate-y-0.5 hover:text-[#111827] sm:inline-flex">Entrar</Link>
            <a href={annualCheckout} onClick={beginCheckout} className="inline-flex items-center gap-1.5 rounded-full bg-[#19C96B] px-4 py-2.5 text-xs font-bold transition-[transform] duration-200 ease-in-out hover:-translate-y-0.5 active:translate-y-0 sm:px-5 sm:text-sm">QUERO O FINANZZI <ArrowRight className="size-3.5" /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <div className="motion-safe:animate-[fin-hero-in_500ms_ease-out]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Seu dinheiro, do seu jeito</p>
                <h1 className="mt-5 max-w-2xl font-display text-[3.8rem] font-semibold leading-[.88] tracking-[-0.075em] sm:text-7xl lg:text-[6.1rem]">Seu dinheiro não precisa dar trabalho.</h1>
                <p className="mt-7 max-w-xl text-lg leading-8 text-[#556070] sm:text-xl">Você fala o que aconteceu. O FINANZZI registra, organiza e mostra o que merece sua atenção.</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href={annualCheckout} onClick={beginCheckout} className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#19C96B] px-7 text-sm font-bold transition-[transform] duration-250 ease-in-out hover:-translate-y-1 active:translate-y-0 sm:text-base">QUERO O FINANZZI <ArrowRight className="size-4 transition-transform duration-250 group-hover:translate-x-1" /></a>
                  <a href="#como-funciona" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#E1E7E3] bg-white px-7 text-sm font-bold transition-[transform] duration-250 ease-in-out hover:-translate-y-1 sm:text-base"><Play className="size-4 fill-current" /> VER COMO FUNCIONA</a>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#556070]"><span>✓ registro manual</span><span>✓ texto ou voz</span><span>✓ feito para celular</span></div>
              </div>
            </Reveal>

            <Reveal delay={100} className="mx-auto w-full max-w-[470px] lg:justify-self-end">
              <div className="rounded-[2.6rem] border border-[#E1E7E3] bg-white p-3 shadow-[0_22px_65px_rgba(17,24,39,.10)] transition-[transform] duration-400 ease-in-out hover:-translate-y-1 sm:p-4">
                <div className="rounded-[2.2rem] bg-[#F4F6F5] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Registro rápido</p><p className="mt-1 text-sm font-semibold">Fale como você falaria.</p></div>
                    <span className="grid size-9 place-items-center rounded-full bg-[#19C96B]"><Mic className="size-4" /></span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {examples.map((item, index) => (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => selectExample(index)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition-[transform,background-color,color] duration-250 ease-in-out hover:-translate-y-0.5 ${index === exampleIndex ? "bg-[#111827] text-white" : "bg-white text-[#556070] border border-[#E1E7E3]"}`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.35rem] bg-[#111827] px-4 py-4 text-sm font-semibold text-white">“{example.text}”</div>

                  <div key={example.text} className="motion-safe:animate-[fin-result-in_350ms_ease-out] mt-4 rounded-[1.45rem] border border-[#E1E7E3] bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Entendi assim</p>
                    <p className="mt-3 font-display text-6xl font-semibold leading-none tracking-[-0.08em]">{example.amount}</p>
                    <p className="mt-2 text-sm font-medium text-[#556070]">{example.context}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#0F9F52]"><span className="grid size-6 place-items-center rounded-full bg-[#EAF9F0]"><Check className="size-3.5" /></span> registrado</div>
                  </div>

                  <div className="mt-4 border-t border-[#E1E7E3] pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Depois do registro</p><p className="mt-1 font-display text-2xl font-semibold tracking-[-0.05em]">Você entende o que cabe hoje.</p></div>
                </div>
                <div className="grid grid-cols-3 px-2 pb-1 pt-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#556070]"><span>Registrar</span><span>Organizar</span><span>Orientar</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-white px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-5 text-sm font-semibold text-[#556070] sm:grid-cols-3 sm:gap-0">
            <div className="sm:border-r sm:border-[#E1E7E3] sm:pr-6">Você fala do seu jeito.</div>
            <div className="sm:border-r sm:border-[#E1E7E3] sm:px-6">O FINANZZI organiza.</div>
            <div className="sm:pl-6">Você decide com mais clareza.</div>
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">01 · Registrar</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Você não preenche. Você conta.</h2></Reveal>
              <Reveal delay={80}><p className="max-w-2xl text-lg leading-8 text-[#556070]">Mercado, Uber, salário, assinatura, compra parcelada. Escreva ou fale do jeito que faria normalmente. O registro continua manual e fica sob seu controle.</p></Reveal>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["“mercado 82”", "R$ 82,00", "Mercado · Alimentação"],
                ["“recebi 2.500”", "+ R$ 2.500,00", "Receita"],
                ["“tênis 399 em 4x”", "4 × R$ 99,75", "Compra parcelada"],
              ].map(([input, result, detail], index) => (
                <Reveal key={input} delay={index * 70}>
                  <article className="rounded-[1.8rem] border border-[#E1E7E3] bg-[#F4F6F5] p-5 transition-[transform] duration-250 ease-in-out hover:-translate-y-1">
                    <p className="text-sm font-semibold text-[#556070]">{input}</p><p className="mt-10 font-display text-4xl font-semibold tracking-[-0.06em]">{result}</p><p className="mt-2 text-xs font-semibold text-[#556070]">{detail}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="compromissos" className="border-y border-[#E1E7E3] bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">02 · Compromissos</p><h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">O que você não quer esquecer fica visível.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">Contas, cartões, assinaturas e compromissos futuros entram no contexto das suas decisões sem transformar a Home em uma planilha.</p></Reveal>
            <Reveal delay={100}>
              <div className="rounded-[2rem] border border-[#E1E7E3] bg-white p-6 shadow-[0_14px_35px_rgba(17,24,39,.06)] transition-[transform] duration-300 ease-in-out hover:-translate-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Próximos compromissos</p>
                {[['Netflix','R$ 39,90','amanhã'],['Aluguel','R$ 1.200,00','em 5 dias'],['Cartão','R$ 205,00','em 8 dias']].map(([name, amount, date], index) => (
                  <div key={name} className={`flex items-center justify-between gap-4 py-4 ${index > 0 ? 'border-t border-[#E1E7E3]' : ''}`}><div><p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-[#556070]">{date}</p></div><p className="text-sm font-bold">{amount}</p></div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">03 · Insights</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">O FIN percebe uma coisa. Você decide o que fazer com ela.</h2></Reveal>
            <Reveal delay={90} className="mt-12 max-w-3xl">
              <article className="rounded-[2rem] border border-[#E1E7E3] bg-[#EAF9F0] p-7 transition-[transform] duration-300 ease-in-out hover:-translate-y-1 sm:p-9"><p className="text-sm font-semibold text-[#0F9F52]">O FIN percebeu uma coisa.</p><p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.05em]">“Seus gastos com transporte subiram nas últimas semanas.”</p><p className="mt-4 text-sm leading-6 text-[#556070]">Uma observação baseada no que você registrou, não um alerta genérico.</p></article>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-[#FCFCF8] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Por que assinar?</p>
              <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Menos preocupação. Mais clareza para decidir.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">O FINANZZI foi feito para virar hábito: você registra em segundos e recebe uma visão mais organizada do seu dinheiro todos os dias.</p>
              <a href="#planos" className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#19C96B] px-6 text-sm font-bold transition-[transform] duration-250 ease-in-out hover:-translate-y-0.5">VER PLANOS <ArrowRight className="size-4" /></a>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-[2.2rem] border border-[#E1E7E3] bg-white p-7 shadow-[0_18px_45px_rgba(17,24,39,.07)] sm:p-9">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Com o FINANZZI, você ganha</p>
                <div className="mt-5 space-y-4">
                  {[
                    "registro rápido por texto ou voz",
                    "organização de contas, cartões e metas",
                    "insights baseados no que você realmente registrou",
                    "uma margem prática para saber o que cabe hoje",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3 border-b border-[#E1E7E3] pb-4 last:border-0 last:pb-0">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#EAF9F0] text-[#0F9F52]"><Check className="size-3.5" /></span>
                      <p className="text-sm font-semibold leading-6">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-[#FCFCF8] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Decisão, não relatório</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Quanto posso gastar hoje?</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">O FINANZZI considera o que você já registrou e os compromissos conhecidos para mostrar uma margem prática.</p></Reveal>
            <Reveal delay={100}><div className="rounded-[2.2rem] border border-[#E1E7E3] bg-white p-7 shadow-[0_18px_45px_rgba(17,24,39,.07)] transition-[transform] duration-300 ease-in-out hover:-translate-y-1 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Sua margem de hoje</p><p className="mt-4 font-display text-7xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">R$ 327</p><p className="mt-3 text-sm font-semibold text-[#556070]">depois dos compromissos que já conhecemos</p></div></Reveal>
          </div>
        </section>

        <section id="planos" className="border-t border-[#E1E7E3] bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Planos</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Escolha como quer cuidar do seu dinheiro.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-[#556070]">A mesma experiência FINANZZI, com a flexibilidade de escolher mensal ou anual.</p></Reveal>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <Reveal>
                <article className="rounded-[2rem] border border-[#E1E7E3] bg-white p-7 shadow-[0_14px_35px_rgba(17,24,39,.05)] transition-[transform] duration-300 ease-in-out hover:-translate-y-1 sm:p-8">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#556070]">Mensal</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em]">{BILLING_PLANS.pro_monthly.name}</h3></div><span className="rounded-full bg-[#F4F6F5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">flexível</span></div>
                  <p className="mt-8 font-display text-5xl font-semibold tracking-[-0.07em]">{BILLING_PLANS.pro_monthly.priceLabel}</p>
                  <p className="mt-2 text-sm text-[#556070]">{BILLING_PLANS.pro_monthly.savingsLabel}</p>
                  <div className="mt-7 space-y-3 text-sm font-semibold text-[#556070]"><p>✓ Registro por texto e voz</p><p>✓ Organização de contas, cartões e metas</p><p>✓ Insights e margem para decidir</p></div>
                  <a href={monthlyCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#19C96B] px-6 text-sm font-bold transition-[transform] duration-250 ease-in-out hover:-translate-y-0.5">ASSINAR MENSAL <ArrowRight className="size-4" /></a>
                </article>
              </Reveal>

              <Reveal delay={90}>
                <article className="relative rounded-[2rem] border-2 border-[#19C96B] bg-white p-7 shadow-[0_18px_45px_rgba(17,24,39,.07)] transition-[transform] duration-300 ease-in-out hover:-translate-y-1 sm:p-8">
                  <span className="absolute right-6 top-6 rounded-full bg-[#EAF9F0] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F9F52]">melhor valor</span>
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#556070]">Anual</p><h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em]">{BILLING_PLANS.pro_annual.name}</h3></div>
                  <p className="mt-8 font-display text-5xl font-semibold tracking-[-0.07em]">{BILLING_PLANS.pro_annual.priceLabel}</p>
                  <p className="mt-2 text-sm font-semibold text-[#0F9F52]">{BILLING_PLANS.pro_annual.monthlyEquivalentLabel}</p>
                  <p className="mt-1 text-sm text-[#556070]">{BILLING_PLANS.pro_annual.savingsLabel}</p>
                  <div className="mt-7 space-y-3 text-sm font-semibold text-[#556070]"><p>✓ Tudo do plano mensal</p><p>✓ Melhor custo por mês</p><p>✓ Um único pagamento anual</p></div>
                  <a href={annualCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-6 text-sm font-bold text-white transition-[transform] duration-250 ease-in-out hover:-translate-y-0.5">ASSINAR ANUAL <ArrowRight className="size-4" /></a>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Dúvidas</p></Reveal>
            <div className="mt-4">
              {faqs.map(([question, answer], index) => (
                <Reveal key={question} delay={index * 50}>
                  <details className="group border-b border-[#E1E7E3] py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold"><span>{question}</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" /></summary>
                    <p className="pt-3 text-sm leading-6 text-[#556070]">{answer}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E1E7E3] bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#556070] sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <span>FINANZZI — inteligência para o seu dinheiro.</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> seus registros sob seu controle</span>
        </div>
      </footer>
    </div>
  );
}