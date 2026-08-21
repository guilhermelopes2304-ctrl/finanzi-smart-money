import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Mic2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Registrar seus gastos ficou fácil" },
      {
        name: "description",
        content:
          "Você fala o que gastou. O FINANZZI organiza. E lembra o que você não pode esquecer.",
      },
    ],
  }),
  component: Landing,
});

type DemoScene = {
  kicker: string;
  input: string;
  result: string;
  detail: string;
};

const demoScenes: readonly DemoScene[] = [
  {
    kicker: "UM GASTO",
    input: "gastei 42 no mercado",
    result: "Registrado ✓",
    detail: "Mercado · R$ 42,00 · Alimentação",
  },
  {
    kicker: "UM UBER",
    input: "uber 27",
    result: "Registrado ✓",
    detail: "Uber · R$ 27,00 · Transporte",
  },
  {
    kicker: "UMA CONTA",
    input: "Netflix 39,90 todo mês",
    result: "Lembrete criado ✓",
    detail: "Netflix · R$ 39,90/mês · Assinatura",
  },
  {
    kicker: "UMA RECEITA",
    input: "recebi 2500",
    result: "Entrada registrada ✓",
    detail: "Receita · R$ 2.500,00 · Este mês",
  },
  {
    kicker: "UMA PARCELA",
    input: "tênis 399 em 4x",
    result: "Parcelado ✓",
    detail: "4 parcelas de R$ 99,75 · Compras",
  },
];

const streamingServices = ["Netflix", "Spotify", "Aluguel", "Energia", "Internet", "Academia"];

