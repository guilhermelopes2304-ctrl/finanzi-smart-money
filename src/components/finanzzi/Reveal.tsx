import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  threshold = 0.12,
  distance = 16,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      data-reveal-visible={visible ? "true" : "false"}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transform: visible ? "translate3d(0, 0, 0)" : `translate3d(0, ${distance}px, 0)`,
      }}
      className={cn(
        "will-change-[transform,opacity] transition-[transform,opacity] duration-[280ms] ease-out motion-reduce:transition-none motion-reduce:transform-none",
        visible ? "opacity-100" : "opacity-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
