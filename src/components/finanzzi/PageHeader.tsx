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
    <header className="fin-page-header relative mb-4 overflow-hidden border-b border-border/60 pb-4 sm:mb-6 sm:pb-5">
      <div className="pointer-events-none absolute -left-16 -top-24 size-52 rounded-full bg-primary/[0.10] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-32 size-64 rounded-full bg-orange-500/[0.045] blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-7 bg-gradient-to-r from-primary to-primary/20 sm:w-9" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-fin-brand-hover sm:text-[10px]">
              FINANZZI
            </span>
          </div>
          <h1 className="font-display text-[1.8rem] font-semibold leading-[1] tracking-[-0.055em] text-foreground sm:text-[2.55rem] sm:leading-[0.98]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-muted-foreground sm:mt-2.5 sm:text-[14px] sm:leading-6">
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
