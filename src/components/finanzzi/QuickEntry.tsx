/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAccounts,
  useBills,
  useCategories,
  useCreditCards,
  useInvalidateFinance,
  useSaveRow,
} from "@/hooks/useFinanceData";
import { interpretFinanceMessage } from "@/lib/channel-engine";
import type { QuickParseResult } from "@/lib/quick-parse";
import { saveRecurringBill } from "@/lib/bills";
import { saveTransaction } from "@/lib/transactions";
import { formatBRL, parseBRL, todayISO } from "@/lib/format";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { trackProductEvent } from "@/lib/product-analytics";
import type { TransactionType } from "@/types/finance";

const NONE = "__none__";

type SpeechResultLike = { isFinal: boolean; 0?: { transcript?: string } };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex?: number; results: SpeechResultLike[] }) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function recurrenceLabel(value: QuickParseResult["recurrence"]) {
  return value === "monthly" ? "todo mês" : value === "yearly" ? "todo ano" : "toda semana";
}

export type QuickEntryPreviewData = {
  text?: string;
  amount?: string;
  description?: string;
  category?: string;
  account?: string;
};

type QuickEntryProps = {
  previewMode?: boolean;
  previewData?: QuickEntryPreviewData;
};

export function QuickEntry({ previewMode = false, previewData }: QuickEntryProps = {}) {
  if (previewMode) return <QuickEntryPreview data={previewData ?? {}} />;
  return <QuickEntryLive />;
}

