import { supabase } from "@/integrations/supabase/client";
import { buildInstallments } from "@/lib/installments";
import { addDaysISO, addMonthsISO } from "@/lib/format";
import type { PaymentMethod, Recurrence, TransactionType } from "@/types/finance";
import { trackProductEvent } from "@/lib/product-analytics";

export interface SaveTransactionInput {
  userId: string;
  editingId?: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  accountId: string | null;
  cardId: string | null;
  date: string;
  method: PaymentMethod;
  notes: string | null;
  recurrence: Recurrence;
  installments?: number;
}

/**
 * Single place where transactions are written. Quick entry and the manual
 * dialog both go through here, so RLS-scoped user_id handling stays identical.
 */
export async function saveTransaction(input: SaveTransactionInput): Promise<string> {
  const parts = Math.max(1, Math.min(72, input.installments ?? 1));
  const base = {
    description: input.description.trim(),
    amount: input.amount,
    type: input.type,
    category_id: input.categoryId,
    account_id: input.accountId,
    credit_card_id: input.cardId,
    date: input.date,
    payment_method: input.method,
    notes: input.notes,
    recurrence: input.recurrence,
  };

  if (input.editingId) {
    const { error } = await supabase.from("transactions").update(base).eq("id", input.editingId);
    if (error) throw new Error(error.message);
    return "Lançamento atualizado";
  }

  if (parts > 1) {
    const rows = buildInstallments({
      userId: input.userId,
      creditCardId: base.credit_card_id,
      accountId: base.account_id,
      categoryId: base.category_id,
      description: base.description,
      totalAmount: input.amount,
      firstDate: input.date,
      installments: parts,
      notes: base.notes,
      paymentMethod: input.method,
      type: input.type,
    });
    const { error } = await supabase.from("transactions").insert(rows);
    if (error) throw new Error(error.message);
    trackProductEvent("first_transaction");
    return `Lançamento criado em ${parts} parcelas`;
  }

  if (input.recurrence !== "none") {
    const occurrences = input.recurrence === "yearly" ? 3 : 12;
    const rows = Array.from({ length: occurrences }, (_, i) => ({
      ...base,
      user_id: input.userId,
      date:
        input.recurrence === "weekly"
          ? addDaysISO(input.date, i * 7)
          : addMonthsISO(input.date, input.recurrence === "yearly" ? i * 12 : i),
    }));
    const { error } = await supabase.from("transactions").insert(rows);
    if (error) throw new Error(error.message);
    trackProductEvent("first_transaction");
    return "Lançamento recorrente criado";
  }

  const { error } = await supabase.from("transactions").insert({ ...base, user_id: input.userId });
  if (error) throw new Error(error.message);
  trackProductEvent("first_transaction");
  return "Lançamento registrado";
}
