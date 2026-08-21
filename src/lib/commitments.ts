import type { Bill, Category } from "@/types/finance";
import { addDaysISO, formatBRL, todayISO } from "@/lib/format";

export type CommitmentKind = "upcoming" | "recurring" | "subscription" | "paid" | "late";

export interface CommitmentReminder {
  title: string;
  description: string;
  tone: "neutral" | "warning" | "danger";
}

const SUBSCRIPTION_WORDS = [
  "netflix",
  "spotify",
  "prime",
  "icloud",
  "youtube",
  "streaming",
  "academia",
  "internet",
  "celular",
  "telefone",
];

export function daysUntil(date: string, reference = todayISO()): number {
  const start = new Date(`${reference}T12:00:00`).getTime();
  const target = new Date(`${date}T12:00:00`).getTime();
  return Math.round((target - start) / 86_400_000);
}

export function isSubscription(bill: Bill, categories: Category[] = []): boolean {
  const category = categories.find((item) => item.id === bill.category_id)?.name ?? "";
  const text = `${bill.description} ${category}`.toLowerCase();
  return (
    category.toLowerCase().includes("assin") ||
    SUBSCRIPTION_WORDS.some((word) => text.includes(word))
  );
}

export function classifyBill(
  bill: Bill,
  categories: Category[] = [],
  reference = todayISO(),
): CommitmentKind {
  if (bill.status === "paid") return "paid";
  if (bill.due_date < reference || bill.status === "late") return "late";
  if (isSubscription(bill, categories)) return "subscription";
  if (bill.recurrence !== "none") return "recurring";
  return "upcoming";
}

export function nextCommitments(
  bills: Bill[],
  categories: Category[] = [],
  limit = 3,
  reference = todayISO(),
): Bill[] {
  return bills
    .filter((bill) => bill.status !== "paid" && bill.due_date >= reference)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, limit);
}

export function recurringCommitments(bills: Bill[], categories: Category[] = []): Bill[] {
  return bills.filter(
    (bill) =>
      bill.status !== "paid" && (bill.recurrence !== "none" || isSubscription(bill, categories)),
  );
}

export function subscriptionCommitments(bills: Bill[], categories: Category[] = []): Bill[] {
  return bills.filter((bill) => isSubscription(bill, categories));
}

export function subscriptionTotals(bills: Bill[], categories: Category[] = []) {
  const subscriptions = subscriptionCommitments(bills, categories);
  const monthly = subscriptions.reduce((total, bill) => {
    const amount = Number(bill.amount) || 0;
    return total + (bill.recurrence === "yearly" ? amount / 12 : amount);
  }, 0);
  return { subscriptions, monthly, yearly: monthly * 12 };
}

export function buildCommitmentReminders(
  bills: Bill[],
  categories: Category[] = [],
  reference = todayISO(),
): CommitmentReminder[] {
  const reminders: CommitmentReminder[] = [];
  const upcoming = nextCommitments(bills, categories, 3, reference);
  const sevenDays = bills.filter(
    (bill) =>
      bill.status !== "paid" &&
      bill.due_date >= reference &&
      bill.due_date <= addDaysISO(reference, 7),
  );
  const overdue = bills.filter((bill) => classifyBill(bill, categories, reference) === "late");

  if (overdue.length > 0) {
    reminders.push({
      title: `${overdue.length} conta${overdue.length > 1 ? "s" : ""} vencida${overdue.length > 1 ? "s" : ""}`,
      description: "Vale a pena resolver este compromisso antes de assumir outro.",
      tone: "danger",
    });
  }
  if (sevenDays.length > 0) {
    const total = sevenDays.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    reminders.push({
      title: `${formatBRL(total)} em contas nesta semana`,
      description: `${sevenDays.length} compromisso${sevenDays.length > 1 ? "s" : ""} merece${sevenDays.length > 1 ? "m" : ""} atenção.`,
      tone: "warning",
    });
  }
  for (const bill of upcoming.slice(0, 2)) {
    const days = daysUntil(bill.due_date, reference);
    reminders.push({
      title: `${bill.description} vence ${days <= 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`}`,
      description: formatBRL(Number(bill.amount || 0)),
      tone: days <= 1 ? "warning" : "neutral",
    });
  }
  return reminders.slice(0, 3);
}
