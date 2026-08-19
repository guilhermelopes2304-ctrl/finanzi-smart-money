import { supabase } from "@/integrations/supabase/client";

/**
 * Pergunta ao Fin. Todo o contexto financeiro é calculado no backend,
 * com o JWT do usuário autenticado. A chave da IA nunca vem para o frontend.
 */
export async function askFinAI(question: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("fin-chat", {
    body: { question },
  });
  if (error) {
    const detail = (data as { error?: string } | null)?.error;
    throw new Error(detail || "Não consegui falar com a inteligência do Fin agora.");
  }
  if (!data?.answer) throw new Error("O Fin não conseguiu gerar uma resposta agora.");
  return String(data.answer);
}
