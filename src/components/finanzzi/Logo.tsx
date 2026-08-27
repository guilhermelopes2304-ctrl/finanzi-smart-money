import "@/finanzzi-final-guard.css";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 1054 1008"
        role="img"
        aria-label="FINANZZI"
        className={cn("h-10 w-auto shrink-0", compact && "h-11")}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#F76B0B"
          d="M5150 6996c-93-26-173-87-229-175-62-96-64-112-68-503-3-197-2-358 1-358 3 0 42 38 88 84 86 86 149 126 258 162 50 16 115 18 710 24l655 6 81 27c92 30 178 74 244 123 113 82 223 226 269 349 24 63 51 191 51 240v35l-1007-1c-773-1-1018-4-1053-13zM5254 5635c-173-37-303-154-373-333l-26-67-3-1055c-2-580 0-1070 3-1088l6-33 278 3c303 3 309 4 348 65 17 25 18 88 23 908l5 880 370 5 370 5 76 27c254 90 423 288 475 556 8 41 14 89 14 108v34l-752-1c-588 0-766-4-814-14zM4117 4792c-16-17-17-92-17-875v-857h290c0 0 290 0 290 0v875 875h-273c-253 0-275-1-290-18zM3390 4233c-40-14-40-17-40-605v-568l288 2 287 3 3 588 2 587-262-1c-145 0-270-3-278-6z"
        />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">FINANZZI</span>
      )}
    </span>
  );
}
