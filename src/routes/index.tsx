/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, LockKeyhole, Mic, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/finanzzi/Logo";
import { BILLING_PLANS, getHublaCheckoutUrl } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FINANZZI — Pare de organizar tudo. Comece a entender." },
    { name: "description", content: "Controle financeiro simples: você conta o que aconteceu e o FINANZZI organiza." },
  ] }),
  component: Landing,
});

const PRINTS = {
  hero: ["/prints/hero.png"],
  registro: ["/prints/registro-1.png", "/prints/registro-2.png", "/prints/registro-3.png"],
  clareza: ["/prints/clareza-1.png"],
  insights: ["/prints/insight-1.png", "/prints/insight-2.png"],
  compromissos: ["/prints/compromissos-1.png", "/prints/compromissos-2.png"],
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.16 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`fin-reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}

function PhoneMockup({ prints, alt, emphasis = false, focus = "center" }: { prints: string[]; alt: string; emphasis?: boolean; focus?: "center" | "upper" | "middle" }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prints.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % prints.length), 3400);
    return () => window.clearInterval(timer);
  }, [prints.length]);
  const focusClass = focus === "upper" ? "object-[50%_28%]" : focus === "middle" ? "object-[50%_42%]" : "object-center";
  return (
    <div className={`relative mx-auto w-full ${emphasis ? "max-w-[390px] sm:max-w-[440px]" : "max-w-[320px]"}`}>
      <div className="absolute inset-x-[9%] -bottom-5 h-10 rounded-full bg-black/45 blur-2xl" />
      <div className="relative rounded-[52px] border-[9px] border-[#333333] bg-[#111111] p-[3px] ring-1 ring-white/10">
        <div className="absolute left-1/2 top-[10px] z-20 h-7 w-[38%] -translate-x-1/2 rounded-full bg-[#050505]" />
        <div className="relative aspect-[9/19] overflow-hidden rounded-[40px] bg-[#262626]">
          <img src={prints[index]} alt={alt} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${focusClass} fin-print-fade`} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[.10] via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-black/20" />
        </div>
      </div>
      {prints.length > 1 && <div className="mt-5 flex justify-center gap-1.5">{prints.map((print, dot) => <span key={print} className={dot === index ? "h-1.5 w-5 rounded-full bg-[#F3612D]" : "size-1.5 rounded-full bg-[#333333]"} />)}</div>}
    </div>
  );
}

