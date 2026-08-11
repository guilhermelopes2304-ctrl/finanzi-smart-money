export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "transferencia"
  | "outro";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "outro", label: "Outro" },
];

export type Recurrence = "none" | "weekly" | "monthly" | "yearly";

export const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: "none", label: "Não se repete" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

export type BillStatus = "pending" | "paid" | "late";

export const ACCOUNT_TYPES: { value: string; label: string }[] = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "digital", label: "Conta digital" },
  { value: "carteira", label: "Carteira" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "outro", label: "Outro" },
];

export interface Profile {
  id: string;
  name: string;
  email: string;
  monthly_income: number;
  current_balance: number;
  main_goal: string | null;
  onboarded: boolean;
  plan: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  bank: string | null;
  type: string;
  initial_balance: number;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: string;
  color: string;
  is_default: boolean;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank: string | null;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  color: string;
}

export interface CreditCardPurchase {
  id: string;
  user_id: string;
  credit_card_id: string;
  category_id: string | null;
  description: string;
  total_amount: number;
  purchase_date: string;
  installments: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  account_id: string | null;
  credit_card_id: string | null;
  purchase_id: string | null;
  bill_id: string | null;
  date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  recurrence: Recurrence;
  installment_number: number | null;
  installment_total: number | null;
}

export interface Bill {
  id: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  recurrence: Recurrence;
  status: BillStatus;
  paid_at: string | null;
  notes: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  description: string | null;
}