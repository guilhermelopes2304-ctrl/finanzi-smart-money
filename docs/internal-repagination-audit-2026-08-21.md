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
