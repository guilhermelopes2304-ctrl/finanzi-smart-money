import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "income" | "expense" | "warning";
}) {
  const toneClass = {
    default: "text-foreground",
    income: "text-success",
    expense: "text-danger",
    warning: "text-warning",
  }[tone];

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className={cn("mt-2 font-display text-xl font-semibold sm:text-2xl", toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}