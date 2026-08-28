/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import {
  useAccounts,
  useBills,
  useCategories,
  useCreditCards,
  useGoals,
  useInvalidateFinance,
  useProfile,
  useSaveRow,
  useTransactions,
} from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL, formatDateBR, monthRange, todayISO } from "@/lib/format";
import {
  buildPeriod,
  cardInvoice,
  expensesByCategory,
  futureInstallmentTotal,
  goalMonthlyTarget,
  spendCapacity,
  totalsFor,
} from "@/lib/finance";
import { nextCommitments, subscriptionTotals } from "@/lib/commitments";
import {
  buildTransactionInput,
  interpretFinanceMessage,
  type FinanceChannelInterpretation,
} from "@/lib/channel-engine";
import { saveRecurringBill } from "@/lib/bills";
import { saveTransaction } from "@/lib/transactions";
import { askFinAI } from "@/lib/fin-ai";
import { cn } from "@/lib/utils";
import { trackProductEvent } from "@/lib/product-analytics";

type Message = { from: "fin" | "user"; text: string };
type RecognitionResult = {
  isFinal?: boolean;
  [index: number]: { transcript?: string } | undefined;
};
type RecognitionEvent = { resultIndex?: number; results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error?: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event?: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  }
}

/** Palavras que indicam claramente a intenção de registrar um lançamento. */
export function FinancialAssistant({ className }: { className?: string }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: accounts = [] } = useAccounts();
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCreditCards();
  const { data: goals = [] } = useGoals();
  const { data: transactions = [] } = useTransactions();
  const invalidate = useInvalidateFinance();
  const saveBill = useSaveRow<Record<string, unknown>>("bills", {
    successMessage: "Compromisso atualizado",
  });

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<FinanceChannelInterpretation | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);

  const categoryName = useMemo(
    () => (id: string | null) => categories.find((c) => c.id === id)?.name ?? null,
    [categories],
  );
  const capacity = useMemo(
    () => spendCapacity({ accounts, transactions, bills, goals }),
    [accounts, transactions, bills, goals],
  );

  function push(message: Message) {
    setMessages((current) => [...current, message]);
  }

  async function commitRecurring(interpretation: FinanceChannelInterpretation) {
    if (!user || interpretation.intent !== "create_recurring_bill") return;
    const { draft } = interpretation;
    setBusy(true);
    try {
      await saveRecurringBill({
        userId: user.id,
        description: draft.description || draft.raw,
        amount: draft.amount,
        categoryId: draft.categoryId,
        accountId: draft.accountId ?? accounts[0]?.id ?? null,
        recurrence: draft.recurrence,
        dueDay: draft.dueDay,
        notes: "Criado pelo Fin",
      });
      invalidate();
      push({
        from: "fin",
        text: `Organizei ${draft.description || draft.raw} como um compromisso recorrente de ${formatBRL(draft.amount)}. Vou lembrar você do próximo vencimento.`,
      });
    } catch {
      push({
        from: "fin",
        text: "Entendi a conta recorrente, mas não consegui salvar agora. Tente novamente.",
      });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function commitBillPaid(interpretation: FinanceChannelInterpretation) {
    if (!user || interpretation.intent !== "mark_bill_paid" || !interpretation.matchedBillId)
      return;
    const bill = bills.find((item) => item.id === interpretation.matchedBillId);
    setBusy(true);
    try {
      await saveBill.mutateAsync({
        id: interpretation.matchedBillId,
        values: { status: "paid", paid_at: todayISO() },
      });
      invalidate();
      push({
        from: "fin",
        text: `${bill?.description ?? "Esse compromisso"} foi marcado como pago. Não criei uma despesa duplicada.`,
      });
    } catch {
      push({ from: "fin", text: "Encontrei o compromisso, mas não consegui atualizá-lo agora." });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function commit(interpretation: FinanceChannelInterpretation) {
    if (!user) return;
    const transaction = buildTransactionInput(interpretation, {
      fallbackAccountId: accounts[0]?.id ?? null,
      notes: "Registrado pelo Fin",
    });
    if (!transaction) return;
    const { draft } = interpretation;
    setBusy(true);
    try {
      await saveTransaction({ userId: user.id, ...transaction });
      invalidate();
      const label = draft.type === "income" ? "entrada" : "saída";
      const category = categoryName(draft.categoryId);
      push({
        from: "fin",
        text: `Registrei uma ${label} de ${formatBRL(draft.amount)}${category ? ` em ${category}` : draft.description ? ` em ${draft.description}` : ""}. Seu painel já foi atualizado.`,
      });
    } catch {
      push({
        from: "fin",
        text: "Entendi o lançamento, mas não consegui salvar agora. Tente novamente em alguns segundos.",
      });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function localAnswer(interpretation: FinanceChannelInterpretation): string | null {
    const { draft } = interpretation;
    if (interpretation.intent === "check_purchase") {
      if (!draft.amount) return "Me diga o valor da compra e eu comparo com o que está livre hoje.";
      const amount = draft.amount;
      const perDay = capacity.perDay;
      if (amount <= perDay) {
        return `Sim — ${formatBRL(amount)} cabe na sua margem de hoje. Depois dela, ainda ficam cerca de ${formatBRL(Math.max(0, perDay - amount))} para o dia.`;
      }
      return `Eu teria cuidado: ${formatBRL(amount)} passa da sua margem diária de ${formatBRL(perDay)}. Antes de decidir, veja se dá para adiar ou reduzir essa compra.`;
    }
    if (interpretation.intent === "list_upcoming_bills") {
      const upcoming = nextCommitments(bills, categories, 5);
      if (upcoming.length === 0) return "Não encontrei compromissos próximos em aberto.";
      const total = upcoming.reduce((sum, bill) => sum + Number(bill.amount), 0);
      const lines = upcoming.map(
        (bill) =>
          `${bill.description}: ${formatBRL(Number(bill.amount))} em ${formatDateBR(bill.due_date)}`,
      );
      return `Você tem ${formatBRL(total)} nos próximos compromissos.\n${lines.join("\n")}`;
    }
    if (interpretation.intent === "list_subscriptions") {
      const summary = subscriptionTotals(bills, categories);
      if (summary.subscriptions.length === 0)
        return "Ainda não encontrei assinaturas recorrentes cadastradas.";
      return `Suas assinaturas somam ${formatBRL(summary.monthly)} por mês e ${formatBRL(summary.yearly)} por ano. As maiores são: ${summary.subscriptions
        .slice(0, 3)
        .map((item) => `${item.description} (${formatBRL(Number(item.amount))})`)
        .join(", ")}.`;
    }
    if (interpretation.intent === "list_cards") {
      if (cards.length === 0) return "Você ainda não cadastrou um cartão.";
      const lines = cards
        .slice(0, 4)
        .map((card) => `${card.name}: fatura de ${formatBRL(cardInvoice(card, transactions))}`);
      return `Encontrei ${cards.length} cartão(ões).\n${lines.join("\n")}`;
    }
    if (interpretation.intent === "list_installments") {
      const total = futureInstallmentTotal(transactions);
      return total > 0
        ? `Você tem ${formatBRL(total)} em parcelas futuras já registradas.`
        : "Não encontrei parcelas futuras registradas.";
    }
    if (interpretation.intent === "query_fin") {
      const normalized = interpretation.text.toLowerCase();
      const period = buildPeriod("current", monthRange());
      if (/como está|resumo|meu mês|meu mes/.test(normalized)) {
        const totals = totalsFor(transactions, period);
        return `Neste mês entraram ${formatBRL(totals.income)} e saíram ${formatBRL(totals.expense)}. O resultado até agora é ${formatBRL(totals.balance)}.`;
      }
      if (/onde|gastando demais|maior gasto|gasto mais/.test(normalized)) {
        const top = expensesByCategory(transactions, categories, period)[0];
        return top
          ? `Sua maior categoria neste mês é ${top.name}, com ${formatBRL(top.value)} (${Math.round(top.share)}% das despesas).`
          : "Ainda não tenho despesas suficientes para encontrar um padrão.";
      }
      if (/objetivo|meta|chegar/.test(normalized)) {
        const goal = goals.find((item) => Number(item.current_amount) < Number(item.target_amount));
        if (!goal)
          return "Você ainda não tem um objetivo em andamento. Quando criar um, eu calculo o ritmo necessário.";
        const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));
        const monthly = goalMonthlyTarget(goal);
        return `${goal.name} está em ${formatBRL(Number(goal.current_amount))} de ${formatBRL(Number(goal.target_amount))}. Faltam ${formatBRL(remaining)}${monthly ? `, cerca de ${formatBRL(monthly)} por mês para chegar no prazo` : ""}.`;
      }
    }
    return null;
  }

  async function handle(text: string) {
    trackProductEvent("fin_used");
    push({ from: "user", text });
    setPending(null);

    const interpretation = interpretFinanceMessage({
      channel: "app",
      text,
      categories,
      accounts,
      cards,
      bills,
    });
    const { draft } = interpretation;
    if (interpretation.intent === "mark_bill_paid" && interpretation.matchedBillId) {
      await commitBillPaid(interpretation);
      return;
    }
    if (
      (interpretation.intent === "record_transaction" ||
        interpretation.intent === "create_recurring_bill") &&
      user
    ) {
      if (draft.amount > 0 && draft.confidence !== "low") {
        if (draft.confidence === "high") {
          await (interpretation.intent === "create_recurring_bill"
            ? commitRecurring(interpretation)
            : commit(interpretation));
          return;
        }
        const category = categoryName(draft.categoryId);
        setPending(interpretation);
        push({
          from: "fin",
          text: `Entendi uma ${draft.type === "income" ? "entrada" : "saída"} de ${formatBRL(draft.amount)}${category ? ` em ${category}` : ` em ${draft.description || "sem categoria"}`}. Confira os detalhes e confirme quando estiver pronto.`,
        });
        return;
      }
    }

    const local = localAnswer(interpretation);
    if (local) {
      push({ from: "fin", text: local });
      return;
    }

    setBusy(true);
    try {
      const answer = await askFinAI(text);
      push({ from: "fin", text: answer });
    } catch (error) {
      push({
        from: "fin",
        text: error instanceof Error ? error.message : "Não consegui responder agora.",
      });
    } finally {
      setBusy(false);
    }
  }

  function send(value?: string) {
    const text = (value ?? input).trim();
    if (!text || busy) return;
    setInput("");
    void handle(text);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function listen() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      push({
        from: "fin",
        text: "Seu navegador não oferece reconhecimento de voz. Use o Chrome ou o Edge e permita o microfone.",
      });
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: RecognitionEvent) => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex ?? 0; i < event.results.length; i += 1) {
        const transcript = event.results[i]?.[0]?.transcript ?? "";
        if (event.results[i]?.isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (finalText.trim()) {
        setInput("");
        stopListening();
        // Transcrição pronta: o Fin interpreta e decide entre pergunta e lançamento.
        send(finalText.trim());
      } else if (interim.trim()) {
        setInput(interim.trim());
      }
    };
    recognition.onerror = (event?: RecognitionErrorEvent) => {
      setListening(false);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        push({
          from: "fin",
          text: "Permita o acesso ao microfone nas configurações do navegador para falar comigo.",
        });
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  // `listen` intentionally stays bound to the browser event handler for the lifetime of this widget.
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ listen?: boolean }>).detail;
      setOpen(true);
      if (detail?.listen) window.setTimeout(listen, 200);
    };
    window.addEventListener("finanzzi:open-assistant", handler);
    return () => window.removeEventListener("finanzzi:open-assistant", handler);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          from: "fin",
          text: `Olá${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}. Eu sou o Fin. Posso analisar seu momento, explicar o que está acontecendo e registrar lançamentos — escreva ou fale comigo como falaria com alguém de confiança.`,
        },
      ]);
    }
  }, [open, messages.length, profile?.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  });

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-[430px] overflow-hidden rounded-[1.75rem] border border-[#B7B7B7]/20 bg-[#FFFFFF] text-white shadow-[0_24px_80px_rgba(0,0,0,.32)] sm:right-4",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[#B7B7B7]/10 bg-gradient-to-r from-[#FF5A1F]/10 to-transparent p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#FF5A1F]/10 text-[10px] font-black uppercase tracking-[0.14em] text-[#FF5A1F]">
            FIN
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm font-bold">
              <Sparkles className="size-3.5 text-[#FF5A1F]" /> Fin
            </div>
            <p className="text-xs text-[#181818]/50">Copiloto financeiro · online</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-2 text-[#181818]/50 hover:bg-[#B7B7B7]/10"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[55vh] space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.map((message) => (
          <div
            key={`${message.from}-${message.text}`}
            className={cn(
              "max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-5 shadow-sm",
              message.from === "user"
                ? "ml-auto bg-[#FF5A1F] font-medium text-[#FFFFFF]"
                : "bg-white/[0.07] text-[#181818]/85",
            )}
          >
            {message.text}
          </div>
        ))}
        {messages.length === 1 && !busy && !pending && (
          <div className="flex flex-wrap gap-2">
            {[
              "Posso gastar 200 hoje?",
              "O que vence essa semana?",
              "Quanto pago em assinaturas?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-full border border-[#B7B7B7]/15 bg-white/[0.05] px-3 py-2 text-left text-xs text-[#181818]/70 transition-colors hover:bg-[#FF5A1F]/15 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {busy && (
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.07] px-3 py-2 text-sm text-[#181818]/60">
            <Loader2 className="size-3.5 animate-spin" /> Pensando no seu dinheiro...
          </div>
        )}
        {pending && !busy && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void (pending.intent === "create_recurring_bill"
                  ? commitRecurring(pending)
                  : commit(pending))
              }
              className="min-h-10 flex-1 rounded-xl bg-[#FF5A1F] px-3 text-sm font-semibold text-[#FFFFFF]"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                push({ from: "fin", text: "Tudo bem, não registrei nada." });
              }}
              className="min-h-10 rounded-xl border border-[#B7B7B7]/15 px-3 text-sm text-[#181818]/70"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-[#B7B7B7]/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 rounded-2xl border border-[#B7B7B7]/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => (listening ? stopListening() : listen())}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              listening ? "bg-[#B7B7B7] text-[#111111]" : "bg-[#FF5A1F] text-[#FFFFFF]",
            )}
            aria-label={listening ? "Parar de ouvir" : "Falar com o Fin"}
          >
            {listening ? <MicOff className="size-4 text-white" /> : <Mic className="size-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={busy}
            placeholder={
              listening ? "Estou ouvindo..." : busy ? "Pensando..." : "Converse com o Fin..."
            }
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#181818]/30"
            aria-label="Mensagem para o Fin"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={busy}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F] text-[#FFFFFF] disabled:opacity-50"
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] leading-4 text-[#181818]/35">
          O Fin usa apenas os dados da sua conta autenticada. Você decide o que registrar.
        </p>
      </div>
    </div>
  );
}