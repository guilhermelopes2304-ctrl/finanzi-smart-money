import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Mic,
  MessageCircle,
  PlayCircle,
  Star,
} from "lucide-react";
import { FinMascot } from "@/components/finanzzi/FinMascot";
import { PhoneChat, type ChatMessage } from "@/components/finanzzi/PhoneDemo";
import { Reveal } from "@/components/finanzzi/Reveal";
import { getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINANZZI — Você fala. O FINANZZI organiza." },
      {
        name: "description",
        content:
          "Registre gastos, contas e assinaturas só conversando. O FINANZZI entende, organiza e lembra por você.",
      },
    ],
  }),
  component: Landing,
});

function checkoutHref() {
  return getHublaCheckoutUrl("pro_annual") ?? "/oferta#oferta";
}

/* ================================================================== */
/* Small building blocks                                              */
/* ================================================================== */

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="grid size-9 place-items-center overflow-hidden rounded-2xl bg-[#EEF0FF]">
        <FinMascot expression="normal" className="h-8 w-8" alt="" />
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.04em] text-[#151827]">
        FINANZZI
      </span>
    </span>
  );
}

function BuyButton({
  children,
  className = "",
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  size?: "lg" | "md";
}) {
  const sizing = size === "lg" ? "min-h-[54px] px-8 text-[15px]" : "min-h-[44px] px-5 text-sm";
  return (
    <a
      href={checkoutHref()}
      onClick={() => trackProductEvent("checkout_started")}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#5B5CE2] font-bold text-white shadow-[0_16px_40px_-12px_rgba(91,92,226,0.7)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#4546C8] ${sizing} ${className}`}
    >
      {children}
    </a>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF0FF] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#4546C8]">
      {children}
    </span>
  );
}

/* ================================================================== */
/* Nav                                                                */
/* ================================================================== */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#EDEEF4] bg-[#FCFBF7]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="FINANZZI — início">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#3F4658] transition-colors hover:text-[#151827]"
          >
            Entrar
          </Link>
          <BuyButton size="md">Quero o FINANZZI</BuyButton>
        </nav>
      </div>
    </header>
  );
}

/* ================================================================== */
/* Hero                                                               */
/* ================================================================== */

