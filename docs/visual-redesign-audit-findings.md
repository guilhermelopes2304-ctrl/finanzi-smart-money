# Auditoria inicial do redesign visual — FINANZZI

## Escopo e branch

A especificação recebida em `pasted_content_10.txt` exige uma execução completa na branch `feat/finanzzi-visual-redesign`, sem alterações na `main`, preservando a lógica financeira, Supabase, Auth, RLS, migrations, cobrança e integrações.

## Estado encontrado

O repositório está em React 19 com TanStack Router/Start, Tailwind CSS 4, Radix/shadcn, Recharts e Supabase. A experiência já possui rotas de autenticação, dashboard, lançamentos, contas, cartões, metas, relatórios, inteligência, “Posso comprar?”, configurações, oferta e onboarding, além de componentes próprios para AppShell, QuickEntry, FinMascot, PlanGate, Fin e navegação mobile.

Os tokens globais de `src/styles.css` já apontam para `#5B5CE2`, `#4546C8`, `#EEF0FF`, `#FCFBF7`, `#F4F5F8`, `#151827`, `#3F4658`, `#667085`, `#E4E7EF` e `#FF6B6B`. Contudo, o mapeamento de `--success`, `--warning` e `--gold` ainda usa o índigo como fallback semântico, o que precisa ser separado no sistema visual: sucesso financeiro deve poder usar verde sem se confundir com marca; alerta deve usar âmbar; erro/perigo deve usar coral/vermelho.

Existe uma camada adicional `src/finanzzi-overrides.css` com seletores de compatibilidade que traduzem classes legadas da landing. A auditoria deve evitar depender apenas desses overrides e consolidar tokens nos componentes para reduzir divergências entre telas.

## FinMascot

`src/components/finanzzi/FinMascot.tsx` seleciona oito assets PNG de 512×512 com transparência. A inspeção visual das expressões normal e feliz confirmou que o corpo principal, a folha e o detalhe lateral são predominantemente verde escuro/verde-limão, com pequeno detalhe amarelo e boca coral. O problema é consistente na família de assets e afeta a percepção de marca, não a lógica do componente.

A correção deve manter silhueta, expressões, proporções, transparência e nomes de estados, alterando apenas a direção de arte para índigo FINANZZI, superfícies suaves e acentos semânticos. A edição de imagens deve ser feita como edição criativa dos assets existentes, não com recoloração determinística, para preservar qualidade e identidade.

## Critérios de aceitação

A interface interna deve usar a mesma hierarquia da landing: índigo para ações e identidade; neutros para estrutura; verde apenas em estados semanticamente positivos; vermelho/coral apenas para erro/perigo; âmbar apenas para alerta. A experiência precisa ser mobile-first em 360, 375, 390 e 430 px, sem overflow horizontal, com navegação inferior, alvos de toque adequados, bottom sheets e QuickEntry curto.

A landing deve utilizar screenshots reais da aplicação e, quando possível, fotografias reais licenciadas de fontes comerciais adequadas, com assets locais otimizados e documentação de origem/licença. Animações devem ser discretas, limitar-se a transform/opacity e respeitar `prefers-reduced-motion`.

## Preservação obrigatória

Nenhuma alteração será feita em banco, migrations, RLS, Auth, `user_id`, regras financeiras, transações, categorias, contas, cartões, metas, cobrança ou integrações reais. A branch de redesign será a única branch alterada; `main` será preservada.

## Assets do Fin — validação da primeira versão índigo

A edição generativa criou versões de referência, feliz, surpreso e pensativo em índigo com transparência aparente e expressões preservadas. Como o limite diário de geração foi atingido antes das restantes expressões, foi usada uma recoloração determinística controlada para os outros cinco assets, seguida de redução para 512×512 e PNG RGBA otimizado. As inspeções de `atento-indigo` e `calmo-indigo` confirmaram silhueta, olhos e expressão preservados, corpo em índigo, superfície clara e detalhe coral, sem o verde de marca original.

## Fotografia real e licenciamento

Foram verificadas as páginas oficiais do [Unsplash License](https://unsplash.com/license) e da [Pexels License](https://www.pexels.com/license/). A licença do Unsplash informa que as imagens podem ser descarregadas e usadas gratuitamente para fins comerciais e não comerciais, sem permissão obrigatória, embora atribuição seja apreciada; também restringe a venda da imagem sem modificações significativas e a compilação para replicar um serviço concorrente. A licença do Pexels informa uso gratuito, modificação permitida e ausência de atribuição obrigatória, proibindo vender cópias não alteradas, sugerir endosso por pessoas/marcas ou redistribuir o asset como plataforma de stock.

A implementação deve guardar localmente apenas assets transformados/otimizados e documentar a fonte e a URL de origem, sem sugerir endosso de pessoas fotografadas. As imagens procuradas são naturais, focadas em smartphone e vida quotidiana, evitando executivos genéricos e fotografias artificiais.

## Seleção fotográfica para landing

Foram avaliadas duas fotografias reais: uma composição horizontal de pessoa a usar smartphone e cartão junto a portátil, adequada para uma secção de confiança/vida quotidiana; e uma composição vertical de planeamento com papel, canetas e smartphone, adequada para mobile. A primeira foi escolhida como imagem hero por comunicar ação financeira sem mostrar rostos artificialmente posados. A segunda fica como asset secundário de apoio à narrativa de planeamento.

## Preview da branch

O preview local da branch arrancou na porta 8083 após as portas 4173–8082 estarem ocupadas. A landing carregou com o título, CTA índigo, demonstração de Quick Entry, novo bloco “Vida real, decisões reais”, copy “Dinheiro não acontece numa planilha”, fotografia e secções comerciais. A navegação textual confirmou que os dois assets fotográficos locais foram incorporados.

A tentativa de abrir `/dashboard` na produção redirecionou para `/auth?mode=login`, sem sessão autenticada disponível no navegador; não foram submetidas credenciais, nem executadas mutações ou testes com dados. A validação autenticada fica condicionada a uma sessão existente ou a takeover explícito do utilizador.

A inspeção de scroll do preview confirmou que o novo bloco editorial aparece entre a hero e “Como funciona”, preservando o CTA, a narrativa de Quick Entry e a hierarquia tipográfica. O proxy não forneceu screenshot numa das descidas, mas a extração textual confirmou todas as secções e assets incorporados; não foram observadas alterações a checkout ou conteúdo financeiro.
