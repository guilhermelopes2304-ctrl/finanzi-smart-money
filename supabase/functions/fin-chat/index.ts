import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `Você é o Fin, assistente financeiro pessoal do FINANZZI. Responda em português do Brasil, com linguagem simples, humana, objetiva e acolhedora. Nunca use respostas genéricas como “sua situação está em atenção” sem explicar o motivo. Use os dados financeiros fornecidos pelo sistema para raciocinar e mostre números quando forem relevantes. Nunca invente dados, saldos, contas, transações ou valores. Diferencie claramente fatos (dados do sistema) de recomendações. Não dê aconselhamento de investimento, jurídico ou tributário como se fosse profissional. Se faltarem dados, diga exatamente o que falta e faça uma pergunta curta. Você pode analisar, explicar, comparar e orientar, mas não deve afirmar que registrou, alterou ou excluiu uma transação nesta função.`;

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Não autenticado");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: auth } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Sessão inválida");

    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) throw new Error("Pergunta vazia");
    if (question.length > 2000) throw new Error("Pergunta muito longa");

    // O contexto financeiro é calculado no backend usando o JWT do usuário.
    // Nunca confiamos em saldo/entradas/despesas enviados pelo frontend.
    const [{ data: profile, error: profileError }, { data: transactions, error: transactionsError }] = await Promise.all([
      supabase.from("profiles").select("monthly_income,current_balance,main_goal").eq("id", user.id).maybeSingle(),
      supabase.from("transactions")
        .select("amount,type,date,description,category_id,categories(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(100),
    ]);

    if (profileError) throw new Error("Não foi possível consultar seu perfil financeiro");
    if (transactionsError) throw new Error("Não foi possível consultar seus lançamentos");

    const rows = transactions ?? [];
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthRows = rows.filter((t) => {
      const d = new Date(`${t.date}T00:00:00`);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const income = monthRows.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = monthRows.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const referenceIncome = Number(profile?.monthly_income || 0) || income;
    const commitment = referenceIncome > 0 ? Math.round((expenses / referenceIncome) * 100) : null;

    const categoryTotals = new Map<string, number>();
    for (const t of monthRows.filter((row) => row.type === "expense")) {
      const category = Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name;
      const name = category || "Outros";
      categoryTotals.set(name, (categoryTotals.get(name) || 0) + Number(t.amount || 0));
    }
    const topCategories = [...categoryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, amount]) => ({ name, amount: brl(amount) }));

    const recentTransactions = rows.slice(0, 12).map((t) => ({
      date: t.date,
      type: t.type,
      description: t.description,
      amount: brl(Number(t.amount || 0)),
      category: Array.isArray(t.categories) ? t.categories[0]?.name ?? null : t.categories?.name ?? null,
    }));

    const safeContext = JSON.stringify({
      usuario_id: user.id,
      saldo_atual: Number(profile?.current_balance || 0),
      renda_mensal: Number(profile?.monthly_income || 0),
      objetivo_principal: profile?.main_goal || null,
      entradas_mes: income,
      saidas_mes: expenses,
      percentual_da_renda_comprometido: commitment,
      principais_categorias_mes: topCategories,
      ultimos_lancamentos: recentTransactions,
    });

    const prompt = `Pergunta do usuário:\n${question}\n\nDados financeiros atuais, consultados pelo backend para o usuário autenticado:\n${safeContext}`;

    // As chaves ficam SOMENTE no backend (env da função). Nunca vão para o frontend.
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    async function callGateway(): Promise<string> {
      if (!lovableKey) throw new Error("sem gateway");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.6-sol",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("gateway error", res.status, detail);
        if (res.status === 402) throw new Error("Os créditos de IA do FINANZZI acabaram. Recarregue para continuar conversando com o Fin.");
        if (res.status === 429) throw new Error("Muitas perguntas ao mesmo tempo. Tente de novo em alguns segundos.");
        throw new Error("gateway indisponível");
      }
      const data = await res.json();
      return String(data?.choices?.[0]?.message?.content ?? "").trim();
    }

    async function callOpenAI(): Promise<string> {
      if (!openaiKey) throw new Error("sem openai");
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("OpenAI error", res.status, detail);
        throw new Error("openai indisponível");
      }
      const data = await res.json();
      return String(data?.choices?.[0]?.message?.content ?? "").trim();
    }

    let answer = "";
    try {
      answer = await callGateway();
    } catch (gatewayError) {
      const message = gatewayError instanceof Error ? gatewayError.message : "";
      if (message.startsWith("Os créditos") || message.startsWith("Muitas perguntas")) throw gatewayError;
      answer = await callOpenAI();
    }
    if (!answer) throw new Error("A IA não retornou uma resposta");

    return new Response(JSON.stringify({ answer }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    const status = message === "Não autenticado" || message === "Sessão inválida" ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
