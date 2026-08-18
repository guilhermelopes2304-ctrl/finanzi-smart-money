import { useEffect, useState } from "react";

export function NavigationLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const stop = () => setLoading(false);
    window.addEventListener("finanzzi:navigation-start", start);
    window.addEventListener("finanzzi:navigation-end", stop);
    return () => {
      window.removeEventListener("finanzzi:navigation-start", start);
      window.removeEventListener("finanzzi:navigation-end", stop);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent" aria-live="polite" aria-label="Carregando página">
      <div className="h-full w-1/3 animate-[finanzzi-progress_900ms_ease-in-out_infinite] rounded-full bg-emerald-500" />
    </div>
  );
}
