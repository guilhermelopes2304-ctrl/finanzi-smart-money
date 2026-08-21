import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck, Sparkles, Target } from "lucide-react";
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
    <div className="min-h-screen overflow-hidden bg-background lg:grid lg:grid-cols-[.88fr_1.12fr]">
      <aside className="relative hidden overflow-hidden bg-[#071a12] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="fin-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative p-10 xl:p-14">
          <Logo />
          <div className="mt-24 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-emerald-200">
              <Sparkles className="size-3.5" /> Vamos descobrir o seu momento
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight xl:text-5xl">
              Seu FINANZZI começa com contexto.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/60">
              Com três respostas, o Fin consegue organizar a primeira leitura da sua vida financeira
              e mostrar o que merece atenção.
            </p>
            <div className="mt-9 space-y-4 text-sm text-white/75">
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-emerald-300 text-[#062117]">
                  <Check className="size-4" />
                </span>
                Uma visão mais pessoal desde o primeiro acesso.
              </p>
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-emerald-200">
                  <Target className="size-4" />
                </span>
                Metas e prioridades mais claras.
              </p>
              <p className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-emerald-200">
                  <ShieldCheck className="size-4" />
                </span>
                Seus dados continuam protegidos e isolados.
              </p>
            </div>
          </div>
        </div>
        <div className="relative p-10 xl:p-14">
          <p className="text-xs text-white/40">Primeira leitura</p>
          <p className="mt-1 font-display text-lg font-semibold">Entender antes de agir.</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-emerald-300" />
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
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Vamos descobrir como está sua vida financeira.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              São três respostas rápidas. Depois, o Fin prepara uma visão inicial feita para você.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="surface-card space-y-6 p-5 shadow-lift sm:p-7">
            <div className="grid gap-2">
              <Label htmlFor="ob-name">Como podemos te chamar?</Label>
              <Input
                id="ob-name"
                value={displayName}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                className="h-12 rounded-xl bg-background/70"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-income">Qual sua renda mensal aproximada?</Label>
              <MoneyInput id="ob-income" value={income} onChange={setIncome} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ob-balance">Quanto você possui atualmente?</Label>
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
              {update.isPending ? "Preparando seu espaço..." : "Ver minha primeira análise"}
              <ArrowRight className="ml-auto size-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
