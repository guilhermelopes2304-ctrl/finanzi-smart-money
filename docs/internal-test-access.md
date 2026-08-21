# Acesso interno de teste do FINANZZI

## Conta autorizada

A única conta autorizada é `guilhermelopes2304@gmail.com`. A assinatura dessa conta foi marcada no backend como `provider = internal_test`, `plan = pro` e `status = active`. Não houve pagamento real.

## Como entrar

1. Abrir `https://finanzzi.vercel.app/auth?mode=login`.
2. Entrar normalmente com o e-mail autorizado e a senha já existente.
3. Depois do login, abrir `https://finanzzi.vercel.app/dashboard`.
4. A aplicação deve mostrar a faixa **AMBIENTE DE TESTE · acesso interno sem cobrança real** dentro da área autenticada.

Não existe URL secreta, query parameter, botão público ou bypass no frontend. O acesso é concedido porque o snapshot de billing server-side identifica a assinatura própria como `internal_test`; o guard pago e o RLS continuam ativos.

## Conta normal

Qualquer outro utilizador autenticado sem uma assinatura ativa confirmada continua a ser redirecionado para `/oferta?reason=payment_required` e não consegue ler ou escrever dados financeiros através do RLS.

## Revogação

Para revogar o teste, um administrador deve alterar a assinatura do utilizador no backend para `plan = 'free'`, `status = 'free'` e `provider = NULL`. Não se deve fazer essa alteração pelo browser, pela chave publicável ou por parâmetros da URL.

## Diagnóstico resolvido

Após o deployment `71f4e7c` estar Ready, a sessão persistente usada no navegador ainda foi redirecionada para `/oferta?reason=billing_unavailable`. A causa foi o middleware server-side procurar apenas `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`, embora a Vercel tivesse as variáveis públicas válidas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. O commit `01b946f` passou a aceitar esses nomes como fallback, sem adicionar secrets, alterar RLS ou alterar migrations.

## Validação em produção após `01b946f`

A versão publicada em `https://finanzzi.vercel.app/dashboard` entrou no dashboard autenticado da conta autorizada. Foram confirmados visualmente: faixa superior **AMBIENTE DE TESTE · ACESSO INTERNO SEM COBRANÇA REAL**, indicador lateral **TESTE INTERNO**, navegação autenticada, margem real exibida como **R$ 3,64** e conteúdo da Home simplificada. A rota deixou de redirecionar para `billing_unavailable` depois da correção do middleware.
