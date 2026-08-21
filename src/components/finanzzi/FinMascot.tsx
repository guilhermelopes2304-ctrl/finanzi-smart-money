import { cn } from "@/lib/utils";

export type FinMascotExpression =
  "normal" | "feliz" | "surpreso" | "pensando" | "atento" | "comemorando" | "explicando" | "calmo";

const SOURCES: Record<FinMascotExpression, string> = {
  normal: "/fin-mascote-reference-clean.png",
  feliz: "/fin-mascote-feliz-clean.png",
  surpreso: "/fin-mascote-surpreso-clean.png",
  pensando: "/fin-mascote-pensando-clean.png",
  atento: "/fin-mascote-atento-clean.png",
  comemorando: "/fin-mascote-comemorando-clean.png",
  explicando: "/fin-mascote-explicando-clean.png",
  calmo: "/fin-mascote-calmo-clean.png",
};

const LABELS: Record<FinMascotExpression, string> = {
  normal: "Fin",
  feliz: "Fin feliz",
  surpreso: "Fin surpreso",
  pensando: "Fin pensando",
  atento: "Fin atento",
  comemorando: "Fin comemorando",
  explicando: "Fin explicando",
  calmo: "Fin calmo",
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
      src={SOURCES[expression]}
      alt={alt ?? LABELS[expression]}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}
