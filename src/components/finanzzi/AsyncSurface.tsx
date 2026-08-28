import type { ReactNode } from "react";

type AsyncSurfaceProps = {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  skeleton: ReactNode;
  empty?: ReactNode;
  errorFallback?: ReactNode;
  children: ReactNode;
};

export function AsyncSurface({
  isLoading,
  error,
  isEmpty,
  skeleton,
  empty,
  errorFallback,
  children,
}: AsyncSurfaceProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando conteúdo</span>
        {skeleton}
      </div>
    );
  }

  if (error && errorFallback) return <>{errorFallback}</>;
  if (isEmpty && empty) return <>{empty}</>;

  return <>{children}</>;
}
