import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="gradient-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 18V9m5 9V5m5 13v-6m5 6V8" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-700 tracking-tight text-foreground">FINANZZI</span>
      )}
    </span>
  );
}