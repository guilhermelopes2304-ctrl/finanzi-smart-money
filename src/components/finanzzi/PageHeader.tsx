import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3 px-0.5 sm:mb-8">
      <div className="min-w-0">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="size-3" /> FINANZZI
        </p>
        <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
