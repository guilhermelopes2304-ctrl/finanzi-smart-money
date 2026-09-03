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
    <header className="fin-page-header mb-2.5 border-b border-border/70 pb-2.5 sm:mb-4 sm:pb-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
            <span className="h-px w-5 bg-primary/70 sm:w-6" />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-fin-brand-hover sm:text-[10px]">
              FINANZZI
            </span>
          </div>
          <h1 className="font-display text-[1.85rem] font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-[3.25rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-muted-foreground sm:mt-2 sm:text-[15px] sm:leading-6">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="fin-page-header-action flex w-full shrink-0 items-center sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
