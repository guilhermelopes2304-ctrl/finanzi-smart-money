import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Mic, Play, ShieldCheck, Sparkles } from "lucide-react";
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
        content:
          "Registre seus gastos do seu jeito. O FINANZZI organiza, lembra e mostra o que merece sua atenção.",
      },
    ],
  }),
  component: Landing,
});

const examples = [
  "mercado 82",
  "uber 27",
  "Netflix 39,90 todo mês",
  "recebi 2.500",
  "tênis 399 em 4x",
];

const demoSteps = [
  { example: "mercado 82", result: "Registrado", detail: "Mercado · R$ 82,00" },
  {
    example: "Netflix 39,90 todo mês",
    result: "Assinatura criada",
    detail: "Netflix · R$ 39,90/mês",
  },
  {
    example: "o que vence essa semana?",
    result: "4 contas · R$ 1.445",
    detail: "Próximos compromissos",
  },
  {
    example: "posso gastar 200?",
    result: "Pode gastar com contexto",
    detail: "Sua margem fica em R$ 127",
  },
  { example: "recebi 2500", result: "Receita registrada", detail: "Receita · R$ 2.500,00" },
];

function Landing() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const annual = BILLING_PLANS.pro_annual;
  const monthly = BILLING_PLANS.pro_monthly;
  const annualCheckout = getHublaCheckoutUrl("pro_annual");
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly");

  function checkout(plan: "annual" | "monthly") {
    trackProductEvent("checkout_started");
    return plan === "annual"
      ? (annualCheckout ?? "/oferta#oferta")
      : (monthlyCheckout ?? "/oferta#oferta");
  }

  function nextExample() {
    setExampleIndex((value) => (value + 1) % examples.length);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFCF8] text-[#111827] selection:bg-[#19C96B] selection:text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-[#111827]/8 bg-[#FCFCF8]/92 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="FINANZZI — início">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#556070] lg:flex">
            <a href="#como-funciona" className="transition-colors hover:text-[#111827]">
              Como funciona
            </a>
            <a href="#contas" className="transition-colors hover:text-[#111827]">
              Contas
            </a>
            <a href="#oferta" className="transition-colors hover:text-[#111827]">
              Oferta
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#556070] hover:text-[#111827] sm:inline-flex"
            >
              Entrar
            </Link>
            <a
              href={checkout("annual")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#19C96B] px-4 py-2.5 text-xs font-bold text-[#111827] transition-transform hover:-translate-y-0.5 sm:px-5 sm:text-sm"
            >
              QUERO O FINANZZI <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF9F0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F9F52]">
                <Sparkles className="size-3.5" /> sem planilha, sem formulário
              </div>
              <h1 className="mt-6 max-w-xl font-display text-[3.6rem] font-semibold leading-[.91] tracking-[-0.07em] sm:text-7xl lg:text-[6.35rem]">
                Seu dinheiro não precisa dar trabalho.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#556070] sm:text-xl">
                Você fala o que aconteceu. O FINANZZI organiza e lembra do resto.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={checkout("annual")}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#19C96B] px-7 text-sm font-bold text-[#111827] transition-transform hover:-translate-y-0.5 sm:text-base"
                >
                  QUERO O FINANZZI <ArrowRight className="size-4" />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#E1E7E3] bg-white/75 px-7 text-sm font-bold text-[#111827] transition-colors hover:bg-white sm:text-base"
                >
                  <Play className="size-4 fill-current" /> VER COMO FUNCIONA
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#556070]">
                <span>✓ acesso completo após pagamento</span>
                <span>✓ feito para celular</span>
                <span>✓ sem banco conectado</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[470px] lg:justify-self-end">
              <div className="absolute -right-6 top-10 hidden h-24 w-24 rounded-[2rem] bg-[#19C96B] sm:block" />
              <div className="relative overflow-hidden rounded-[2.4rem] border border-[#E1E7E3] bg-white p-3 shadow-[0_24px_70px_rgba(33,38,29,0.12)] sm:p-4">
                <div className="rounded-[2rem] bg-[#F4F5F8] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">
                        Você fala
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">
                        como falaria com alguém.
                      </p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-full bg-[#19C96B] text-[#111827]">
                      <Mic className="size-4" />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={nextExample}
                    className="mt-5 w-full rounded-[1.35rem] bg-[#111827] px-4 py-4 text-left text-sm font-semibold text-white shadow-sm"
                  >
                    “{examples[exampleIndex]}”
                  </button>
                  <div className="mt-4 rounded-[1.35rem] border border-[#E1E7E3] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556070]">
                      Entendi assim
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-3xl font-semibold tracking-[-0.05em] text-[#111827]">
                          R$ 82,00
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#556070]">
                          Mercado · Alimentação
                        </p>
                      </div>
                      <span className="rounded-full bg-[#EAF9F0] px-2.5 py-1 text-[10px] font-bold text-[#0F9F52]">
                        registrado
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.35rem] bg-[#19C96B] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FCFCF8]">
                      e depois...
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold leading-tight text-[#FCFCF8]">
                      Você ainda pode gastar R$ 327 hoje.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#556070]">
                  <span>Registrar</span>
                  <span>Organizar</span>
                  <span>Orientar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-white px-4 py-6 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-4 text-sm font-semibold text-[#556070] sm:grid-cols-3 sm:gap-0">
            <div className="sm:border-r sm:border-[#E1E7E3] sm:px-6 first:sm:pl-0">
              Você fala do seu jeito.
            </div>
            <div className="sm:border-r sm:border-[#E1E7E3] sm:px-6">
              O FINANZZI organiza sozinho.
            </div>
            <div className="sm:pl-6">E lembra do que você não pode esquecer.</div>
          </div>
        </section>

        <section className="border-y border-[#E1E7E3] bg-[#F4F5F8] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14">
            <Reveal className="relative overflow-hidden rounded-[2rem] border border-[#E1E7E3] bg-white shadow-[0_22px_60px_rgba(21,24,39,.10)]">
              <img
                src="/images/photography/finanzi-phone-payment.webp"
                alt="Pessoa a utilizar um smartphone para uma decisão de pagamento junto a um portátil"
                width={1600}
                height={1067}
                loading="eager"
                className="aspect-[1.35] w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/30 bg-[#111827]/82 px-4 py-3 text-white backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#EAF9F0]">
                  Vida real, decisões reais
                </p>
                <p className="mt-1 text-sm font-semibold">
                  O FINANZZI ajuda a decidir antes de gastar.
                </p>
              </div>
            </Reveal>
            <Reveal delay={90} className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">
                Feito para o seu dia
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-[.96] tracking-[-0.06em] sm:text-6xl">
                Dinheiro não acontece numa planilha.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#556070] sm:text-lg">
                Acontece no supermercado, no café, no checkout e naquele momento em que você decide
                se uma compra cabe. O FINANZZI acompanha esse contexto sem transformar a sua vida
                num formulário.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#0F9F52]">
                <span className="rounded-full bg-[#EAF9F0] px-3 py-2">sem banco conectado</span>
                <span className="rounded-full bg-[#EAF9F0] px-3 py-2">feito para celular</span>
                <span className="rounded-full bg-[#EAF9F0] px-3 py-2">do seu jeito</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="como-funciona" className="bg-[#F4F6F5] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">
                Olha como é fácil
              </p>
              <h2 className="mt-4 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Você não preenche. Você conta.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#556070]">
                Fale uma frase. O FINANZZI entende, você confirma e pronto.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {demoSteps.map(({ example, result, detail }, index) => (
                <article
                  key={example}
                  className="rounded-[1.8rem] border border-[#E1E7E3] bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.05)]"
                >
                  <div className="rounded-[1.35rem] bg-[#111827] p-3 text-white">
                    <div className="mb-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.14em] text-[#E1E7E3]">
                      <span>FINANZZI</span>
                      <span>0{index + 1}</span>
                    </div>
                    <p className="min-h-12 rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold leading-5">
                      “{example}”
                    </p>
                    <div className="mt-2 rounded-xl bg-[#EAF9F0] p-3 text-[#111827]">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#0F9F52]">
                        Entendi assim
                      </p>
                      <p className="mt-2 text-sm font-bold leading-5">{result}</p>
                      <p className="mt-1 text-[11px] text-[#556070]">{detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contas" className="bg-[#111827] px-4 py-20 text-white sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#19C96B]">
                Contas e assinaturas
              </p>
              <h2 className="mt-4 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Ele também lembra do que você esqueceria.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/65">
                Netflix, Spotify, internet, aluguel, energia, academia e parcelas. Cadastre uma vez
                e deixe o FINANZZI lembrar do próximo vencimento.
              </p>
            </div>
            <div className="rounded-[2rem] bg-[#FCFCF8] p-6 text-[#111827] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#556070]">
                Uma assinatura criada
              </p>
              <div className="mt-6 divide-y divide-[#E1E7E3]">
                {[
                  "Netflix · R$ 39,90",
                  "Spotify · R$ 21,90",
                  "Internet · R$ 99,90",
                  "Academia · R$ 89,90",
                ].map((item, index) => (
                  <div key={item} className="flex items-center justify-between py-4">
                    <span className="text-sm font-semibold">{item}</span>
                    <span className="rounded-full bg-[#EAF9F0] px-3 py-1 text-[10px] font-bold text-[#0F9F52]">
                      {index === 0 ? "criada" : `${index + 2} dias`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-[#19C96B] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FCFCF8]">
                  vence amanhã
                </p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.05em] text-[#FCFCF8]">
                  Assinatura criada
                </p>
                <p className="mt-1 text-sm font-medium text-[#FCFCF8]">
                  {" "}
                  Netflix · R$ 39,90 todo mês
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">
                Uma descoberta por vez
              </p>
              <h2 className="mt-4 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                O FINANZZI não só registra. Ele te conta o que isso significa.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#556070]">
                “Você gastou mais com delivery.” “Essa parcela pesa R$ 99,75 nos próximos meses.”
                “Você tem quatro contas nesta semana.”
              </p>
              <a
                href={checkout("annual")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#19C96B] px-6 py-3.5 text-sm font-bold text-[#111827] transition-transform hover:-translate-y-0.5"
              >
                QUERO TER ISSO <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="grid gap-4">
              <figure className="relative overflow-hidden rounded-[1.6rem] border border-[#E1E7E3] bg-white shadow-[0_14px_36px_rgba(25,30,22,0.05)]">
                <img
                  src="/images/photography/finanzi-planning.webp"
                  alt="Pessoa a planear o dia junto a um smartphone"
                  width={500}
                  height={750}
                  loading="lazy"
                  className="h-52 w-full object-cover sm:h-64"
                />
                <figcaption className="absolute inset-x-4 bottom-4 rounded-xl bg-[#111827]/82 px-3 py-2 text-xs font-semibold text-[#FCFCF8] backdrop-blur-md">
                  Pequenas decisões ficam mais leves quando você tem contexto.
                </figcaption>
              </figure>
              {[
                "Descobri quanto gasto em assinaturas.",
                "Perguntei se podia comprar.",
                "O FINANZZI lembrou das minhas contas.",
              ].map((text) => (
                <div
                  key={text}
                  className="rounded-[1.6rem] border border-[#E1E7E3] bg-white p-5 shadow-[0_12px_34px_rgba(25,30,22,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EAF9F0] text-[#0F9F52]">
                      <Check className="size-4" />
                    </span>
                    <p className="text-lg font-semibold leading-7">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="oferta" className="bg-[#EAF9F0] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">
                Acesso completo
              </p>
              <h2 className="mt-4 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Pare de tentar lembrar de tudo.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#556070]">
                Registre. Organize. Lembre. Entenda. E deixe o FINANZZI fazer a parte chata.
              </p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <PricingCard plan={monthly} checkoutHref={checkout("monthly")} />
              <PricingCard plan={annual} checkoutHref={checkout("annual")} featured />
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs font-semibold text-[#556070]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4" /> pagamento processado pelo checkout
              </span>
              <span>acesso liberado após confirmação</span>
              <span>cancelamento conforme o plano</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F9F52]">FAQ</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Ainda está pensando?
            </h2>
            <div className="mt-8 divide-y divide-[#E1E7E3] rounded-[1.7rem] border border-[#E1E7E3] bg-white px-5 text-left">
              <Faq title="Preciso preencher tudo manualmente?">
                Não. O FINANZZI foi pensado para entender frases simples como “uber 27”, “mercado
                82” ou “Netflix 39,90 todo mês”.
              </Faq>
              <Faq title="O FINANZZI lembra minhas contas?">
                Sim. Você pode cadastrar contas fixas, assinaturas, parcelas e outros compromissos
                para acompanhar os próximos vencimentos.
              </Faq>
              <Faq title="Ele acessa minha conta bancária?">
                Não. O FINANZZI não precisa da sua senha bancária para registrar e organizar o que
                você informa.
              </Faq>
              <Faq title="Quando recebo acesso?">
                O acesso completo é liberado depois da confirmação do pagamento.
              </Faq>
              <Faq title="Posso usar pelo celular?">
                Sim. A experiência foi pensada primeiro para telas pequenas e também funciona no
                desktop.
              </Faq>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] bg-[#111827] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#19C96B]">
              FINANZZI
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-0.06em] sm:text-7xl">
              Você não precisa virar especialista em finanças. Só precisa começar.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Registre do seu jeito. O FINANZZI organiza o resto.
            </p>
            <a
              href={checkout("annual")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#19C96B] px-7 py-4 text-sm font-bold text-[#111827] transition-transform hover:-translate-y-0.5 sm:text-base"
            >
              QUERO O FINANZZI <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function PricingCard({
  plan,
  checkoutHref,
  featured = false,
}: {
  plan: (typeof BILLING_PLANS)[keyof typeof BILLING_PLANS];
  checkoutHref: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`rounded-[2rem] border p-6 sm:p-8 ${featured ? "border-[#111827] bg-[#111827] text-white shadow-[0_24px_60px_rgba(20,24,18,0.15)]" : "border-[#E1E7E3] bg-white text-[#111827]"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.15em] ${featured ? "text-[#19C96B]" : "text-[#556070]"}`}
          >
            {plan.name}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em]">
            {plan.priceLabel}
          </p>
          <p className={`mt-1 text-sm ${featured ? "text-white/60" : "text-[#556070]"}`}>
            {plan.monthlyEquivalentLabel}
          </p>
        </div>
        {featured && (
          <span className="rounded-full bg-[#19C96B] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#111827]">
            mais vantajoso
          </span>
        )}
      </div>
      <p className={`mt-4 text-sm font-semibold ${featured ? "text-white/70" : "text-[#556070]"}`}>
        {plan.savingsLabel}
      </p>
      <div className={`my-7 border-t ${featured ? "border-white/10" : "border-[#E1E7E3]"}`} />
      <ul className={`space-y-3 text-sm ${featured ? "text-white/80" : "text-[#556070]"}`}>
        {[
          "Registro por texto e voz",
          "Organização automática",
          "Contas e assinaturas",
          "Lembretes e compromissos",
          "Parcelas",
          "FIN para orientar suas decisões",
          "Direcionamentos práticos",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${featured ? "text-[#19C96B]" : "text-[#19C96B]"}`}
            />
            {item}
          </li>
        ))}
      </ul>
      <a
        href={checkoutHref}
        className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform hover:-translate-y-0.5 ${featured ? "bg-[#19C96B] text-[#111827]" : "bg-[#0F9F52] text-[#FCFCF8]"}`}
      >
        ASSINAR AGORA <ArrowRight className="size-4" />
      </a>
    </article>
  );
}

function Faq({ title, children }: { title: string; children: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-[#556070]">{children}</p>
    </details>
  );
}
