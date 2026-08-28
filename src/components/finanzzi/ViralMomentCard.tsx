import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackProductEvent, type ProductEvent } from "@/lib/product-analytics";
import { toast } from "sonner";

export interface ViralMomentCardProps {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
  shareText: string;
  event: Extract<
    ProductEvent,
    | "subscription_moment_shared"
    | "installment_moment_shared"
    | "category_moment_shared"
    | "fin_month_moment_shared"
  >;
  className?: string;
}

function canShareFiles(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, y);
}

async function buildMomentFile(
  props: Pick<ViralMomentCardProps, "eyebrow" | "title" | "value" | "detail">,
) {
  if (typeof document === "undefined" || typeof File === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, "#111827");
  gradient.addColorStop(1, "#556070");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1920);
  context.fillStyle = "rgba(183, 255, 82, 0.12)";
  context.beginPath();
  context.arc(940, 160, 260, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#FF5A1F";
  context.font = "700 34px Arial, sans-serif";
  context.fillText("FINANZZI", 90, 130);
  context.fillStyle = "rgba(255,255,255,0.55)";
  context.font = "600 24px Arial, sans-serif";
  context.fillText("DESCOBERTA", 820, 130);

  context.fillStyle = "rgba(210,255,220,0.72)";
  context.font = "600 27px Arial, sans-serif";
  context.fillText(props.eyebrow.toUpperCase(), 90, 1220);
  context.fillStyle = "#fcfcf8";
  context.font = "700 82px Arial, sans-serif";
  drawWrappedText(context, props.title, 90, 1335, 900, 98);
  context.fillStyle = "#FF5A1F";
  context.font = "700 112px Arial, sans-serif";
  drawWrappedText(context, props.value, 90, 1600, 900, 125);
  context.fillStyle = "rgba(255,255,255,0.72)";
  context.font = "400 30px Arial, sans-serif";
  drawWrappedText(context, props.detail, 90, 1720, 900, 44);
  context.strokeStyle = "rgba(255,255,255,0.18)";
  context.beginPath();
  context.moveTo(90, 1810);
  context.lineTo(990, 1810);
  context.stroke();
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.font = "400 24px Arial, sans-serif";
  context.fillText("Você registra. O FINANZZI organiza.", 90, 1865);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  return blob ? new File([blob], "finanzzi-descoberta.png", { type: "image/png" }) : null;
}

export function ViralMomentCard({
  eyebrow,
  title,
  value,
  detail,
  shareText,
  event,
  className,
}: ViralMomentCardProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (canShareFiles()) {
        const file = await buildMomentFile({ eyebrow, title, value, detail });
        const canShareImage =
          file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
        await navigator.share(
          canShareImage
            ? { title: `${title} · FINANZZI`, text: shareText, files: [file] }
            : { title: `${title} · FINANZZI`, text: shareText },
        );
        trackProductEvent(event);
        toast.success(
          canShareImage
            ? "Card vertical pronto para compartilhar"
            : "Momento pronto para compartilhar",
          {
            description: "O card não inclui saldo, renda ou dados bancários.",
          },
        );
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
        trackProductEvent(event);
        toast.success("Texto copiado", {
          description: "Cole onde quiser para compartilhar sua descoberta.",
        });
      }
    } catch {
      // Cancelar a partilha nativa não deve mostrar erro.
    }
  }

  return (
    <div className={cn("surface-card p-4", className)}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center">
        <div className="mx-auto w-full max-w-[14rem]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-[#111827] p-5 text-white shadow-[0_18px_50px_rgba(2,32,20,0.22)]">
            <div className="absolute -top-16 -right-16 size-40 rounded-full bg-[#FF5A1F]/20 blur-2xl" />
            <div className="absolute -bottom-20 -left-14 size-44 rounded-full bg-[#FF5A1F]/10 blur-2xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#FF5A1F]/80">
                <span>FINANZZI</span>
                <span>Descoberta</span>
              </div>
              <div className="mt-auto">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[#FF5A1F]/80">
                  {eyebrow}
                </p>
                <h3 className="mt-3 text-[1.55rem] leading-[1.03] font-semibold tracking-[-0.05em]">
                  {title}
                </h3>
                <p className="mt-6 text-[2rem] leading-none font-semibold tracking-[-0.06em] text-[#FF5A1F]">
                  {value}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-[#F4F5F8]/70">{detail}</p>
              </div>
              <div className="mt-8 border-t border-[#556070]/15 pt-3 text-[0.65rem] text-[#F4F5F8]/50">
                Você registra. O FINANZZI organiza.
              </div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Momento FINANZZI
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
            Uma descoberta que vale compartilhar
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            O card é vertical, fácil de publicar nos Stories e não revela informações sensíveis da
            sua vida financeira.
          </p>
          <Button type="button" className="mt-5" onClick={() => void share()}>
            {copied ? (
              <Check className="size-4" />
            ) : canShareFiles() ? (
              <Share2 className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copiado" : canShareFiles() ? "Compartilhar card" : "Copiar descoberta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
