import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const SYSTEM = `Você é o Fin, assistente financeiro pessoal do FINANZZI. Responda em português do Brasil, de forma humana, clara, objetiva e inteligente. Use exclusivamente os dados financeiros fornecidos pelo backend e nunca invente valores. Diferencie fatos, cálculos e recomendações. Quando perguntarem quanto podem gastar, use OBRIGATORIAMENTE o campo disponivel_para_gastar calculado pelo sistema; não recalcule usando apenas saldo, renda ou despesas do mês. Se perguntarem por que podem gastar esse valor, explique com os componentes saldo_contas, contas_a_pagar_restantes, parcelas_restantes_no_mes e reserva_mensal_das_metas. Se o valor disponível for positivo, informe o valor exato. Se for zero, explique quais compromissos consumiram o saldo. Se for uma pergunta conceitual, responda normalmente sem inventar dados pessoais. Se houver dados insuficientes, diga exatamente o que falta. Nunca registre lançamentos nesta função; lançamentos são tratados separadamente pelo aplicativo.`;
function brl(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function isoTodaySP() { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Não autenticado");
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "", { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Sessão inválida");
    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) throw new Error("Pergunta vazia");
    if (question.length > 2000) throw new Error("Pergunta muito longa");

    const [profileRes, txRes, accountRes, billRes, goalRes] = await Promise.all([
      supabase.from("profiles").select("monthly_income,main_goal").eq("id", user.id).maybeSingle(),
      supabase.from("transactions").select("amount,type,date,description,category_id,account_id,credit_card_id,installment_total,categories(name)").eq("user_id", user.id).order("date", { ascending: false }).limit(1000),
      supabase.from("accounts").select("id,initial_balance").eq("user_id", user.id),
      supabase.from("bills").select("amount,due_date,status").eq("user_id", user.id),
      supabase.from("goals").select("target_amount,current_amount,deadline").eq("user_id", user.id),
    ]);
    if (profileRes.error) throw new Error("Não foi possível consultar seu perfil financeiro");
    if (txRes.error) throw new Error("Não foi possível consultar seus lançamentos");
    if (accountRes.error) throw new Error("Não foi possível consultar suas contas");
    if (billRes.error) throw new Error("Não foi possível consultar suas contas a pagar");
    if (goalRes.error) throw new Error("Não foi possível consultar suas metas");

    const profile = profileRes.data;
    const rows = txRes.data ?? [];
    const accounts = accountRes.data ?? [];
    const bills = billRes.data ?? [];
    const goals = goalRes.data ?? [];
    const today = isoTodaySP();
    const [year, month] = today.split("-").map(Number);
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const daysLeft = Math.max(1, lastDay - Number(today.slice(8, 10)) + 1);

    const monthRows = rows.filter(t => t.date >= monthStart && t.date <= monthEnd);
    const income = monthRows.filter(t => t.type === "income").reduce((s,t) => s + Number(t.amount || 0), 0);
    const expenses = monthRows.filter(t => t.type === "expense").reduce((s,t) => s + Number(t.amount || 0), 0);
    const referenceIncome = Number(profile?.monthly_income || 0) || income;
    const commitment = referenceIncome > 0 ? Math.round((expenses / referenceIncome) * 100) : null;

    // Mesmo cálculo da tela "Posso gastar?": saldo das contas + movimentos liquidados,
    // excluindo compras de cartão que ainda não saíram da conta.
    const opening = accounts.reduce((s,a) => s + Number(a.initial_balance || 0), 0);
    const settledMovement = rows.reduce((s,t) => {
      if (t.date > today || t.credit_card_id) return s;
      return t.type === "income" ? s + Number(t.amount || 0) : s - Number(t.amount || 0);
    }, 0);
    const balance = opening + settledMovement;

    // Mantém exatamente a mesma regra da tela: compromissos não pagos até o fim do mês,
    // incluindo os que já estão atrasados, também continuam comprometendo o dinheiro.
    const upcomingBills = bills.filter(b => b.status !== "paid" && b.due_date <= monthEnd).reduce((s,b) => s + Number(b.amount || 0), 0);
    const upcomingInstallments = rows.filter(t => t.type === "expense" && t.installment_total && t.installment_total > 1 && t.date > today && t.date <= monthEnd).reduce((s,t) => s + Number(t.amount || 0), 0);
    const goalsReserve = goals.reduce((s,g) => {
      if (!g.deadline) return s;
      const [gy, gm] = String(g.deadline).slice(0,10).split("-").map(Number);
      const monthsLeft = (gy - year) * 12 + (gm - month);
      const remaining = Math.max(0, Number(g.target_amount || 0) - Number(g.current_amount || 0));
      return s + (monthsLeft > 0 ? remaining / monthsLeft : remaining);
    }, 0);
    const availableToSpend = balance - upcomingBills - upcomingInstallments - goalsReserve;
    const perDay = availableToSpend > 0 ? availableToSpend / daysLeft : 0;

    const categoryTotals = new Map<string, number>();
    for (const t of monthRows.filter(t => t.type === "expense")) {
      const category = Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name;
      const name = category || "Outros";
      categoryTotals.set(name, (categoryTotals.get(name) || 0) + Number(t.amount || 0));
    }
    const topCategories = [...categoryTotals.entries()].sort((a,b) => b[1] - a[1]).slice(0,8).map(([name,amount]) => ({ name, amount: brl(amount) }));
    const recentTransactions = rows.slice(0,12).map(t => ({ date:t.date, type:t.type, description:t.description, amount:brl(Number(t.amount || 0)), category:Array.isArray(t.categories) ? t.categories[0]?.name ?? null : t.categories?.name ?? null }));

    const safeContext = JSON.stringify({
      saldo_contas: balance,
      renda_mensal: Number(profile?.monthly_income || 0),
      objetivo_principal: profile?.main_goal || null,
      entradas_mes: income,
      saidas_mes: expenses,
      percentual_da_renda_comprometido: commitment,
      disponivel_para_gastar: Math.max(0, availableToSpend),
      disponivel_por_dia: perDay,
      dias_restantes_no_mes: daysLeft,
      contas_a_pagar_restantes: upcomingBills,
      parcelas_restantes_no_mes: upcomingInstallments,
      reserva_mensal_das_metas: goalsReserve,
      principais_categorias_mes: topCategories,
      ultimos_lancamentos: recentTransactions,
    });
    const prompt = `Pergunta do usuário:\n${question}\n\nContexto financeiro calculado pelo backend para o usuário autenticado:\n${safeContext}`;

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    async function callGateway() {
      if (!lovableKey) throw new Error("sem gateway");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json","Lovable-API-Key":lovableKey,"X-Lovable-AIG-SDK":"fetch"}, body:JSON.stringify({ model:"openai/gpt-5.6-sol", messages:[{role:"system",content:SYSTEM},{role:"user",content:prompt}] }) });
      if (!res.ok) { if(res.status===402) throw new Error("Os créditos de IA do FINANZZI acabaram. Recarregue para continuar conversando com o Fin."); if(res.status===429) throw new Error("Muitas perguntas ao mesmo tempo. Tente novamente."); throw new Error("gateway indisponível"); }
      const data = await res.json(); return String(data?.choices?.[0]?.message?.content ?? "").trim();
    }
    async function callOpenAI() {
      if (!openaiKey) throw new Error("sem openai");
      const res = await fetch("https://api.openai.com/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${openaiKey}`}, body:JSON.stringify({ model:Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini", messages:[{role:"system",content:SYSTEM},{role:"user",content:prompt}] }) });
      if (!res.ok) throw new Error("openai indisponível");
      const data = await res.json(); return String(data?.choices?.[0]?.message?.content ?? "").trim();
    }
    let answer = "";
    try { answer = await callGateway(); } catch (e) { const m = e instanceof Error ? e.message : ""; if (m.startsWith("Os créditos") || m.startsWith("Muitas perguntas")) throw e; answer = await callOpenAI(); }
    if (!answer) throw new Error("A IA não retornou uma resposta");
    return new Response(JSON.stringify({ answer }), { headers:{...cors,"Content-Type":"application/json"} });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    const status = message === "Não autenticado" || message === "Sessão inválida" ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), { status, headers:{...cors,"Content-Type":"application/json"} });
  }
});
