# Sistema visual interno FINANZZI

## Ideia central

O FINANZZI interno deve parecer um produto de uso diário, não um painel empresarial. A linguagem visual parte de papel quente, verde floresta e acentos lima, com números grandes, texto curto, superfícies calmas e uma única ação principal por vez.

## Paleta

| Função | Direção |
| --- | --- |
| Fundo | Creme quente, próximo de papel, para reduzir o aspecto de software frio. |
| Primária | Verde floresta escuro para confiança, leitura e ações principais. |
| Ação | Lima vivo para confirmar, lançar e destacar uma decisão positiva. |
| Orientação | Dourado discreto para compromissos, metas e atenção. |
| Alerta | Coral/vermelho apenas quando existe risco ou erro real. |

## Tipografia e composição

A tipografia de exibição continua forte e compacta para frases de decisão. A interface usa espaços amplos, poucas bordas, sombras suaves e superfícies sem glassmorphism. O mobile é a referência de composição; o desktop adapta-se com uma coluna de conteúdo confortável e uma navegação lateral enxuta.

## Personagem do Fin

O Fin passa a ser uma criatura ilustrada não humana, com corpo em forma de semente, verde floresta, faixa lima, detalhe dourado e olhos expressivos. O componente `FinMascot` usa expressões semânticas: `normal`, `feliz`, `surpreso`, `pensando`, `atento` e `comemorando`. O mascote aparece como apoio contextual, nunca como interface inteira.

## Regras de uso

O Fin normal aparece no widget e em estados neutros. O Fin feliz confirma registos e pequenas vitórias. O Fin pensando acompanha respostas analíticas. O Fin atento aparece em lembretes e riscos, sem alarmismo. O Fin comemorando acompanha objetivos e progresso. O Fin surpreso pode aparecer em descobertas partilháveis. Nenhum asset expõe renda, saldo ou dados pessoais automaticamente.

## Atualização para a identidade high-tech — 21 de agosto de 2026

A identidade aplicada passou a usar exclusivamente os cinco tokens definidos para a nova fase: `#0A0F1D` como Deep Space Blue e base dominante, `#FFFFFF` para texto de alto contraste, `#94A3B8` para informação secundária, `#39FF14` para CTA, IA, estados positivos e crescimento, e `#1E293B` para superfícies, bordas e divisores. O modo escuro é agora o padrão quando não existe preferência guardada.

A landing foi validada visualmente na pré-visualização local: o hero apresenta fundo Deep Space, headline branca, CTA Neon Lime e uma demonstração de conversa sobre superfície Dark Slate. A linha Deep Space→Lime aparece como sinal visual de IA, sem representar números reais. A oferta mantém checkout e copy existentes, mas com CTA Lime e hierarquia de segurança em Slate.

## Validação de produção — deployment 7db939c

A URL `https://finanzzi.vercel.app/` carregou a nova landing após o deployment Vercel `5ngamUQrNKEACT1uzNEjXEsaPAxT`. O hero mostrou Deep Space Blue, tipografia branca, CTA Neon Lime e demonstração com superfícies Dark Slate. A navegação principal e os CTAs estavam presentes.

A abertura de `/dashboard` redirecionou corretamente para `/auth?mode=login`, indicando que a rota protegida continua a exigir sessão. A validação visual autenticada do dashboard não foi feita nesta passagem porque o navegador conectado não tinha uma sessão ativa disponível.

A sessão autenticada foi validada em `https://finanzzi.vercel.app/dashboard` após ativar o modo dark. O dashboard mostrou fundo `#0A0F1D`, texto branco, navegação em superfícies escuras, CTA lime, faixa `TESTE INTERNO` lime e o hero de margem em Neon Lime. O widget do Fin abriu sobre wrapper Dark Slate/Deep Space, com mascote, links de ação e botão de envio Lime. Os dados financeiros reais e a proteção de rota permaneceram operacionais.
