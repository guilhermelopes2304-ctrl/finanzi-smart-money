import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { getBrandLogo } from "@/lib/brand-logos";

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "F";
}

export function TransactionBrandLogo({ description }: { description: string }) {
  const [failed, setFailed] = useState(false);
  const brand = getBrandLogo(description);
  const label = brand?.name ?? description;
  const fallback = useMemo(() => initials(label), [label]);

  useEffect(() => {
    setFailed(false);
  }, [brand?.logoUrl, description]);

  if (!brand || failed) {
    return (
      <span
        aria-label={label}
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-fin-brand-soft text-[11px] font-black tracking-tight text-fin-brand-hover"
      >
        {brand ? fallback : <Store className="size-4" aria-hidden="true" />}
      </span>
    );
  }

  return (
    <span className="grid size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm">
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className="size-full object-contain"
        loading="eager"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
