import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import { useAccounts, useBills, useGoals, useTransactions } from "@/hooks/useFinanceData";
import { spendCapacity } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { trackProductEvent } from "@/lib/product-analytics";

/** Read-only calculator: how much is safe to spend until the end of the month. */
export function CanISpend() {
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: goals = [] } = useGoals();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const capacity = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }),
    [accounts, transactions, bills, goals],
  );

  useEffect(() => {
    trackProductEvent("spend_capacity_viewed");
  }, []);

  const rows = [
    { label: "Saldo disponível", value: capacity.balance, sign: "" },
    { label: "Contas a pagar até o fim do mês", value: capacity.upcomingBills, sign: "−" },
    { label: "Parcelas que ainda vencem no mês", value: capacity.upcomingInstallments, sign: "−" },
    { label: "Reserva das suas metas", value: capacity.goalsReserve, sign: "−" },
  ];

  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Wallet className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold leading-tight">Posso gastar?</h2>
          <p className="text-xs text-muted-foreground">
            Cálculo automático com os seus dados — nada é alterado.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 transition-all duration-300 ease-out",
          capacity.level === "healthy"
            ? "border-success/30 bg-success/10"
            : capacity.level === "attention"
              ? "border-warning/30 bg-warning/10"
              : "border-danger/30 bg-danger/10",
        )}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Livre para gastar até o fim do mês
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatBRL(Math.max(0, capacity.free))}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {capacity.free > 0
            ? `Cerca de ${formatBRL(capacity.perDay)} por dia nos próximos ${capacity.daysLeft} dias.`
            : "Seus compromissos já consomem o saldo do mês. Evite novos gastos agora."}
        </p>
      </div>

      <button
        type="button"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((open) => !open)}
        className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-muted/20 px-4 text-left text-sm font-semibold transition-all duration-200 hover:bg-muted/35 active:scale-[0.99]"
      >
        <span>{detailsOpen ? "Ocultar cálculo" : "Ver como calculamos"}</span>
        <ChevronDown className={cn("size-4 transition-transform duration-300", detailsOpen && "rotate-180")} />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          detailsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="mt-4 space-y-2 rounded-xl border border-border/70 bg-muted/10 p-4 text-sm">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums">
                  {row.sign}
                  {formatBRL(row.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
