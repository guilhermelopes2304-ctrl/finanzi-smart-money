import { supabase } from '@/lib/supabase';
import type { Account, Bill, Category, CreditCard, FinanceSnapshot, Goal, Profile, Transaction } from '@/lib/types';

export async function loadFinanceSnapshot(userId: string): Promise<FinanceSnapshot> {
  const [profile, accounts, categories, cards, transactions, bills, goals] = await Promise.all([
    supabase.from('profiles').select('id,name,email,current_balance,monthly_income,avatar_url').eq('id', userId).maybeSingle(),
    supabase.from('accounts').select('id,name,bank,type,initial_balance').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('categories').select('id,name,kind,color').eq('user_id', userId).order('name', { ascending: true }),
    supabase.from('credit_cards').select('id,name,bank,credit_limit').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('transactions').select('id,description,amount,type,category_id,account_id,credit_card_id,date,payment_method,notes,recurrence,installment_number,installment_total').eq('user_id', userId).order('date', { ascending: false }).limit(500),
    supabase.from('bills').select('id,description,amount,due_date,status').eq('user_id', userId).in('status', ['pending', 'late']).order('due_date', { ascending: true }).limit(30),
    supabase.from('goals').select('id,name,target_amount,current_amount,deadline').eq('user_id', userId).order('created_at', { ascending: true }).limit(12),
  ]);

  for (const result of [profile, accounts, categories, cards, transactions, bills, goals]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    profile: (profile.data ?? null) as Profile | null,
    accounts: (accounts.data ?? []) as Account[],
    categories: (categories.data ?? []) as Category[],
    cards: (cards.data ?? []) as CreditCard[],
    transactions: (transactions.data ?? []) as Transaction[],
    bills: (bills.data ?? []) as Bill[],
    goals: (goals.data ?? []) as Goal[],
  };
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function monthKey(date: string | Date) {
  const d = typeof date === 'string' ? new Date(`${date.slice(0, 10)}T12:00:00`) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(date: string, months: number) {
  const d = new Date(`${date.slice(0, 10)}T12:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (/uber|transporte|combust|gasolina|ônibus|onibus|metro|taxi/.test(n)) return 'car-outline' as const;
  if (/aliment|mercado|super|restaurante|ifood|padaria/.test(n)) return 'restaurant-outline' as const;
  if (/saúde|saude|farm|academia|méd|med/.test(n)) return 'heart-outline' as const;
  if (/lazer|netflix|prime|spotify|cinema/.test(n)) return 'play-circle-outline' as const;
  if (/casa|moradia|aluguel|luz|água|agua|conta/.test(n)) return 'home-outline' as const;
  if (/compras|roupa|vest/.test(n)) return 'bag-handle-outline' as const;
  if (/educ/.test(n)) return 'school-outline' as const;
  return 'receipt-outline' as const;
}

export function transactionIcon(description: string, categoryName?: string) {
  const n = `${description} ${categoryName ?? ''}`.toLowerCase();
  if (/uber/.test(n)) return 'car-sport-outline' as const;
  if (/netflix|prime|spotify/.test(n)) return 'play-circle-outline' as const;
  if (/academia/.test(n)) return 'barbell-outline' as const;
  if (/farmácia|farmacia|médico|medico/.test(n)) return 'medkit-outline' as const;
  if (/supermercado|mercado|ifood|restaurante/.test(n)) return 'restaurant-outline' as const;
  return categoryIcon(categoryName ?? '');
}
