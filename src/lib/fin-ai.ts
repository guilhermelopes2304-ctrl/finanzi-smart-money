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
    let detail = (data as { error?: string } | null)?.error;
    const response = (error as { context?: Response }).context;
    if (!detail && response) {
      try {
        const body = (await response.clone().json()) as { error?: string };
        detail = body.error;
      } catch {
        // Mantém a mensagem segura quando a resposta não é JSON.
      }
    }
    throw new Error(detail || "Não consegui falar com a inteligência do Fin agora.");
  }
  if (!data?.answer) throw new Error("O Fin não conseguiu gerar uma resposta agora.");
  return String(data.answer);
}
