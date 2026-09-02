import { useState } from "react";
import { Store } from "lucide-react";
import { getBrandLogo } from "@/lib/brand-logos";

export function TransactionBrandLogo({ description }: { description: string }) {
  const [failed, setFailed] = useState(false);
  const brand = getBrandLogo(description);

  if (!brand || failed) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fin-brand-soft text-fin-brand-hover">
        <Store className="size-4" />
      </span>
    );
  }

  return (
    <span className="grid size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm">
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className="size-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
