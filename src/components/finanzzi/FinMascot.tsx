import { cn } from "@/lib/utils";

export type FinMascotExpression =
  "normal" | "feliz" | "surpreso" | "pensando" | "atento" | "comemorando" | "explicando" | "calmo";

const LABELS: Record<FinMascotExpression, string> = {
  normal: "Assistente financeiro",
  feliz: "Assistente financeiro confiante",
  surpreso: "Assistente financeiro atento",
  pensando: "Assistente financeiro a analisar",
  atento: "Assistente financeiro atento",
  comemorando: "Assistente financeiro a celebrar um progresso",
  explicando: "Assistente financeiro a explicar",
  calmo: "Assistente financeiro tranquilo",
};

export function FinMascot({
  expression = "normal",
  className,
  alt,
}: {
  expression?: FinMascotExpression;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      aria-label={alt ?? LABELS[expression]}
      title={alt ?? LABELS[expression]}
      className={cn(
        "inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary",
        className,
      )}
    >
      FIN
    </span>
  );
}
