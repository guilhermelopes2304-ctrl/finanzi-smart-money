import { useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useAccounts, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { financialHealth, availableBalance, totalsFor, buildPeriod } from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { cn } from "@/lib/utils";

type ChatMessage = { from: "fin" | "user"; text: string };

export function FinancialAssistant({ className }: { className?: string }) {
  const { data: profile } = useProfile();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const period = useMemo(() => buildPeriod("current", monthRange()), []);
  const totals = useMemo(() => totalsFor(transactions, period), [transactions, period]);
  const balance = availableBalance(accounts, transactions);
  const health = financialHealth(totals, Number(profile?.monthly_income ?? 0));
  const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0);
  const commitment = income > 0 ? Math.round((totals.expense / income) * 100) : 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("finanzzi:open-assistant", handler);
    return () => window.removeEventListener("finanzzi:open-assistant", handler);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: "fin", text: `Olá${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! Sou o Fin. Seu saldo é ${formatBRL(balance)} e seu comprometimento está em ${commitment}%. O que você quer analisar?` }]);
    }
  }, [open, messages.length, profile?.name, balance, commitment]);

  function answer(question: string) {
    const q = question.toLowerCase();
    if (q.includes("gastar") || q.includes("posso comprar") || q.includes("comprar")) {
      return commitment > 90 ? "Eu seguraria novas compras por enquanto. Seus gastos já estão muito próximos da sua renda." : `Com ${commitment}% da renda comprometida, eu evitaria assumir uma parcela alta. Seu saldo atual é ${formatBRL(balance)}.`;
    }
    if (q.includes("econom") || q.includes("cortar") || q.includes("reduzir")) return commitment > 70 ? "O primeiro passo é atacar as categorias que mais pesam no mês e reduzir gastos recorrentes." : "Sua situação está relativamente equilibrada. Podemos focar em metas e reserva mensal.";
    if (q.includes("saldo") || q.includes("dinheiro")) return `Seu saldo disponível agora é ${formatBRL(balance)}.`;
    if (q.includes("receita") || q.includes("renda")) return `Neste período, suas receitas somam ${formatBRL(totals.income)}.`;
    if (q.includes("despesa") || q.includes("gasto")) return `Neste período, suas despesas somam ${formatBRL(totals.expense)}.`;
    if (q.includes("meta") || q.includes("objetivo")) return "Defina uma meta com valor e prazo. Eu posso acompanhar o progresso junto com seus lançamentos.";
    return `Sua saúde financeira está ${health.title.toLowerCase()}. Posso analisar saldo, receitas, despesas, comprometimento e compras.`;
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [...current, { from: "user", text }, { from: "fin", text: answer(text) }]);
    setInput("");
  }

  if (!open) return null;

  return (
    <div className={cn("fixed bottom-24 right-4 z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#071a12] text-white shadow-2xl shadow-black/40", className)}>
      <div className="flex items-center justify-between border-b border-white/10 bg-emerald-400/10 p-4">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-emerald-400/10"><Bot className="size-6 text-emerald-300" /></div><div><div className="flex items-center gap-1.5 text-sm font-bold"><Sparkles className="size-3.5 text-emerald-300" /> Fin</div><p className="text-xs text-white/50">Seu assistente financeiro</p></div></div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Fechar"><X className="size-4" /></button>
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={cn("max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-5", message.from === "fin" ? "bg-white/[0.07] text-white/80" : "ml-auto bg-emerald-400 text-[#032013] font-medium")}>{message.text}</div>)}</div>
      <div className="border-t border-white/10 p-3"><div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Pergunte ao Fin..." className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/30" /><button type="button" onClick={send} className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400 text-[#032013]" aria-label="Enviar"><Send className="size-4" /></button></div><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setInput("Posso gastar hoje?")} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">Posso gastar?</button><button type="button" onClick={() => setInput("Como posso economizar?")} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">Como economizar?</button></div></div>
    </div>
  );
}
