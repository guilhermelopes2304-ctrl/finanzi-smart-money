import { addMonthsISO } from "@/lib/format";

export interface InstallmentInput {
  userId: string;
  purchaseId?: string | null;
  creditCardId?: string | null;
  accountId?: string | null;
  categoryId: string | null;
  description: string;
  totalAmount: number;
  firstDate: string;
  installments: number;
  notes?: string | null;
  paymentMethod?: string;
  type?: "income" | "expense";
}

/**
 * Splits a total amount into N installments, keeping cents exact:
 * the remainder is added to the first installment.
 */
export function splitAmount(total: number, parts: number): number[] {
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / parts);
  const remainder = cents - base * parts;
  return Array.from({ length: parts }, (_, i) => (base + (i === 0 ? remainder : 0)) / 100);
}

export function buildInstallments(input: InstallmentInput) {
  const parts = Math.max(1, Math.floor(input.installments));
  const values = splitAmount(input.totalAmount, parts);
  return values.map((amount, index) => ({
    user_id: input.userId,
    purchase_id: input.purchaseId ?? null,
    credit_card_id: input.creditCardId ?? null,
    account_id: input.accountId ?? null,
    category_id: input.categoryId,
    description: parts > 1 ? `${input.description} (${index + 1}/${parts})` : input.description,
    amount,
    type: input.type ?? "expense",
    date: addMonthsISO(input.firstDate, index),
    payment_method: input.paymentMethod ?? (input.creditCardId ? "credito" : "dinheiro"),
    notes: input.notes ?? null,
    recurrence: "none",
    installment_number: parts > 1 ? index + 1 : null,
    installment_total: parts > 1 ? parts : null,
  }));
}