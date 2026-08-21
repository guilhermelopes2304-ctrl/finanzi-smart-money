import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Check, Mic, Send, Sparkles, X } from "lucide-react";
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
const EXAMPLES = ["mercado 82", "uber 27", "recebi 2.500", "netflix 39,90", "aluguel 1200"];

export function recurrenceLabel(value: QuickParseResult["recurrence"]) {
  return value === "monthly" ? "todo mês" : value === "yearly" ? "todo ano" : "toda semana";
}

export function QuickEntry() {
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
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [paidBillId, setPaidBillId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % EXAMPLES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  function handlePhoto() {
    toast("Leitura de foto ainda não está ligada a um OCR real.", {
      description: "Nada foi registado. Você pode escrever o que aconteceu para o Fin interpretar.",
    });
  }

  function openFinVoice() {
    window.dispatchEvent(new CustomEvent("finanzzi:open-assistant", { detail: { listen: true } }));
  }

  function handleParse(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    trackProductEvent("quick_entry_used");
    const interpretation = interpretFinanceMessage({
      channel: "app",
      text,
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
      setText("");
      toast("Abri o formulário completo para você conferir os detalhes.");
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
        toast.success("Compromisso marcado como pago");
        invalidate();
        setDraft(null);
        setPaidBillId(null);
        setText("");
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

  return (
    <div className="surface-card overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#5B5CE2]/15 text-[#5B5CE2]">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Atalho FINANZZI
            </p>
            <h2 className="mt-1 text-base font-semibold leading-tight sm:text-lg">
              Lance do seu jeito
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Escreva como falaria com o Fin. Ele entende o contexto.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openFinVoice}
          className="hidden min-h-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/10 sm:inline-flex"
        >
          <Mic className="size-3.5" /> Falar com o Fin
        </button>
      </div>
      <form onSubmit={handleParse} className="mt-4 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={EXAMPLES[placeholderIndex]}
            className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0"
            aria-label="Registro rápido por texto"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={openFinVoice}
            className="size-11 shrink-0 rounded-xl px-0"
            aria-label="Falar com o Fin"
          >
            <Mic className="size-5" />
          </Button>
          <Button
            type="submit"
            disabled={!text.trim()}
            className="h-11 shrink-0 rounded-xl px-4"
            aria-label="Interpretar lançamento"
          >
            <Send className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Interpretar</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Experimente:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setText(example)}
              className="rounded-full bg-muted px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <button
            type="button"
            onClick={openFinVoice}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.99]"
          >
            <Mic className="size-4" /> Falar
          </button>
          <button
            type="button"
            onClick={handlePhoto}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
          >
            <Camera className="size-4" /> Foto
          </button>
        </div>
      </form>
      {draft && (
        <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/[0.035] p-4 animate-fin-fade-up sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {paidBillId ? "Conta encontrada" : "Entendi assim"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {paidBillId
                  ? "Vou atualizar o compromisso, sem criar outro lançamento."
                  : "Confira antes de confirmar o lançamento."}
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
          <div className="mb-4 grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-[auto_1fr] sm:items-center">
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
              {busy ? "Salvando..." : paidBillId ? "Marcar como paga" : "Confirmar lançamento"}
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
