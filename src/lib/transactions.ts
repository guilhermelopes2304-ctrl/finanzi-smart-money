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

export async function saveTransaction(input: SaveTransactionInput): Promise<string> {
  const description = input.description.trim();
  if (!description) throw new Error("Informe uma descrição para o lançamento");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Informe um valor maior que zero");
  const parts = Math.max(1, Math.min(72, input.installments ?? 1));
  const base = { description, amount: input.amount, type: input.type, category_id: input.categoryId, account_id: input.accountId, credit_card_id: input.cardId, date: input.date, payment_method: input.method, notes: input.notes, recurrence: input.recurrence };

  if (input.editingId) {
    const { error } = await supabase.from("transactions").update(base).eq("id", input.editingId).eq("user_id", input.userId);
    if (error) throw new Error(error.message);
    return input.editingId;
  }
  if (parts > 1) {
    const rows = buildInstallments({ userId: input.userId, creditCardId: base.credit_card_id, accountId: base.account_id, categoryId: base.category_id, description: base.description, totalAmount: input.amount, firstDate: input.date, installments: parts, notes: base.notes, paymentMethod: input.method, type: input.type });
    const { data, error } = await supabase.from("transactions").insert(rows).select("id").order("date", { ascending: true }).limit(1);
    if (error) throw new Error(error.message);
    const id = data?.[0]?.id;
    if (!id) throw new Error("O lançamento foi criado, mas não foi possível confirmar seu identificador");
    trackProductEvent("first_transaction");
    return id;
  }
  if (input.recurrence !== "none") {
    const occurrences = input.recurrence === "yearly" ? 3 : 12;
    const rows = Array.from({ length: occurrences }, (_, i) => ({ ...base, user_id: input.userId, date: input.recurrence === "weekly" ? addDaysISO(input.date, i * 7) : addMonthsISO(input.date, input.recurrence === "yearly" ? i * 12 : i) }));
    const { data, error } = await supabase.from("transactions").insert(rows).select("id").order("date", { ascending: true }).limit(1);
    if (error) throw new Error(error.message);
    const id = data?.[0]?.id;
    if (!id) throw new Error("O lançamento foi criado, mas não foi possível confirmar seu identificador");
    trackProductEvent("first_transaction");
    return id;
  }
  const { data, error } = await supabase.from("transactions").insert({ ...base, user_id: input.userId }).select("id").single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("O lançamento foi criado, mas não foi possível confirmar seu identificador");
  trackProductEvent("first_transaction");
  return data.id;
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
