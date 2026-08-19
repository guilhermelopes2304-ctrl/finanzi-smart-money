import { useEffect, useRef, useState } from "react";

export function NavigationLoading() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = () => {
      if (timer.current) clearTimeout(timer.current);
      setLoading(true);
    };
    const stop = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setLoading(false), 120);
    };
    const fallback = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setLoading(false), 3500);
    };

    window.addEventListener("finanzzi:navigation-start", start);
    window.addEventListener("finanzzi:navigation-end", stop);
    window.addEventListener("finanzzi:navigation-fallback", fallback);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("finanzzi:navigation-start", start);
      window.removeEventListener("finanzzi:navigation-end", stop);
      window.removeEventListener("finanzzi:navigation-fallback", fallback);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/10" aria-live="polite" aria-label="Carregando página">
      <div className="h-full w-1/3 animate-[finanzzi-progress_900ms_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  );
}
