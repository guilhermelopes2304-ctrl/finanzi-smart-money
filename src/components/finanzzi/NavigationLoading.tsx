import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

export function NavigationLoading() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
    const start = () => {
      clear();
      setLoading(true);
    };
    const stop = () => {
      clear();
      timer.current = setTimeout(() => setLoading(false), 160);
    };
    const fallback = () => {
      clear();
      setLoading(false);
    };

    window.addEventListener("finanzzi:navigation-start", start);
    window.addEventListener("finanzzi:navigation-end", stop);
    window.addEventListener("finanzzi:navigation-fallback", fallback);
    return () => {
      clear();
      window.removeEventListener("finanzzi:navigation-start", start);
      window.removeEventListener("finanzzi:navigation-end", stop);
      window.removeEventListener("finanzzi:navigation-fallback", fallback);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/10">
        <div className="h-full w-1/3 animate-[finanzzi-progress_900ms_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[99] flex items-center justify-center bg-background/25 backdrop-blur-[1px] animate-in fade-in-0 duration-150">
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card/95 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg">
          <LoaderCircle className="size-4 animate-spin text-primary" />
          <span>Carregando</span>
        </div>
      </div>
    </>
  );
}
