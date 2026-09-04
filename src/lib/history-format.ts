import type { Category, TransactionType } from "@/types/finance";

const CATEGORY_RULES: Record<string, string[]> = {
  transporte: ["uber", "99", "taxi", "onibus", "ônibus", "metro", "metrô", "gasolina", "combustivel", "combustível", "estacionamento", "passagem"],
  alimentação: ["lanche", "almoco", "almoço", "janta", "jantar", "churrasco", "pizza", "restaurante", "ifood", "delivery", "padaria", "feira", "comida"],
  mercado: ["mercado", "supermercado", "atacadao", "atacadão", "hortifruti"],
  moradia: ["aluguel", "condominio", "condomínio", "luz", "energia", "agua", "água", "gas", "gás", "internet"],
  saúde: ["farmacia", "farmácia", "remedio", "remédio", "medico", "médico", "dentista", "academia"],
  educação: ["escola", "faculdade", "curso", "livro", "material escolar"],
  lazer: ["cinema", "netflix", "spotify", "viagem", "bar", "show"],
  compras: ["roupa", "tenis", "tênis", "celular", "presente", "shopping"],
  salário: ["salario", "salário", "pagamento", "ordenado", "holerite"],
  "renda extra": ["freela", "freelance", "extra", "venda", "vendi"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeTransactionDescription(description: string, type: TransactionType): string {
  const raw = description.trim();
  if (!raw) return type === "income" ? "Entrada" : "Despesa";

  let clean = raw
    .replace(/^\s*(?:r\$\s*)?[\d.,]+\s*/i, "")
    .replace(/^(?:gastei|gasto|paguei|pagar|comprei|compra|despesa|recebi|receber|ganhei|entrou|salario|salário)\s+/i, "")
    .replace(/\.{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return type === "income" ? "Entrada" : "Despesa";

  const normalized = normalize(clean);
  for (const [category, terms] of Object.entries(CATEGORY_RULES)) {
    if (terms.some((term) => normalized.includes(normalize(term)))) {
      const matched = terms.find((term) => normalized.includes(normalize(term)));
      if (matched) {
        const label = matched.replace(/\b\w/g, (char) => char.toUpperCase());
        if (normalized === normalize(matched) || normalized.startsWith(normalize(matched) + " ")) return label;
      }
    }
  }

  if (/^(?:pix|transferencia|transferência)\b/i.test(clean)) {
    const person = clean.replace(/^(?:pix|transferencia|transferência)\s*/i, "").trim();
    return person ? `Transferência ${person}` : "Transferência";
  }

  return clean
    .replace(/^[-–—:]+/, "")
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function inferHistoryCategory(
  description: string,
  type: TransactionType,
  categories: Category[],
): Category | null {
  const normalized = normalize(description);
  if (!normalized) return null;

  const allowed = categories.filter((category) => category.kind === type || category.kind === "both");
  for (const category of allowed) {
    const name = normalize(category.name);
    if (name && (normalized.includes(name) || name.includes(normalized))) return category;
  }

  for (const [target, terms] of Object.entries(CATEGORY_RULES)) {
    if (terms.some((term) => normalized.includes(normalize(term)))) {
      const found = allowed.find((category) => {
        const name = normalize(category.name);
        return name === normalize(target) || (target === "mercado" && /mercado|supermercado/.test(name));
      });
      if (found) return found;
    }
  }
  return null;
}

export function historyCategoryLabel(
  description: string,
  type: TransactionType,
  categories: Category[],
  categoryId: string | null | undefined,
): string {
  const stored = categoryId ? categories.find((category) => category.id === categoryId) : null;
  return stored?.name ?? inferHistoryCategory(description, type, categories)?.name ?? "Geral";
}
