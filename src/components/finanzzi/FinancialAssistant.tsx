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
  const description = withoutAmount.replace(/^(eu\s+)?(recebi|ganhei|entrou|entraram|recebimento|salário|salario|renda|pagaram|depósito|deposito|vendi|venda|gastei|paguei|pagar|comprei|compra|saiu|saída|saida|despesa|gasto|gaste)\s*/i, "").replace(/^(de|do|da|em|no|na|com|por)\s+/i, "").trim();
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
  useEffect(() => { if (open && messages.length === 0) setMessages([{ from: "fin", text: `Olá${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! Sou o Fin. Hoje seu saldo disponível é ${formatBRL(balance)}. Pode me perguntar sobre gastos, renda, contas, compras ou como organizar melhor seu dinheiro.` }]); }, [open, messages.length, profile?.name, balance]);

  function answer(q: string) {
    const text = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const firstName = profile?.name?.split(" ")[0] || "você";
    const avgExpense = totals.expense > 0 ? totals.expense : 0;
    const availableAfterExpenses = income - avgExpense;
    const topCategory = categories.map((category: any) => {
      const total = transactions.filter((t: any) => t.type === "expense" && t.category_id === category.id).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      return { name: category.name, total };
    }).sort((a: any, b: any) => b.total - a.total)[0];

    if (/\b(oi|ola|olá|bom dia|boa tarde|boa noite|tudo bem)\b/.test(text)) return `Olá, ${firstName}! 👋 Estou aqui para cuidar da parte chata das finanças com você. Posso analisar seus gastos, dizer quanto você pode gastar, ajudar a economizar ou registrar um lançamento.`;
    if (/\b(quem e|quem é|o que voce faz|o que você faz|como voce funciona|como você funciona)\b/.test(text)) return "Eu sou o Fin, o assistente financeiro do FINANZZI. Eu uso os seus próprios dados para responder perguntas práticas, explicar sua situação e, quando você pedir, registrar entradas e saídas. Não quero só dizer que está tudo bem ou em atenção: quero explicar o porquê e o que você pode fazer.";
    if (/\b(saldo|quanto tenho|quanto eu tenho|dinheiro disponivel|dinheiro disponível)\b/.test(text)) return `Hoje você tem ${formatBRL(balance)} de saldo disponível. Suas entradas neste período somam ${formatBRL(totals.income)} e suas saídas ${formatBRL(totals.expense)}. Se quiser, eu também posso analisar quanto desse saldo é prudente manter como reserva.`;
    if (/\b(quanto gastei|quanto gastei esse mes|quanto gastei no mes|despesas|gastos)\b/.test(text)) return `Neste período você gastou ${formatBRL(totals.expense)}. Isso representa aproximadamente ${commitment}% da sua renda considerada de ${formatBRL(income)}.${topCategory && topCategory.total > 0 ? ` A categoria que mais pesa é ${topCategory.name}, com ${formatBRL(topCategory.total)}.` : " Ainda não tenho uma categoria com dados suficientes para apontar o maior peso."}`;
    if (/\b(quanto recebi|receita|receitas|renda|salario|salário|ganhei)\b/.test(text)) return `Neste período, suas entradas registradas somam ${formatBRL(totals.income)}. Para comparação, estou considerando ${formatBRL(income)} como sua renda de referência. Se houver uma renda que não apareceu aqui, podemos registrá-la pelo próprio Fin.`;
    if (/\b(posso gastar|posso comprar|da pra comprar|dá pra comprar|consigo comprar|vale a pena comprar)\b/.test(text)) return commitment >= 90 ? `Eu teria cautela agora. Você já comprometeu cerca de ${commitment}% da renda e tem ${formatBRL(balance)} disponíveis. Antes de uma compra nova, eu priorizaria manter uma margem para contas e imprevistos.` : commitment >= 70 ? `Dá para pensar na compra, mas sem apertar o orçamento. Cerca de ${commitment}% da sua renda já está comprometida. Eu tentaria manter a compra dentro do que sobra depois das despesas e preservaria uma reserva.` : `Sua situação atual permite mais flexibilidade: cerca de ${100 - commitment}% da renda ainda não está comprometida. Mesmo assim, eu não usaria todo o saldo disponível em uma única compra. Se você me disser o valor da compra, eu faço uma análise mais objetiva.`;
    if (/\b(economizar|economia|economizar mais|como economizar|cortar gastos|reduzir gastos|onde cortar)\b/.test(text)) return topCategory && topCategory.total > 0 ? `Eu começaria por ${topCategory.name}. É onde seus registros mostram maior peso, cerca de ${formatBRL(topCategory.total)} neste período. Em vez de cortar tudo, podemos procurar uma redução de 10% nessa categoria e transformar a diferença em reserva.` : `Eu começaria acompanhando os gastos recorrentes e definindo um limite semanal. Hoje suas saídas estão em ${formatBRL(totals.expense)}. Se você registrar os próximos gastos pelo Fin, consigo identificar padrões e sugerir cortes mais específicos.`;
    if (/\b(meta|metas|objetivo|objetivos)\b/.test(text)) return "Posso ajudar a transformar um objetivo em plano: valor da meta, prazo e quanto separar por mês. Se você me disser, por exemplo, 'quero juntar R$ 5.000 em 10 meses', eu calculo uma contribuição mensal aproximada.";
    if (/\b(conta|contas|vencimento|vencimentos|boleto|boletos)\b/.test(text)) return "Posso analisar suas contas, mas preciso que elas estejam cadastradas no FINANZZI. Se você me disser qual conta quer conferir, posso orientar o que observar: vencimento, valor e impacto no dinheiro disponível.";
    if (/\b(cartao|cartão|fatura|faturas|limite)\b/.test(text)) return "Para cartões, o ponto principal é não confundir limite disponível com dinheiro disponível. Eu posso analisar a fatura e os compromissos cadastrados e ajudar a decidir quanto ainda é seguro gastar.";
    if (/\b(onde gasto|para onde|categorias|categoria|maior gasto|maior despesa)\b/.test(text)) return topCategory && topCategory.total > 0 ? `Pelos seus registros, ${topCategory.name} é a categoria com maior gasto, em ${formatBRL(topCategory.total)} neste período. Posso comparar as principais categorias e procurar oportunidades de redução.` : "Ainda não tenho lançamentos categorizados o bastante para fazer uma comparação confiável.";
    if (/\b(organizar|organizar minha vida|organizar meu dinheiro|planejamento|planejar)\b/.test(text)) return `Eu faria em três passos: 1) registrar tudo que entra e sai; 2) garantir que as contas e cartões estejam cadastrados; 3) separar uma meta ou reserva antes de aumentar os gastos. Hoje suas entradas são ${formatBRL(totals.income)} e suas saídas ${formatBRL(totals.expense)}, então já temos uma base para começar.`;
    if (/\b(saude financeira|situação financeira|situacao financeira|estou bem|estou mal|como estou)\b/.test(text)) return `Minha leitura é esta: você tem ${formatBRL(balance)} disponíveis, gastou ${formatBRL(totals.expense)} neste período e comprometeu aproximadamente ${commitment}% da renda de referência. ${commitment >= 90 ? "O ponto de atenção é o espaço pequeno entre renda e gastos." : commitment >= 70 ? "Há espaço, mas vale acompanhar os gastos para não perder margem." : "Há uma margem interessante para construir reserva e metas."} Saúde financeira não é só um rótulo: é principalmente a relação entre renda, gastos, compromissos e reserva.`;
    if (/\b(quanto sobra|o que sobra|sobra)\b/.test(text)) return `Considerando ${formatBRL(income)} de renda de referência e ${formatBRL(avgExpense)} em despesas registradas, a diferença aproximada é ${formatBRL(Math.max(availableAfterExpenses, 0))}. Isso não significa que todo esse valor esteja livre para gastar, porque contas futuras e reservas também precisam entrar na decisão.`;
    return `Entendi. Eu consigo ser mais específico se você me disser o que quer decidir. Por exemplo: “posso gastar R$ 300 hoje?”, “onde estou gastando mais?”, “como economizar R$ 500 por mês?”, “quanto sobra depois das despesas?” ou “como está minha situação financeira?”. Eu uso seus dados do FINANZZI para responder, não só um texto genérico.`;
  }

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

  if (!open) return <button type="button" onClick={() => setOpen(true)} aria-label="Abrir assistente financeiro Fin" className={cn("fixed bottom-24 right-4 z-40 grid size-14 place-items-center overflow-hidden rounded-full border-2 border-[#3F4658]/30 bg-[#151827] shadow-2xl shadow-black/30 transition-transform hover:scale-105 active:scale-95", className)}><img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" loading="lazy" decoding="async" /><span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#151827] bg-[#5B5CE2]" /></button>;
  return <div className={cn("fixed bottom-24 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-[390px] overflow-hidden rounded-3xl border border-[#3F4658]/20 bg-[#151827] text-white shadow-2xl shadow-black/40 sm:right-4", className)}><div className="flex items-center justify-between border-b border-[#3F4658]/10 bg-[#5B5CE2]/10 p-4"><div className="flex items-center gap-3"><div className="size-10 overflow-hidden rounded-xl bg-[#5B5CE2]/10"><img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" /></div><div><div className="flex items-center gap-1.5 text-sm font-bold"><Sparkles className="size-3.5 text-[#5B5CE2]" /> Fin</div><p className="text-xs text-[#F4F5F8]/50">Seu assistente financeiro</p></div></div><button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-[#F4F5F8]/50 hover:bg-[#3F4658]/10" aria-label="Fechar"><X className="size-4" /></button></div><div className="max-h-[55vh] space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={cn("max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-5", message.from === "fin" ? "bg-white/[0.07] text-[#F4F5F8]/80" : "ml-auto bg-[#5B5CE2] text-[#151827] font-medium")}>{message.text}</div>)}</div><div className="border-t border-[#3F4658]/10 p-3"><div className="flex gap-2 rounded-2xl border border-[#3F4658]/10 bg-white/[0.04] p-1"><button type="button" onClick={listening ? undefined : startListening} className={cn("grid size-10 shrink-0 place-items-center rounded-xl", listening ? "bg-[#3F4658] text-[#FFFFFF]" : "bg-[#5B5CE2] text-[#151827]")} aria-label={listening ? "Ouvindo" : "Falar com o Fin"}>{listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} placeholder={listening ? "Estou ouvindo..." : saving ? "Salvando lançamento..." : "Pergunte ou diga um lançamento..."} disabled={saving} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#F4F5F8]/30" /><button type="button" onClick={() => void send()} disabled={saving} className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#5B5CE2] text-[#151827] disabled:opacity-50" aria-label="Enviar"><Send className="size-4" /></button></div><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setInput("Posso gastar hoje?")} className="rounded-full bg-[#3F4658]/5 px-2.5 py-1 text-[11px] text-[#F4F5F8]/55">Posso gastar?</button><button type="button" onClick={() => setInput("Como posso economizar?")} className="rounded-full bg-[#3F4658]/5 px-2.5 py-1 text-[11px] text-[#F4F5F8]/55">Como economizar?</button><button type="button" onClick={() => setInput("Gastei 50 no mercado")} className="rounded-full bg-[#3F4658]/5 px-2.5 py-1 text-[11px] text-[#F4F5F8]/55">Testar lançamento</button></div></div></div>;
}
