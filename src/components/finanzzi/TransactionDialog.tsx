import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  useAccounts,
  useCategories,
  useCreditCards,
  useInvalidateFinance,
} from "@/hooks/useFinanceData";
import { saveTransaction } from "@/lib/transactions";
import { parseBRL, todayISO } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { cn } from "@/lib/utils";
import {
  PAYMENT_METHODS,
  RECURRENCES,
  type PaymentMethod,
  type Recurrence,
  type Transaction,
  type TransactionType,
} from "@/types/finance";

const NONE = "__none__";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  defaultCardId?: string;
  defaultDescription?: string;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  defaultCardId,
  defaultDescription,
}: Props) {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCreditCards();

  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState(NONE);
  const [accountId, setAccountId] = useState(NONE);
  const [cardId, setCardId] = useState(defaultCardId ?? NONE);
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [installments, setInstallments] = useState("1");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(String(Number(transaction.amount).toFixed(2)).replace(".", ","));
      setDate(transaction.date);
      setCategoryId(transaction.category_id ?? NONE);
      setAccountId(transaction.account_id ?? NONE);
      setCardId(transaction.credit_card_id ?? NONE);
      setMethod(transaction.payment_method);
      setNotes(transaction.notes ?? "");
      setRecurrence(transaction.recurrence);
      setInstallments("1");
    } else {
      setType("expense");
      setDescription(defaultDescription ?? "");
      setAmount("");
      setDate(todayISO());
      setCategoryId(NONE);
      setAccountId(NONE);
      setCardId(defaultCardId ?? NONE);
      setMethod(defaultCardId ? "credito" : "pix");
      setNotes("");
      setRecurrence("none");
      setInstallments("1");
    }
  }, [open, transaction, defaultCardId, defaultDescription]);

  const visibleCategories = categories.filter((c) => c.kind === type || c.kind === "both");
  const parts = Math.max(1, Math.min(72, Number.parseInt(installments || "1", 10) || 1));
  const total = parseBRL(amount);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (total <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    setBusy(true);
    try {
      const message = await saveTransaction({
        userId: user.id,
        editingId: transaction?.id ?? null,
        description,
        amount: total,
        type,
        categoryId: categoryId === NONE ? null : categoryId,
        accountId: accountId === NONE ? null : accountId,
        cardId: cardId === NONE ? null : cardId,
        date,
        method,
        notes: notes.trim() || null,
        recurrence,
        installments: transaction ? 1 : parts,
      });
      toast.success(message);
      invalidate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Não foi possível salvar", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa para manter seu dinheiro organizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {(["expense", "income"] as TransactionType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={cn(
                  "rounded-md py-2 text-sm font-medium transition-colors",
                  type === option
                    ? option === "income"
                      ? "bg-success text-success-foreground"
                      : "bg-danger text-danger-foreground"
                    : "text-muted-foreground",
                )}
              >
                {option === "income" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-desc">Descrição</Label>
            <Input
              id="tx-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Mercado do mês"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Valor</Label>
              <MoneyInput id="tx-amount" value={amount} onChange={setAmount} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Data</Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem categoria</SelectItem>
                  {visibleCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Forma de pagamento</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem conta</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cartão</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem cartão</SelectItem>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!transaction && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tx-parts">Parcelas</Label>
                <Input
                  id="tx-parts"
                  type="number"
                  min={1}
                  max={72}
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
                {parts > 1 && total > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {parts}x de aproximadamente{" "}
                    {(total / parts).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Recorrência</Label>
                <Select
                  value={recurrence}
                  onValueChange={(v) => setRecurrence(v as Recurrence)}
                  disabled={parts > 1}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tx-notes">Observação</Label>
            <Textarea
              id="tx-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Opcional"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}