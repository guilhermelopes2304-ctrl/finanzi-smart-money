import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bot, ChevronLeft, ChevronRight, CircleHelp, Loader2, Send, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts, useBills, useCategories, useCreditCards, useGoals, useInvalidateFinance } from "@/hooks/useFinanceData";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { buildPeriod, expensesByCategory, spendCapacity, totalsFor } from "@/lib/finance";
import { buildTransactionInput, interpretFinanceMessage } from "@/lib/channel-engine";
import { saveTransaction } from "@/lib/transactions";
import type { Profile, Transaction } from "@/types/finance";

type HomeChatProps = { profile?: Profile | null; transactions: Transaction[] };
type Message = { id: string; role: "user" | "fin"; text: string };

const shortcuts = [
  { label: "Quanto gastei este mês?", icon: TrendingUp },
  { label: "Quanto tenho disponível?", icon: WalletCards },
  { label: "Onde estou gastando mais?", icon: Sparkles },
  { label: "Preciso de ajuda", icon: CircleHelp },
];

export function HomeChat({ profile, transactions }: HomeChatProps) {
  const { user } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCreditCards();
  const { data: goals = [] } = useGoals();
  const invalidate = useInvalidateFinance();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const firstName = profile?.name?.split(" ")[0] || "você";
  const recent = useMemo(() => [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-4), [transactions]);

  function push(role: Message["role"], text: string) {
    setMessages((current) => [...current, { id: crypto.randomUUID(), role, text }]);
  }

  async function handleSend(value?: string) {
    const text = (value ?? input).trim();
    if (!text || busy) return;
    setInput("");
    push("user", text);
    const interpretation = interpretFinanceMessage({ channel: "app", text, categories, accounts, cards, bills });
    const draft = interpretation.draft;

    if (interpretation.intent === "record_transaction" && user && draft.amount > 0 && draft.confidence !== "low") {
      const transaction = buildTransactionInput(interpretation, { fallbackAccountId: accounts[0]?.id ?? null, notes: "Registrado pela Home" });
      if (!transaction) {
        push("fin", "Consegui entender o valor, mas preciso de mais detalhes para registrar.");
        return;
      }
      setBusy(true);
      try {
        await saveTransaction({ userId: user.id, ...transaction });
        invalidate();
        const kind = draft.type === "income" ? "entrada" : "despesa";
        const category = categories.find((item) => item.id === draft.categoryId)?.name;
        push("fin", `✓ ${kind === "entrada" ? "Entrada registrada" : "Despesa registrada"}\n\n${formatBRL(draft.amount)}${category ? ` • ${category}` : ""}${draft.description ? `\n${draft.description}` : ""}`);
      } catch {
        push("fin", "Não consegui salvar esse lançamento agora. Tente novamente em alguns segundos.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (interpretation.intent === "query_fin") {
      const normalized = interpretation.text.toLowerCase();
      const period = buildPeriod("current", monthRange());
      if (/quanto.*gastei|gasto.*mês|gasto.*mes|resumo/.test(normalized)) {
        const totals = totalsFor(transactions, period);
        push("fin", `Neste mês você gastou ${formatBRL(totals.expense)}.\nEntradas: ${formatBRL(totals.income)}\nResultado: ${formatBRL(totals.balance)}`);
        return;
      }
      if (/onde|gastando mais|maior gasto/.test(normalized)) {
        const top = expensesByCategory(transactions, categories, period)[0];
        push("fin", top ? `Sua maior categoria neste mês é ${top.name}: ${formatBRL(top.value)}.` : "Ainda não tenho despesas suficientes para encontrar um padrão.");
        return;
      }
    }

    if (/quanto.*dispon|saldo|tenho.*disponível|tenho.*disponivel/.test(text.toLowerCase())) {
      const capacity = spendCapacity({ accounts, transactions, bills, goals });
      push("fin", `Sua margem disponível estimada é ${formatBRL(capacity.perDay)} por dia.`);
      return;
    }

    push("fin", "Entendi. Para registrar, tente algo como “gastei 45 no almoço” ou “recebi 2.000 de salário”.");
  }

  return (
    <section className="relative min-h-[calc(100dvh-7rem)] overflow-hidden rounded-[30px] border border-white/[0.07] bg-background shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.13),transparent_42%)]" />
      <div className="relative flex min-h-[calc(100dvh-7rem)] flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pt-8">
        <header className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-4" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">FINANZZI</p><p className="truncate text-xs text-muted-foreground">Seu dinheiro, em conversa.</p></div></div>
          <button type="button" onClick={() => setShowShortcuts((v) => !v)} aria-label={showShortcuts ? "Ocultar atalhos" : "Mostrar atalhos"} aria-expanded={showShortcuts} className="grid size-10 place-items-center rounded-full border border-white/[0.08] bg-card/70 text-muted-foreground backdrop-blur-xl transition hover:border-primary/30 hover:text-foreground active:scale-95">{showShortcuts ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-8 sm:py-12">
          <div className="mb-7 text-center sm:mb-9"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Olá, {firstName}</p><h1 className="mt-3 text-[2rem] font-semibold leading-[1.04] tracking-[-0.06em] sm:text-4xl">O que aconteceu com seu dinheiro?</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">Escreva como você fala. Eu registro e organizo para você.</p></div>

          <div className="space-y-3" aria-live="polite">
            {messages.map((message) => <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[86%] rounded-[22px] rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground whitespace-pre-line" : "mr-auto max-w-[88%] rounded-[22px] border border-white/[0.07] bg-card/60 px-4 py-3 text-sm whitespace-pre-line shadow-sm"}><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-60">{message.role === "user" ? "Você" : "FINANZZI"}</p>{message.text}</div>)}
            {messages.length === 0 && recent.length > 0 && <div className="space-y-2"><p className="px-1 text-[11px] font-medium text-muted-foreground">Últimos movimentos</p>{recent.map((tx) => { const income = tx.type === "income"; return <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-card/35 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm">{tx.description || "Lançamento"}</p><p className="text-[11px] text-muted-foreground">{formatDateBR(tx.date)}</p></div><span className="ml-3 flex shrink-0 items-center gap-1 text-sm font-bold">{income ? <ArrowUpRight className="size-3.5 text-primary" /> : <ArrowDownRight className="size-3.5 text-muted-foreground" />}{income ? "+" : "-"}{formatBRL(Number(tx.amount))}</span></div>; })}</div>}
          </div>
        </main>

        <div className="mx-auto w-full max-w-3xl"><div className="mb-2 flex items-center gap-2 px-1 text-xs text-muted-foreground"><Bot className="size-3.5 text-primary" /><span>{busy ? "Organizando seu lançamento..." : "Digite uma entrada ou saída"}</span></div><div className="flex items-end gap-2 rounded-[26px] border border-white/[0.09] bg-card/90 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} placeholder="Ex.: gastei 45 no almoço" rows={1} disabled={busy} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground" aria-label="Mensagem financeira"/><button type="button" onClick={() => void handleSend()} disabled={!input.trim() || busy} className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40" aria-label="Enviar">{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</button></div></div>
      </div>

      <aside className={`absolute right-0 top-1/2 z-20 w-[min(84vw,290px)] -translate-y-1/2 rounded-l-[24px] border border-r-0 border-white/[0.08] bg-card/95 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 ${showShortcuts ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"}`} aria-hidden={!showShortcuts}>
        <div className="px-2 pb-2 pt-1"><p className="text-xs font-semibold">Atalhos</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Perguntas rápidas para explorar seu dinheiro.</p></div>
        <div className="space-y-1">{shortcuts.map(({ label, icon: Icon }) => <button key={label} type="button" disabled={busy} onClick={() => { setShowShortcuts(false); void handleSend(label); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs text-muted-foreground transition hover:bg-primary/[0.08] hover:text-foreground active:scale-[0.99] disabled:opacity-50"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-primary"><Icon className="size-4" /></span><span>{label}</span></button>)}</div>
      </aside>
    </section>
  );
}
