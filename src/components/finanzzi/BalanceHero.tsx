import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { formatBRL } from "@/lib/format";

const HIDE_KEY = "finanzzi:hide-balance";

export function BalanceHero({
  balance,
  income,
  expense,
  greeting,
}: {
  balance: number;
  income: number;
  expense: number;
  greeting: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(localStorage.getItem(HIDE_KEY) === "1");
  }, []);

  function toggle() {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(HIDE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="gradient-hero relative animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-lift)] duration-500 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[#5B5CE2]/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[#3F4658]/5 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5B5CE2] to-transparent"
      />

      <div className="relative">
        <p className="text-sm font-medium text-[#F4F5F8]/75">{greeting}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-[#F4F5F8]/75">Saldo disponível</span>
          <button
            type="button"
            onClick={toggle}
            aria-label={hidden ? "Mostrar saldo" : "Esconder saldo"}
            className="grid size-6 place-items-center rounded-full text-[#F4F5F8]/70 transition-all hover:scale-110 hover:bg-[#3F4658]/10 hover:text-white active:scale-90"
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {hidden ? "R$ ••••••" : formatBRL(balance)}
        </p>

        <div className="mt-5 h-px bg-gradient-to-r from-[#151827] via-[#3F4658] to-[#5B5CE2]" />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#3F4658]/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#F4F5F8]/75">
              <ArrowUpRight className="size-3.5" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <p className="mt-1 text-base font-semibold">{hidden ? "••••" : formatBRL(income)}</p>
          </div>
          <div className="rounded-2xl bg-[#3F4658]/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#F4F5F8]/75">
              <ArrowDownRight className="size-3.5" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <p className="mt-1 text-base font-semibold">{hidden ? "••••" : formatBRL(expense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
