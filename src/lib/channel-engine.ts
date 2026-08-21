import type { Account, Bill, Category, CreditCard } from "@/types/finance";
import { todayISO } from "@/lib/format";
import { normalize, parseQuickEntry, type QuickParseResult } from "@/lib/quick-parse";
import type { SaveTransactionInput } from "@/lib/transactions";

/** Canais de interação que podem consumir o mesmo motor financeiro. */
export type FinanceChannel = "app" | "voice" | "whatsapp" | "api";

/** Intenções de alto nível; novas intenções entram aqui, não num adaptador de canal. */
export type FinanceChannelIntent =
  | "record_transaction"
  | "query_fin"
  | "create_recurring_bill"
  | "mark_bill_paid"
  | "list_upcoming_bills"
  | "list_subscriptions"
  | "check_purchase"
  | "list_cards"
  | "list_installments"
  | "unknown";

export interface FinanceChannelContext {
  categories: Category[];
  accounts: Account[];
  cards: CreditCard[];
  bills?: Bill[];
}

export interface FinanceChannelInput extends FinanceChannelContext {
  channel: FinanceChannel;
  text: string;
}

export interface FinanceChannelInterpretation {
  channel: FinanceChannel;
  intent: FinanceChannelIntent;
  text: string;
  /** O draft existe também em mensagens ambíguas para permitir confirmação pelo canal. */
  draft: QuickParseResult;
  matchedBillId?: string | null;
}

export interface BuildTransactionOptions {
  fallbackAccountId?: string | null;
  date?: string;
  notes?: string | null;
}

const ACTION_RE =
  /\b(gastei|paguei|comprei|torrei|recebi|ganhei|entrou|caiu|vendi|registra|registrar|registre|anota|anotar|lan[cç]a|lan[cç]ar)\b/i;
const QUESTION_RE =
  /(\?|\b(posso|quanto|qual|quais|como|onde|por que|porque|devo|vale a pena|consigo)\b)/i;
const UPCOMING_RE =
  /\b(contas?|compromissos?|pagamentos?|vence|vencem|pagar)\b.*\b(hoje|amanha|amanhã|semana|dias|mes|m[eê]s|pr[oó]xim)/i;
const SUBSCRIPTIONS_RE = /\b(assinaturas?|streaming|mensalidades?|recorrentes?)\b/i;
const PURCHASE_RE = /\b(posso|devo|consigo|cabe|gastar|comprar|compra)\b/i;
const CARDS_RE = /\b(cart[oõ]es?|cart[aã]o|fatura|limite)\b/i;
const INSTALLMENTS_RE = /\b(parcelas?|parcelado|parcelamento)\b/i;
const PAID_RE = /\b(paguei|pago|quit(ei|ado)|liquid(ei|ado))\b/i;

function findPaidBill(text: string, amount: number, bills: Bill[] = []): Bill | null {
  if (!PAID_RE.test(text) || amount <= 0) return null;
  const normalized = normalize(text);
  const exact = bills.filter(
    (bill) => bill.status !== "paid" && Math.abs(Number(bill.amount) - amount) < 0.01,
  );
  if (exact.length === 1) return exact[0] ?? null;
  return (
    exact.find((bill) =>
      normalize(bill.description)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .some((word) => normalized.includes(word)),
    ) ?? null
  );
}

function detectQueryIntent(
  text: string,
): Exclude<FinanceChannelIntent, "record_transaction" | "create_recurring_bill" | "unknown"> {
  const normalized = normalize(text);
  if (PURCHASE_RE.test(normalized) && /\b(posso|devo|consigo|cabe)\b/.test(normalized))
    return "check_purchase";
  if (SUBSCRIPTIONS_RE.test(normalized)) return "list_subscriptions";
  if (INSTALLMENTS_RE.test(normalized)) return "list_installments";
  if (CARDS_RE.test(normalized)) return "list_cards";
  if (
    UPCOMING_RE.test(normalized) ||
    /\b(o que vence|quanto tenho de contas|quanto vou pagar)\b/.test(normalized)
  ) {
    return "list_upcoming_bills";
  }
  return "query_fin";
}

/**
 * Converte texto de qualquer canal numa interpretação única.
 * Transportes como WhatsApp devem apenas preencher FinanceChannelInput.
 */
export function interpretFinanceMessage(input: FinanceChannelInput): FinanceChannelInterpretation {
  const text = input.text.trim();
  const draft = parseQuickEntry(text, input.categories, input.cards, input.accounts);
  const isQuestion = QUESTION_RE.test(text);
  const paidBill = findPaidBill(text, draft.amount, input.bills);
  const isAction = (ACTION_RE.test(text) || draft.amount > 0) && !isQuestion;
  const isRecurring =
    draft.type === "expense" && draft.amount > 0 && draft.recurrence !== "none" && !isQuestion;

  return {
    channel: input.channel,
    intent: paidBill
      ? "mark_bill_paid"
      : isRecurring
        ? "create_recurring_bill"
        : isAction
          ? "record_transaction"
          : isQuestion
            ? detectQueryIntent(text)
            : "query_fin",
    text,
    draft,
    matchedBillId: paidBill?.id ?? null,
  };
}

/**
 * Normaliza o resultado do parser para o contrato de persistência.
 * A autenticação e o userId continuam a ser responsabilidade do adaptador confiável.
 */
export function buildTransactionInput(
  interpretation: FinanceChannelInterpretation,
  options: BuildTransactionOptions = {},
): Omit<SaveTransactionInput, "userId"> | null {
  if (interpretation.intent !== "record_transaction" || interpretation.draft.amount <= 0) {
    return null;
  }

  const { draft } = interpretation;
  const channelLabel = interpretation.channel === "whatsapp" ? "WhatsApp" : "Fin";

  return {
    description: draft.description || draft.raw,
    amount: draft.amount,
    type: draft.type,
    categoryId: draft.categoryId,
    accountId: draft.accountId ?? options.fallbackAccountId ?? null,
    cardId: draft.cardId,
    date: options.date ?? todayISO(),
    method: draft.cardId ? "credito" : "pix",
    notes: options.notes ?? `Registrado pelo ${channelLabel}`,
    recurrence: draft.recurrence,
    ...(draft.installments ? { installments: draft.installments } : {}),
  };
}

/** Contrato neutro para respostas que cada canal poderá renderizar de forma própria. */
export type FinanceChannelResponse =
  | { kind: "confirmation"; draft: QuickParseResult }
  | { kind: "transaction_recorded"; text: string }
  | { kind: "fin_answer"; text: string }
  | { kind: "clarification"; text: string }
  | { kind: "error"; text: string };
