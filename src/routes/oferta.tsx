import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  ChevronDown,
  Mic,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingOffer } from "@/components/finanzzi/PlanGate";
import { Logo } from "@/components/finanzzi/Logo";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/oferta")({
  validateSearch: (search: Record<string, unknown>): { reason?: string } => {
    const reason = search["reason"];
    return typeof reason === "string" ? { reason } : {};
  },
  head: () => ({
    meta: [
      { title: "Assinar FINANZZI — Seu dinheiro mais simples" },
      {
        name: "description",
        content:
          "Assine o FINANZZI para registrar, organizar, lembrar, entender e orientar sua vida financeira.",
      },
    ],
  }),
  component: OfferPage,
});

const journey = [
  {
    icon: MessageCircle,
    step: "01",
    title: "Registre",
    text: "Escreva ou fale como falaria com alguém. O FINANZZI entende o que aconteceu.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Organize",
    text: "Categorias, contas, cartões, parcelas e recorrências entram no lugar certo.",
  },
  {
    icon: CalendarClock,
    step: "03",
    title: "Lembre",
    text: "Compromissos, assinaturas e vencimentos deixam de depender da sua memória.",
  },
  {
    icon: BellRing,
    step: "04",
    title: "Entenda",
    text: "Veja para onde o dinheiro está indo e o peso do que já está comprometido.",
  },
  {
    icon: Sparkles,
    step: "05",
    title: "Oriente",
    text: "Pergunte ao Fin e receba uma próxima decisão com o contexto do seu momento.",
  },
];

const demos = [
  {
    label: "REGISTRO POR TEXTO",
    user: "gastei 45 no mercado",
    result: "Registrado · Alimentação · R$ 45,00",
  },
  {
    label: "REGISTRO POR VOZ",
    user: "Registrei um gasto falando.",
    result: "O texto vira lançamento organizado, sem abrir planilha.",
  },
  {
    label: "ASSINATURAS",
    user: "quanto gasto com streaming?",
    result: "O FINANZZI reúne as assinaturas e mostra o total mensal.",
  },
  {
    label: "LEMBRETES",
    user: "O FINANZZI me lembrou da minha conta.",
    result: "Próximos compromissos aparecem antes do vencimento.",
  },
  {
    label: "DIRECIONAMENTO",
    user: "posso gastar 200 hoje?",
    result: "O Fin cruza sua margem com o que já está comprometido.",
  },
  {
    label: "CATEGORIAS",
    user: "descobri para onde meu dinheiro está indo.",
    result: "Categorias, parcelas e recorrências revelam os padrões do mês.",
  },
];

