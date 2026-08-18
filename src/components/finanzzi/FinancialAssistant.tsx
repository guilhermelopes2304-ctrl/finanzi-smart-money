import { useState } from "react";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialAssistantProps {
  balance: number;
  commitment: number;
  healthTitle: string;
  className?: string;
}

export function FinancialAssistant({
  balance,
  commitment,
  healthTitle,
  className,
}: FinancialAssistantProps) {
  const [imageError, setImageError] = useState(false);

  const message =
    commitment > 90
      ? "Atenção: seus gastos estão muito próximos ou acima da sua renda. Vamos organizar isso juntos?"
      : commitment > 70
        ? "Seus gastos estão um pouco altos. Posso ajudar você a encontrar onde dá para economizar."
        : balance >= 0
          ? "Sua situação está caminhando bem. Continue acompanhando seus gastos e metas comigo."
          : "Seu saldo está negativo. Vamos identificar os maiores gastos e montar um plano de recuperação.";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-background/80 shadow-inner">
          {!imageError ? (
            <img
              src="/fin-assistente.png"
              alt="Fin, assistente financeiro do FINANZZI"
              className="size-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Bot className="size-10 text-primary" aria-hidden="true" />
          )}
          <span className="absolute bottom-1 right-1 size-2.5 rounded-full bg-success ring-2 ring-background" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fin · seu assistente financeiro</p>
          </div>
          <h2 className="mt-1 text-lg font-bold">Vamos cuidar do seu dinheiro juntos?</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Saúde financeira: {healthTitle}
        </span>
        <span className="rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Comprometimento: {commitment}%
        </span>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          onClick={() => window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"))}
        >
          Falar com o Fin
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
