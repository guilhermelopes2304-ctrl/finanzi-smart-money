import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 140;
const MAX_VISIBLE_MS = 1200;

export function NavigationLoading() {
  const [loading, setLoading] = useState(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      hideTimer.current = null;
      safetyTimer.current = null;
    };

    const start = () => {
      clearTimers();
      startedAt.current = Date.now();
      setLoading(true);
      safetyTimer.current = setTimeout(() => setLoading(false), MAX_VISIBLE_MS);
    };

    const stop = () => {
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        clearTimers();
        setLoading(false);
      }, remaining);
    };

    window.addEventListener("finanzzi:navigation-start", start);
    window.addEventListener("finanzzi:navigation-end", stop);
    window.addEventListener("finanzzi:navigation-fallback", stop);

    return () => {
      clearTimers();
      window.removeEventListener("finanzzi:navigation-start", start);
      window.removeEventListener("finanzzi:navigation-end", stop);
      window.removeEventListener("finanzzi:navigation-fallback", stop);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/10"
      aria-hidden="true"
    >
      <div className="h-full w-1/3 animate-[finanzzi-progress_900ms_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none" />
    </div>
  );
}
