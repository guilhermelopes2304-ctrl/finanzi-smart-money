import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/finanzzi/AppShell";
import { DashboardView } from "@/components/finanzzi/DashboardView";
import { todayISO } from "@/lib/format";
import type { Account, Bill, Category, Goal, Profile, Transaction } from "@/types/finance";

export const Route = createFileRoute("/visual-review/dashboard")({
  head: () => ({
    meta: [
      { title: "Revisão visual — FINANZZI" },
      {
        name: "description",
        content: "Rota temporária não indexada para revisão visual do FINANZZI.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: VisualReviewDashboard,
});

function VisualReviewDashboard() {
  const data = createReviewData();

  return (
    <AppShell visualReview>
      <DashboardView
        profile={data.profile}
        transactions={data.transactions}
        categories={data.categories}
        accounts={data.accounts}
        bills={data.bills}
        goals={data.goals}
        capacityPerDay={327}
        previewMode
        quickEntryPreviewData={{
          text: "mercado 82",
          amount: "R$ 82,00",
          description: "Mercado",
          category: "Alimentação",
          account: "Conta principal",
        }}
      />
    </AppShell>
  );
}

type ReviewData = {
  profile: Profile;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  bills: Bill[];
  goals: Goal[];
};

function createReviewData(): ReviewData {
  const userId = "visual-review-user";
  const today = todayISO();
  const currentMonth = today.slice(0, 7);
  const date = (day: number) => `${currentMonth}-${String(day).padStart(2, "0")}`;
  const futureDate = (days: number) => {
    const next = new Date(`${today}T12:00:00`);
    next.setDate(next.getDate() + days);
    return next.toISOString().slice(0, 10);
  };

  return {
    profile: {
      id: userId,
      name: "Gui",
      email: "visual-review@finanzzi.local",
      monthly_income: 5000,
      current_balance: 2450,
      main_goal: "Reserva de emergência",
      onboarded: true,
      plan: "pro",
    },
    accounts: [
      {
        id: "visual-review-account",
        user_id: userId,
        name: "Conta principal",
        bank: "Conta digital",
        type: "digital",
        initial_balance: 2450,
      },
    ],
    categories: [
      {
        id: "visual-review-food",
        user_id: userId,
        name: "Alimentação",
        kind: "expense",
        color: "#19C96B",
        is_default: true,
      },
      {
        id: "visual-review-transport",
        user_id: userId,
        name: "Transporte",
        kind: "expense",
        color: "#0F9F52",
        is_default: true,
      },
      {
        id: "visual-review-income",
        user_id: userId,
        name: "Salário",
        kind: "income",
        color: "#19C96B",
        is_default: true,
      },
    ],
    transactions: [
      {
        id: "visual-review-tx-income",
        user_id: userId,
        description: "Salário",
        amount: 5000,
        type: "income",
        category_id: "visual-review-income",
        account_id: "visual-review-account",
        credit_card_id: null,
        purchase_id: null,
        bill_id: null,
        date: date(1),
        payment_method: "transferencia",
        notes: null,
        recurrence: "none",
        installment_number: null,
        installment_total: null,
      },
      {
        id: "visual-review-tx-market",
        user_id: userId,
        description: "Mercado",
        amount: 82,
        type: "expense",
        category_id: "visual-review-food",
        account_id: "visual-review-account",
        credit_card_id: null,
        purchase_id: null,
        bill_id: null,
        date: today,
        payment_method: "pix",
        notes: null,
        recurrence: "none",
        installment_number: null,
        installment_total: null,
      },
      {
        id: "visual-review-tx-delivery",
        user_id: userId,
        description: "Jantar",
        amount: 64,
        type: "expense",
        category_id: "visual-review-food",
        account_id: "visual-review-account",
        credit_card_id: null,
        purchase_id: null,
        bill_id: null,
        date: date(4),
        payment_method: "pix",
        notes: null,
        recurrence: "none",
        installment_number: null,
        installment_total: null,
      },
      {
        id: "visual-review-tx-transport",
        user_id: userId,
        description: "Uber",
        amount: 27,
        type: "expense",
        category_id: "visual-review-transport",
        account_id: "visual-review-account",
        credit_card_id: null,
        purchase_id: null,
        bill_id: null,
        date: date(6),
        payment_method: "credito",
        notes: null,
        recurrence: "none",
        installment_number: null,
        installment_total: null,
      },
    ],
    bills: [
      {
        id: "visual-review-bill-netflix",
        user_id: userId,
        category_id: "visual-review-food",
        account_id: "visual-review-account",
        description: "Netflix",
        amount: 39.9,
        due_date: futureDate(1),
        recurrence: "monthly",
        status: "pending",
        paid_at: null,
        notes: null,
      },
      {
        id: "visual-review-bill-internet",
        user_id: userId,
        category_id: null,
        account_id: "visual-review-account",
        description: "Internet",
        amount: 99.9,
        due_date: futureDate(3),
        recurrence: "monthly",
        status: "pending",
        paid_at: null,
        notes: null,
      },
      {
        id: "visual-review-bill-rent",
        user_id: userId,
        category_id: null,
        account_id: "visual-review-account",
        description: "Aluguel",
        amount: 1200,
        due_date: futureDate(7),
        recurrence: "monthly",
        status: "pending",
        paid_at: null,
        notes: null,
      },
    ],
    goals: [],
  };
}
