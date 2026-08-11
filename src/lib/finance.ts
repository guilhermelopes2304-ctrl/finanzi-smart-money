import { addMonthsISO, monthLabel, parseISODate, toISODate, todayISO } from "@/lib/format";
import type { Account, Bill, Category, CreditCard, Goal, Transaction } from "@/types/finance";

export interface Period {
  from: string;
  to: string;
  label: string;
}

export type PeriodPreset = "current" | "previous" | "last3" | "custom";

export function buildPeriod(preset: PeriodPreset, custom?: { from: string; to: string }): Period {
  const now = new Date();
  const startOf = (offset: number) => new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const endOf = (offset: number) => new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  switch (preset) {
    case "previous":
      return { from: toISODate(startOf(-1)), to: toISODate(endOf(-1)), label: "Mês anterior" };
    case "last3":
      return { from: toISODate(startOf(-2)), to: toISODate(endOf(0)), label: "Últimos 3 meses" };
    case "custom":
      return {
        from: custom?.from ?? toISODate(startOf(0)),
        to: custom?.to ?? toISODate(endOf(0)),
        label: "Período personalizado",
      };
    default:
      return { from: toISODate(startOf(0)), to: toISODate(endOf(0)), label: "Este mês" };
  }
}

/** Same length window immediately before the given period. */
export function previousPeriod(period: Period): Period {
  const from = parseISODate(period.from);
  const to = parseISODate(period.to);
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  const newTo = new Date(from);
  newTo.setDate(newTo.getDate() - 1);
  const newFrom = new Date(newTo);
  newFrom.setDate(newFrom.getDate() - days + 1);
  return { from: toISODate(newFrom), to: toISODate(newTo), label: "Período anterior" };
}

export function inPeriod(tx: { date: string }, period: Period): boolean {
  return tx.date >= period.from && tx.date <= period.to;
}

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function totalsFor(transactions: Transaction[], period: Period): Totals {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (!inPeriod(tx, period)) continue;
    if (tx.type === "income") income += Number(tx.amount);
    else expense += Number(tx.amount);
  }
  return { income, expense, balance: income - expense };
}

/** Overall balance from account opening balances plus every past transaction. */
export function availableBalance(accounts: Account[], transactions: Transaction[]): number {
  const today = todayISO();
  const opening = accounts.reduce((sum, a) => sum + Number(a.initial_balance), 0);
  const movement = transactions.reduce((sum, tx) => {
    if (tx.date > today) return sum;
    // Credit-card installments only leave the account when the bill is paid.
    if (tx.credit_card_id) return sum;
    return tx.type === "income" ? sum + Number(tx.amount) : sum - Number(tx.amount);
  }, 0);
  return opening + movement;
}

export function accountBalance(account: Account, transactions: Transaction[]): number {
  const today = todayISO();
  return transactions.reduce((sum, tx) => {
    if (tx.account_id !== account.id || tx.date > today || tx.credit_card_id) return sum;
    return tx.type === "income" ? sum + Number(tx.amount) : sum - Number(tx.amount);
  }, Number(account.initial_balance));
}

export interface CategorySlice {
  id: string;
  name: string;
  color: string;
  value: number;
  share: number;
}

