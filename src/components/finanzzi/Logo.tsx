import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/finanzzi-approved.webp?v=1"
        alt="FINANZZI"
        className="size-9 rounded-[22%] object-cover shadow-[var(--shadow-soft)]"
        width={36}
        height={36}
      />
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">FINANZZI</span>
      )}
    </span>
  );
}
