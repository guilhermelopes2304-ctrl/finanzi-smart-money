import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useAccounts, useBills, useProfile, useTransactions } from "@/hooks/useFinanceData";
import {
  analyzePurchase,
  availableBalance,
  billStatus,
  buildPeriod,
  futureInstallmentTotal,
  totalsFor,
  type PurchaseAdvice,
} from "@/lib/finance";
import { addDaysISO, parseBRL, todayISO } from "@/lib/format";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { CanISpend } from "@/components/finanzzi/CanISpend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/posso-comprar")({
  head: () => ({
    meta: [
      { title: "Posso comprar? — FINANZZI" },
      { name: "description", content: "Descubra se uma compra cabe no seu orçamento com base nos seus dados." },
      { property: "og:title", content: "Posso comprar? — FINANZZI" },
      { property: "og:description", content: "Simule uma compra antes de decidir." },
    ],
  }),
  component: CanIBuyPage,
});

function CanIBuyPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: profile } = useProfile();
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [parts, setParts] = useState("1");
  const [result, setResult] = useState<PurchaseAdvice | null>(null);

  function analyze(event: React.FormEvent) {
    event.preventDefault();
    const period = buildPeriod("current");
    const totals = totalsFor(transactions, period);
    const upcoming = bills
      .filter(
        (b) => billStatus(b) !== "paid" && b.due_date >= todayISO() && b.due_date <= addDaysISO(todayISO(), 30),
      )
      .reduce((s, b) => s + Number(b.amount), 0);
    setResult(
      analyzePurchase({
        price: parseBRL(price),
        installments: Math.max(1, Number(parts) || 1),
        monthlyIncome: totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0),
        monthlyExpenses: totals.expense,
        existingInstallments: futureInstallmentTotal(transactions),
        upcomingBills: upcoming,
        balance: availableBalance(accounts, transactions),
      }),
    );
  }

  return (
    <div>
      <PageHeader
        title="Posso comprar?"
        subtitle="Simule uma compra com base na sua situação financeira real."
      />

      <div className="mb-4">
        <CanISpend />
      </div>

      <form onSubmit={analyze} className="surface-card space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="buy-item">O que você quer comprar?</Label>
          <Input
            id="buy-item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ex.: Celular novo"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="buy-price">Valor</Label>
            <MoneyInput id="buy-price" value={price} onChange={setPrice} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buy-parts">Parcelas</Label>
            <Input
              id="buy-parts"
              type="number"
              min={1}
              max={72}
              value={parts}
              onChange={(e) => setParts(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit">
          <ShoppingBag className="size-4" /> Analisar compra
        </Button>
      </form>

      {result && (
        <div className="surface-card mt-4 p-5">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "size-3 rounded-full",
                result.level === "healthy"
                  ? "bg-success"
                  : result.level === "attention"
                    ? "bg-warning"
                    : "bg-danger",
              )}
            />
            <h2 className="text-lg font-semibold">{result.title}</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Análise para <strong>{item}</strong>.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {result.reasons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Esta é uma ferramenta educativa: a decisão final é sempre sua.
          </p>
        </div>
      )}
    </div>
  );
}