import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Profile, Transaction } from "@/types/finance";
import { HomeChat } from "@/components/finanzzi/HomeChat";

gsap.registerPlugin(useGSAP);

type DashboardViewProps = {
  profile?: Profile | null;
  transactions: Transaction[];
  categories?: unknown[];
  accounts?: unknown[];
  bills?: unknown[];
  goals?: unknown[];
  isLoading?: boolean;
  capacityPerDay?: number;
  previewMode?: boolean;
  quickEntryPreviewData?: Record<string, string>;
};

export function DashboardView({ profile, transactions, isLoading = false }: DashboardViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo("[data-home-chat]", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="fin-screen fin-dashboard fin-product-home min-h-full bg-background text-foreground">
      <section data-home-chat aria-label="Assistente financeiro" className="min-h-[calc(100dvh-5rem)]">
        <HomeChat profile={profile} transactions={transactions} isLoading={isLoading} />
      </section>
    </div>
  );
}
