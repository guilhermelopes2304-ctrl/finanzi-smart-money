import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pencil, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts, useBills, useCategories, useCreditCards, useInvalidateFinance } from "@/hooks/useFinanceData";
import { interpretFinanceMessage } from "@/lib/channel-engine";
import { deleteTransaction, saveTransaction } from "@/lib/transactions";
import { saveRecurringBill } from "@/lib/bills";
import { formatBRL, parseBRL, todayISO } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import type { Transaction, TransactionType } from "@/types/finance";
import { cn } from "@/lib/utils";

type SpeechResultLike = { isFinal: boolean; 0?: { transcript?: string } };
type SpeechRecognitionLike = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { resultIndex?: number; results: SpeechResultLike[] }) => void) | null; onerror: ((event?: { error?: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type Props = { profileName?: string | null };

async function findSavedTransaction(userId: string, description: string, amount: number, type: TransactionType) {
  const { data, error } = await supabase
    .from("transactions")
    .select("id,user_id,description,amount,type,category_id,account_id,credit_card_id,purchase_id,bill_id,date,payment_method,notes,recurrence,installment_number,installment_total")
    .eq("user_id", userId)
    .eq("description", description.trim())
    .eq("amount", amount)
    .eq("type", type)
    .eq("date", todayISO())
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Transaction | null) ?? null;
}

export function HomeQuickRegister({ profileName }: Props) {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCreditCards();
  const { data: bills = [] } = useBills();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const firstName = profileName?.split(" ")[0] || "você";

  async function register(rawText: string) {
    const value = rawText.trim();
    if (!value || !user || busy) return;
    setBusy(true);
    try {
      const interpretation = interpretFinanceMessage({ channel: "app", text: value, categories, accounts, cards, bills });
      const draft = interpretation.draft;
      if (draft.confidence === "low" || draft.amount <= 0 || !draft.description.trim()) {
        toast("Preciso de mais detalhes para registrar", { description: "Informe pelo menos o valor e o que aconteceu." });
        return;
      }

      if (interpretation.intent === "record_transaction") {
        await saveTransaction({
          userId: user.id,
          description: draft.description,
          amount: draft.amount,
          type: draft.type,
          categoryId: draft.categoryId ?? null,
          accountId: draft.accountId ?? accounts[0]?.id ?? null,
          cardId: draft.cardId ?? null,
          date: todayISO(),
          method: draft.cardId ? "credito" : "pix",
          notes: "Registrado pela Home",
          recurrence: "none",
          ...(draft.installments ? { installments: draft.installments } : {}),
        });
        const transaction = await findSavedTransaction(user.id, draft.description, draft.amount, draft.type);
        setSaved(transaction);
        setText("");
        invalidate();
        toast.success(`${draft.type === "income" ? "Entrada" : "Saída"} registrada`, { description: `${formatBRL(draft.amount)} • ${draft.description}` });
        return;
      }

      if (draft.recurrence !== "none") {
        await saveRecurringBill({ userId: user.id, description: draft.description, amount: draft.amount, categoryId: draft.categoryId ?? null, accountId: draft.accountId ?? accounts[0]?.id ?? null, recurrence: draft.recurrence, dueDay: draft.dueDay, notes: "Registrado pela Home" });
        setText("");
        invalidate();
        toast.success("Compromisso registrado", { description: `${formatBRL(draft.amount)} • ${draft.description}` });
        return;
      }

      toast("Não identifiquei uma entrada ou saída", { description: "Tente: “gastei 45 no almoço” ou “recebi 2000 de salário”." });
    } catch {
      toast.error("Não foi possível registrar", { description: "Verifique sua conexão e tente novamente." });
    } finally {
      setBusy(false);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void register(text);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function startVoice() {
    const voiceWindow = window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
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
        void register(finalText.trim());
      } else if (interimText.trim()) setText(interimText.trim());
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      setListening(false);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") toast.error("Permita o acesso ao microfone para registrar por voz.");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    setListening(true);
    try { recognition.start(); } catch { recognitionRef.current = null; setListening(false); }
  }

  useEffect(() => () => recognitionRef.current?.stop(), []);

  async function cancelSaved() {
    if (!user || !saved || busy) return;
    setBusy(true);
    try {
      await deleteTransaction(user.id, saved.id);
      setSaved(null);
      invalidate();
      toast.success("Lançamento cancelado", { description: "O valor foi removido dos seus registros." });
    } catch {
      toast.error("Não foi possível cancelar o lançamento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8" aria-label="Registro financeiro rápido">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Olá, {firstName}</p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.05em] sm:text-4xl">Registre seu dinheiro sem complicação.</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Digite ou fale o que aconteceu. O FINANZZI registra automaticamente.</p>
      </div>

      <form onSubmit={submit} className="mt-7 rounded-[28px] border border-white/[0.10] bg-card/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl focus-within:border-primary/35">
        <div className="flex items-center gap-2">
          <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={busy} rows={1} placeholder="Ex.: gastei 45 no combustível" aria-label="Registrar entrada ou saída" className="min-h-12 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground" />
          <button type="button" onClick={startVoice} disabled={busy} className={cn("grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition active:scale-95", listening && "bg-primary/10 text-primary")} aria-label={listening ? "Parar gravação" : "Registrar por voz"}>{listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}</button>
          <button type="submit" disabled={busy || !text.trim()} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-95 disabled:opacity-35" aria-label="Registrar">{busy ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send className="size-4" />}</button>
        </div>
        <div className="px-3 pb-2 pt-1 text-[11px] text-muted-foreground">Ex.: “comprei 3 óleos de motor de 15 reais” ou “recebi 2 mil de salário”.</div>
      </form>

      {saved && (
        <div className="mt-5 rounded-[24px] border border-primary/20 bg-primary/[0.045] p-4 shadow-sm animate-fin-enter sm:p-5">
          <div className="flex items-start gap-3">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", saved.type === "income" ? "bg-emerald-500/12 text-emerald-400" : "bg-primary/12 text-primary")}><Sparkles className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Salvo automaticamente</p>
              <p className="mt-1 truncate text-sm font-semibold">{saved.description}</p>
              <p className={cn("mt-1 font-display text-2xl font-semibold tracking-tight", saved.type === "income" ? "text-emerald-400" : "text-foreground")}>{saved.type === "income" ? "+" : "−"}{formatBRL(Number(saved.amount))}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setEditOpen(true)} disabled={busy} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold transition active:scale-[0.98]"><Pencil className="size-4" /> Editar</button>
            <button type="button" onClick={() => void cancelSaved()} disabled={busy} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 text-sm font-semibold text-destructive transition active:scale-[0.98]"><Trash2 className="size-4" /> Cancelar</button>
          </div>
        </div>
      )}

      {saved && <TransactionDialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) invalidate(); }} transaction={saved} />}
    </section>
  );
}
