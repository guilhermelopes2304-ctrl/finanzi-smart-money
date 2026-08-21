import { supabase } from "@/integrations/supabase/client";
import { addMonthsISO, todayISO } from "@/lib/format";
import type { Recurrence } from "@/types/finance";

export interface SaveRecurringBillInput {
  userId: string;
  description: string;
  amount: number;
  categoryId: string | null;
  accountId: string | null;
  recurrence: Recurrence;
  dueDay?: number | null;
  notes?: string | null;
}

function dueDateFor(day: number | null | undefined): string {
  if (!day) return todayISO();
  const today = new Date(`${todayISO()}T12:00:00`);
  const candidate = new Date(today.getFullYear(), today.getMonth(), Math.min(day, 28), 12);
  if (candidate.getTime() < today.getTime()) {
    return addMonthsISO(candidate.toISOString().slice(0, 10), 1);
  }
  return candidate.toISOString().slice(0, 10);
}

/** Único escritor de contas recorrentes para todos os canais confiáveis. */
export async function saveRecurringBill(input: SaveRecurringBillInput): Promise<string> {
  const { error } = await supabase.from("bills").insert({
    user_id: input.userId,
    description: input.description.trim(),
    amount: input.amount,
    category_id: input.categoryId,
    account_id: input.accountId,
    due_date: dueDateFor(input.dueDay),
    recurrence: input.recurrence,
    status: "pending",
    notes: input.notes ?? null,
  });
  if (error) throw new Error(error.message);
  return "Conta recorrente criada";
}
