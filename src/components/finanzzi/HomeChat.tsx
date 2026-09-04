import { ArrowDownRight, ArrowUpRight, Bot, Sparkles } from "lucide-react";
import { formatBRL, formatDateBR } from "@/lib/format";
import type { Profile, Transaction } from "@/types/finance";
import { QuickEntry } from "@/components/finanzzi/QuickEntry";

type HomeChatProps = {
  profile?: Profile | null;
  transactions: Transaction[];
};

export function HomeChat({ profile, transactions }: HomeChatProps) {
  const firstName = profile?.name?.split(" ")[0] || "você";
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse();

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-card/45 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,hsl(var(--primary)/0.16),transparent_36%)]" />
      <div className="relative px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">FINANZZI</p>
            <h1 className="mt-0.5 truncate text-lg font-semibold tracking-[-0.035em]">Olá, {firstName}</h1>
          </div>
        </div>

        <div className="mt-7 max-w-2xl">
          <p className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.06em] sm:text-5xl">
            O que aconteceu com seu dinheiro?
          </p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Conte do seu jeito. Eu organizo a entrada ou saída para você.
          </p>
        </div>

        <div className="mt-7 space-y-3" aria-live="polite">
          <div className="flex gap-3">
            <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-4" />
            </div>
            <div className="max-w-[88%] rounded-[20px] rounded-tl-md border border-white/[0.06] bg-background/70 px-4 py-3">
              <p className="text-sm leading-6">Registre uma despesa ou receita aqui embaixo. Pode escrever como você fala.</p>
            </div>
          </div>

          {recent.map((tx) => {
            const income = tx.type === "income";
            return (
              <div key={tx.id} className="flex justify-end gap-3 animate-fin-enter">
                <div className="max-w-[88%] rounded-[20px] rounded-tr-md border border-primary/15 bg-primary/[0.07] px-4 py-3">
                  <p className="text-xs text-muted-foreground">{formatDateBR(tx.date)}</p>
                  <p className="mt-1 text-sm font-semibold">{tx.description}</p>
                  <p className={`mt-1 flex items-center justify-end gap-1 text-sm font-bold ${income ? "text-primary" : "text-foreground"}`}>
                    {income ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5 text-muted-foreground" />}
                    {income ? "+" : "-"}{formatBRL(Number(tx.amount))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <QuickEntry />
        </div>
      </div>
    </div>
  );
}
