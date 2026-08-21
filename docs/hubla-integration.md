# Integração Hubla do FINANZZI

## Estado atual

A integração está preparada, mas **não está a cobrar** porque as URLs próprias do FINANZZI ainda não foram configuradas. O checkout fornecido em `pay.hub.la` pertence ao Porquim IA e não é usado pelo FINANZZI.

O fluxo implementado é:

> Landing FINANZZI → checkout Hubla configurado → evento autenticado → criação/localização do utilizador pelo e-mail → assinatura ativa no backend → login e acesso ao aplicativo.

O frontend nunca altera `plan`, `status` ou os identificadores de billing. O guard de `/dashboard` exige uma assinatura `pro` com estado `active` e período válido. O webhook Hubla é a única entrada capaz de ativar ou revogar esse estado.

## Configuração necessária

| Local | Nome | Conteúdo | Sensibilidade |
|---|---|---|---|
| Vercel, ambiente de produção | `VITE_HUBLA_CHECKOUT_MONTHLY_URL` | URL do produto/oferta mensal do FINANZZI na Hubla | URL pública |
| Vercel, ambiente de produção | `VITE_HUBLA_CHECKOUT_ANNUAL_URL` | URL do produto/oferta anual do FINANZZI na Hubla | URL pública |
| Vercel/server runtime | `HUBLA_WEBHOOK_TOKEN` | Token gerado na integração Webhooks da Hubla | Secreto; nunca frontend |
| Vercel/server runtime | `SUPABASE_SERVICE_ROLE_KEY` | Service role do projeto Supabase oficial | Secreto; nunca frontend |
| Vercel/server runtime | `SUPABASE_URL` | `https://qyxkzmviherbatxxidgl.supabase.co` | Não secreto, server-side |

O endpoint a configurar na Hubla é:

`https://finanzzi.vercel.app/api/billing/webhook`

Na Hubla, selecione apenas eventos necessários, como `customer.member_added`, `customer.member_removed`, `subscription.activated`, `subscription.expired`, `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.refunded` e as transições de status necessárias à operação. A Hubla documenta o token no cabeçalho `x-hubla-token` e a idempotência no cabeçalho `x-hubla-idempotency`.

## Segurança

O endpoint aceita o formato HMAC legado apenas para compatibilidade interna e aceita Hubla somente quando o token `x-hubla-token` corresponde ao secret server-side. Cada evento é deduplicado por `x-hubla-idempotency`. O processamento não confia em parâmetros de retorno do checkout nem em dados enviados pelo browser.

Após um evento aprovado, o backend procura o Auth user pelo e-mail. Se não existir, cria-o com confirmação controlada pelo fluxo autenticado do provedor e marca que a pessoa precisa definir a senha. O trigger existente do Supabase cria o perfil, categorias padrão e assinatura inicial. Nenhuma conta financeira é criada automaticamente.

Eventos de falha, cancelamento, expiração, reembolso, chargeback ou remoção de membro revogam apenas o acesso pago; não apagam transações, contas, cartões, metas, parcelas ou outros dados financeiros.

## Order bumps

A arquitetura possui um catálogo vazio de `BILLING_ORDER_BUMPS`. Não há complemento inventado nem vendido agora. Futuramente poderão ser configurados produtos como acesso familiar, planner ou relatório premium, com produto/oferta e webhook próprios.

## Checklist de ativação real

1. Criar na Hubla dois produtos/ofertas FINANZZI, mensal e anual, com os preços aprovados comercialmente.
2. Confirmar Pix, cartão, parcelamento e cupom na própria oferta Hubla.
3. Configurar a URL do webhook e copiar o token para secret server-side.
4. Configurar as duas URLs `VITE_HUBLA_CHECKOUT_*` na Vercel e publicar um novo deployment.
5. Enviar eventos de teste da Hubla e verificar respostas `2xx`, sem ativar dados de um utilizador real.
6. Fazer uma compra real controlada apenas depois de confirmar a oferta, o preço, a política de cancelamento e o fluxo de definição de senha.

## Referências oficiais

[1] [Hubla — Integrações de webhook](https://help.hub.la/hc/pt-br/webhook-hubla)

[2] [Hubla — Introdução a Webhooks](https://hubla.gitbook.io/docs/webhooks/introducao)

[3] [Hubla — Boas práticas](https://hubla.gitbook.io/docs/webhooks/boas-praticas)

[4] [Hubla — Eventos](https://hubla.gitbook.io/docs/webhooks/eventos.md)

[5] [Hubla — Eventos de membro](https://hubla.gitbook.io/docs/webhooks/eventos/membro.md)

[6] [Hubla — Eventos de fatura](https://hubla.gitbook.io/docs/webhooks/eventos/fatura.md)
