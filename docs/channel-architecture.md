# Arquitetura futura de canais do FINANZZI

## Objetivo

O WhatsApp deverá ser apenas um adaptador de entrada e saída. A regra financeira não deve viver no WhatsApp, no React, nem em templates de mensagens. App, voz, API e WhatsApp devem transformar a mensagem num mesmo comando de domínio, executado com o mesmo parser, contexto financeiro, autorização, confirmação e persistência.

> App e WhatsApp recebem “gastei 45 no mercado” e devem produzir a mesma interpretação, a mesma confirmação e o mesmo registo.

## Fluxo comum

```text
Canal (App / Voz / WhatsApp / API)
        ↓
Adaptador de canal: autentica, normaliza texto e controla o formato da resposta
        ↓
interpretFinanceMessage()
        ↓
Comando financeiro: registrar lançamento, consultar Fin, contas recorrentes,
assinaturas, saldo, cartão, parcelas, lembretes ou insights
        ↓
Confirmação quando necessário
        ↓
buildTransactionInput() / serviço financeiro confiável
        ↓
Persistência Supabase com user_id derivado da sessão confiável
        ↓
FinanceChannelResponse
        ↓
Renderizador do canal: UI, áudio ou mensagem WhatsApp
```

## Contratos partilhados

A camada `src/lib/channel-engine.ts` contém os contratos agnósticos de canal. `FinanceChannelInput` recebe texto, canal e contexto financeiro. `interpretFinanceMessage()` devolve uma intenção e um `QuickParseResult`. `buildTransactionInput()` converte a interpretação num contrato compatível com `saveTransaction`, incluindo categoria, conta, cartão, tipo, data, parcelas e recorrência.

O parser existente em `src/lib/quick-parse.ts` continua a ser a fonte única de interpretação de linguagem natural. Ele já reconhece valor, tipo, descrição, categoria e cartão; agora também pode reconhecer a conta pelo nome ou banco. O futuro adaptador WhatsApp não deverá criar expressões regulares, categorias ou conversões monetárias próprias.

A persistência continua centralizada em `src/lib/transactions.ts`, incluindo lançamentos simples, recorrências e parcelas. Para bills, assinaturas, lembretes e consultas, o próximo passo será expor comandos equivalentes no mesmo serviço de domínio, sem colocá-los no adaptador WhatsApp.

## Intenções futuras

| Intenção                | Exemplos                              | Resultado comum                                     |
| ----------------------- | ------------------------------------- | --------------------------------------------------- |
| `record_transaction`    | “gastei 45 no mercado”, “recebi 3500” | Draft, confirmação e transação persistida           |
| `create_recurring_bill` | “Netflix 39,90 todo mês”              | Conta recorrente e próximos vencimentos             |
| `list_upcoming_bills`   | “o que vence esta semana?”            | Lista curta de contas e total comprometido          |
| `list_subscriptions`    | “quanto pago em streaming?”           | Total mensal/anual e assinaturas encontradas        |
| `check_purchase`        | “posso gastar 200?”                   | Orientação do Fin com contexto financeiro confiável |
| `list_cards`            | “como estão meus cartões?”            | Limites, faturas e comprometimento                  |
| `list_installments`     | “quanto tenho de parcelas?”           | Total e próximas parcelas                           |
| `query_fin`             | “onde estou gastando demais?”         | Resposta curta do Fin, sem inventar dados           |

Os nomes das intenções pertencem ao domínio. Cada canal apenas escolhe como apresentar a resposta e como pedir confirmação.

## Segurança e identidade

No App, a identidade vem do JWT da sessão Supabase. No futuro WhatsApp, o webhook deverá validar a assinatura do provedor, normalizar o número de origem e resolver esse número para um utilizador FINANZZI no servidor. O `user_id` nunca deve ser aceite no texto recebido, num campo controlado pelo cliente ou num payload não autenticado.

O adaptador WhatsApp não deve receber service role no cliente. O servidor deverá aplicar idempotência por `provider_message_id`, rate limiting, limites de tamanho, proteção contra replay e logs sem conteúdo financeiro sensível. A autorização deve acontecer antes de carregar contas, cartões, transações ou contexto do Fin.

O frontend atual e o futuro WhatsApp devem chamar a mesma lógica confiável para escrita. Enquanto `saveTransaction()` é o escritor usado pelo App, a futura integração deverá expor o mesmo contrato através de uma função server-side/RPC autenticada, sem duplicar inserts no webhook.

## Fin e consultas

O App usa `askFinAI()` para chamar a Edge Function `fin-chat`. Essa função autentica o utilizador, carrega dados com RLS, calcula margem, contas a pagar, parcelas e metas e só depois chama o provider de IA. O futuro canal WhatsApp deve reutilizar essa mesma fronteira confiável, ou extrair o construtor de contexto para um módulo server-side partilhado. Não deve implementar uma segunda versão de “posso gastar?”, saldo ou recomendações.

A resposta do Fin deve ser convertida num `FinanceChannelResponse`. A interface web pode mostrar uma conversa e ações; o WhatsApp poderá enviar texto, botões ou listas; voz poderá sintetizar a mesma resposta. O conteúdo financeiro é o mesmo, apenas a apresentação muda.

## Confirmação e ambiguidades

Lançamentos com confiança suficiente podem seguir para confirmação curta. Mensagens ambíguas devem devolver `confirmation` ou `clarification`, nunca gravar silenciosamente. O formato visual atual “Entendi assim” é um renderizador App da mesma confirmação que futuramente poderá ser apresentada no WhatsApp:

```text
Entendi assim:
Despesa de R$ 399,00
Tênis
4x de R$ 99,75
Nubank

[Registrar] [Editar]
```

A confirmação precisa transportar um identificador temporário e expirar. O webhook não deve confiar num texto “sim” sem associá-lo a um draft criado para o mesmo utilizador e canal.

## Lembretes e eventos futuros

Lembretes de contas, cartões, faturas, parcelas e metas deverão ser produzidos por um único serviço de notificações. O destino será um adaptador configurável: dentro do App, push/inbox; no WhatsApp, mensagem template aprovada pelo provedor; noutros canais, email ou outro destino. O motor deve decidir se o lembrete é útil e evitar bombardear o utilizador; o canal apenas entrega.

## Estado atual e limites desta preparação

Esta etapa não cria WhatsApp, webhook de provedor, credenciais, templates, número telefónico, cron jobs ou migrations. Também não altera Supabase, RLS, Auth, design ou o fluxo de confirmação atual. Foi criada apenas a fronteira de domínio `channel-engine`, o reconhecimento partilhado de conta no parser e esta especificação para que a futura integração seja incremental, segura e sem reconstruir o sistema.
