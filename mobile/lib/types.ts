export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'transferencia' | 'outro';
export type Recurrence = 'none' | 'weekly' | 'monthly' | 'yearly';
export type Profile = { id: string; name: string; email: string; current_balance: number; monthly_income: number; avatar_url?: string | null; };
export type Account = { id: string; name: string; bank: string | null; type: string; initial_balance: number; };
export type Category = { id: string; name: string; kind: string; color: string; };
export type CreditCard = { id: string; name: string; bank: string | null; credit_limit: number; };
export type Bill = { id: string; description: string; amount: number; due_date: string; status: 'pending' | 'paid' | 'late'; };
export type Goal = { id: string; name: string; target_amount: number; current_amount: number; deadline: string | null; };
export type Transaction = {
  id: string; description: string; amount: number; type: TransactionType; category_id: string | null;
  account_id: string | null; credit_card_id: string | null; date: string; payment_method: PaymentMethod;
  notes: string | null; recurrence: Recurrence; installment_number: number | null; installment_total: number | null;
};

export type FinanceSnapshot = {
  profile: Profile | null;
  accounts: Account[];
  categories: Category[];
  cards: CreditCard[];
  transactions: Transaction[];
  bills: Bill[];
  goals: Goal[];
};
