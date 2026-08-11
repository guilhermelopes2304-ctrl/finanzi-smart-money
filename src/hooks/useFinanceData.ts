import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  Account,
  Bill,
  Category,
  CreditCard,
  CreditCardPurchase,
  Goal,
  Profile,
  Transaction,
} from "@/types/finance";

type Table =
  | "profiles"
  | "accounts"
  | "categories"
  | "credit_cards"
  | "credit_card_purchases"
  | "transactions"
  | "bills"
  | "goals";

function handle<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Profile | null;
    },
  });
}

function useList<T>(table: Table, order: { column: string; ascending: boolean }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [table, user?.id],
    enabled: !!user,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(order.column, { ascending: order.ascending });
      return handle<T[]>(data as T[] | null, error);
    },
  });
}

export const useAccounts = () => useList<Account>("accounts", { column: "created_at", ascending: true });
export const useCategories = () => useList<Category>("categories", { column: "name", ascending: true });
export const useCreditCards = () => useList<CreditCard>("credit_cards", { column: "created_at", ascending: true });
export const usePurchases = () =>
  useList<CreditCardPurchase>("credit_card_purchases", { column: "purchase_date", ascending: false });
export const useTransactions = () => useList<Transaction>("transactions", { column: "date", ascending: false });
export const useBills = () => useList<Bill>("bills", { column: "due_date", ascending: true });
export const useGoals = () => useList<Goal>("goals", { column: "created_at", ascending: true });

export function useInvalidateFinance() {
  const qc = useQueryClient();
  return () => {
    for (const key of [
      "profile",
      "accounts",
      "categories",
      "credit_cards",
      "credit_card_purchases",
      "transactions",
      "bills",
      "goals",
    ]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
}

interface MutationOptions {
  successMessage?: string;
  onDone?: () => void;
}

export function useSaveRow<T extends Record<string, unknown>>(table: Table, options: MutationOptions = {}) {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: T }) => {
      if (id) {
        const { error } = await supabase
          .from(table)
          // Row shapes are validated by each form; the table name is generic here.
          .update(values as never)
          .eq("id", id);
        if (error) throw new Error(error.message);
        return id;
      }
      const { data, error } = await supabase
        .from(table)
        .insert({ ...values, user_id: user!.id } as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return (data as { id: string }).id;
    },
    onSuccess: () => {
      invalidate();
      if (options.successMessage) toast.success(options.successMessage);
      options.onDone?.();
    },
    onError: (error: Error) => toast.error("Não foi possível salvar", { description: error.message }),
  });
}

export function useDeleteRow(table: Table, successMessage = "Registro excluído") {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error("Não foi possível excluir", { description: error.message }),
  });
}

export function useUpdateProfile(successMessage = "Perfil atualizado") {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase.from("profiles").update(values as never).eq("id", user!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error("Não foi possível salvar", { description: error.message }),
  });
}

/** Creates a card purchase and all of its installment transactions. */
export function useCreateCardPurchase(onDone?: () => void) {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (input: {
      credit_card_id: string;
      category_id: string | null;
      description: string;
      total_amount: number;
      purchase_date: string;
      installments: number;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("credit_card_purchases")
        .insert({
          user_id: user!.id,
          credit_card_id: input.credit_card_id,
          category_id: input.category_id,
          description: input.description,
          total_amount: input.total_amount,
          purchase_date: input.purchase_date,
          installments: input.installments,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const purchaseId = (data as { id: string }).id;
      const { buildInstallments } = await import("@/lib/installments");
      const rows = buildInstallments({
        userId: user!.id,
        purchaseId,
        creditCardId: input.credit_card_id,
        categoryId: input.category_id,
        description: input.description,
        totalAmount: input.total_amount,
        firstDate: input.purchase_date,
        installments: input.installments,
        notes: input.notes ?? null,
      });
      const { error: txError } = await supabase.from("transactions").insert(rows);
      if (txError) throw new Error(txError.message);
      return purchaseId;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Compra registrada");
      onDone?.();
    },
    onError: (error: Error) => toast.error("Não foi possível registrar a compra", { description: error.message }),
  });
}

export function useDeletePurchase() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase.from("credit_card_purchases").delete().eq("id", purchaseId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Compra excluída");
    },
    onError: (error: Error) => toast.error("Não foi possível excluir", { description: error.message }),
  });
}