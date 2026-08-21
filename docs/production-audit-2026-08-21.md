# Auditoria de produção — 2026-08-21

A URL oficial `https://finanzzi.vercel.app/dashboard` abriu com sessão autenticada, mas ainda serve a versão antiga do FINANZZI. A interface observada contém `FIN Score`, navegação `Lançamentos`, o painel antigo com score e a decisão do dia, portanto não corresponde ao código local da nova direção definitiva.

O código local, após validação, já não contém referências a `Fin Score`/`fin_score` e contém a Home simplificada com `O que aconteceu?`, compromissos, compromissos recorrentes e Fin contextual. Esta divergência deve ser tratada no deploy; não é uma falha do código local.

A cadeia frontend do Fin foi lida: `src/lib/fin-ai.ts` chama `supabase.functions.invoke("fin-chat", { body: { question } })`, não contém secrets e propaga erros da função. A Edge Function autentica o JWT, consulta apenas dados com `user_id = auth user`, calcula o contexto financeiro e chama `LOVABLE_API_KEY`, com fallback para `OPENAI_API_KEY`.

A consulta administrativa ao endpoint de secrets do Supabase respondeu HTTP 200 com lista vazia (`[]`), indicando que não existem secrets personalizados configurados. Logo, a Edge Function não tem `LOVABLE_API_KEY` nem `OPENAI_API_KEY` customizados disponíveis para o provider, embora os secrets padrão do Supabase existam.


A tentativa de abrir diretamente `https://vercel.com/gg-hobby/finanzzi` ficou numa página 404 autenticada da Vercel, apesar de a sessão estar ativa. O push foi feito para `main`; a verificação deve continuar pelo painel interno/navegação de Deployments ou pelo domínio de produção, sem criar outro projeto.


Após o segundo push (`3846007`), o domínio de produção iniciou um novo deployment automático. Uma navegação imediata devolveu apenas o título da aplicação e sem elementos detectáveis, com indicação de screenshot transitório indisponível; é necessário aguardar e verificar novamente antes de classificar como falha.


Com `?deploycheck=3846007`, a produção confirmou o commit final: `Você registra. O FINANZZI organiza. E cuida do resto.`, `Você tem R$ ... para gastar hoje`, `O que aconteceu?`, Quick Entry, `Próximos compromissos`, um insight e navegação mobile/desktop com `Lançar`. Não há `Fin Score` na página publicada.


Em produção, a tela Contas confirmou os cinco filtros novos. O Fin abriu como copiloto autenticado e aceitou a pergunta `o que vence esta semana?`; no momento do registo estava em `Analisando seus dados...`, sem qualquer operação de escrita.


O teste real em produção respondeu `Não consegui falar com a inteligência do Fin agora.`. A sessão estava autenticada, o input foi aceite e a Edge Function publicada exigiu JWT; combinado com a lista de secrets customizados vazia e o código que requer `LOVABLE_API_KEY` ou `OPENAI_API_KEY`, o bloqueio é confirmado como ausência de provider configurado no Supabase, não como mock ou erro de RLS.


Relatórios em produção confirmou o momento viral de categoria: card vertical `Descobri para onde meu dinheiro vai`, percentual e categoria agregada, CTA `Compartilhar card`, explicação de que não revela dados sensíveis e preservação do `FIN PRO` para relatórios avançados.


A verificação da raiz oficial foi corrigida para `https://finanzzi.vercel.app/` (dois “z”). Ela confirma a landing nova em produção, com hero do copiloto, simulação pública de margem, benefícios, Fin e CTA. A URL `https://finanzi.vercel.app/` (um “z”) é outro site/template e não pertence ao FINANZZI oficial.
