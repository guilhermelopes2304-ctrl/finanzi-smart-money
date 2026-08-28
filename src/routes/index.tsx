import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Mic, Play, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";
import { Reveal } from "@/components/finanzzi/Reveal";
import { LazyImage } from "@/components/finanzzi/LazyImage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Seu dinheiro sem complicação" },
      { name: "description", content: "Registre seu dinheiro do seu jeito. O FINANZZI organiza, lembra e ajuda você a decidir." },
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
  const example = examples[exampleIndex]!;
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";
  const beginCheckout = () => trackProductEvent("checkout_started");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFCF8] text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-[#E1E7E3] bg-[#FCFCF8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#556070] lg:flex">
            <a href="#como-funciona" className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[#111827]">Como funciona</a>
            <a href="#compromissos" className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[#111827]">Compromissos</a>
            <a href="#planos" className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[#111827]">Planos</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth" search={{ mode: "login" }} className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#556070] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#111827] sm:inline-flex">Entrar</Link>
            <a href={annualCheckout} onClick={beginCheckout} className="inline-flex items-center gap-2 rounded-full bg-[#19C96B] px-4 py-2.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:px-5 sm:text-sm">QUERO O FINANZZI <ArrowRight className="size-3.5" /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Seu dinheiro, do seu jeito</p>
                <h1 className="mt-5 max-w-2xl font-display text-[3.8rem] font-semibold leading-[.88] tracking-[-0.075em] sm:text-7xl lg:text-[6.1rem]">Seu dinheiro não precisa dar trabalho.</h1>
                <p className="mt-7 max-w-xl text-lg leading-8 text-[#556070] sm:text-xl">Você fala o que aconteceu. O FINANZZI registra, organiza e mostra o que merece sua atenção.</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href={annualCheckout} onClick={beginCheckout} className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#19C96B] px-7 text-sm font-bold transition-all duration-250 hover:-translate-y-1 active:translate-y-0 sm:text-base">QUERO O FINANZZI <ArrowRight className="size-4 transition-transform duration-250 group-hover:translate-x-1" /></a>
                  <a href="#como-funciona" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#E1E7E3] bg-white px-7 text-sm font-bold transition-all duration-250 hover:-translate-y-1 sm:text-base"><Play className="size-4 fill-current" /> VER COMO FUNCIONA</a>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#556070]"><span>✓ registro manual</span><span>✓ texto ou voz</span><span>✓ feito para celular</span></div>
              </div>
            </Reveal>

            <Reveal delay={120} className="mx-auto w-full max-w-[470px] lg:justify-self-end">
              <div className="transition-transform duration-400 hover:-translate-y-1">
                <LazyImage src="/finanzi-iphone-hero.png" alt="FINANZZI no iPhone" eager className="h-auto w-full" />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-white px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-5 text-sm font-semibold text-[#556070] sm:grid-cols-3 sm:gap-0">
            <Reveal><div className="sm:border-r sm:border-[#E1E7E3] sm:pr-6">Você fala do seu jeito.</div></Reveal>
            <Reveal delay={70}><div className="sm:border-r sm:border-[#E1E7E3] sm:px-6">O FINANZZI organiza.</div></Reveal>
            <Reveal delay={140}><div className="sm:pl-6">Você decide com mais clareza.</div></Reveal>
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">01 · Registrar</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Você não preenche. Você conta.</h2></div></Reveal>
              <Reveal delay={80}><p className="max-w-2xl text-lg leading-8 text-[#556070]">Mercado, Uber, salário, assinatura, compra parcelada. Escreva ou fale do jeito que faria normalmente. O registro continua manual e fica sob seu controle.</p></Reveal>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[["“mercado 82”", "R$ 82,00", "Mercado · Alimentação"], ["“recebi 2.500”", "+ R$ 2.500,00", "Receita"], ["“tênis 399 em 4x”", "4 × R$ 99,75", "Compra parcelada"]].map(([input, result, detail], index) => (
                <Reveal key={input} delay={index * 70}><article className="rounded-[1.8rem] border border-[#E1E7E3] bg-[#F4F6F5] p-5 transition-transform duration-250 hover:-translate-y-1"><p className="text-sm font-semibold text-[#556070]">{input}</p><p className="mt-10 font-display text-4xl font-semibold tracking-[-0.06em]">{result}</p><p className="mt-2 text-xs font-semibold text-[#556070]">{detail}</p></article></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="compromissos" className="border-y border-[#E1E7E3] bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">02 · Compromissos</p><h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">O que você não quer esquecer fica visível.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">Contas, cartões, assinaturas e compromissos futuros entram no contexto das suas decisões sem transformar a Home em uma planilha.</p></div></Reveal>
            <Reveal delay={100}><div className="rounded-[2rem] border border-[#E1E7E3] bg-white p-6 shadow-[0_14px_35px_rgba(17,24,39,.06)] transition-transform duration-300 hover:-translate-y-1"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Próximos compromissos</p>{[["Netflix","R$ 39,90","amanhã"],["Aluguel","R$ 1.200,00","em 5 dias"],["Cartão","R$ 205,00","em 8 dias"]].map(([name, amount, date], index) => <div key={name} className={`flex items-center justify-between gap-4 py-4 ${index > 0 ? "border-t border-[#E1E7E3]" : ""}`}><div><p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-[#556070]">{date}</p></div><p className="text-sm font-bold">{amount}</p></div>)}</div></Reveal>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">03 · Registro na prática</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Você fala. O FINANZZI entende.</h2></div></Reveal>
            <Reveal delay={80} className="mt-10 max-w-2xl">
              <article className="rounded-[2rem] border border-[#E1E7E3] bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,.06)]">
                <div className="flex flex-wrap gap-2">{examples.map((item, index) => <button key={item.text} type="button" onClick={() => setExampleIndex(index)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-250 hover:-translate-y-0.5 ${index === exampleIndex ? "border-[#111827] bg-[#111827] text-white" : "border-[#E1E7E3] bg-[#F4F6F5] text-[#556070]"}`}>{item.text}</button>)}</div>
                <div className="mt-5 rounded-[1.4rem] bg-[#111827] px-4 py-4 text-sm font-semibold text-white">“{example.text}”</div>
                <div key={example.text} className="mt-4 rounded-[1.5rem] border border-[#E1E7E3] bg-[#FCFCF8] p-5 motion-safe:animate-[fin-result-in_350ms_ease-out]"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Entendi assim</p><p className="mt-3 font-display text-6xl font-semibold leading-none tracking-[-0.08em]">{example.amount}</p><p className="mt-2 text-sm font-medium text-[#556070]">{example.context}</p><div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#0F9F52]"><span className="grid size-6 place-items-center rounded-full bg-[#EAF9F0]"><Check className="size-3.5" /></span> registrado</div></div>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="insights" className="border-y border-[#E1E7E3] bg-white px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">04 · Insights</p><h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">O FIN percebe uma coisa. Você decide.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">Observações baseadas no que você realmente registrou, para transformar informação em decisão.</p></div></Reveal><Reveal delay={100}><article className="rounded-[2rem] border border-[#E1E7E3] bg-[#EAF9F0] p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-9"><p className="text-sm font-semibold text-[#0F9F52]">O FIN percebeu uma coisa.</p><p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.05em]">“Seus gastos com transporte subiram nas últimas semanas.”</p><p className="mt-4 text-sm leading-6 text-[#556070]">Uma observação contextual, não um alerta genérico.</p></article></Reveal></div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Decisão, não relatório</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Quanto posso gastar hoje?</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">Uma margem prática baseada no que você já registrou e nos compromissos conhecidos.</p></div></Reveal><Reveal delay={100}><div className="rounded-[2.2rem] border border-[#E1E7E3] bg-white p-7 shadow-[0_18px_45px_rgba(17,24,39,.07)] transition-transform duration-300 hover:-translate-y-1 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">Sua margem de hoje</p><p className="mt-4 font-display text-7xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">R$ 327</p><p className="mt-3 text-sm font-semibold text-[#556070]">depois dos compromissos que já conhecemos</p></div></Reveal></div>
        </section>

        <section id="planos" className="border-t border-[#E1E7E3] bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl"><Reveal><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Planos</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-0.065em] sm:text-7xl">Escolha como quer cuidar do seu dinheiro.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-[#556070]">A mesma experiência FINANZZI, com a flexibilidade de escolher mensal ou anual.</p></div></Reveal><div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal><article className="rounded-[2rem] border border-[#E1E7E3] bg-white p-7 shadow-[0_14px_35px_rgba(17,24,39,.05)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#556070]">Mensal</p><h3 className="mt-2 font-display text-3xl font-semibold">{BILLING_PLANS.pro_monthly.name}</h3><p className="mt-8 font-display text-5xl font-semibold tracking-[-0.07em]">{BILLING_PLANS.pro_monthly.priceLabel}</p><p className="mt-2 text-sm text-[#556070]">{BILLING_PLANS.pro_monthly.savingsLabel}</p><div className="mt-7 space-y-3 text-sm font-semibold text-[#556070]"><p>✓ Registro por texto e voz</p><p>✓ Contas, cartões e metas</p><p>✓ Insights e margem para decidir</p></div><a href={monthlyCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#19C96B] px-6 text-sm font-bold transition-transform duration-250 hover:-translate-y-0.5">ASSINAR MENSAL <ArrowRight className="size-4" /></a></article></Reveal>
            <Reveal delay={90}><article className="relative rounded-[2rem] border-2 border-[#19C96B] bg-white p-7 shadow-[0_18px_45px_rgba(17,24,39,.07)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"><span className="absolute right-6 top-6 rounded-full bg-[#EAF9F0] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F9F52]">melhor valor</span><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#556070]">Anual</p><h3 className="mt-2 font-display text-3xl font-semibold">{BILLING_PLANS.pro_annual.name}</h3><p className="mt-8 font-display text-5xl font-semibold tracking-[-0.07em]">{BILLING_PLANS.pro_annual.priceLabel}</p><p className="mt-2 text-sm font-semibold text-[#0F9F52]">{BILLING_PLANS.pro_annual.monthlyEquivalentLabel}</p><p className="mt-1 text-sm text-[#556070]">{BILLING_PLANS.pro_annual.savingsLabel}</p><div className="mt-7 space-y-3 text-sm font-semibold text-[#556070]"><p>✓ Tudo do plano mensal</p><p>✓ Melhor custo por mês</p><p>✓ Um único pagamento anual</p></div><a href={annualCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-6 text-sm font-bold text-white transition-transform duration-250 hover:-translate-y-0.5">ASSINAR ANUAL <ArrowRight className="size-4" /></a></article></Reveal>
          </div></div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20"><div className="mx-auto max-w-3xl"><Reveal><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">Dúvidas</p></Reveal><div className="mt-4">{faqs.map(([question, answer], index) => <Reveal key={question} delay={index * 50}><details className="group border-b border-[#E1E7E3] py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold"><span>{question}</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" /></summary><p className="pt-3 text-sm leading-6 text-[#556070]">{answer}</p></details></Reveal>)}</div></div></section>
      </main>

      <footer className="border-t border-[#E1E7E3] bg-white px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#556070] sm:flex-row sm:items-center sm:justify-between"><Link to="/" aria-label="FINANZZI — início"><Logo /></Link><span>FINANZZI — inteligência para o seu dinheiro.</span><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> seus registros sob seu controle</span></div></footer>
    </div>
  );
}
