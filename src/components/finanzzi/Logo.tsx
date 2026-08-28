import "@/finanzzi-final-guard.css";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/brand/logo/finanzzi-logo.svg?v=brand-orange-1"
        alt="FINANZZI"
        className={cn("size-9 rounded-xl object-contain", compact && "size-10")}
      />
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">FINANZZI</span>
      )}
    </span>
  );
}