function OfferPage() {
  const { reason } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Voltar para o início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                <Link to="/dashboard">Meu FINANZZI</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                <Link to="/auth" search={{ mode: "login", returnTo: "/oferta" }}>
                  Entrar
                </Link>
              </Button>
            )}
            <Button asChild className="rounded-full px-5 shadow-soft">
              <a href="#oferta">Assinar FINANZZI</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {reason === "payment_required" && (
          <div className="border-b border-primary/20 bg-primary/[0.08] px-4 py-3 text-center text-sm font-medium text-primary">
            O acesso completo é liberado somente depois da confirmação do pagamento aprovado.
          </div>
        )}
        {reason === "billing_unavailable" && (
          <div className="border-b border-fin-danger/25 bg-fin-danger-soft px-4 py-3 text-center text-sm font-medium text-fin-ink">
            Não conseguimos validar o billing agora. Nenhum dado financeiro foi aberto.
          </div>
        )}

        <section className="relative isolate overflow-hidden bg-[#EAF9F0] text-[#111827]">
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.86fr_1.14fr] lg:py-28">
            <div className="text-center lg:text-left">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#0F9F52] shadow-sm lg:mx-0">
                <Sparkles className="size-3.5" /> Acesso completo ao FINANZZI
              </div>
              <h1 className="mt-7 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Controle seu dinheiro sem complicar.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#556070] sm:text-lg lg:mx-0">
                Registre seus gastos por texto ou voz. O FINANZZI organiza tudo, lembra das suas
                contas e ajuda você a entender o que fazer a seguir.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full bg-[#19C96B] px-8 text-base text-[#111827] shadow-[0_12px_40px_rgba(25,201,107,.18)] hover:bg-[#19C96B]"
                >
                  <a href="#oferta">
                    Assinar FINANZZI <ArrowRight className="ml-1 size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-[#E1E7E3] bg-white px-8 text-base text-[#111827] hover:bg-[#F4F6F5]"
                >
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#556070] lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-[#19C96B]" /> Texto e voz
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-[#19C96B]" /> Dados protegidos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mic className="size-4 text-[#19C96B]" /> Feito para o celular
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative rounded-[2.25rem] border border-[#E1E7E3] bg-white p-3 shadow-[0_18px_55px_rgba(21,24,39,.08)]">
                <div className="overflow-hidden rounded-[1.8rem] bg-[#F4F6F5] p-5 text-[#111827] sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#19C96B]/70">
                        Demonstração simulada
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        Falar dos seus gastos ficou fácil.
                      </p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-xl bg-[#19C96B] text-[#111827]">
                      <MessageCircle className="size-5" />
                    </span>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-[#19C96B] px-4 py-3 text-sm font-semibold text-[#111827]">
                      gastei 45 no mercado
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#E1E7E3] bg-white px-4 py-3 text-sm text-[#111827]">
                      Registrado ✓
                      <br />
                      <span className="text-[#19C96B]">Alimentação · R$ 45,00</span>
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#E1E7E3] bg-[#EAF9F0] px-4 py-3 text-sm text-[#111827]">
                      Você ainda pode gastar <strong className="text-[#0F9F52]">R$ 327 hoje</strong>
                      .
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Registrar", "em segundos"],
                    ["Organizar", "automaticamente"],
                    ["Orientar", "sem julgamento"],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-[#E1E7E3] bg-[#F4F6F5] p-3 text-center"
                    >
                      <p className="text-xs font-semibold text-[#0F9F52]">{title}</p>
                      <p className="mt-1 text-[11px] text-[#556070]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-b border-border/70 bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                A jornada FINANZZI
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Você registra. O FINANZZI organiza. E te ajuda a cuidar do resto.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Uma jornada simples por fora e uma camada financeira completa por dentro.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {journey.map(({ icon: Icon, step, title, text }) => (
                <div key={step} className="surface-card p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-muted-foreground/60">
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-card/35">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Veja antes de comprar
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                  Pequenas conversas. Grandes clarezas.
                </h2>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
                Todas as cenas abaixo são demonstrações simuladas.
              </span>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((demo) => (
                <div key={demo.label} className="surface-card overflow-hidden p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    {demo.label}
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                      {demo.user}
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-muted/65 px-4 py-3 text-sm leading-6 text-foreground">
                      {demo.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-background">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:py-28">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                O acesso completo
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Tudo o que você precisa para parar de adivinhar.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Contas, assinaturas, parcelas, cartões, metas, alertas, análises e o Fin — com os
                seus dados reais protegidos por autenticação e RLS.
              </p>
              <div className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Registro por texto e voz",
                  "Organização automática",
                  "Contas fixas e lembretes",
                  "Análise de assinaturas",
                  "Parcelas e cartões",
                  "Direcionamentos do Fin",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" /> {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="surface-card rounded-[2rem] p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Privacidade por padrão
              </p>
              <h3 className="mt-4 text-2xl font-semibold">
                Antes do pagamento, apenas a demonstração.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nenhum dado financeiro real é exibido nesta página. O acesso ao aplicativo só é
                liberado depois de o backend confirmar o pagamento aprovado.
              </p>
              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4 text-sm leading-6">
                <p className="font-semibold">WhatsApp no futuro</p>
                <p className="mt-1 text-muted-foreground">
                  O motor financeiro está preparado para novos canais, mas o WhatsApp ainda não faz
                  parte do produto disponível.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="oferta" className="bg-[#EAF9F0] text-[#111827]">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#19C96B]">
                Oferta FINANZZI
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Pague uma vez por mês. Tenha clareza todos os dias.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#556070]">
                Escolha o mensal ou economize no anual. O acesso só é ativado depois da confirmação
                do pagamento pelo provedor.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[2rem] bg-background text-foreground shadow-2xl">
              <BillingOffer onClose={() => void navigate({ to: "/" })} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="text-center">
            <ShieldCheck className="mx-auto size-9 text-primary" />
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Segurança e transparência
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-5xl">
              Sem prova social inventada. Sem promessa escondida.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              O FINANZZI não apresenta avaliações, números de utilizadores ou garantias que ainda
              não foram comprovados. O que você vê aqui é uma demonstração clara do produto e da
              oferta preparada.
            </p>
          </div>
          <div className="mt-10 divide-y divide-border rounded-[1.5rem] border border-border bg-card">
            {[
              [
                "Quando o acesso é liberado?",
                "Somente após pagamento aprovado e confirmação do webhook no backend.",
              ],
              [
                "O que acontece se o pagamento falhar?",
                "O acesso completo não é liberado; os dados existentes, quando houver, permanecem preservados.",
              ],
              [
                "Posso cancelar?",
                "Sim. O cancelamento será tratado pelo provedor escolhido, sem apagar os dados.",
              ],
            ].map(([question, answer]) => (
              <details key={question} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {question}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Você registra. O FINANZZI organiza. E te ajuda a cuidar do resto.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Início
            </Link>
            <a href="#oferta" className="hover:text-foreground">
              Oferta
            </a>
            {user ? (
              <Link to="/dashboard" className="hover:text-foreground">
                Aplicativo
              </Link>
            ) : (
              <Link to="/auth" search={{ mode: "login" }} className="hover:text-foreground">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
