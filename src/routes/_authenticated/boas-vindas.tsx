/* eslint-disable prettier/prettier */
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
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
  "Criar reserva",
  "Quitar dívidas",
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
  const [goal, setGoal] = useState(GOALS[0] ?? "Organizar minhas finanças");
  const displayName = name || profile?.name || "";

  async function startWithoutDetails() {
    if (!user) return;
    try {
      await update.mutateAsync({
        name: displayName,
        monthly_income: parseBRL(income),
        current_balance: parseBRL(balance),
        main_goal: goal,
        onboarded: true,
      });
      await navigate({ to: "/dashboard" });
    } catch {
      // The shared mutation already surfaces its error.
    }
  }

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
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <span className="text-xs text-muted-foreground">Você pode ajustar tudo depois</span>
          </div>
          <div className="mb-7">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#181818] text-[10px] font-black uppercase tracking-[0.16em] text-[#FF5A1F] sm:hidden">
                FIN
              </span>
              <div>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Vamos começar pelo básico.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  Preencha só o que fizer sentido agora. Você pode ajustar tudo depois.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="surface-card space-y-6 p-5 shadow-lift sm:p-7">
            <div className="rounded-[1.5rem] bg-primary p-4 text-primary-foreground sm:p-5">
              <Label htmlFor="ob-first-entry" className="block text-base font-semibold text-primary-foreground">
                Se quiser, registre algo agora
              </Label>
              <p className="mt-1 text-xs leading-5 text-primary-foreground/65">Escreva do seu jeito. Você também pode pular esta parte.</p>
              <Input
                id="ob-first-entry"
                value={firstEntry}
                onChange={(event) => setFirstEntry(event.target.value)}
                placeholder="O que aconteceu?"
                className="mt-3 h-12 rounded-xl border-0 bg-primary-foreground text-base text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-name">Como você prefere ser chamado?</Label>
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
                Quanto você tem disponível hoje?{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <MoneyInput id="ob-balance" value={balance} onChange={setBalance} />
            </div>
            <div className="space-y-3">
              <div>
                <Label>O que você quer melhorar?</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha uma opção. Você pode mudar depois.
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
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Você pode mudar qualquer informação depois. Não precisa acertar tudo agora.
            </div>
            <div className="space-y-3">
              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-base shadow-soft"
                disabled={update.isPending}
              >
                {update.isPending ? "Preparando..." : "Começar"}
                <ArrowRight className="ml-auto size-4" />
              </Button>
              <button
                type="button"
                onClick={() => void startWithoutDetails()}
                disabled={update.isPending}
                className="min-h-11 w-full rounded-xl text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Começar agora e preencher depois
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
