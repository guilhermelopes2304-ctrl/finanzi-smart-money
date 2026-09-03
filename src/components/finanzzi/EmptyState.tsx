import type { ReactNode } from "react";
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="fin-empty-state flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-muted/30 px-6 py-10 text-center sm:py-12">
      {icon ? (
        <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          {icon}
        </div>
      ) : (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-fin-brand-soft text-[10px] font-black uppercase tracking-[0.16em] text-fin-brand-hover shadow-[0_12px_30px_hsl(var(--primary)/0.10)]">
          FIN
        </span>
      )}
      <p className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
