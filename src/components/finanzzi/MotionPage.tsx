import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MotionPage({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div
      key={pathname}
      data-fin-page={pathname}
      className={cn("fin-page-enter min-w-0", className)}
    >
      {children}
    </div>
  );
}
