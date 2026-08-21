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
