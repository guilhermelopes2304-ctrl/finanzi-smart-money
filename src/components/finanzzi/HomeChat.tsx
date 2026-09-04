import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bot, ChevronLeft, ChevronRight, CircleHelp, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { formatBRL, formatDateBR } from "@/lib/format";
import type { Profile, Transaction } from "@/types/finance";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";

type HomeChatProps = {
  profile?: Profile | null;
  transactions: Transaction[];
};

const shortcuts = [
  { label: "Quanto gastei este mês?", icon: TrendingUp },
  { label: "Quanto tenho disponível?", icon: WalletCards },
  { label: "Onde estou gastando mais?", icon: Sparkles },
  { label: "Preciso de ajuda", icon: CircleHelp },
];

export function HomeChat({ profile, transactions }: HomeChatProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const firstName = profile?.name?.split(" ")[0] || "você";
  const recent = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  return (
    <section className="relative min-h-[calc(100dvh-7rem)] overflow-hidden rounded-[30px] border border-white/[0.07] bg-background shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.13),transparent_42%)]" />
      <div className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-primary/[0.035] blur-3xl" />

      <div className="relative flex min-h-[calc(100dvh-7rem)] flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pt-8">
        <header className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">FINANZZI</p>
              <p className="truncate text-xs text-muted-foreground">Seu dinheiro, em conversa.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowShortcuts((value) => !value)}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-card/70 text-muted-foreground shadow-sm backdrop-blur-xl transition hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
            aria-label={showShortcuts ? "Ocultar atalhos" : "Mostrar atalhos"}
            aria-expanded={showShortcuts}
          >
            {showShortcuts ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10 sm:py-14">
          {recent.length === 0 ? (
            <div className="mx-auto w-full max-w-2xl text-center">
              <div className="mx-auto mb-6 grid size-16 place-items-center rounded-[22px] border border-primary/15 bg-primary/[0.07] text-primary shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
                <Sparkles className="size-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Olá, {firstName}</p>
              <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.065em] sm:text-5xl">
                O que aconteceu com seu dinheiro?
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                Registre uma entrada ou saída do seu jeito. O FINANZZI organiza para você.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-5">
              <div className="mb-8 text-center sm:mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Olá, {firstName}</p>
                <h1 className="mt-3 text-[2rem] font-semibold leading-[1.04] tracking-[-0.06em] sm:text-4xl">
                  O que aconteceu com seu dinheiro?
                </h1>
              </div>

              <div className="space-y-3" aria-live="polite">
                {recent.map((tx) => {
                  const income = tx.type === "income";
                  return (
                    <div key={tx.id} className="flex justify-end animate-fin-enter">
                      <div className="max-w-[88%] rounded-[22px] rounded-tr-md border border-primary/15 bg-primary/[0.07] px-4 py-3 shadow-sm">
                        <p className="text-[11px] text-muted-foreground">{formatDateBR(tx.date)}</p>
                        <p className="mt-1 text-sm font-medium">{tx.description}</p>
                        <p className={`mt-1 flex items-center justify-end gap-1 text-sm font-bold ${income ? "text-primary" : "text-foreground"}`}>
                          {income ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5 text-muted-foreground" />}
                          {income ? "+" : "-"}{formatBRL(Number(tx.amount))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Bot className="size-3.5 text-primary" />
            <span>Você pode escrever como fala.</span>
          </div>
          <QuickEntry />
        </div>
      </div>

      <aside
        className={`absolute right-0 top-1/2 z-20 w-[min(82vw,280px)] -translate-y-1/2 rounded-l-[24px] border border-r-0 border-white/[0.08] bg-card/90 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 ${
          showShortcuts ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
        }`}
        aria-hidden={!showShortcuts}
      >
        <div className="px-2 pb-2 pt-1">
          <p className="text-xs font-semibold">Atalhos</p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Perguntas rápidas para explorar seu dinheiro.</p>
        </div>
        <div className="space-y-1">
          {shortcuts.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs text-muted-foreground transition hover:bg-primary/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.99]"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-primary">
                <Icon className="size-4" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
