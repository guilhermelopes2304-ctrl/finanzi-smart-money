import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 90;
const MIN_VISIBLE_MS = 120;
const MAX_VISIBLE_MS = 900;

export function NavigationLoading() {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const startedAt = useRef(0);
  const loadingRef = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      if (showTimer.current) clearTimeout(showTimer.current);
      hideTimer.current = null;
      safetyTimer.current = null;
      showTimer.current = null;
    };

    const hide = () => {
      clearTimers();
      loadingRef.current = false;
      setLoading(false);
    };

    const start = () => {
      clearTimers();
      startedAt.current = Date.now();
      showTimer.current = setTimeout(() => {
        loadingRef.current = true;
        loadingRef.current = true;
        setLoading(true);
        safetyTimer.current = setTimeout(hide, MAX_VISIBLE_MS);
      }, SHOW_DELAY_MS);
    };

    const stop = () => {
      if (!loadingRef.current) {
        if (showTimer.current) clearTimers();
        return;
      }
      const elapsedVisible = Date.now() - Math.max(startedAt.current + SHOW_DELAY_MS, startedAt.current);
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsedVisible);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(hide, remaining);
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/10" aria-hidden="true">
      <div className="h-full w-1/3 animate-[finanzzi-progress_900ms_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none" />
    </div>
  );
}
