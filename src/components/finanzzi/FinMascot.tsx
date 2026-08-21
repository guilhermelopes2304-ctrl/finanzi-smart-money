import humanSecretaryAsset from "@/visual-experiments/fin-human-secretary-hidden.svg";
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
    <img
      src={humanSecretaryAsset}
      alt={alt ?? LABELS[expression]}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}
