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
    <div className="fin-page-header mb-7 flex flex-col gap-4 px-0.5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          FINANZZI
        </p>
        <h1 className="font-display text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="fin-page-header-action w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
}
