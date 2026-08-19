import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Sparkles, X } from "lucide-react";
import { useAccounts, useCategories, useCreditCards, useInvalidateFinance, useProfile } from "@/hooks/useFinanceData";
import { useAuth } from "@/hooks/useAuth";
import { formatBRL, todayISO } from "@/lib/format";
import { saveTransaction } from "@/lib/transactions";
import { parseQuickEntry, type QuickParseResult } from "@/lib/quick-parse";
import { askFinAI } from "@/lib/fin-ai";
import { cn } from "@/lib/utils";

type Message = { from: "fin" | "user"; text: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event?: any) => void) | null;
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
const ACTION_RE = /\b(gastei|paguei|comprei|torrei|recebi|ganhei|entrou|caiu|vendi|registra|registrar|registre|anota|anotar|lan[cç]a|lan[cç]ar)\b/i;
/** Perguntas nunca viram lançamento, mesmo com valor no texto. */
const QUESTION_RE = /(\?|\b(posso|quanto|qual|quais|como|onde|por que|porque|devo|vale a pena|consigo)\b)/i;

export function FinancialAssistant({ className }: { className?: string }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCreditCards();
  const invalidate = useInvalidateFinance();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<QuickParseResult | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);

  const categoryName = useMemo(
    () => (id: string | null) => categories.find((c) => c.id === id)?.name ?? null,
    [categories],
  );

  function push(message: Message) {
    setMessages((current) => [...current, message]);
  }

  async function commit(draft: QuickParseResult) {
    if (!user) return;
    setBusy(true);
    try {
      await saveTransaction({
        userId: user.id,
        description: draft.description || draft.raw,
        amount: draft.amount,
        type: draft.type,
        categoryId: draft.categoryId,
        accountId: draft.cardId ? null : accounts[0]?.id ?? null,
        cardId: draft.cardId,
        date: todayISO(),
        method: draft.cardId ? "credito" : "pix",
        notes: "Registrado pelo Fin",
        recurrence: "none",
      });
      invalidate();
      const label = draft.type === "income" ? "entrada" : "saída";
      const category = categoryName(draft.categoryId);
      push({
        from: "fin",
        text: `Registrei uma ${label} de ${formatBRL(draft.amount)}${category ? ` em ${category}` : draft.description ? ` em ${draft.description}` : ""}. Seu painel já foi atualizado.`,
      });
    } catch {
      push({ from: "fin", text: "Entendi o lançamento, mas não consegui salvar agora. Tente novamente em alguns segundos." });
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  async function handle(text: string) {
    push({ from: "user", text });
    setPending(null);

    const isAction = ACTION_RE.test(text) && !QUESTION_RE.test(text);
    if (isAction && user) {
      const draft = parseQuickEntry(text, categories, cards);
      if (draft.amount > 0 && draft.confidence !== "low") {
        if (draft.confidence === "high") {
          await commit(draft);
          return;
        }
        const category = categoryName(draft.categoryId);
        setPending(draft);
        push({
          from: "fin",
          text: `Só confirmando: ${draft.type === "income" ? "entrada" : "saída"} de ${formatBRL(draft.amount)}${category ? ` em ${category}` : ` em ${draft.description || "sem categoria"}`}. Posso registrar?`,
        });
        return;
      }
    }

    setBusy(true);
    try {
      const answer = await askFinAI(text);
      push({ from: "fin", text: answer });
    } catch (error) {
      push({ from: "fin", text: error instanceof Error ? error.message : "Não consegui responder agora." });
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
      push({ from: "fin", text: "Seu navegador não oferece reconhecimento de voz. Use o Chrome ou o Edge e permita o microfone." });
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
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
    recognition.onerror = (event: any) => {
      setListening(false);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        push({ from: "fin", text: "Permita o acesso ao microfone nas configurações do navegador para falar comigo." });
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
          text: `Olá${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! Eu sou o Fin. Posso analisar seus dados reais e também registrar lançamentos — é só falar ou escrever, por exemplo: “gastei 45 reais no mercado” ou “quanto gastei este mês?”.`,
        },
      ]);
    }
  }, [open, messages.length, profile?.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir Fin"
        className={cn(
          "fixed bottom-24 right-4 z-40 grid size-14 place-items-center overflow-hidden rounded-full border-2 border-primary/20 bg-[#062117] shadow-2xl transition-transform hover:scale-105 active:scale-95",
          className,
        )}
      >
        <img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" />
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#062117] bg-emerald-400" />
      </button>
    );

  return (
    <div
      className={cn(
        "fixed bottom-24 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-[400px] overflow-hidden rounded-3xl border border-primary/20 bg-[#071a12] text-white shadow-2xl sm:right-4",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 overflow-hidden rounded-xl">
            <img src="/fin-assistente.png" alt="Fin" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm font-bold">
              <Sparkles className="size-3.5 text-emerald-300" /> Fin
            </div>
            <p className="text-xs text-white/50">Assistente financeiro</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/10" aria-label="Fechar">
          <X className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[55vh] space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.from}-${index}`}
            className={cn(
              "max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-5",
              message.from === "user" ? "ml-auto bg-emerald-400 font-medium text-[#032013]" : "bg-white/[0.07] text-white/85",
            )}
          >
            {message.text}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.07] px-3 py-2 text-sm text-white/60">
            <Loader2 className="size-3.5 animate-spin" /> Analisando seus dados...
          </div>
        )}
        {pending && !busy && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void commit(pending)}
              className="min-h-10 flex-1 rounded-xl bg-emerald-400 px-3 text-sm font-semibold text-[#032013]"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                push({ from: "fin", text: "Tudo bem, não registrei nada." });
              }}
              className="min-h-10 rounded-xl border border-white/15 px-3 text-sm text-white/70"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => (listening ? stopListening() : listen())}
            className={cn("grid size-10 shrink-0 place-items-center rounded-xl", listening ? "bg-red-400" : "bg-emerald-400 text-[#032013]")}
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
            placeholder={listening ? "Estou ouvindo..." : busy ? "Pensando..." : "Converse com o Fin..."}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-white/30"
            aria-label="Mensagem para o Fin"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={busy}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400 text-[#032013] disabled:opacity-50"
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-white/35">O Fin consulta seus dados no servidor com sua conta autenticada.</p>
      </div>
    </div>
  );
}