function QuickEntryPreview({ data }: { data: QuickEntryPreviewData }) {
  const text = data?.text ?? "";
  return (
    <div className="surface-card fin-layout-transition overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#FF5A1F]/15 text-[#FF5A1F]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Registro rápido
            </p>
            <h2 className="mt-1 text-base font-semibold leading-tight sm:text-lg">
              Escreva ou fale. Eu organizo.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conte o que aconteceu do seu jeito.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="hidden min-h-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 text-xs font-bold text-primary opacity-70 sm:inline-flex"
        >
          <Mic className="size-3.5" /> Registrar falando
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-sm">
          <Input
            value={text}
            placeholder="Ex.: paguei 50 no almoço"
            readOnly
            aria-label="Exemplo de registro rápido"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            disabled
            className="size-11 shrink-0 rounded-xl px-0"
            aria-label="Registrar falando"
          >
            <Mic className="size-5" />
          </Button>
          <Button
            type="button"
            disabled
            className="h-11 shrink-0 rounded-xl px-4"
            aria-label="Registrar lançamento"
          >
            <Send className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Registrar</span>
          </Button>
        </div>
        <div className="sm:hidden">
          <button
            type="button"
            disabled
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary opacity-70"
          >
            <Mic className="size-4" /> Falar
          </button>
        </div>
      </div>
      {(data?.amount || data?.description || data?.category || data?.account) && (
        <div className="fin-layout-transition mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/[0.035] p-4 animate-fin-enter sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Entendi assim
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Confira os detalhes antes de registrar.
          </p>
          <div className="mt-4 grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-lg font-bold">
              −
            </div>
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">
                {data.amount ?? "R$ 82,00"}
              </p>
              <p className="mt-1 text-sm font-medium">{data.description ?? text}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{data.category ?? "Alimentação"}</span>
                {data.account && <span>· {data.account}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickEntryLive() {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCreditCards();
  const saveBill = useSaveRow<Record<string, unknown>>("bills", {
    successMessage: "Compromisso atualizado",
  });
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<QuickParseResult | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(NONE);
  const [accountId, setAccountId] = useState(NONE);
  const [cardId, setCardId] = useState(NONE);
  const [busy, setBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualText, setManualText] = useState("");
  const [paidBillId, setPaidBillId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function returnToDashboardTop() {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Wait for the save state and dashboard queries to finish changing the layout.
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollTop);
    });
    window.setTimeout(scrollTop, 120);
  }

  function parseText(rawText: string) {
    const nextText = rawText.trim();
    if (!nextText) return;
    trackProductEvent("quick_entry_used");
    const interpretation = interpretFinanceMessage({
      channel: "app",
      text: nextText,
      categories,
      accounts,
      cards,
      bills,
    });
    const result = interpretation.draft;
    setPaidBillId(
      interpretation.intent === "mark_bill_paid" ? (interpretation.matchedBillId ?? null) : null,
    );
    if (result.confidence === "low") {
      setManualText(result.raw);
      setManualOpen(true);
      setText(nextText);
      toast("Não consegui entender todos os detalhes. Confira antes de salvar.");
      return;
    }
    setDraft(result);
    setType(result.type);
    setAmount(result.amount.toFixed(2).replace(".", ","));
    setDescription(result.description);
    setCategoryId(result.categoryId ?? NONE);
    setCardId(result.cardId ?? NONE);
    setAccountId(result.accountId ?? NONE);
  }

  function handleParse(event: React.FormEvent) {
    event.preventDefault();
    parseText(text);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function startInlineVoice() {
    const voiceWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Ctor = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;

    if (!Ctor) {
      toast.error("O reconhecimento de voz não está disponível neste navegador.");
      return;
    }

    if (listening) {
      stopListening();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += transcript;
        else interimText += transcript;
      }

      if (finalText.trim()) {
        recognitionRef.current = null;
        setListening(false);
        setText(finalText.trim());
        parseText(finalText.trim());
      } else if (interimText.trim()) {
        setText(interimText.trim());
      }
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      setListening(false);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        toast.error("Permita o acesso ao microfone para registrar falando.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }

  useEffect(() => () => recognitionRef.current?.stop(), []);

  async function confirm() {
    if (!user || !draft) return;
    const value = parseBRL(amount);
    if (value <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    setBusy(true);
    try {
      if (paidBillId) {
        await saveBill.mutateAsync({
          id: paidBillId,
          values: { status: "paid", paid_at: todayISO() },
        });
        invalidate();
        setDraft(null);
        setPaidBillId(null);
        setText("");
        returnToDashboardTop();
        return;
      }
      const category = categoryId === NONE ? null : categoryId;
      const account = accountId === NONE ? null : accountId;
      if (draft.recurrence !== "none") {
        await saveRecurringBill({
          userId: user.id,
          description: description || draft.raw,
          amount: value,
          categoryId: category,
          accountId: account,
          recurrence: draft.recurrence,
          dueDay: draft.dueDay,
          notes: null,
        });
      } else {
        await saveTransaction({
          userId: user.id,
          description: description || draft.raw,
          amount: value,
          type,
          categoryId: category,
          accountId: account,
          cardId: cardId === NONE ? null : cardId,
          date: todayISO(),
          method: cardId === NONE ? "pix" : "credito",
          notes: null,
          recurrence: "none",
          ...(draft.installments ? { installments: draft.installments } : {}),
        });
      }
      const catName = categories.find((c) => c.id === categoryId)?.name;
      toast.success(
        draft.recurrence !== "none"
          ? `${description || draft.raw} organizada como conta recorrente`
          : `${type === "income" ? "Receita" : "Despesa"} de ${formatBRL(value)} registrada`,
        {
          description:
            draft.recurrence !== "none"
              ? "O FINANZZI vai lembrar do próximo vencimento."
              : catName
                ? `Categoria: ${catName}`
                : "Seu saldo já foi atualizado.",
        },
      );
      invalidate();
      setDraft(null);
      setText("");
      returnToDashboardTop();
    } catch {
      toast.error("Não foi possível salvar", {
        description: "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  }

  const visibleCategories = categories.filter((c) => c.kind === type || c.kind === "both");
  const categoryName = draft?.categoryId
    ? categories.find((c) => c.id === draft.categoryId)?.name
    : null;
  const cardName = draft?.cardId ? cards.find((c) => c.id === draft.cardId)?.name : null;
  const calculatedItems = draft?.items ?? [];

  return (
    <div className="surface-card overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#FF5A1F]/15 text-[#FF5A1F]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Registro rápido
            </p>
            <h2 className="mt-1 text-base font-semibold leading-tight sm:text-lg">
              Fale ou escreva. Eu organizo.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conte o que aconteceu. Eu cuido da organização.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startInlineVoice}
          className="hidden min-h-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 text-xs font-bold text-primary fin-interactive fin-pressable hover:bg-primary/10 sm:inline-flex"
        >
          <Mic className="size-3.5" /> Registrar falando
        </button>
      </div>
      <form onSubmit={handleParse} className="mt-4 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-sm fin-layout-transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que aconteceu?"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0"
            aria-label="Registro rápido por texto"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={startInlineVoice}
            className="size-11 shrink-0 rounded-xl px-0"
            aria-label={listening ? "Parar gravação" : "Registrar falando"}
          >
            {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>
          <Button
            type="submit"
            disabled={!text.trim()}
            className="h-11 shrink-0 rounded-xl px-4"
            aria-label="Registrar lançamento"
          >
            <Send className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Registrar</span>
          </Button>
        </div>
        <div className="sm:hidden">
          <button
            type="button"
            onClick={startInlineVoice}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary fin-interactive fin-pressable hover:bg-primary/10"
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />} {listening ? "Parar" : "Falar"}
          </button>
        </div>
      </form>
      {draft && (
        <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/[0.035] p-4 animate-fin-enter fin-layout-transition sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {paidBillId ? "Conta encontrada" : "Entendi assim"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {paidBillId
                  ? "Vou atualizar o compromisso, sem criar outro lançamento."
                  : "Confira e registre quando estiver tudo certo."}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                draft.confidence === "high"
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning",
              )}
            >
              {paidBillId
                ? "Atualização segura"
                : draft.confidence === "high"
                  ? "Leitura segura"
                  : "Confira os campos"}
            </span>
          </div>
          <div className="mb-4 grid gap-3 rounded-2xl bg-card p-4 fin-layout-transition sm:grid-cols-[auto_1fr] sm:items-center">
            <div
              className={cn(
                "grid size-14 place-items-center rounded-2xl text-lg font-bold",
                type === "income" ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
              )}
            >
              {type === "income" ? "+" : "−"}
            </div>
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">
                {formatBRL(parseBRL(amount) || draft.amount)}
              </p>
              <p className="mt-1 text-sm font-medium">{description || draft.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{categoryName ?? "Sem categoria"}</span>
                {cardName && <span>· {cardName}</span>}
                {draft.installments && <span>· {draft.installments}x</span>}
                {paidBillId ? (
                  <span>· será marcada como paga</span>
                ) : (
                  draft.recurrence !== "none" && <span>· {recurrenceLabel(draft.recurrence)}</span>
                )}
              </div>
            </div>
          </div>
          {calculatedItems.length > 0 && !paidBillId && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-background animate-fin-enter">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Itens identificados</p>
                  <p className="text-xs text-muted-foreground">Confira como o total foi calculado.</p>
                </div>
                <span className="text-xs font-semibold text-primary">{calculatedItems.length} {calculatedItems.length === 1 ? "item" : "itens"}</span>
              </div>
              <div className="divide-y divide-border">
                {calculatedItems.map((item, index) => (
                  <div key={`${item.quantity}-${item.unitPrice}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                    <p className="min-w-0 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.quantity} {item.description} × {formatBRL(item.unitPrice)}</span>
                      <span className="ml-1">=</span>
                    </p>
                    <p className="shrink-0 text-sm font-semibold">{formatBRL(item.total)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-muted/35 px-4 py-3">
                <span className="text-sm font-semibold">Total calculado</span>
                <span className="font-display text-lg font-semibold tracking-tight">{formatBRL(draft.amount)}</span>
              </div>
            </div>
          )}
          {!paidBillId && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-background p-1">
                {(["expense", "income"] as TransactionType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={cn(
                      "min-h-11 rounded-lg text-sm font-semibold transition-colors",
                      type === option
                        ? option === "income"
                          ? "bg-success text-success-foreground"
                          : "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {option === "income" ? "Receita" : "Despesa"}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qe-amount">Valor</Label>
                  <MoneyInput id="qe-amount" value={amount} onChange={setAmount} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qe-desc">Descrição</Label>
                  <Input
                    id="qe-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem categoria</SelectItem>
                      {visibleCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Conta</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem conta</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Cartão</Label>
                  <Select value={cardId} onValueChange={setCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem cartão</SelectItem>
                      {cards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Button onClick={confirm} disabled={busy} className="h-11 flex-1">
              <Check className="size-4" />{" "}
              {busy ? "Salvando..." : paidBillId ? "Marcar como paga" : "Registrar"}
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                setDraft(null);
                setPaidBillId(null);
              }}
              aria-label="Cancelar"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <TransactionDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        defaultDescription={manualText}
      />
    </div>
  );
}
