import type { Category, CreditCard, TransactionType } from "@/types/finance";

export type Confidence = "high" | "medium" | "low";

export interface QuickParseResult {
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string | null;
  cardId: string | null;
  confidence: Confidence;
  raw: string;
}

export const EXPENSE_KEYWORDS = [
  "gastei", "gasto", "gastos", "paguei", "pagar", "pago", "comprei", "compra",
  "saiu", "torrei", "debitou", "despesa",
];

export const INCOME_KEYWORDS = [
  "recebi", "receber", "ganhei", "entrou", "caiu", "salario", "salário",
  "renda", "receita", "pix recebido", "vendi",
];

/** Simple synonym dictionary: term -> default FINANZZI category names. */
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  mercado: ["alimentação", "alimentacao", "supermercado"],
  supermercado: ["alimentação", "alimentacao"],
  feira: ["alimentação", "alimentacao"],
  padaria: ["alimentação", "alimentacao"],
  restaurante: ["alimentação", "alimentacao"],
  lanche: ["alimentação", "alimentacao"],
  ifood: ["alimentação", "alimentacao"],
  almoco: ["alimentação", "alimentacao"],
  janta: ["alimentação", "alimentacao"],
  uber: ["transporte"],
  onibus: ["transporte"],
  metro: ["transporte"],
  gasolina: ["transporte"],
  combustivel: ["transporte"],
  estacionamento: ["transporte"],
  passagem: ["transporte"],
  taxi: ["transporte"],
  luz: ["moradia", "casa", "contas"],
  energia: ["moradia", "casa", "contas"],
  agua: ["moradia", "casa", "contas"],
  aluguel: ["moradia", "casa"],
  condominio: ["moradia", "casa"],
  internet: ["moradia", "casa", "contas"],
  gas: ["moradia", "casa"],
  farmacia: ["saúde", "saude"],
  remedio: ["saúde", "saude"],
  medico: ["saúde", "saude"],
  dentista: ["saúde", "saude"],
  academia: ["saúde", "saude"],
  escola: ["educação", "educacao"],
  faculdade: ["educação", "educacao"],
  curso: ["educação", "educacao"],
  livro: ["educação", "educacao"],
  cinema: ["lazer"],
  netflix: ["lazer"],
  spotify: ["lazer"],
  viagem: ["lazer"],
  bar: ["lazer"],
  roupa: ["compras", "vestuário", "vestuario"],
  tenis: ["compras", "vestuário", "vestuario"],
  celular: ["compras"],
  presente: ["compras"],
  salario: ["salário", "salario", "renda"],
  freela: ["renda extra", "salário", "salario"],
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractAmount(text: string): number | null {
  const match = normalize(text).match(/(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  const raw = match[1];
  let normalized = raw;
  if (raw.includes(",")) normalized = raw.replace(/\./g, "").replace(",", ".");
  else if (/\.\d{3}$/.test(raw)) normalized = raw.replace(/\./g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function detectType(words: string[]): TransactionType | null {
  for (const w of words) {
    if (INCOME_KEYWORDS.includes(w)) return "income";
    if (EXPENSE_KEYWORDS.includes(w)) return "expense";
  }
  return null;
}

function matchCategory(words: string[], categories: Category[], type: TransactionType): string | null {
  const pool = categories.filter((c) => c.kind === type || c.kind === "both");
  // Direct match against user's own category names.
  for (const word of words) {
    if (word.length < 3) continue;
    const direct = pool.find((c) => {
      const name = normalize(c.name);
      return name === word || name.includes(word) || word.includes(name);
    });
    if (direct) return direct.id;
  }
  // Synonym dictionary.
  for (const word of words) {
    const targets = CATEGORY_SYNONYMS[word];
    if (!targets) continue;
    const found = pool.find((c) => targets.includes(normalize(c.name)));
    if (found) return found.id;
  }
  return null;
}

function matchCard(text: string, words: string[], cards: CreditCard[]): string | null {
  for (const card of cards) {
    const name = normalize(card.name);
    const bank = card.bank ? normalize(card.bank) : "";
    if (name && text.includes(name)) return card.id;
    if (bank && text.includes(bank)) return card.id;
    if (words.some((w) => w.length > 3 && (name.includes(w) || (bank && bank.includes(w))))) return card.id;
  }
  return null;
}

const STOP_WORDS = new Set([
  ...EXPENSE_KEYWORDS,
  ...INCOME_KEYWORDS,
  "de", "do", "da", "no", "na", "em", "com", "para", "pra", "o", "a", "os", "as",
  "um", "uma", "reais", "real", "r$", "meu", "minha", "hoje", "ontem", "cartao", "cartão",
]);

function buildDescription(raw: string): string {
  const words = raw
    .split(/\s+/)
    .filter((w) => {
      const n = normalize(w).replace(/[^\wçã]/g, "");
      if (!n) return false;
      if (/^\d/.test(n)) return false;
      return !STOP_WORDS.has(n);
    })
    .slice(0, 5);
  const text = words.join(" ").trim();
  if (!text) return raw.trim().slice(0, 60);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseQuickEntry(
  raw: string,
  categories: Category[],
  cards: CreditCard[],
): QuickParseResult {
  const text = normalize(raw);
  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  const amount = extractAmount(raw);
  const detected = detectType(words);
  const type: TransactionType = detected ?? "expense";
  const categoryId = amount ? matchCategory(words, categories, type) : null;
  const cardId = matchCard(text, words, cards);

  let confidence: Confidence;
  if (!amount || raw.trim().length < 4) confidence = "low";
  else if (detected && categoryId) confidence = "high";
  else if (detected) confidence = "medium";
  else confidence = "medium";

  return {
    type,
    amount: amount ?? 0,
    description: buildDescription(raw),
    categoryId,
    cardId,
    confidence,
    raw: raw.trim(),
  };
}
