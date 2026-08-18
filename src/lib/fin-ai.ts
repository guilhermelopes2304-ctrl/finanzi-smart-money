import { supabase } from "@/integrations/supabase/client";

export type FinAIContext = {
  balance: number;
  income: number;
  expenses: number;
  monthlyIncome: number;
  commitment: number;
  topCategories: Array<{ name: string; total: number }>;
};

export async function askFinAI(question: string, context: FinAIContext): Promise<string> {
  const { data, error } = await supabase.functions.invoke("fin-chat", {
    body: { question, context },
  });
  if (error) throw new Error("Não consegui falar com a inteligência do Fin agora.");
  if (!data?.answer) throw new Error("O Fin não conseguiu gerar uma resposta agora.");
  return String(data.answer);
}
