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
    <header className="fin-page-header mb-6 border-b border-border/70 pb-5 sm:mb-8 sm:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-px w-6 bg-primary/70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fin-brand-hover">
              FINANZZI
            </span>
          </div>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-[3.25rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
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
