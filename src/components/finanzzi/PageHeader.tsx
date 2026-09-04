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
    <header className="fin-page-header relative mb-3 overflow-hidden border-b border-border/60 pb-3 sm:mb-5 sm:pb-4">
      <div className="pointer-events-none absolute -left-10 -top-20 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
            <span className="h-px w-6 bg-gradient-to-r from-primary to-primary/20 sm:w-8" />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-fin-brand-hover sm:text-[10px]">
              FINANZZI
            </span>
          </div>
          <h1 className="font-display text-[1.9rem] font-semibold leading-[0.96] tracking-[-0.06em] text-foreground sm:text-[3.25rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-muted-foreground sm:mt-2.5 sm:text-[15px] sm:leading-6">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="fin-page-header-action relative flex w-full shrink-0 items-center sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
