# Auditoria para repaginação interna do FINANZZI

## Princípios de referência

A referência pública `https://www.oporquim.com.br/` comunica uma proposta de organização financeira por linguagem natural, com baixa fricção, respostas diretas e automação de categorias, alertas e relatórios. A experiência enfatiza que o utilizador pode enviar mensagens curtas como “uber 27” e obter um resultado organizado sem navegar por formulários.

A referência também usa um fluxo de consumo: proposta de valor clara, demonstrações conversacionais, registo por texto/áudio/foto, alertas úteis e organização automática. Estes princípios podem orientar o FINANZZI, mas não devem ser copiados como marca, logo, identidade visual, textos, personagens, ilustrações, layout ou componentes.

## Decisões próprias para o FINANZZI

A experiência interna deve preservar a sequência **Registar → Organizar → Lembrar → Entender → Orientar**, com a Home centrada no campo “O que aconteceu?”, uma margem diária simples, até três compromissos e um único insight relevante. O produto deve manter identidade própria FINANZZI, o modelo pago, o modo de teste interno, Supabase, Auth, RLS, migrations, dados financeiros e integração real do Fin.

## Auditoria inicial do código

As âncoras de maior valor identificadas no projeto são `src/components/finanzzi/AppShell.tsx`, `src/routes/_authenticated/dashboard.tsx`, `src/components/finanzzi/QuickEntry.tsx` e `src/components/finanzzi/FinancialAssistantV2.tsx`. A Home já possui margem diária, Quick Entry, compromissos e um insight. O Quick Entry já usa o motor partilhado `interpretFinanceMessage`, inclui confirmação “Entendi assim” e persiste transações ou contas recorrentes. O AppShell concentra a navegação desktop/mobile, a faixa de teste interno, o diálogo global de lançamento e o widget do Fin.

As rotas existentes incluem Home, lançamentos, contas, cartões, metas, relatórios, inteligência, posso-comprar, configurações e onboarding. A repaginação deverá alterar hierarquia e apresentação sem apagar estas rotas ou as suas operações.

## Auditoria do asset atual do Fin

`public/fin-assistente.png` é uma composição raster de 1536×1024 com uma pessoa humana fotorealista, dashboard de telemóvel, textos promocionais e um pequeno robô genérico. Este asset não deve ser usado como avatar principal na nova experiência. O novo sistema visual precisa de um mascote ilustrado não humano, com silhueta simples, versões pequena/circular/monocromática e expressões reutilizáveis, sem apagar o asset antigo até a substituição ser validada.

## Auditoria do provider do Fin — 21 de agosto de 2026

A Edge Function `fin-chat` autentica o JWT, consulta apenas as tabelas do utilizador autenticado, calcula `disponivel_para_gastar` no backend e chama um provider real (`LOVABLE_API_KEY` quando disponível, caso contrário OpenAI com `OPENAI_API_KEY`). A listagem administrativa de secrets do projeto confirmou `OPENAI_API_KEY`, mas não confirmou `LOVABLE_API_KEY`. A chave OpenAI já tinha devolvido HTTP 401 em produção, portanto respostas abertas da IA continuam dependentes da substituição desse secret no Supabase. A interface agora responde localmente, com dados reais, a margem de compra, próximos compromissos, assinaturas, cartões e parcelas; perguntas abertas continuam a mostrar o erro real do provider, sem mock.