const HERO_MESSAGES: ChatMessage[] = [
  { from: "user", text: "gastei 45 no mercado" },
  { from: "fin", confirm: "Registrado", text: "Mercado", emphasis: "R$ 45" },
  { from: "user", text: "quanto posso gastar hoje?" },
  {
    from: "fin",
    text: "Você tem",
    emphasis: "R$ 327",
    meta: "disponíveis pra hoje, já contando o que vence.",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-8 lg:pb-16 lg:pt-16">
        <div className="text-center lg:text-left">
          <Reveal>
            <Eyebrow>
              <MessageCircle className="size-3.5" /> Você fala. Ele organiza.
            </Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-balance font-display text-[2.85rem] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#151827] sm:text-6xl lg:text-[4.4rem]">
              Seu dinheiro não precisa dar trabalho.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-relaxed text-[#3F4658] lg:mx-0">
              Registre gastos, contas e assinaturas só conversando. Nada de planilha, nada de
              formulário.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <BuyButton className="w-full sm:w-auto">
                QUERO O FINANZZI <ArrowRight className="size-4" />
              </BuyButton>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-bold text-[#151827] ring-1 ring-[#E4E7EF] transition-transform duration-200 hover:-translate-y-0.5 hover:ring-[#5B5CE2] sm:w-auto"
              >
                Já tenho conta
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-7 flex items-center justify-center gap-4 text-sm text-[#667085] lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="size-4 text-[#5B5CE2]" /> Texto
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mic className="size-4 text-[#5B5CE2]" /> Voz
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Camera className="size-4 text-[#5B5CE2]" /> Foto
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-[#EEF0FF]" />
          <PhoneChat messages={HERO_MESSAGES} inputPlaceholder="Conte o que aconteceu" />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Problem                                                            */
/* ================================================================== */

function Problem() {
  const subs = ["Netflix", "Spotify", "Internet", "Academia", "Energia", "Aluguel"];
  return (
    <section className="bg-[#151827] py-20 text-white sm:py-28">
      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
            Você lembra de todas as contas que paga?
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {subs.map((sub) => (
              <span
                key={sub}
                className="rounded-full border border-white/12 bg-white/[0.06] px-5 py-2.5 text-base font-semibold text-white/80"
              >
                {sub}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-10 font-display text-3xl font-bold tracking-[-0.03em] text-white/55 sm:text-4xl">
            Provavelmente não.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            É por isso que existe o FINANZZI.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Demonstrations ("olha como é fácil")                               */
/* ================================================================== */

type Demo = {
  scene: string;
  detail: string;
  messages: ChatMessage[];
  placeholder?: string;
};

const DEMOS: Demo[] = [
  {
    scene: "Registrei sem preencher formulário.",
    detail: "Escreveu, mandou, pronto. O FINANZZI entende e organiza sozinho.",
    placeholder: "uber 27",
    messages: [
      { from: "user", text: "uber 27" },
      { from: "fin", confirm: "Registrado", text: "Transporte", emphasis: "R$ 27" },
    ],
  },
  {
    scene: "Perguntei quanto eu gasto com streaming.",
    detail: "Ele soma tudo por você e ainda mostra o tamanho do estrago no ano.",
    placeholder: "quanto gasto com streaming?",
    messages: [
      { from: "user", text: "quanto gasto com streaming?" },
      { from: "fin", text: "Streaming", emphasis: "R$ 327,40/mês" },
      { from: "fin", text: "No ano isso dá", emphasis: "R$ 3.928,80", reaction: "😳" },
    ],
  },
  {
    scene: "Perguntei o que vence essa semana.",
    detail: "Sem susto no fim do mês. Você sabe o que vem antes de vir.",
    placeholder: "o que vence essa semana?",
    messages: [
      { from: "user", text: "o que vence essa semana?" },
      { from: "fin", text: "Essa semana", emphasis: "4 contas", meta: "somando R$ 1.445" },
    ],
  },
  {
    scene: "Perguntei se podia comprar.",
    detail: "Antes de gastar, você pergunta. O FINANZZI responde na hora.",
    placeholder: "posso gastar 200 hoje?",
    messages: [
      { from: "user", text: "posso gastar 200 hoje?" },
      { from: "fin", text: "Pode. Sobram", emphasis: "R$ 127", meta: "mesmo depois dessa compra." },
    ],
  },
];

function Demonstrations() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow>Olha como é fácil</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#151827] sm:text-5xl">
              Você conversa. Ele resolve.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col gap-20 sm:gap-28">
          {DEMOS.map((demo, index) => {
            const reversed = index % 2 === 1;
            return (
              <div key={demo.scene} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal className={reversed ? "lg:order-2" : ""}>
                  <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
                    <span className="font-display text-6xl font-black text-[#EEF0FF] sm:text-7xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-balance font-display text-3xl font-bold leading-[1.05] tracking-[-0.035em] text-[#151827] sm:text-4xl">
                      {demo.scene}
                    </h3>
                    <p className="mt-4 text-lg leading-relaxed text-[#3F4658]">{demo.detail}</p>
                  </div>
                </Reveal>
                <Reveal delay={120} className={reversed ? "lg:order-1" : ""}>
                  <PhoneChat
                    messages={demo.messages}
                    inputPlaceholder={demo.placeholder ?? "Mensagem"}
                    className="max-w-[280px]"
                  />
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Commitments                                                        */
/* ================================================================== */

const COMMIT_MESSAGES: ChatMessage[] = [
  { from: "user", text: "quero lembrar do aluguel todo dia 5" },
  {
    from: "fin",
    confirm: "Combinado",
    text: "Aluguel",
    emphasis: "R$ 1.200",
    meta: "todo dia 5 · eu te aviso antes.",
  },
  { from: "fin", text: "Psiu, o aluguel vence amanhã." },
];

function Commitments() {
  const items = [
    { name: "Netflix", value: "R$ 39,90", when: "vence em 6 dias" },
    { name: "Spotify", value: "R$ 21,90", when: "vence em 9 dias" },
    { name: "Internet", value: "R$ 99,90", when: "vence em 12 dias" },
    { name: "Energia", value: "R$ 184,30", when: "vence em 15 dias" },
    { name: "Academia", value: "R$ 89,90", when: "vence em 20 dias" },
  ];
  return (
    <section className="bg-[#EEF0FF] py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
            <Eyebrow>
              <Bell className="size-3.5" /> Ele lembra por você
            </Eyebrow>
            <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#151827] sm:text-5xl">
              Não serve só pra anotar gasto.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3F4658]">
              Contas, assinaturas, parcelas e a fatura. Você fala uma vez e o FINANZZI passa a
              lembrar por você — sempre antes de vencer.
            </p>
            <div className="mt-8 overflow-hidden rounded-3xl border border-white bg-white/70 shadow-[0_20px_50px_-24px_rgba(21,24,39,0.25)]">
              {items.map((item, index) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 px-5 py-4 ${index > 0 ? "border-t border-[#EDEEF4]" : ""}`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF0FF] text-[#4546C8]">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-bold text-[#151827]">{item.name}</p>
                    <p className="text-xs text-[#667085]">{item.when}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[#151827]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <PhoneChat messages={COMMIT_MESSAGES} inputPlaceholder="quero lembrar de..." />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Meet FIN                                                           */
/* ================================================================== */

function MeetFin() {
  const moments: { expression: Parameters<typeof FinMascot>[0]["expression"]; line: string }[] = [
    { expression: "feliz", line: "Boa. Já organizei." },
    { expression: "atento", line: "Isso vence amanhã." },
    { expression: "pensando", line: "Você ainda usa a Netflix?" },
    { expression: "comemorando", line: "Tá avançando, hein." },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <FinMascot expression="explicando" className="mx-auto h-28 w-28 sm:h-32 sm:w-32" />
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#151827] sm:text-5xl">
            Esse é o FIN.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[#3F4658]">
            Ele não é um robô nem uma planilha falante. É aquele amigo esperto que entende de
            dinheiro e fala a sua língua — sem julgamento, sempre na hora certa.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((moment, index) => (
            <Reveal key={moment.line} delay={index * 90}>
              <div className="flex h-full flex-col items-center gap-4 rounded-3xl bg-[#F4F5F8] p-6">
                <FinMascot expression={moment.expression} className="h-20 w-20" />
                <p className="font-display text-lg font-bold leading-snug text-[#151827]">
                  {`“${moment.line}”`}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* How it works                                                       */
/* ================================================================== */

function HowItWorks() {
  const steps = [
    {
      icon: <MessageCircle className="size-6" />,
      title: "Você fala",
      text: "“gastei 45 no mercado”, um áudio ou a foto do comprovante. Do jeito que for mais fácil.",
    },
    {
      icon: <Check className="size-6" strokeWidth={3} />,
      title: "Ele organiza",
      text: "O FINANZZI entende, categoriza e guarda tudo — sem você abrir planilha nenhuma.",
    },
    {
      icon: <Bell className="size-6" />,
      title: "Você entende",
      text: "Quanto pode gastar, o que vence e pra onde o dinheiro foi. Sempre claro.",
    },
  ];
  return (
    <section className="bg-[#151827] py-20 text-white sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
              Simples assim.
            </h2>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 110}>
              <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#5B5CE2] text-white">
                  {step.icon}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-[-0.03em]">{step.title}</h3>
                <p className="leading-relaxed text-white/65">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Social proof (placeholders for real content)                       */
/* ================================================================== */

function SocialProof() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow>
              <Star className="size-3.5" /> Prova real
            </Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#151827] sm:text-5xl">
              Quem usa, mostra.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-lg leading-relaxed text-[#667085]">
              Espaço reservado para vídeos, prints e comentários reais de quem organizou a vida
              financeira com o FINANZZI.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((slot) => (
            <Reveal key={`video-${slot}`} delay={slot * 90}>
              <div className="flex aspect-[9/13] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[#D9DCEA] bg-[#F4F5F8] text-center">
                <PlayCircle className="size-10 text-[#B7BAD0]" />
                <p className="px-6 text-sm font-semibold text-[#8A90A6]">Espaço para vídeo / TikTok</p>
              </div>
            </Reveal>
          ))}
          <div className="flex flex-col gap-5">
            {[0, 1, 2].map((slot) => (
              <Reveal key={`comment-${slot}`} delay={slot * 90}>
                <div className="rounded-3xl border-2 border-dashed border-[#D9DCEA] bg-[#F4F5F8] p-5">
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#E4E7EF]" />
                    <div className="flex-1 space-y-1.5">
                      <span className="block h-2.5 w-24 rounded-full bg-[#E4E7EF]" />
                      <span className="block h-2 w-16 rounded-full bg-[#E9EBF3]" />
                    </div>
                    <div className="flex gap-0.5 text-[#CBD0E0]">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <Star key={star} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <span className="block h-2.5 w-full rounded-full bg-[#E9EBF3]" />
                    <span className="block h-2.5 w-4/5 rounded-full bg-[#E9EBF3]" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#8A90A6]">
                    Espaço para comentário real
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Offer                                                              */
/* ================================================================== */

function Offer() {
  const features = [
    "Registre seus gastos por texto, voz ou foto",
    "Organização automática por categorias",
    "Lembretes de tudo que vence",
    "Contas, assinaturas e parcelas no controle",
    "Sua fatura sempre à vista",
    "FIN pra tirar dúvidas na hora",
    "Direcionamentos do que merece atenção",
  ];
  return (
    <section id="oferta" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#5B5CE2] p-8 text-white shadow-[0_40px_90px_-40px_rgba(91,92,226,0.9)] sm:p-12">
            <div className="pointer-events-none absolute -right-8 -top-8 opacity-90">
              <FinMascot expression="comemorando" className="h-40 w-40" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">FINANZZI</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
              Acesso completo.
            </h2>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-white/80">
              Tudo que você precisa pra parar de correr atrás do dinheiro — e deixar ele organizado
              por você.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[15px] font-medium">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <a
                href={checkoutHref()}
                onClick={() => trackProductEvent("checkout_started")}
                className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-[#4546C8] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                QUERO O FINANZZI <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FAQ                                                                */
/* ================================================================== */

function Faq() {
  const faqs = [
    {
      q: "Preciso preencher planilha ou formulário?",
      a: "Não. Você só conta o que aconteceu — por texto, áudio ou foto — e o FINANZZI organiza o resto sozinho.",
    },
    {
      q: "Funciona pra contas e assinaturas?",
      a: "Sim. Fale uma vez, tipo “lembrar do aluguel todo dia 5”, e ele passa a te avisar sempre antes de vencer.",
    },
    {
      q: "O FIN entende gíria e mensagem curta?",
      a: "Entende. “uber 27” ou “mercado 82” já é suficiente pra ele registrar certinho.",
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Sim. Seus dados são tratados com segurança e usados só pra organizar a sua vida financeira.",
    },
  ];
  return (
    <section className="bg-[#F4F5F8] py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Reveal>
            <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#151827] sm:text-5xl">
              Perguntas rápidas.
            </h2>
          </Reveal>
        </div>
        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.q} delay={index * 70}>
              <details className="group rounded-2xl border border-[#E4E7EF] bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-display text-lg font-bold text-[#151827]">
                  {faq.q}
                  <ChevronDown className="size-5 shrink-0 text-[#5B5CE2] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-[#3F4658]">{faq.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Final CTA                                                          */
/* ================================================================== */

function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <FinMascot expression="feliz" className="mx-auto h-24 w-24" />
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.0] tracking-[-0.045em] text-[#151827] sm:text-6xl">
            Bora deixar o dinheiro organizado?
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-[#3F4658]">
            Você fala. O FINANZZI cuida do resto.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8 flex justify-center">
            <BuyButton className="w-full sm:w-auto">
              QUERO O FINANZZI <ArrowRight className="size-4" />
            </BuyButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Footer                                                             */
/* ================================================================== */

function Footer() {
  return (
    <footer className="border-t border-[#EDEEF4] bg-[#FCFBF7] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <Wordmark />
        <p className="text-sm text-[#667085]">
          © {new Date().getFullYear()} FINANZZI. Você fala, ele organiza.
        </p>
        <Link
          to="/auth"
          search={{ mode: "login" }}
          className="text-sm font-semibold text-[#4546C8] hover:underline"
        >
          Entrar
        </Link>
      </div>
    </footer>
  );
}

/* ================================================================== */
/* Page                                                               */
/* ================================================================== */

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FCFBF7] font-sans text-[#151827] antialiased">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Demonstrations />
        <Commitments />
        <MeetFin />
        <HowItWorks />
        <SocialProof />
        <Offer />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
