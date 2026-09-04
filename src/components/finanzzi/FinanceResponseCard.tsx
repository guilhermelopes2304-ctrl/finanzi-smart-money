import { useState } from "react";
import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Pencil, RotateCcw, Wallet, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useInvalidateFinance } from "@/hooks/useFinanceData";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";

type FinanceResponseCardProps = { text: string; onEdit?: () => void; onUndo?: () => void; actionBusy?: boolean };

function parseMoney(value: string | undefined) {
  if (!value) return 0;
  return Number(value.replace(/\./g, "").replace(",", "."));
}

export function FinanceResponseCard({ text, onEdit, onUndo, actionBusy = false }: FinanceResponseCardProps) {
  const { user } = useAuth();
  const invalidate = useInvalidateFinance();
  const [localBusy, setLocalBusy] = useState(false);
  const [undone, setUndone] = useState(false);
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const isConfirmation = /^✓\s*(entrada registrada|despesa registrada)/i.test(lines[0] ?? "");
  const isSummary = /^(neste mês você gastou|neste mes voce gastou)/i.test(lines[0] ?? "");

  async function undoFromDatabase() {
    if (!user || localBusy || undone) return;
    const amountLine = lines[1] ?? "";
    const amountMatch = amountLine.match(/R\$\s*([\d.]+,\d{2})/);
    const amount = parseMoney(amountMatch?.[1]);
    const description = lines[2] ?? "";
    if (!amount) return;
    setLocalBusy(true);
    try {
      let query = supabase.from("transactions").select("id").eq("user_id", user.id).eq("amount", amount).order("created_at", { ascending: false }).limit(1);
      if (description) query = query.eq("description", description);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data?.id) throw new Error("Lançamento não encontrado");
      const { error: deleteError } = await supabase.from("transactions").delete().eq("id", data.id).eq("user_id", user.id);
      if (deleteError) throw deleteError;
      setUndone(true);
      invalidate();
      onUndo?.();
    } finally {
      setLocalBusy(false);
    }
  }

  if (isConfirmation) {
    const title = undone ? "Lançamento desfeito" : (lines[0]?.replace(/^✓\s*/i, "") ?? "Lançamento registrado");
    const amountLine = lines[1] ?? "";
    const amountMatch = amountLine.match(/(R\$\s*[\d.]+,\d{2})/);
    const category = amountLine.includes("•") ? amountLine.split("•")[1]?.trim() : "";
    const description = lines[2] ?? "";
    return (
      <article className={`w-full max-w-[min(92vw,420px)] rounded-[24px] border p-4 shadow-[0_14px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl ${undone ? "border-white/[0.06] bg-card/50 opacity-70" : "border-white/[0.08] bg-card/90"}`}>
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">{undone ? <RotateCcw className="size-5" /> : <CheckCircle2 className="size-5" />}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p className="text-sm font-semibold text-foreground">{title}</p>{!undone && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Confirmado</span>}</div>
            <p className="mt-2 text-xl font-semibold tracking-tight">{amountMatch?.[1] ?? amountLine}</p>
            {category && <span className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-[11px] font-medium text-primary">{category}</span>}
            {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {!undone && <div className="mt-4 flex gap-2 border-t border-white/[0.07] pt-3">
          <Link to="/lancamentos" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-background px-3 py-2.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><Pencil className="size-3.5" /> Editar</Link>
          <button type="button" disabled={actionBusy || localBusy} onClick={() => void undoFromDatabase()} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-background px-3 py-2.5 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50">{actionBusy || localBusy ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />} {actionBusy || localBusy ? "Desfazendo..." : "Desfazer"}</button>
        </div>}
      </article>
    );
  }

  if (isSummary) {
    const expense = parseMoney(lines[0]?.match(/R\$\s*([\d.]+,\d{2})/)?.[1]);
    const income = parseMoney(lines.find((line) => /^entradas:/i.test(line))?.match(/R\$\s*([\d.]+,\d{2})/)?.[1]);
    const balance = parseMoney(lines.find((line) => /^resultado:/i.test(line))?.match(/R\$\s*([\d.]+,\d{2})/)?.[1]);
    const healthy = balance >= 0;
    return (
      <article className="w-full max-w-[min(94vw,460px)] overflow-hidden rounded-[26px] border border-white/[0.08] bg-card/90 shadow-[0_16px_55px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5"><div className="flex items-center gap-2.5"><div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Wallet className="size-4" /></div><div><p className="text-sm font-semibold">Resumo do mês</p><p className="text-[10px] text-muted-foreground">Sua movimentação até agora</p></div></div><div className={`grid size-8 place-items-center rounded-full ${healthy ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>{healthy ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}</div></div>
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] px-1 py-4"><div className="px-3"><div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground"><ArrowUpRight className="size-3 text-emerald-400" /> Entradas</div><p className="text-sm font-semibold">{formatBRL(income)}</p></div><div className="px-3"><div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground"><ArrowDownRight className="size-3 text-primary" /> Saídas</div><p className="text-sm font-semibold">{formatBRL(expense)}</p></div><div className="px-3"><p className="mb-1 text-[10px] text-muted-foreground">Balanço</p><p className={`text-sm font-semibold ${healthy ? "text-emerald-400" : "text-primary"}`}>{formatBRL(balance)}</p></div></div>
      </article>
    );
  }
  return <div className="max-w-[92%] rounded-[22px] border border-white/[0.07] bg-card/65 px-4 py-3 text-sm shadow-sm whitespace-pre-line">{text}</div>;
}
