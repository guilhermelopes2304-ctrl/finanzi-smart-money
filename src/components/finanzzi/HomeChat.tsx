import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bot, ChevronLeft, ChevronRight, CircleHelp, CreditCard, History, Loader2, Menu, Plus, Send, Settings, Sparkles, Target, WalletCards } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts, useBills, useCategories, useCreditCards, useGoals, useInvalidateFinance } from "@/hooks/useFinanceData";
import { formatBRL, formatDateBR, monthRange } from "@/lib/format";
import { buildPeriod, expensesByCategory, spendCapacity, totalsFor } from "@/lib/finance";
import { buildTransactionInput, interpretFinanceMessage } from "@/lib/channel-engine";
import { saveTransaction } from "@/lib/transactions";
import type { Profile, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";

type HomeChatProps = { profile?: Profile | null; transactions: Transaction[]; isLoading?: boolean };
type Message = { id: string; role: "user" | "fin"; text: string };

const suggestions = [
  "Gastei R$ 45 no almoço",
  "Recebi R$ 2.000 de salário",
  "Quanto gastei este mês?",
];

const nav = [
  { to: "/lancamentos", label: "Histórico", icon: History },
  { to: "/contas", label: "Contas", icon: WalletCards },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function HomeChat({ profile, transactions, isLoading = false }: HomeChatProps) {
  const { user } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCreditCards();
  const { data: goals = [] } = useGoals();
  const invalidate = useInvalidateFinance();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // The Home owns the viewport while it is mounted. This prevents iOS Safari/PWA
  // from scrolling the shell itself and exposing the page background above the app.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyHeight: body.style.height,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyTop: body.style.top,
    };
    const scrollY = window.scrollY;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.height = "100%";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.top = `-${scrollY}px`;
    window.scrollTo(0, 0);

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      html.style.height = previous.htmlHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.style.height = previous.bodyHeight;
      body.style.position = previous.bodyPosition;
      body.style.width = previous.bodyWidth;
      body.style.top = previous.bodyTop;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "você";
  const recent = useMemo(() => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4), [transactions]);

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
        push("fin", "Entendi o valor, mas preciso de mais detalhes para registrar.");
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

    push("fin", "Posso registrar entradas e saídas ou responder sobre seus gastos. Tente: “gastei 45 no almoço”.");
  }

  return (
    <section className="fixed inset-0 z-40 flex h-[100dvh] min-h-0 w-full touch-none overflow-hidden overscroll-none bg-background text-foreground lg:static lg:z-auto lg:h-[calc(100dvh-5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,hsl(var(--primary)/0.10),transparent_34%)]" />
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))] sm:px-8 lg:pt-6">
        <header className="flex h-11 shrink-0 items-center justify-between">
          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu" className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground active:scale-95"><Menu className="size-5" /></button>
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="FINANZZI"><span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-4" /></span><span className="text-sm font-bold tracking-[-0.02em]">FINANZZI</span></Link>
          <Link to="/dashboard" aria-label="Nova conversa" className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground active:scale-95"><Plus className="size-5" /></Link>
        </header>

        <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden py-4 sm:py-7">
          <div className={cn("shrink-0 text-center transition-all duration-300", messages.length ? "mb-5" : "mb-4") }>
            {messages.length === 0 ? <>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary">OLÁ, {firstName.toUpperCase()}</p>
              <h1 className="mt-4 text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.065em] sm:text-5xl">O que aconteceu<br className="sm:hidden" /> com seu dinheiro?</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">Fale do seu jeito. Eu registro, organizo e te ajudo.</p>
            </> : <p className="text-xs font-medium text-muted-foreground">Conversa com o FINANZZI</p>}
          </div>

          {messages.length === 0 && !isLoading && recent.length > 0 && (
            <div className="mx-auto mb-4 flex shrink-0 max-w-xl flex-wrap justify-center gap-2">
              {suggestions.map((item) => <button key={item} type="button" disabled={busy} onClick={() => void handleSend(item)} className="rounded-full border border-white/[0.09] bg-card/50 px-3.5 py-2 text-xs text-muted-foreground backdrop-blur-sm transition hover:border-primary/30 hover:bg-primary/[0.06] hover:text-foreground active:scale-[0.98]">{item}</button>)}
            </div>
          )}

          <div className={cn("min-h-0 flex-1 overscroll-contain px-1 touch-pan-y", messages.length ? "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "overflow-hidden")} aria-live="polite">
            <div className="space-y-3 pb-3">
              {messages.map((message) => <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[88%] rounded-[22px] rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground whitespace-pre-line" : "mr-auto max-w-[92%] rounded-[22px] border border-white/[0.07] bg-card/65 px-4 py-3 text-sm whitespace-pre-line shadow-sm"}><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-60">{message.role === "user" ? "Você" : "FINANZZI"}</p>{message.text}</div>)}
            </div>
          </div>
        </main>

        <div className="mx-auto w-full max-w-3xl shrink-0">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><Bot className="size-3.5 text-primary" /> {busy ? "Organizando..." : "Registre como você fala"}</span>{messages.length > 0 && <button type="button" onClick={() => setMessages([])} className="text-muted-foreground hover:text-foreground">Nova conversa</button>}</div>
          <div className="flex items-end gap-2 rounded-[27px] border border-white/[0.10] bg-card/90 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl focus-within:border-primary/30">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} placeholder="Digite o que aconteceu..." rows={1} disabled={busy} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground" aria-label="Mensagem financeira" />
            <button type="button" onClick={() => void handleSend()} disabled={!input.trim() || busy} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-95 disabled:opacity-35" aria-label="Enviar">{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/60">O FINANZZI pode organizar seus lançamentos a partir do que você escrever.</p>
        </div>
      </div>

      {sidebarOpen && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-[70] flex w-[min(86vw,320px)] flex-col border-r border-white/[0.08] bg-card/95 p-4 shadow-[20px_0_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-2 py-1"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">FINANZZI</p><p className="mt-1 text-[11px] text-muted-foreground">Tudo do seu dinheiro, sem poluição.</p></div><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" className="grid size-10 place-items-center rounded-full hover:bg-background"><ChevronLeft className="size-5" /></button></div>
        <button type="button" onClick={() => { setMessages([]); setInput(""); setSidebarOpen(false); }} className="mt-7 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-background px-4 py-3 text-left text-sm font-semibold transition hover:border-primary/30"><span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Plus className="size-4" /></span>Nova conversa</button>
        <nav className="mt-6 space-y-1">{nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm text-muted-foreground transition hover:bg-background hover:text-foreground"><span className="grid size-9 place-items-center rounded-xl bg-background text-primary"><Icon className="size-4" /></span>{label}<ChevronRight className="ml-auto size-4 opacity-40" /></Link>)}</nav>
        <div className="mt-auto rounded-2xl border border-primary/10 bg-primary/[0.05] p-4"><p className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-3.5 text-primary" /> Atalhos inteligentes</p><div className="mt-3 space-y-1.5">{suggestions.map((item) => <button key={item} type="button" disabled={busy} onClick={() => { setSidebarOpen(false); void handleSend(item); }} className="w-full rounded-xl px-2 py-2 text-left text-[11px] text-muted-foreground hover:bg-primary/[0.08] hover:text-foreground">{item}</button>)}</div></div>
      </aside>
    </section>
  );
}
