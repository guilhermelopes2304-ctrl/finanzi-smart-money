# Pesquisa de gateway — FINANZZI

## Mercado Pago

A documentação oficial de Assinaturas do Mercado Pago afirma que é possível criar uma assinatura pela API definindo a frequência e partilhar um link de pagamento no site ou diretamente com o cliente: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview

## Stripe

A documentação oficial do Stripe Billing descreve assinaturas recorrentes para dar acesso a um produto ou serviço e a geração automática de invoices: https://docs.stripe.com/billing/subscriptions/overview

A página oficial do Stripe sobre pagamentos no Brasil apresenta os métodos e requisitos de aceitação de pagamentos no país: https://stripe.com/resources/more/payments-in-brazil

A documentação oficial do Stripe também tem suporte específico a Pix: https://docs.stripe.com/payments/pix

## Observação

A recomendação final deve ponderar operação no Brasil, recorrência, Pix, checkout hospedado, webhooks, gestão de inadimplência, suporte a cartão e esforço de integração. Nenhum gateway foi integrado nesta etapa; as fontes foram apenas consultadas para a recomendação solicitada.

## Referência comercial analisada: Porquim

A landing pública organiza a jornada em CTA imediato, oferta com preço, garantia, CTA repetido, demonstrações curtas, benefícios em sequência, depoimentos e chamada final. A página enfatiza simplicidade, exemplos de uso e uma promessa entendida rapidamente. Para o FINANZZI, serão reutilizados apenas esses princípios de ritmo comercial, demonstração curta, oferta e CTA; não serão copiados identidade, textos, logo, imagens, componentes, layout ou provas sociais.

A página analisada também apresenta depoimentos, contagem de utilizadores e garantia. O briefing do FINANZZI proíbe inventar esses elementos, portanto serão usados placeholders claramente marcados ou omitidos até existirem dados reais.

Fonte: https://www.oporquim.com.br/

## Comparação confirmada na documentação oficial

O Mercado Pago documenta Assinaturas com periodicidade semanal, mensal ou anual, tentativas automáticas de cobrança, meios de pagamento locais incluindo Pix e boleto, possibilidade de período de teste, link de pagamento e webhooks/notificações. A disponibilidade documentada inclui o Brasil. Fonte: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview

O Stripe documenta o ciclo de vida completo de assinaturas, invoices, retries/dunning, estados `incomplete`, `active`, `past_due`, `canceled` e `unpaid`, além de webhooks para provisionar ou revogar acesso. Fonte: https://docs.stripe.com/billing/subscriptions/overview

A documentação do Stripe para Pix confirma pagamentos em BRL para contas brasileiras, Pix recorrente via Pix Automático como recurso ainda limitado por disponibilidade, e suporte a Checkout/Payment Links/Subscriptions conforme o produto habilitado. Fonte: https://docs.stripe.com/payments/pix

## Recomendação preliminar

Para o primeiro gateway do FINANZZI no Brasil, a recomendação preliminar é **Mercado Pago**, porque o produto precisa de uma assinatura local com checkout/link de pagamento, recorrência mensal/anual, Pix e boleto, e o próprio provedor documenta esses meios e o fluxo de assinatura no Brasil. Stripe permanece uma alternativa forte para uma arquitetura global e um modelo de billing mais sofisticado, mas a disponibilidade de Pix Automático e a operação brasileira devem ser confirmadas na conta comercial antes da escolha definitiva.

Nenhuma integração foi implementada; esta é apenas a recomendação técnica solicitada antes do gateway.

## Auditoria do checkout Hubla fornecido

URL analisada: https://pay.hub.la/7i5nXgo1xTAnq0W9Z9wz?utm_source=LINK_PADRAO

O checkout público analisado identifica o produto como `Porquim I.A - Seu contato inteligente`, mostra preço de referência de R$ 97,00 e oferta parcelada em 12x, apresenta plano de assinatura anual, aceita cartão e Pix, permite cupom e recolhe informações pessoais como país/telefone, nome e documento. Também apresenta order bumps de outros produtos e um segundo acesso. Esses elementos pertencem à oferta Porquim e não serão reutilizados como catálogo FINANZZI.

Para o FINANZZI, o checkout Hubla deve ser configurado na conta do proprietário com produto, preços, periodicidade, URL de retorno, webhook, segredo de assinatura e mapeamento de eventos próprios. O URL fornecido é uma referência de checkout existente, não uma credencial nem uma configuração de integração do FINANZZI. Nenhuma compra foi iniciada e nenhum dado pessoal foi submetido.

## Hubla: webhooks oficiais

A Central de Ajuda oficial da Hubla informa que o vendedor ativa a integração de Webhooks, recebe um token de autenticação e cria regras com URL, produtos/ofertas e eventos selecionados. A própria Hubla recomenda testar eventos, acompanhar o histórico e considerar `200 OK` como sucesso do disparo. A documentação agrupa eventos de membros, assinaturas, faturas, parcelamento inteligente e reembolso; a lista completa é mantida no GitBook de Webhooks.

Fonte: https://help.hub.la/hc/pt-br/webhook-hubla

Implicação para o FINANZZI: o endpoint deve receber o token da Hubla via secret, aceitar somente eventos do produto/oferta configurados, manter idempotência por evento, resolver o comprador pelo e-mail/identificador externo, ativar a assinatura apenas após evento de pagamento/assinatura aprovado e preservar dados em cancelamento/expiração. Nenhum token Hubla está disponível no ambiente, portanto a configuração real da integração não pode ser concluída sem a credencial fornecida pelo proprietário.

## Detalhes técnicos da Hubla

A documentação técnica oficial confirma que cada evento inclui o token único no cabeçalho `x-hubla-token` e um identificador no cabeçalho `x-hubla-idempotency`. A Hubla recomenda ignorar duplicados, não assumir ordem de entrega, usar `version`, `createdAt` e `modifiedAt` para evitar estados antigos, responder rapidamente com 2xx e processar a lógica de forma assíncrona. Os eventos citados incluem `subscription.created`, `invoice.created`, `invoice.status_updated`, `invoice.payment_succeeded`, `subscription.activated` e `customer.member_added`.

Fontes: https://hubla.gitbook.io/docs/webhooks/boas-praticas e https://hubla.gitbook.io/docs/webhooks/introducao

## Payloads Hubla relevantes para o FINANZZI

A documentação de eventos da Hubla confirma eventos `customer.member_added` e `customer.member_removed`, com `event.user.email`, `event.user.id`, `event.user.phone`, `event.subscription.id`, `event.subscription.type`, `event.subscription.status`, `billingCycleMonths`, `credits`, `paymentMethod`, `autoRenew`, `freeTrial`, datas de ativação/inativação/modificação e `version`. Os métodos documentados incluem `credit_card`, `pix` e `bank_slip`. Para faturas, os eventos incluem `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.status_updated`, `invoice.refunded` e outros; o payload contém pagador, e-mail, `invoice.subscriptionId`, status, valor, método de pagamento e datas.

Fontes: https://hubla.gitbook.io/docs/webhooks/eventos.md, https://hubla.gitbook.io/docs/webhooks/eventos/membro.md e https://hubla.gitbook.io/docs/webhooks/eventos/fatura.md

Nota de segurança: os exemplos de payload têm dados fictícios de documentação e não foram usados para criar contas, assinaturas ou dados reais no FINANZZI.