function Landing() {
  const [activeScene, setActiveScene] = useState(0);
  const currentScene = demoScenes[activeScene] ?? demoScenes[0]!;
  const annualCheckout = getHublaCheckoutUrl("pro_annual");
  const monthlyCheckout = getHublaCheckoutUrl("pro_monthly");

  function checkoutHref(plan: "monthly" | "annual") {
    const checkout = plan === "annual" ? annualCheckout : monthlyCheckout;
    return checkout ?? "/oferta#oferta";
  }

  function markCheckout() {
    trackProductEvent("checkout_started");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f3ec] text-[#17201c] selection:bg-[#c6f45d] selection:text-[#17201c]">
      <header className="sticky top-0 z-40 border-b border-[#17201c]/10 bg-[#f7f3ec]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
          <Link to="/" aria-label="FINANZZI — início">
            <Logo />
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm font-medium lg:flex"
            aria-label="Navegação principal"
          >
            <a className="transition-colors hover:text-[#537b15]" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition-colors hover:text-[#537b15]" href="#contas">
              Contas
            </a>
            <a className="transition-colors hover:text-[#537b15]" href="#oferta">
              Oferta
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="hidden rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#17201c]/5 sm:inline-flex"
            >
              Entrar
            </Link>
            <a
              href={checkoutHref("annual")}
              onClick={markCheckout}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#17201c] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 sm:px-5 sm:text-sm"
            >
              QUERO O FINANZZI <ArrowRight className="size-3.5 sm:size-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#f7f3ec]">
          <div className="pointer-events-none absolute -right-40 top-12 size-[26rem] rounded-full bg-[#d5f77a]/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-48 bottom-0 size-[28rem] rounded-full bg-[#ead7c1]/55 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-[#17201c]/15 bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#537b15] sm:text-xs">
                Sem planilha. Sem formulário.
              </p>
              <h1 className="mt-6 max-w-2xl font-display text-[3.45rem] font-semibold leading-[.93] tracking-[-0.07em] sm:text-7xl lg:text-[6.6rem]">
                Registrar seus gastos ficou fácil.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-7 text-[#17201c]/70 sm:text-xl sm:leading-8">
                Você fala o que gastou. O FINANZZI organiza. E lembra o que você não pode esquecer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={checkoutHref("annual")}
                  onClick={markCheckout}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#17201c] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:text-base"
                >
                  QUERO O FINANZZI <ArrowRight className="size-4" />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#17201c]/20 bg-white/45 px-7 text-sm font-bold transition-colors hover:bg-white sm:text-base"
                >
                  VER COMO FUNCIONA <ArrowDown className="size-4" />
                </a>
              </div>
              <p className="mt-4 text-xs text-[#17201c]/55">
                Acesso completo liberado depois da confirmação do pagamento.
              </p>
            </div>

            <ConversationDemo scene={currentScene} />
          </div>
        </section>

        <section className="border-y border-[#17201c]/10 bg-[#17201c] text-white">
          <div className="mx-auto grid max-w-6xl gap-0 sm:grid-cols-3">
            <div className="border-b border-white/15 px-5 py-6 sm:border-b-0 sm:border-r sm:px-8">
              <p className="text-3xl font-semibold tracking-tight">Você fala.</p>
              <p className="mt-1 text-sm text-white/55">Do jeito que você falaria.</p>
            </div>
            <div className="border-b border-white/15 px-5 py-6 sm:border-b-0 sm:border-r sm:px-8">
              <p className="text-3xl font-semibold tracking-tight">Ele entende.</p>
              <p className="mt-1 text-sm text-white/55">Sem preencher formulário.</p>
            </div>
            <div className="px-5 py-6 sm:px-8">
              <p className="text-3xl font-semibold tracking-tight text-[#c6f45d]">Você respira.</p>
              <p className="mt-1 text-sm text-white/55">Porque as contas não somem mais.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#e9dfd1] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
                A pergunta incômoda
              </p>
              <h2 className="mt-5 max-w-xl font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Você sabe quanto gastou este mês?
              </h2>
              <p className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Provavelmente não.
              </p>
            </div>
            <div className="max-w-xl lg:pb-2">
              <p className="text-xl leading-8 text-[#17201c]/75 sm:text-2xl sm:leading-9">
                Você paga Netflix. Spotify. Internet. Academia. Aluguel. Cartão. Parcelas.
              </p>
              <p className="mt-6 text-xl font-semibold leading-8 sm:text-2xl sm:leading-9">
                E no fim do mês parece que seu dinheiro simplesmente sumiu.
              </p>
              <div className="mt-8 h-px w-20 bg-[#17201c]/25" />
              <p className="mt-6 text-lg leading-7 text-[#17201c]/65">
                O FINANZZI organiza isso para você — sem transformar sua vida numa planilha.
              </p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="bg-[#f7f3ec] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
                Parece simples porque é
              </p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Foi só mandar uma mensagem.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#17201c]/65 sm:text-xl">
                Cada frase vira uma ação organizada. Experimente as cenas — são demonstrações
                públicas, sem dados reais.
              </p>
            </div>
            <div
              className="mt-10 flex gap-2 overflow-x-auto pb-2"
              aria-label="Demonstrações do FINANZZI"
            >
              {demoScenes.map((scene, index) => (
                <button
                  key={scene.input}
                  type="button"
                  aria-pressed={activeScene === index}
                  onClick={() => setActiveScene(index)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                    activeScene === index
                      ? "border-[#17201c] bg-[#17201c] text-white"
                      : "border-[#17201c]/15 bg-white/50 text-[#17201c]/65 hover:bg-white"
                  }`}
                >
                  {scene.kicker}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <ConversationDemo scene={currentScene} large />
              <div className="flex flex-col justify-between rounded-[2rem] bg-[#c6f45d] p-7 sm:p-9">
                <div>
                  <Mic2 className="size-7 text-[#17201c]" />
                  <p className="mt-10 max-w-sm font-display text-4xl font-semibold leading-[.98] tracking-[-0.05em] sm:text-5xl">
                    Você não precisa falar a língua das planilhas.
                  </p>
                </div>
                <p className="mt-10 text-sm font-semibold leading-6 text-[#17201c]/70">
                  Fale como fala com alguém. O FINANZZI cuida da organização.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contas" className="bg-[#17201c] px-4 py-20 text-white sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6f45d]">
                O susto do fim do mês
              </p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Nunca mais esqueça suas contas.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/60 sm:text-xl">
                Cadastre uma vez. O FINANZZI lembra depois — inclusive quando a cobrança parece
                pequena demais para preocupar.
              </p>
              <a
                href={checkoutHref("annual")}
                onClick={markCheckout}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c6f45d] px-6 py-3.5 text-sm font-bold text-[#17201c] transition-transform hover:-translate-y-0.5"
              >
                VER MINHAS ASSINATURAS <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-x-5 gap-y-0 sm:grid-cols-3">
                {streamingServices.map((service, index) => (
                  <div key={service} className="border-b border-white/15 py-5 sm:py-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      0{index + 1}
                    </p>
                    <p className="mt-2 text-xl font-semibold sm:text-2xl">{service}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-l-2 border-[#c6f45d] pl-5">
                <p className="text-sm uppercase tracking-[0.14em] text-white/45">
                  Demonstração simulada
                </p>
                <p className="mt-2 font-display text-5xl font-semibold tracking-[-0.05em] text-[#c6f45d] sm:text-7xl">
                  R$ 327,40
                </p>
                <p className="mt-1 text-lg text-white/60">por mês em assinaturas.</p>
                <p className="mt-5 text-2xl font-semibold tracking-tight">R$ 3.928,80 por ano.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f3ec] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
                Quatro coisas, sem enrolação
              </p>
              <h2 className="mt-5 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                O que muda no seu dia.
              </h2>
            </div>
            <div className="mt-12 divide-y divide-[#17201c]/15 border-y border-[#17201c]/15">
              {[
                ["01", "REGISTRE", "Fale o que aconteceu."],
                ["02", "ORGANIZE", "Ele entende e categoriza."],
                ["03", "LEMBRE", "Contas, assinaturas e vencimentos."],
                ["04", "ORIENTE", "Descubra o que fazer."],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="grid gap-3 py-7 sm:grid-cols-[80px_1fr_1fr] sm:items-center sm:py-9"
                >
                  <span className="text-sm font-bold text-[#537b15]">{number}</span>
                  <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {title}
                  </h3>
                  <p className="text-base text-[#17201c]/60 sm:text-lg">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#d5f77a] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
              Cenas que dão vontade de testar
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
              Eu testei o FINANZZI com os meus gastos...
            </h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <StoryBlock
                title="Perguntei se podia comprar..."
                quote="posso gastar 200 hoje?"
                answer="Pode. Mas sua margem cai para R$ 127."
              />
              <StoryBlock
                title="Descobri quanto pago em streaming..."
                quote="quanto eu gasto por mês com streaming?"
                answer="R$ 327,40. R$ 3.928,80 por ano."
              />
              <StoryBlock
                title="Olha o que ele encontrou..."
                quote="quais contas vencem essa semana?"
                answer="4 contas. R$ 1.445 no total."
              />
            </div>
            <p className="mt-7 text-xs font-semibold text-[#17201c]/55">
              Tudo acima é demonstração simulada. Os números variam conforme os seus dados.
            </p>
          </div>
        </section>

        <section className="bg-[#f7f3ec] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
                  Prova social, do jeito certo
                </p>
                <h2 className="mt-5 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                  Quando chegarem os vídeos, eles entram aqui.
                </h2>
              </div>
              <span className="rounded-full border border-[#17201c]/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17201c]/55">
                DEMO · aguardando conteúdo real
              </span>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {["Comentário real", "Vídeo de uso", "Print de resultado"].map((item) => (
                <div
                  key={item}
                  className="flex min-h-44 flex-col justify-between border border-dashed border-[#17201c]/25 bg-white/35 p-6"
                >
                  <Sparkles className="size-5 text-[#537b15]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#537b15]">
                      DEMO
                    </p>
                    <p className="mt-2 text-lg font-semibold">{item}</p>
                    <p className="mt-1 text-sm text-[#17201c]/55">
                      Espaço reservado para prova verificável.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="oferta" className="bg-[#17201c] px-4 py-20 text-white sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6f45d]">
                A oferta
              </p>
              <h2 className="mt-5 max-w-xl font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
                Pare de tentar lembrar de tudo.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
                Deixe o FINANZZI organizar. Acesso completo ao produto, com o seu histórico
                protegido.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm text-white/65">
                <ShieldCheck className="size-5 text-[#c6f45d]" /> Pagamento seguro · acesso após
                confirmação
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#f7f3ec] p-6 text-[#17201c] sm:p-9">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#537b15]">
                    FINANZZI
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                    Acesso completo.
                  </h3>
                </div>
                <span className="rounded-full bg-[#c6f45d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                  Anual · melhor valor
                </span>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="font-display text-6xl font-semibold tracking-[-0.07em]">
                  R$ 12,49
                </span>
                <span className="pb-2 text-sm text-[#17201c]/55">por mês no anual</span>
              </div>
              <p className="mt-2 text-sm text-[#17201c]/55">
                Cobrado como {BILLING_PLANS.pro_annual.priceLabel}. Plano mensal:{" "}
                {BILLING_PLANS.pro_monthly.priceLabel}.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Registro por texto",
                  "Voz",
                  "Organização",
                  "Contas e assinaturas",
                  "Lembretes",
                  "Fin e orientação",
                ].map((benefit) => (
                  <p key={benefit} className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="size-4 text-[#537b15]" /> {benefit}
                  </p>
                ))}
              </div>
              <a
                href={checkoutHref("annual")}
                onClick={markCheckout}
                className="mt-9 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#17201c] px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:text-base"
              >
                QUERO O FINANZZI <ArrowRight className="size-4" />
              </a>
              <p className="mt-4 text-center text-xs text-[#17201c]/50">
                Sem cobrança enquanto o checkout próprio não estiver configurado.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#e9dfd1] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
              Perguntas simples
            </p>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">
              Antes de começar.
            </h2>
            <div className="mt-10 divide-y divide-[#17201c]/15 border-y border-[#17201c]/15">
              <Faq
                question="Preciso preencher tudo manualmente?"
                answer="Não. Você escreve ou fala do jeito que falaria com alguém. O FINANZZI organiza a partir disso."
              />
              <Faq
                question="Posso falar meus gastos?"
                answer="Sim. O registro por voz faz parte do acesso completo; a demonstração pública usa apenas exemplos simulados."
              />
              <Faq
                question="Ele lembra minhas contas?"
                answer="Sim. Contas recorrentes, assinaturas e vencimentos ficam organizados para você acompanhar antes da data."
              />
              <Faq
                question="Posso cadastrar Netflix e outros streamings?"
                answer="Sim. Você pode registrar assinaturas e ver o total mensal e anual comprometido."
              />
              <Faq
                question="Ele acessa minha conta bancária?"
                answer="Não. O FINANZZI não precisa de acesso bancário para funcionar; você escolhe o que registrar."
              />
              <Faq
                question="Quando recebo acesso?"
                answer="Depois que o backend confirmar o pagamento aprovado pelo checkout configurado. Antes disso, a página mostra apenas demonstrações."
              />
              <Faq
                question="Como funciona o pagamento?"
                answer="O checkout Hubla será aberto somente quando as URLs próprias do FINANZZI forem configuradas. Nenhuma cobrança é criada enquanto estiver pendente."
              />
              <Faq
                question="Posso cancelar?"
                answer="O cancelamento será tratado pelo provedor configurado e não apaga os dados financeiros existentes."
              />
            </div>
          </div>
        </section>

        <section className="bg-[#c6f45d] px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#537b15]">
              Seu próximo mês pode ser diferente
            </p>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[.9] tracking-[-0.07em] sm:text-8xl">
              Deixe o FINANZZI organizar.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#17201c]/65">
              Registrar seus gastos ficou fácil. O resto começa a fazer sentido.
            </p>
            <a
              href={checkoutHref("annual")}
              onClick={markCheckout}
              className="mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#17201c] px-8 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:text-base"
            >
              QUERO O FINANZZI <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#17201c] px-4 py-8 text-center text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
          <div className="rounded-full bg-white px-3 py-1">
            <Logo />
          </div>
          <p className="text-xs text-white/50">
            Você fala. O FINANZZI organiza. E lembra o que você não pode esquecer.
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
            Demonstrações públicas sem dados reais · WhatsApp no futuro
          </p>
        </div>
      </footer>
    </div>
  );
}

function ConversationDemo({ scene, large = false }: { scene: DemoScene; large?: boolean }) {
  return (
    <div className={`relative mx-auto w-full ${large ? "max-w-3xl" : "max-w-xl"}`}>
      <div className="absolute -inset-3 rounded-[2.5rem] bg-[#c6f45d]/35 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-[#17201c]/12 bg-white p-4 shadow-[0_24px_70px_rgba(23,32,28,.12)] sm:p-6">
        <div className="flex items-center justify-between border-b border-[#17201c]/10 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#537b15]">
              Demonstração simulada
            </p>
            <p className="mt-1 text-sm font-semibold">Falar dos seus gastos ficou fácil.</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-[#c6f45d] text-[#17201c]">
            <Mic2 className="size-4" />
          </span>
        </div>
        <div className="mt-7 space-y-3">
          <div className="ml-auto max-w-[88%] rounded-[1.35rem] rounded-br-md bg-[#17201c] px-4 py-3 text-sm font-medium text-white sm:text-base">
            {scene.input}
          </div>
          <div className="max-w-[90%] rounded-[1.35rem] rounded-bl-md border border-[#17201c]/12 bg-[#f7f3ec] px-4 py-4">
            <p className="text-sm font-semibold text-[#537b15]">{scene.result}</p>
            <p className="mt-1 text-sm text-[#17201c]/65">{scene.detail}</p>
          </div>
          <div className="rounded-2xl bg-[#c6f45d] px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#537b15]">
              Próxima clareza
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Seu dinheiro disponível hoje: R$ 327
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryBlock({ title, quote, answer }: { title: string; quote: string; answer: string }) {
  return (
    <article className="rounded-[1.75rem] bg-[#f7f3ec] p-5 text-[#17201c] sm:p-6">
      <p className="text-sm font-bold text-[#537b15]">{title}</p>
      <p className="mt-7 font-display text-2xl font-semibold leading-tight tracking-tight">
        “{quote}”
      </p>
      <div className="mt-6 border-t border-[#17201c]/12 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#17201c]/45">
          FINANZZI responde
        </p>
        <p className="mt-2 text-lg font-semibold leading-6">{answer}</p>
      </div>
    </article>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="max-w-2xl pt-3 text-sm leading-6 text-[#17201c]/65 sm:text-base">{answer}</p>
    </details>
  );
}
