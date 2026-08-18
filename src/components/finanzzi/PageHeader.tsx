import type { ReactNode } from "react";

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
    <div className="mb-5 flex items-end justify-between gap-3 px-0.5 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-[1.65rem] font-bold tracking-[-0.03em] text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm leading-5 text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
