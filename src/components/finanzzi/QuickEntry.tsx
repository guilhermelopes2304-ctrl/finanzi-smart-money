import { useState } from "react";
import { toast } from "sonner";
import { Check, Mic, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts, useCategories, useCreditCards, useInvalidateFinance } from "@/hooks/useFinanceData";
import { parseQuickEntry, type QuickParseResult } from "@/lib/quick-parse";
import { saveTransaction } from "@/lib/transactions";
import { formatBRL, parseBRL, todayISO } from "@/lib/format";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/finance";

const NONE = "__none__";

export function QuickEntry() {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCreditCards();
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

  function openFin() { window.dispatchEvent(new CustomEvent("finanzzi:open-assistant")); }

  function handleParse(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    const result = parseQuickEntry(text, categories, cards);
    if (result.confidence === "low") {
      setManualText(result.raw); setManualOpen(true); setText("");
      toast("Não consegui interpretar — abri o formulário completo."); return;
    }
    setDraft(result); setType(result.type); setAmount(result.amount.toFixed(2).replace(".", ","));
    setDescription(result.description); setCategoryId(result.categoryId ?? NONE); setCardId(result.cardId ?? NONE); setAccountId(NONE);
  }

  async function confirm() {
    if (!user || !draft) return;
    const value = parseBRL(amount);
    if (value <= 0) { toast.error("Informe um valor maior que zero."); return; }
    setBusy(true);
    try {
      await saveTransaction({ userId: user.id, description: description || draft.raw, amount: value, type, categoryId: categoryId === NONE ? null : categoryId, accountId: accountId === NONE ? null : accountId, cardId: cardId === NONE ? null : cardId, date: todayISO(), method: cardId === NONE ? "pix" : "credito", notes: null, recurrence: "none" });
      const catName = categories.find((c) => c.id === categoryId)?.name;
      toast.success(`✅ ${type === "income" ? "Receita" : "Despesa"} de ${formatBRL(value)}${catName ? ` em ${catName}` : ""} registrada`);
      invalidate(); setDraft(null); setText("");
    } catch { toast.error("Não foi possível salvar", { description: "Verifique sua conexão e tente novamente." }); }
    finally { setBusy(false); }
  }

  const visibleCategories = categories.filter((c) => c.kind === type || c.kind === "both");

  return (
    <div className="surface-card overflow-hidden p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-gold/25 text-[oklch(0.5_0.13_82)] dark:text-gold"><Sparkles className="size-4" /></span><div><h2 className="text-base font-semibold leading-tight">Registrar rapidamente</h2><p className="text-xs text-muted-foreground">Digite como você falaria com o Fin</p></div></div>
      <form onSubmit={handleParse} className="space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: gastei R$ 45 no mercado" className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0" aria-label="Registro rápido por texto" />
          <Button type="button" variant="ghost" onClick={openFin} className="size-11 shrink-0 rounded-xl px-0" aria-label="Falar com o Fin"><Mic className="size-5" /><span className="sr-only">Falar com o Fin</span></Button>
          <Button type="submit" disabled={!text.trim()} className="h-11 shrink-0 rounded-xl px-4">Registrar</Button>
        </div>
        <button type="button" onClick={openFin} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.99] sm:hidden">
          <Mic className="size-4" /> Falar com o Fin
        </button>
      </form>
      {draft && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-xl border border-border bg-muted/40 p-4 duration-200">
          <div className="mb-3 flex items-center justify-between gap-2"><p className="text-sm font-medium">Confira antes de salvar</p><span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", draft.confidence === "high" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{draft.confidence === "high" ? "Confiança alta" : "Confira os campos"}</span></div>
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-background p-1">{(["expense", "income"] as TransactionType[]).map((option) => <button key={option} type="button" onClick={() => setType(option)} className={cn("min-h-11 rounded-md text-sm font-medium transition-colors", type === option ? option === "income" ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground" : "text-muted-foreground")}>{option === "income" ? "Receita" : "Despesa"}</button>)}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="qe-amount">Valor</Label><MoneyInput id="qe-amount" value={amount} onChange={setAmount} /></div>
            <div className="space-y-1.5"><Label htmlFor="qe-desc">Descrição</Label><Input id="qe-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Categoria</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value={NONE}>Sem categoria</SelectItem>{visibleCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Conta</Label><Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value={NONE}>Sem conta</SelectItem>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Cartão</Label><Select value={cardId} onValueChange={setCardId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value={NONE}>Sem cartão</SelectItem>{cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={confirm} disabled={busy} className="h-11 flex-1"><Check className="size-4" /> {busy ? "Salvando..." : "Confirmar"}</Button><Button variant="outline" className="h-11" onClick={() => setDraft(null)} aria-label="Cancelar"><X className="size-4" /></Button></div>
        </div>
      )}
      <TransactionDialog open={manualOpen} onOpenChange={setManualOpen} defaultDescription={manualText} />
    </div>
  );
}