export function expensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  period: Period,
): CategorySlice[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();
  let total = 0;
  for (const tx of transactions) {
    if (tx.type !== "expense" || !inPeriod(tx, period)) continue;
    const key = tx.category_id ?? "none";
    totals.set(key, (totals.get(key) ?? 0) + Number(tx.amount));
    total += Number(tx.amount);
  }
  return [...totals.entries()]
    .map(([id, value]) => ({
      id,
      name: byId.get(id)?.name ?? "Sem categoria",
      color: byId.get(id)?.color ?? "#94a3b8",
      value,
      share: total ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
  cumulative: number;
}

export function monthlySeries(transactions: Transaction[], months = 6): MonthlyPoint[] {
  const now = new Date();
  const points: MonthlyPoint[] = [];
  let cumulative = 0;
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const period: Period = { from: toISODate(start), to: toISODate(end), label: "" };
    const t = totalsFor(transactions, period);
    cumulative += t.balance;
    points.push({
      month: monthLabel(period.from),
      income: t.income,
      expense: t.expense,
      balance: t.balance,
      cumulative,
    });
  }
  return points;
}

export type HealthLevel = "healthy" | "attention" | "critical";

export interface HealthResult {
  level: HealthLevel;
  title: string;
  commitment: number;
  message: string;
}

export function financialHealth(totals: Totals, monthlyIncome: number): HealthResult {
  const income = totals.income > 0 ? totals.income : monthlyIncome;
  if (income <= 0) {
    return {
      level: "attention",
      title: "Ainda não dá para avaliar",
      commitment: 0,
      message:
        "Cadastre sua renda ou registre suas receitas para que o FINANZZI possa avaliar sua situação.",
    };
  }
  const commitment = Math.round((totals.expense / income) * 100);
  if (commitment <= 70) {
    return {
      level: "healthy",
      title: "Saudável",
      commitment,
      message: `Você está gastando ${commitment}% da sua renda. Seu nível de comprometimento está em uma faixa confortável.`,
    };
  }
  if (commitment <= 95) {
    return {
      level: "attention",
      title: "Atenção",
      commitment,
      message: `Você está gastando ${commitment}% da sua renda. Sobra pouco espaço para imprevistos — vale revisar os maiores gastos.`,
    };
  }
  return {
    level: "critical",
    title: "Crítica",
    commitment,
    message: `Você está gastando ${commitment}% da sua renda. Suas despesas estão maiores do que o que entra e isso tende a virar dívida.`,
  };
}

/** Monthly amount already committed to future installments. */
export function monthlyInstallmentLoad(transactions: Transaction[]): number {
  const today = todayISO();
  const nextMonth = addMonthsISO(today, 1);
  return transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.installment_total &&
        tx.installment_total > 1 &&
        tx.date > today &&
        tx.date <= nextMonth,
    )
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function futureInstallmentTotal(transactions: Transaction[]): number {
  const today = todayISO();
  return transactions
    .filter((tx) => tx.type === "expense" && tx.date > today && !!tx.installment_total)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function cardInvoice(card: CreditCard, transactions: Transaction[], monthOffset = 0): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
  const period: Period = { from: toISODate(start), to: toISODate(end), label: "" };
  return transactions
    .filter((tx) => tx.credit_card_id === card.id && inPeriod(tx, period))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function cardUsedLimit(card: CreditCard, transactions: Transaction[]): number {
  const today = todayISO();
  return transactions
    .filter((tx) => tx.credit_card_id === card.id && tx.date >= today.slice(0, 8) + "01")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function billStatus(bill: Bill): "pending" | "paid" | "late" {
  if (bill.status === "paid") return "paid";
  return bill.due_date < todayISO() ? "late" : "pending";
}

export function goalMonthlyTarget(goal: Goal): number | null {
  if (!goal.deadline) return null;
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));
  const now = new Date();
  const deadline = parseISODate(goal.deadline);
  const months =
    (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
  if (months <= 0) return remaining;
  return remaining / months;
}

export interface Insight {
  title: string;
  description: string;
  tone: "positive" | "neutral" | "warning";
}

export function buildInsights(args: {
  transactions: Transaction[];
  categories: Category[];
  bills: Bill[];
  period: Period;
  monthlyIncome: number;
}): { diagnosis: string[]; opportunities: Insight[]; actions: Insight[] } {
  const { transactions, categories, bills, period, monthlyIncome } = args;
  const current = totalsFor(transactions, period);
  const prevPeriod = previousPeriod(period);
  const previous = totalsFor(transactions, prevPeriod);
  const slices = expensesByCategory(transactions, categories, period);
  const prevSlices = expensesByCategory(transactions, categories, prevPeriod);

  const diagnosis: string[] = [];
  if (current.income > 0) diagnosis.push(`Você recebeu ${brl(current.income)} no período.`);
  if (current.expense > 0) diagnosis.push(`Suas despesas foram ${brl(current.expense)}.`);
  if (current.income > 0 || current.expense > 0) {
    diagnosis.push(
      current.balance >= 0
        ? `Você terminou o período com ${brl(current.balance)} de saldo positivo.`
        : `Você terminou o período com ${brl(Math.abs(current.balance))} a mais em despesas do que em receitas.`,
    );
  }
  if (monthlyIncome > 0 && current.income === 0) {
    diagnosis.push(`Sua renda informada no perfil é de ${brl(monthlyIncome)} por mês.`);
  }

  const opportunities: Insight[] = [];
  for (const slice of slices.slice(0, 3)) {
    const prev = prevSlices.find((s) => s.id === slice.id);
    if (prev && prev.value > 0) {
      const diff = ((slice.value - prev.value) / prev.value) * 100;
      if (diff >= 10) {
        opportunities.push({
          title: `Gastos com ${slice.name} aumentaram ${Math.round(diff)}%`,
          description: `Foram ${brl(slice.value)} contra ${brl(prev.value)} no período anterior.`,
          tone: "warning",
        });
        continue;
      }
      if (diff <= -10) {
        opportunities.push({
          title: `Você reduziu ${Math.round(Math.abs(diff))}% em ${slice.name}`,
          description: `De ${brl(prev.value)} para ${brl(slice.value)}. Continue assim.`,
          tone: "positive",
        });
        continue;
      }
    }
    opportunities.push({
      title: `${slice.name} representa ${Math.round(slice.share)}% dos seus gastos`,
      description: `Foram ${brl(slice.value)} no período.`,
      tone: "neutral",
    });
  }

  const actions: Insight[] = [];
  const top = slices[0];
  if (top && top.value > 0) {
    const cut = Math.round(top.value * 0.1);
    if (cut > 0) {
      actions.push({
        title: `Reduza 10% em ${top.name}`,
        description: `Isso representa cerca de ${brl(cut)} por mês, ou ${brl(cut * 12)} em um ano.`,
        tone: "neutral",
      });
    }
  }
  const late = bills.filter((b) => billStatus(b) === "late");
  if (late.length > 0) {
    actions.push({
      title: `${late.length} conta${late.length > 1 ? "s" : ""} em atraso`,
      description: `Total de ${brl(late.reduce((s, b) => s + Number(b.amount), 0))}. Regularizar evita juros.`,
      tone: "warning",
    });
  }
  if (current.balance > 0) {
    actions.push({
      title: "Guarde parte do que sobrou",
      description: `Separando ${brl(current.balance * 0.3)} deste período você fortalece sua reserva.`,
      tone: "positive",
    });
  } else if (current.expense > current.income && current.expense > 0) {
    actions.push({
      title: "Reequilibre o mês",
      description: `Suas despesas superaram as receitas em ${brl(current.expense - current.income)}. Reveja os gastos variáveis.`,
      tone: "warning",
    });
  }
  const installments = monthlyInstallmentLoad(transactions);
  if (installments > 0) {
    actions.push({
      title: "Parcelas comprometem os próximos meses",
      description: `Você já tem ${brl(installments)} em parcelas no próximo mês.`,
      tone: "neutral",
    });
  }

  return { diagnosis, opportunities, actions: actions.slice(0, 3) };
}

function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface PurchaseAdvice {
  level: HealthLevel;
  title: string;
  reasons: string[];
  monthlyImpact: number;
  newCommitment: number;
}

export function analyzePurchase(args: {
  price: number;
  installments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingInstallments: number;
  upcomingBills: number;
  balance: number;
}): PurchaseAdvice {
  const { price, installments, monthlyIncome, monthlyExpenses, existingInstallments, upcomingBills, balance } =
    args;
  const monthlyImpact = price / Math.max(1, installments);
  const reasons: string[] = [];
  reasons.push(`Essa compra adicionaria ${brl(monthlyImpact)} por mês ao seu orçamento.`);
  if (existingInstallments > 0) {
    reasons.push(`Você já possui ${brl(existingInstallments)} em compromissos parcelados futuros.`);
  }
  if (upcomingBills > 0) {
    reasons.push(`Há ${brl(upcomingBills)} em contas a vencer nos próximos 30 dias.`);
  }
  reasons.push(`Seu saldo disponível hoje é de ${brl(balance)}.`);

  if (monthlyIncome <= 0) {
    return {
      level: "attention",
      title: "Precisamos de mais dados",
      reasons: [
        "Informe sua renda mensal nas configurações ou registre suas receitas para uma análise completa.",
        ...reasons,
      ],
      monthlyImpact,
      newCommitment: 0,
    };
  }

  const committed = monthlyExpenses + monthlyImpact;
  const newCommitment = Math.round((committed / monthlyIncome) * 100);
  reasons.push(
    `Com essa compra, seu comprometimento mensal ficaria em cerca de ${newCommitment}% da sua renda.`,
  );

  if (newCommitment <= 70 && balance >= monthlyImpact) {
    return {
      level: "healthy",
      title: "Compra confortável",
      reasons: [...reasons, "Considerando seus dados atuais, essa compra cabe no seu orçamento."],
      monthlyImpact,
      newCommitment,
    };
  }
  if (newCommitment <= 90) {
    return {
      level: "attention",
      title: "Compra exige atenção",
      reasons: [...reasons, "Considerando seus compromissos atuais, essa compra merece cautela."],
      monthlyImpact,
      newCommitment,
    };
  }
  return {
    level: "critical",
    title: "Compra não recomendada agora",
    reasons: [
      ...reasons,
      "Nesse cenário, seus compromissos ficariam muito próximos ou acima da sua renda.",
    ],
    monthlyImpact,
    newCommitment,
  };
}