import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Account, Bill, Category, Goal, Profile, Transaction } from "@/types/finance";
import { HomeChat } from "@/components/finanzzi/HomeChat";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { Reveal } from "@/components/finanzzi/Reveal";

gsap.registerPlugin(useGSAP);

type DashboardViewProps = {
  profile?: Profile | null;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  bills: Bill[];
  goals: Goal[];
  isLoading?: boolean;
  capacityPerDay?: number;
  previewMode?: boolean;
  quickEntryPreviewData?: Record<string, string>;
};

export function DashboardView({ profile, transactions, isLoading = false }: DashboardViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-home-chat]", {
      y: 18,
      opacity: 0,
      duration: 0.55,
      ease: "power3.out",
    });
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="fin-screen fin-dashboard fin-product-home min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-3 sm:px-6 sm:pb-10 sm:pt-5">
        <Reveal>
          <section data-home-chat aria-label="Assistente financeiro">
            <HomeChat profile={profile} transactions={transactions} />
          </section>
        </Reveal>

        {!isLoading && transactions.length === 0 && (
          <Reveal delay={90} className="mt-4">
            <div className="rounded-[26px] border border-dashed border-border bg-card/40">
              <EmptyState
                title="Sua conversa financeira começa aqui"
                description="Registre sua primeira entrada ou saída na caixa de conversa acima."
              />
            </div>
          </Reveal>
        )}

        {transactions.length > 0 && (
          <Reveal delay={100} className="mt-4">
            <div className="flex justify-end px-1">
              <Link
                to="/lancamentos"
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary"
              >
                Ver histórico completo <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
