import "@/finanzzi-final-guard.css";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/brand/logo/finanzzi-logo.png"
        alt="FINANZZI"
        className={cn("h-10 w-auto object-contain", compact && "h-11")}
      />
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">FINANZZI</span>
      )}
    </span>
  );
}
