import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `Você é o Fin, assistente financeiro pessoal do FINANZZI. Responda em português do Brasil, com linguagem simples, humana, objetiva e acolhedora. Nunca use respostas genéricas como “sua situação está em atenção” sem explicar o motivo. Use os dados fornecidos para raciocinar e mostre números quando forem relevantes. Não invente dados, saldos, contas ou transações. Diferencie claramente fato (dado recebido) de recomendação. Não dê aconselhamento de investimento, jurídico ou tributário como se fosse profissional. Para uma ação financeira (registrar, alterar ou excluir lançamento), não execute nada nesta função: apenas explique o que seria necessário; ações serão feitas por ferramentas controladas do aplicativo. Se faltarem dados, diga exatamente o que falta e faça uma pergunta curta.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Não autenticado");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Sessão inválida");

    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) throw new Error("Pergunta vazia");
    if (question.length > 2000) throw new Error("Pergunta muito longa");

    const context = body.context && typeof body.context === "object" ? body.context : {};
    const safeContext = JSON.stringify({
      saldo_disponivel: context.balance,
      entradas_periodo: context.income,
      saidas_periodo: context.expenses,
      renda_referencia: context.monthlyIncome,
      percentual_comprometido: context.commitment,
      principais_categorias: Array.isArray(context.topCategories) ? context.topCategories.slice(0, 8) : [],
    });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY não configurada no ambiente do FINANZZI");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        instructions: SYSTEM,
        input: `Pergunta do usuário:\n${question}\n\nContexto financeiro atual do próprio usuário autenticado:\n${safeContext}`,
        max_output_tokens: 500,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI error", response.status, detail);
      throw new Error("Não foi possível consultar a inteligência do Fin agora");
    }

    const data = await response.json();
    const answer = typeof data.output_text === "string" ? data.output_text.trim() : "";
    if (!answer) throw new Error("A IA não retornou uma resposta");

    return new Response(JSON.stringify({ answer, userId: user.id }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    const status = message === "Não autenticado" || message === "Sessão inválida" ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
