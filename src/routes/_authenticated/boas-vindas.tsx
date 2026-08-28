import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck, Sparkles, Target } from "lucide-react";
import { useCategories, useProfile, useUpdateProfile } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Logo } from "@/components/finanzzi/Logo";
import { parseBRL, todayISO } from "@/lib/format";
import { interpretFinanceMessage } from "@/lib/channel-engine";
import { saveRecurringBill } from "@/lib/bills";
import { saveTransaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/boas-vindas")({
  head: () => ({
    meta: [
      { title: "Primeiros passos — FINANZZI" },
      {
        name: "description",
        content: "Configure a primeira leitura personalizada do seu dinheiro.",
      },
    ],
  }),
  component: Onboarding,
});

const GOALS = [
  "Organizar minhas finanças",
  "Economizar dinheiro",
  "Criar reserva",
  "Quitar dívidas",
  "Comprar algo",
  "Viajar",
  "Outro",
];

function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const update = useUpdateProfile("Tudo pronto! Vamos começar.");
  const [name, setName] = useState("");
  const [firstEntry, setFirstEntry] = useState("");
  const [income, setIncome] = useState("");
  const [balance, setBalance] = useState("");
  const [goal, setGoal] = useState(GOALS[0]!);
  const displayName = name || profile?.name || "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      await update.mutateAsync({
        name: displayName,
        monthly_income: parseBRL(income),
        current_balance: parseBRL(balance),
        main_goal: goal,
        onboarded: true,
      });
      const text = firstEntry.trim();
      if (text) {
        const interpretation = interpretFinanceMessage({
          channel: "app",
          text,
          categories,
          accounts: [],
          cards: [],
        });
        const { draft } = interpretation;
        if (draft.amount > 0 && interpretation.intent === "create_recurring_bill") {
          await saveRecurringBill({
            userId: user.id,
            description: draft.description || draft.raw,
            amount: draft.amount,
            categoryId: draft.categoryId,
            accountId: null,
            recurrence: draft.recurrence,
            dueDay: draft.dueDay,
            notes: "Criado no onboarding",
          });
        } else if (draft.amount > 0 && interpretation.intent === "record_transaction") {
          await saveTransaction({
            userId: user.id,
            description: draft.description || draft.raw,
            amount: draft.amount,
            type: draft.type,
            categoryId: draft.categoryId,
            accountId: null,
            cardId: null,
            date: todayISO(),
            method: "pix",
            notes: "Primeiro registro no onboarding",
            recurrence: "none",
            ...(draft.installments ? { installments: draft.installments } : {}),
          });
        }
      }
      await navigate({ to: "/dashboard" });
    } catch {
      // The shared mutation already surfaces its error. Keep the user on the first-value step.
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background lg:grid lg:grid-cols-[.88fr_1.12fr]">
      <aside className="relative hidden overflow-hidden bg-[#FFFFFF] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="fin-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative p-10 xl:p-14">
          <Logo />
          <div className="mt-24 max-w-md">
            <span className="mb-8 grid size-14 place-items-center rounded-2xl bg-[#FF5A1F] text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]">
              FIN
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7B7B7]/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-[#FF5A1F]">
              <Sparkles className="size-3.5" /> Vamos descobrir o seu momento
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight xl:text-5xl">
              Seu FINANZZI começa com contexto.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#181818]/60">
              Com três respostas, o Fin consegue organizar a primeira leitura da sua vida financeira
              e mostrar o que merece atenção.
            </p>
            <div className="mt-9 space-y-4 text-sm text-[#181818]/75">
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[#FF5A1F] text-[#FFFFFF]">
                  <Check className="size-4" />
                </span>
                Uma visão mais pessoal desde o primeiro acesso.
              </p>
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[#B7B7B7]/10 text-[#FF5A1F]">
                  <Target className="size-4" />
                </span>
                Metas e prioridades mais claras.
              </p>
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[#B7B7B7]/10 text-[#FF5A1F]">
                  <ShieldCheck className="size-4" />
                </span>
                Seus dados continuam protegidos e isolados.
              </p>
            </div>
          </div>
        </div>
        <div className="relative p-10 xl:p-14">
          <p className="text-xs text-[#181818]/40">Primeira leitura</p>
          <p className="mt-1 font-display text-lg font-semibold">Entender antes de agir.</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#B7B7B7]/10">
            <div className="h-full w-1/3 rounded-full bg-[#FF5A1F]" />
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="text-xs font-semibold text-primary">1 de 1</span>
          </div>
          <div className="mb-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Primeiros passos
            </p>
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#181818] text-[10px] font-black uppercase tracking-[0.16em] text-[#FF5A1F] sm:hidden">
                FIN
              </span>
              <div>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Me conta o básico. Eu organizo o resto.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  São três respostas rápidas. Depois, o Fin prepara uma primeira leitura feita para
                  você.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="surface-card space-y-6 p-5 shadow-lift sm:p-7">
            <div className="rounded-[1.5rem] bg-primary p-4 text-primary-foreground sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                Primeiro momento de valor
              </p>
              <Label
                htmlFor="ob-first-entry"
                className="mt-2 block text-base font-semibold text-primary-foreground"
              >
                Conte seu primeiro gasto
              </Label>
              <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                Escreva como falaria com o Fin. Por exemplo: mercado 82.
              </p>
              <Input
                id="ob-first-entry"
                value={firstEntry}
                onChange={(event) => setFirstEntry(event.target.value)}
                placeholder="mercado 82"
                className="mt-3 h-12 rounded-xl border-0 bg-primary-foreground text-base text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-name">Como podemos te chamar?</Label>
              <Input
                id="ob-name"
                value={displayName}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como você gosta de ser chamado?"
                className="h-12 rounded-xl bg-background/70"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-income">
                Qual sua renda mensal aproximada?{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <MoneyInput id="ob-income" value={income} onChange={setIncome} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-balance">
                Quanto você possui atualmente?{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <MoneyInput id="ob-balance" value={balance} onChange={setBalance} />
            </div>
            <div className="space-y-3">
              <div>
                <Label>Qual seu principal objetivo?</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Isso ajuda o Fin a priorizar o que importa agora.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-sm transition-all active:scale-95",
                      goal === item
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-2xl bg-muted/45 p-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Você pode atualizar
              essas informações depois em Configurações.
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base shadow-soft"
              disabled={update.isPending}
            >
              {update.isPending ? "Preparando seu espaço..." : "Ver meu ponto de partida"}
              <ArrowRight className="ml-auto size-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
