export function formatBRL(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCompactBRL(value: number): string {
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}

/** Parses "1.234,56" or "1234.56" into a number. */
export function parseBRL(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "");
  const normalized =
    cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** "2026-03-08" -> "08/03/2026" (no timezone shifting). */
export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  const now = new Date();
  return toISODate(now);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addMonthsISO(iso: string, months: number): string {
  const base = parseISODate(iso);
  const day = base.getDate();
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toISODate(target);
}

export function addDaysISO(iso: string, days: number): string {
  const base = parseISODate(iso);
  base.setDate(base.getDate() + days);
  return toISODate(base);
}

export const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function monthLabel(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

export function monthRange(offset = 0): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: toISODate(start), to: toISODate(end) };
}

export function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}