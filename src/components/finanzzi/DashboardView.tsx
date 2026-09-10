import type { Profile, Transaction } from "@/types/finance";
import { HomeQuickRegister } from "@/components/finanzzi/HomeQuickRegister";

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

export function DashboardView({ profile }: DashboardViewProps) {
  return (
    <div className="fin-screen fin-dashboard fin-product-home min-h-full bg-background text-foreground">
      <HomeQuickRegister profileName={profile?.name} />
    </div>
  );
}
