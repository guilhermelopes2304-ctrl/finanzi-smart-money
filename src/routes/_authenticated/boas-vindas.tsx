import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useProfile, useUpdateProfile } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Logo } from "@/components/finanzzi/Logo";
import { parseBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/boas-vindas")({
  head: () => ({
    meta: [
      { title: "Primeiros passos — FINANZZI" },
      { name: "description", content: "Configure sua conta e comece a organizar seu dinheiro." },
      { property: "og:title", content: "Primeiros passos — FINANZZI" },
      { property: "og:description", content: "Configure sua conta FINANZZI em poucos segundos." },
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
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const update = useUpdateProfile("Tudo pronto! Vamos começar.");
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [balance, setBalance] = useState("");
  const [goal, setGoal] = useState(GOALS[0]!);

  const displayName = name || profile?.name || "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await update.mutateAsync({
      name: displayName,
      monthly_income: parseBRL(income),
      current_balance: parseBRL(balance),
      main_goal: goal,
      onboarded: true,
    });
    await navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-semibold">Vamos organizar sua vida financeira.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Três respostas rápidas para personalizar suas análises.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ob-name">Como podemos te chamar?</Label>
            <Input
              id="ob-name"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ob-income">Qual sua renda mensal aproximada?</Label>
            <MoneyInput id="ob-income" value={income} onChange={setIncome} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ob-balance">Quanto você possui atualmente?</Label>
            <MoneyInput id="ob-balance" value={balance} onChange={setBalance} />
          </div>

          <div className="space-y-2">
            <Label>Qual seu principal objetivo financeiro?</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    goal === g
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={update.isPending}>
            {update.isPending ? "Salvando..." : "Começar a usar o FINANZZI"}
          </Button>
        </form>
      </div>
    </div>
  );
}