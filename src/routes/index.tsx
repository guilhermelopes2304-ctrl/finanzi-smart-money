import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";
import { Reveal } from "@/components/finanzzi/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FINANZZI — Inteligência para o seu dinheiro" },
    { name: "description", content: "Registre seu dinheiro do seu jeito e enxergue a próxima decisão com clareza." },
  ] }),
  component: Landing,
});

const points = ["Você registra em segundos", "Texto ou voz, do seu jeito", "Tudo pensado para o celular"];

function Landing() {
  const annualCheckout = getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly") ?? "/oferta#oferta";
  const beginCheckout = () => trackProductEvent("checkout_started");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#111111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/60 lg:flex">
            <a href="#produto" className="hover:text-white">Produto</a>
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#planos" className="hover:text-white">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" search={{ mode: "login" }} className="hidden px-4 py-2 text-sm font-semibold text-white/70 hover:text-white sm:inline-flex">Entrar</Link>
            <a href={annualCheckout} onClick={beginCheckout} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FF5A1F] px-5 text-xs font-extrabold tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-[#ff6a35]">COMEÇAR <ArrowRight className="size-4" /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_.82fr]">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF5A1F]">FINANZZI · dinheiro com clareza</p>
                <h1 className="mt-5 max-w-3xl font-display text-[3.7rem] font-semibold leading-[.9] tracking-[-.075em] sm:text-7xl lg:text-[6rem]">Pare de organizar tudo. Comece a entender.</h1>
                <p className="mt-7 max-w-xl text-lg leading-8 text-white/65 sm:text-xl">Você conta o que aconteceu. O FINANZZI registra, organiza e mostra o que merece sua atenção.</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href={annualCheckout} onClick={beginCheckout} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#FF5A1F] px-7 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#ff6a35]">QUERO O FINANZZI <ArrowRight className="size-4" /></a>
                  <a href="#como-funciona" className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/5">VER COMO FUNCIONA</a>
                </div>
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-white/55">{points.map((point) => <span key={point} className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#FF5A1F]" />{point}</span>)}</div>
              </div>
            </Reveal>
            <Reveal delay={120} className="mx-auto w-full max-w-[470px]">
              <img src="/finanzi-iphone-hero.png" alt="FINANZZI no iPhone" className="block h-auto w-full drop-shadow-2xl" />
            </Reveal>
          </div>
        </section>

        <section id="produto" className="border-y border-white/10 bg-[#181818] px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-5 text-sm font-semibold text-white/60 sm:grid-cols-3">
            {["Você fala do seu jeito.", "O FINANZZI organiza.", "Você decide com mais clareza."].map((text) => <div key={text} className="sm:border-r sm:border-white/10 sm:px-6 first:sm:pl-0 last:border-0 last:sm:pr-0">{text}</div>)}
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF5A1F]">01 · Registrar</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">Você não preenche. Você conta.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">Mercado, Uber, salário ou assinatura. Escreva ou fale como faria naturalmente e confirme antes de salvar.</p></Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[["“mercado 82”","R$ 82,00","Alimentação"],["“recebi 2.500”","+ R$ 2.500,00","Receita"],["“tênis 399 em 4x”","4 × R$ 99,75","Parcelado"]].map(([input,value,label],index) => <Reveal key={input} delay={index*70}><article className="rounded-[1.8rem] border border-white/10 bg-[#181818] p-6"><p className="text-sm font-semibold text-white/50">{input}</p><p className="mt-12 font-display text-4xl font-semibold tracking-[-.06em]">{value}</p><p className="mt-2 text-xs font-semibold text-[#FF5A1F]">{label}</p></article></Reveal>)}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#181818] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal><div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF5A1F]">02 · Clareza</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">Veja para onde seu dinheiro está indo.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Contas, cartões, assinaturas e objetivos ficam no mesmo contexto. Sem transformar sua vida financeira em uma planilha.</p></div></Reveal>
            <Reveal delay={100}><div className="rounded-[2rem] border border-white/10 bg-[#111111] p-7 sm:p-9"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">O que merece atenção</p><div className="mt-7 space-y-5">{[["Mercado","R$ 842","74%"],["Transporte","R$ 391","48%"],["Assinaturas","R$ 126","30%"]].map(([name,value,width]) => <div key={name}><div className="flex justify-between text-sm font-semibold"><span>{name}</span><span className="text-white/60">{value}</span></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#FF5A1F]" style={{width}} /></div></div>)}</div></div></Reveal>
          </div>
        </section>

        <section id="planos" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#FF5A1F]">Planos</p><h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">Escolha como quer cuidar do seu dinheiro.</h2></Reveal>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <Reveal><article className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/50">Mensal</p><h3 className="mt-3 font-display text-3xl font-semibold">{BILLING_PLANS.pro_monthly.name}</h3><p className="mt-8 font-display text-5xl font-semibold tracking-[-.07em]">{BILLING_PLANS.pro_monthly.priceLabel}</p><p className="mt-2 text-sm text-white/50">{BILLING_PLANS.pro_monthly.savingsLabel}</p><a href={monthlyCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center rounded-full border border-white/15 text-sm font-bold transition hover:bg-white hover:text-[#111111]">ASSINAR MENSAL</a></article></Reveal>
              <Reveal delay={90}><article className="rounded-[2rem] border border-[#FF5A1F]/70 bg-[#181818] p-7 sm:p-8"><span className="inline-flex rounded-full bg-[#FF5A1F] px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white">melhor valor</span><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-white/50">Anual</p><h3 className="mt-3 font-display text-3xl font-semibold">{BILLING_PLANS.pro_annual.name}</h3><p className="mt-8 font-display text-5xl font-semibold tracking-[-.07em]">{BILLING_PLANS.pro_annual.priceLabel}</p><p className="mt-2 text-sm text-[#FF5A1F]">{BILLING_PLANS.pro_annual.monthlyEquivalentLabel}</p><a href={annualCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-13 w-full items-center justify-center rounded-full bg-[#FF5A1F] text-sm font-bold text-white transition hover:bg-[#ff6a35]">ASSINAR ANUAL <ArrowRight className="ml-2 size-4" /></a></article></Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#181818] px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-4xl text-center"><Sparkles className="mx-auto size-6 text-[#FF5A1F]" /><h2 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-7xl">Menos esforço para registrar. Mais clareza para decidir.</h2><a href={annualCheckout} onClick={beginCheckout} className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#FF5A1F] px-8 text-sm font-bold text-white transition hover:-translate-y-1">COMEÇAR AGORA <ArrowRight className="size-4" /></a></Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><Link to="/"><Logo /></Link><span>FINANZZI — inteligência para o seu dinheiro.</span><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-[#FF5A1F]" /> Feito para decidir com clareza</span></div></footer>
    </div>
  );
}
