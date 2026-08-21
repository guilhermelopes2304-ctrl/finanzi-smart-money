# FINANZZI — Brief operacional do redesign final

## Direção de produto

O FINANZZI deve parecer um produto de consumo financeiro moderno, simples e desejável. A mensagem central é **Você fala. O FINANZZI organiza.** A experiência deve seguir o fluxo: falar, entender, confirmar, resolver. A landing vende através de demonstrações concretas; a aplicação entrega registro, conferência, lembretes, perguntas e decisões sem parecer um dashboard corporativo.

## Identidade visual definitiva

A identidade desta especificação substitui o índigo anterior como cor principal do produto. Tokens obrigatórios:

| Token | Valor | Uso |
|---|---|---|
| Verde principal | `#19C96B` | ações, confirmação e identidade |
| Verde forte | `#0F9F52` | hover, foco e estados fortes |
| Verde suave | `#EAF9F0` | seleção, superfícies e chips |
| Fundo principal | `#FCFCF8` | canvas claro |
| Fundo secundário | `#F4F6F5` | superfícies secundárias |
| Texto principal | `#111827` | títulos e números |
| Texto secundário | `#556070` | descrições e navegação |
| Bordas | `#E1E7E3` | divisores e contornos |
| Branco | `#FFFFFF` | superfícies e texto em verde |
| Coral | `#FF6B6B` | alertas e personalidade, raramente |

Não usar roxo, azul como identidade, verde neon, `#39FF14`, gradientes neon, glow, glassmorphism exagerado ou excesso de sombra.

## Landing e Auth

A landing deve usar headline “Seu dinheiro não precisa dar trabalho.”, subheadline “Você fala o que aconteceu. O FINANZZI organiza e lembra do resto.”, CTA principal “QUERO O FINANZZI” e CTA secundário “VER COMO FUNCIONA”. O primeiro viewport deve mostrar um celular inteiro com uma demonstração autossuficiente de “mercado 82” → “Entendi assim” → “Mercado R$ 82,00” → “Registrar” → “Registrado.” → “Você ainda pode gastar R$ 327 hoje.” As secções devem privilegiar demonstrações curtas, números de impacto, compromissos/assinaturas e momentos com potencial de conteúdo, sem explicação técnica extensa.

Login e cadastro devem pertencer à mesma marca, com poucos elementos, campos claros e mini demonstração de celular. O fluxo comercial permanece Landing → Checkout → Pagamento → Acesso.

## Home interna

A Home não deve parecer dashboard. A ordem recomendada é: saudação curta; “O que aconteceu?” com Quick Entry principal e exemplos “mercado 82”, “uber 27”, “recebi 2500”; “Sua margem hoje” com valor compacto e subtexto curto; “Próximos compromissos” com no máximo três itens; “O FIN percebeu uma coisa” com apenas um insight. A primeira ação deve ser registro e nada secundário deve competir com ela.

A margem deve ser um bloco compacto. Coral só quando baixa; verde quando saudável. Registro deve mostrar “Entendi assim”, permitir “Registrar” ou “Editar” e, após confirmação, mostrar “Registrado.” e opcionalmente a margem restante.

## Áreas internas

Compromissos unifica contas, recorrências, assinaturas, parcelas e vencimentos, com primeira visão “Próximos 7 dias”. Assinaturas mostram totais mensal/anual e um insight de economia. Transações usam timeline simples por dia, sem tabela pesada. Cartões mostram disponível, fatura, vencimento e parcelado, com detalhes sob demanda. Objetivos mostram progresso e texto contextual.

## FIN sem avatar

O FIN continua integrado ao produto, mas não usa personagem, mascote, rosto, avatar ou imagem 3D. Deve ser representado apenas por tipografia, indicadores, mensagens, ícones simples, animações discretas e blocos contextuais. Não deve parecer um chatbot com grande botão flutuante “FIN”.

## Navegação, mobile e qualidade

Sidebar compacta com Início, Lançar, Compromissos, Cartões, Objetivos, FIN e Mais; pode recolher para ícones. Mobile prioritário em 360, 390 e 430 px, com navegação de uma mão: Início, Lançar, Compromissos, FIN e Mais. Padronizar botões, inputs, cards, bordas, sombras, espaçamentos, ícones, tipografia e estados. Corrigir contraste, placeholders, estados ativos, empty states, skeletons, erros humanos e microinterações úteis.

## Preservação e validação

Não alterar Supabase, Auth, RLS, migrations, dados, billing, backend, integrações ou regras financeiras. Validar TypeScript, build, lint dos ficheiros alterados, desktop, mobile, temas claro/escuro, landing, login, cadastro, Home, registro, compromissos, assinaturas, cartões, objetivos, FIN, paywall e checkout. Publicar numa branch de Preview e não fazer merge na `main` sem aprovação.
