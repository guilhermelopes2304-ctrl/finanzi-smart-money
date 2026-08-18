import { useEffect, useMemo, useState } from "react";
import { Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { useAccounts, useCategories, useProfile, useTransactions } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { financialHealth, availableBalance, totalsFor, buildPeriod } from "@/lib/finance";
import { formatBRL, monthRange } from "@/lib/format";
import { saveTransaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";
import type { PaymentMethod, Recurrence, TransactionType } from "@/types/finance";

type ChatMessage = { from: "fin" | "user"; text: string };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: any) => void) | null; onerror: ((event?: any) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
declare global { interface Window { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition } }

function parseMoney(text: string): number | null {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const matches = [...normalized.matchAll(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/g)];
  if (!matches.length) return null;
  for (const match of matches) {
    const raw = match[1];
    const value = raw.includes(",") ? Number(raw.replace(/\./g, "").replace(",", ".")) : Number(raw);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

function parseVoiceTransaction(text: string): { type: TransactionType; amount: number; description: string } | null {
  const normalized = text.toLowerCase().trim();
  const amount = parseMoney(normalized);
  if (!amount) return null;
  const incomeWords = /\b(recebi|ganhei|entrou|entraram|recebimento|salário|salario|renda|pagaram|depósito|deposito|vendi|venda)\b/i;
  const expenseWords = /\b(gastei|paguei|pagar|comprei|compra|saiu|saída|saida|despesa|gasto|gaste|paguei)\b/i;
  const type: TransactionType = incomeWords.test(normalized) && !expenseWords.test(normalized) ? "income" : "expense";
  const withoutAmount = normalized.replace(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/, "").replace(/\b(reais?|real)\b/g, "").trim();
  const description = withoutAmount
    .replace(/^(eu\s+)?(recebi|ganhei|entrou|entraram|recebimento|salário|salario|renda|pagaram|depósito|deposito|vendi|venda|gastei|paguei|pagar|comprei|compra|saiu|saída|saida|despesa|gasto|gaste)\s*/i, "")
    .replace(/^(de|do|da|em|no|na|com|por)\s+/i, "")
    .trim();
  return { type, amount, description: description || (type === "income" ? "Entrada registrada pelo Fin" : "Saída registrada pelo Fin") };
}

export function FinancialAssistant({ className }: { className?: string }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(); const { data: transactions = [] } = useTransactions(); const { data: accounts = [] } = useAccounts(); const { data: categories = [] } = useCategories();
  const [open, setOpen] = useState(false); const [input, setInput] = useState(""); const [listening, setListening] = useState(false); const [saving, setSaving] = useState(false); const [messages, setMessages] = useState<ChatMessage[]>([]);
  const period = useMemo(() => buildPeriod("current", monthRange()), []); const totals = useMemo(() => totalsFor(transactions, period), [transactions, period]);
  const balance = availableBalance(accounts, transactions); const health = financialHealth(totals, Number(profile?.monthly_income ?? 0)); const income = totals.income > 0 ? totals.income : Number(profile?.monthly_income ?? 0); const commitment = income > 0 ? Math.round((totals.expense / income) * 100) : 0;

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setInput("Seu navegador não oferece reconhecimento de voz. Tente Chrome ou Edge."); return; }
    const recognition = new Recognition(); recognition.lang = "pt-BR"; recognition.continuous = true; recognition.interimResults = true;
    recognition.onresult = (event: any) => { let finalText = ""; let interimText = ""; for (let i = event.resultIndex ?? 0; i < event.results.length; i += 1) { const transcript = event.results[i]?.[0]?.transcript ?? ""; if (event.results[i]?.isFinal) finalText += transcript; else interimText += transcript; } const text = `${finalText}${interimText}`.trim(); if (text) setInput(text); };
    recognition.onerror = (event: any) => { setListening(false); if (event?.error === "not-allowed" || event?.error === "service-not-allowed") setInput("Permita o acesso ao microfone para falar com o Fin."); };
    recognition.onend = () => setListening(false); setListening(true); try { recognition.start(); } catch { setListening(false); }
  }
  useEffect(() => { const handler = (event: Event) => { const detail = (event as CustomEvent<{ listen?: boolean }>).detail; setOpen(true); if (detail?.listen) setTimeout(startListening, 120); }; window.addEventListener("finanzzi:open-assistant", handler); return () => window.removeEventListener("finanzzi:open-assistant", handler); }, []);
  useEffect(() => { if (open && messages.length === 0) setMessages([{ from: "fin", text: `Olá${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! Sou o Fin. Seu saldo é ${formatBRL(balance)}. Como posso ajudar?` }]); }, [open, messages.length, profile?.name, balance]);

  function answer(q: string) { const text = q.toLowerCase(); if (text.includes("gastar") || text.includes("comprar")) return commitment > 90 ? "Eu seguraria novas compras por enquanto. Seus gastos já estão muito próximos da sua renda." : `Com ${commitment}% da renda comprometida, eu evitaria assumir uma parcela alta. Seu saldo atual é ${formatBRL(balance)}.`; if (text.includes("econom") || text.includes("cortar") || text.includes("reduzir")) return commitment > 70 ? "O primeiro passo é atacar as categorias que mais pesam no mês e reduzir gastos recorrentes." : "Sua situação está relativamente equilibrada. Podemos focar em metas e reserva mensal."; if (text.includes("saldo") || text.includes("dinheiro")) return `Seu saldo disponível agora é ${formatBRL(balance)}.`; if (text.includes("receita") || text.includes("renda")) return `Neste período, suas receitas somam ${formatBRL(totals.income)}.`; if (text.includes("despesa") || text.includes("gasto")) return `Neste período, suas despesas somam ${formatBRL(totals.expense)}.`; return `Sua saúde financeira está ${health.title.toLowerCase()}. Posso analisar saldo, receitas, despesas, comprometimento e compras.`; }

  async function send() {
    const text = input.trim(); if (!text || saving) return;
    setMessages((current) => [...current, { from: "user", text }]); setInput("");
    const transaction = parseVoiceTransaction(text);
    if (transaction && user) {
      setSaving(true);
      try {
        await saveTransaction({ userId: user.id, description: transaction.description, amount: transaction.amount, type: transaction.type, categoryId: null, accountId: accounts[0]?.id ?? null, cardId: null, date: new Date().toISOString().slice(0, 10), method: "cash" as PaymentMethod, notes: "Registrado pelo Fin", recurrence: "none" as Recurrence });
        const label = transaction.type === "income" ? "entrada" : "saída";
        setMessages((current) => [...current, { from: "fin", text: `Pronto! Registrei ${label} de ${formatBRL(transaction.amount)}${transaction.description ? ` em “${transaction.description}”` : ""}. O lançamento já está salvo.` }]);
      } catch (error) {
        setMessages((current) => [...current, { from: "fin", text: `Não consegui salvar esse lançamento. ${error instanceof Error ? error.message : "Tente novamente."}` }]);
      } finally { setSaving(false); }
      return;
    }
    setMessages((current) => [...current, { from: "fin", text: answer(text) }]);
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} aria-label="Abrir assistente financeiro Fin" className={cn("fixed bottom-24 right-4 z-40 grid size-14 place-items-center overflow-hidden rounded-full border-2 border-emerald-300/30 bg-[#062117] shadow-2xl shadow-black/30 transition-transform hover:scale-105 active:scale-95", className)}><img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" loading="lazy" decoding="async" /><span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#062117] bg-emerald-400" /></button>;
  return <div className={cn("fixed bottom-24 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-[390px] overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#071a12] text-white shadow-2xl shadow-black/40 sm:right-4", className)}><div className="flex items-center justify-between border-b border-white/10 bg-emerald-400/10 p-4"><div className="flex items-center gap-3"><div className="size-10 overflow-hidden rounded-xl bg-emerald-400/10"><img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" /></div><div><div className="flex items-center gap-1.5 text-sm font-bold"><Sparkles className="size-3.5 text-emerald-300" /> Fin</div><p className="text-xs text-white/50">Seu assistente financeiro</p></div></div><button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/10" aria-label="Fechar"><X className="size-4" /></button></div><div className="max-h-[55vh] space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={cn("max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-5", message.from === "fin" ? "bg-white/[0.07] text-white/80" : "ml-auto bg-emerald-400 text-[#032013] font-medium")}>{message.text}</div>)}</div><div className="border-t border-white/10 p-3"><div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1"><button type="button" onClick={listening ? undefined : startListening} className={cn("grid size-10 shrink-0 place-items-center rounded-xl", listening ? "bg-red-400 text-white" : "bg-emerald-400 text-[#032013]")} aria-label={listening ? "Ouvindo" : "Falar com o Fin"}>{listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} placeholder={listening ? "Estou ouvindo..." : saving ? "Salvando lançamento..." : "Pergunte ou diga um lançamento..."} disabled={saving} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/30" /><button type="button" onClick={() => void send()} disabled={saving} className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400 text-[#032013] disabled:opacity-50" aria-label="Enviar"><Send className="size-4" /></button></div><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setInput("Posso gastar hoje?")} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">Posso gastar?</button><button type="button" onClick={() => setInput("Como posso economizar?")} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">Como economizar?</button><button type="button" onClick={() => setInput("Gastei 50 no mercado")} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">Testar lançamento</button></div></div></div>;
}
