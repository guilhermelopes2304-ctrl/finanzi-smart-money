# Auditoria de produção — 2026-08-21

A URL oficial `https://finanzzi.vercel.app/dashboard` abriu com sessão autenticada, mas ainda serve a versão antiga do FINANZZI. A interface observada contém `FIN Score`, navegação `Lançamentos`, o painel antigo com score e a decisão do dia, portanto não corresponde ao código local da nova direção definitiva.

O código local, após validação, já não contém referências a `Fin Score`/`fin_score` e contém a Home simplificada com `O que aconteceu?`, compromissos, compromissos recorrentes e Fin contextual. Esta divergência deve ser tratada no deploy; não é uma falha do código local.

A cadeia frontend do Fin foi lida: `src/lib/fin-ai.ts` chama `supabase.functions.invoke("fin-chat", { body: { question } })`, não contém secrets e propaga erros da função. A Edge Function autentica o JWT, consulta apenas dados com `user_id = auth user`, calcula o contexto financeiro e chama `LOVABLE_API_KEY`, com fallback para `OPENAI_API_KEY`.

A consulta administrativa ao endpoint de secrets do Supabase respondeu HTTP 200 com lista vazia (`[]`), indicando que não existem secrets personalizados configurados. Logo, a Edge Function não tem `LOVABLE_API_KEY` nem `OPENAI_API_KEY` customizados disponíveis para o provider, embora os secrets padrão do Supabase existam.
