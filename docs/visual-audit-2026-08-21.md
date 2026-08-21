# Auditoria visual completa do FINANZZI — 21 de agosto de 2026

## Escopo

Esta auditoria cobre a landing, autenticação, onboarding, shell interno, Home, registo rápido, movimentos, compromissos, cartões, objetivos, Fin, inteligência, configurações, billing/paywall, estados vazios, loading, erros, modais, toasts, formulários, temas dark/light e composições desktop/mobile. A referência externa foi usada apenas como referência de simplicidade, demonstração cedo e linguagem de produto de consumo; não serão copiados marca, textos ou layout proprietário.

## Achados visuais confirmados em produção

| Superfície | Evidência | Direção de correção |
|---|---|---|
| Login | O ecrã usa uma composição dividida; a metade esquerda fica muito escura e a direita permanece branca, com pequenos textos de baixa presença e branding ainda ligado ao tema anterior. | Unificar a linguagem com azul/coral, reforçar headline e demonstração pequena do produto, simplificar o painel do formulário e melhorar o contraste secundário. |
| Recuperação de senha | O ecrã é um cartão central genérico, sem a demonstração visual nem a personalidade do FINANZZI; há corpo auxiliar muito claro sobre branco. | Reutilizar o shell de autenticação, incluir Fin/mini-demo, usar tokens comuns e manter um único foco: criar nova senha. |

## Requisitos cromáticos desta etapa

| Token | Uso |
|---|---|
| `#5B5CE2` | Primária, CTAs e estados ativos |
| `#4546C8` | Hover, foco forte e variação de ação |
| `#EEF0FF` | Superfície suave, seleção e chips |
| `#FCFBF7` | Fundo claro principal |
| `#F4F5F8` | Fundo secundário |
| `#151827` | Texto principal |
| `#3F4658` | Texto secundário legível |
| `#667085` | Texto auxiliar/caption |
| `#E4E7EF` | Bordas e divisores |
| `#FF6B6B` | Detalhe coral para erro/atenção, sem dominar a interface |

## Regra de implementação

A alteração é visual e de UX. Não altera banco, RLS, Auth, migrations, checkout, regras financeiras ou integrações reais. O modo dark deve adaptar a mesma identidade azul, com fundos profundos e azuis ajustados; não deve voltar ao verde neon nem simplesmente inverter as cores.

## Landing local após migração azul/coral

A landing local carregou com o hero escuro em azul profundo, headline de alto contraste, CTA primário azul e demonstração cedo. O ritmo de venda continua claro: promessa, conversa, compromissos, cenas, oferta e FAQ. A migração mecânica revelou um ponto de atenção: algumas secções que antes usavam fundo verde neon agora usam azul primário; textos que estavam em verde como kicker ou detalhe precisam de ser ajustados para branco/Deep Ink quando aparecem sobre o próprio fundo azul. A estrutura não apresenta overflow horizontal no viewport desktop testado.

## Autenticação local após a primeira implementação

O login local passou a usar o mesmo produto: marca FINANZZI, demonstração “gastei 45 no mercado”, personagem do Fin, headline orientada à decisão, formulário com foco azul e CTA azul. O shell preserva o alternador dark/light e o fluxo Supabase. A recuperação de senha foi reconstruída com a mesma estrutura e uma ilustração do Fin, mas o screenshot do proxy falhou nessa navegação; será verificada novamente antes da publicação.
