# Finanzzi: Your Money Mastered

FINANZZI — INTELIGÊNCIA PARA O SEU DINHEIRO

Crie um aplicativo web SaaS completo chamado FINANZZI.

Slogan oficial:

FINANZZI — Inteligência para o seu dinheiro.

O FINANZZI será um organizador financeiro pessoal moderno, profissional e comercializável.

O objetivo é permitir que qualquer pessoa registre suas receitas, despesas, contas, cartões e metas e receba uma visão clara da própria vida financeira, com análises automáticas e recomendações educativas baseadas nos próprios dados.

IMPORTANTE:

Este projeto deve ser construído como um produto REAL e funcional, não como uma demonstração visual.

Não criar telas falsas.

Não criar botões sem função.

Não deixar funcionalidades importantes como placeholders.

Usar Supabase como backend e banco de dados.

Usar Supabase Auth para autenticação.

Usar RLS (Row Level Security) para proteger os dados.

Cada usuário deve acessar exclusivamente seus próprios dados financeiros.

O sistema deve ser responsivo e funcionar muito bem em celular, tablet e desktop.

Priorizar nesta ordem:

Funcionamento

Banco de dados

Segurança

Autenticação

Funcionalidades financeiras

Experiência mobile

Design

Recursos comerciais

Se alguma funcionalidade avançada ameaçar a estabilidade do sistema, priorize primeiro o funcionamento correto do núcleo financeiro.

==================================================

IDENTIDADE VISUAL
==================================================

Nome:

FINANZZI

Slogan:

Inteligência para o seu dinheiro.

O produto deve transmitir:

confiança

organização

inteligência

simplicidade

crescimento financeiro

modernidade

Criar uma identidade visual premium e profissional.

Usar predominantemente tons de verde como identidade financeira, combinados com branco, cinza e tons neutros.

Não exagerar nas cores.

Interface limpa.

Cards modernos.

Bordas arredondadas.

Sombras suaves.

Tipografia moderna.

Excelente espaçamento.

Microinterações discretas.

O resultado deve parecer um SaaS comercial profissional.

==================================================
2. LANDING PAGE

Criar uma landing page pública antes do login.

Hero:

FINANZZI

Inteligência para o seu dinheiro.

Texto:

"Entenda para onde seu dinheiro está indo, organize seus gastos e tome decisões financeiras melhores."

Botões:

Começar gratuitamente

Entrar

Criar seção de benefícios:

Controle seus gastos

Registre receitas e despesas de forma simples.

Entenda seu dinheiro

Veja exatamente para onde sua renda está indo.

Organize suas contas

Nunca perca de vista seus próximos vencimentos.

Controle seus cartões

Acompanhe limite, faturas e compras parceladas.

Crie metas

Planeje viagens, compras, reservas e outros objetivos.

Receba orientações

O FINANZZI analisa seus dados e mostra oportunidades de melhoria.

Criar seção explicando:

Como funciona

Registre

Organize

Analise

Melhore

CTA final:

Comece a organizar sua vida financeira

==================================================
3. AUTENTICAÇÃO

Implementar autenticação REAL com Supabase Auth.

Criar:

Cadastro

Login

Logout

Recuperação de senha

Sessão persistente

Proteção das páginas privadas

Não criar tabela própria para senhas.

Após cadastro/login:

→ Dashboard.

Criar perfil do usuário.

Campos:

id

nome

email

created_at

updated_at

==================================================
4. PRIMEIRO ACESSO

No primeiro acesso, apresentar uma configuração inicial simples:

"Vamos organizar sua vida financeira."

Perguntar:

Qual sua renda mensal aproximada?

Quanto você possui atualmente?

Qual seu principal objetivo financeiro?

Objetivos:

Organizar minhas finanças

Economizar dinheiro

Criar reserva

Quitar dívidas

Comprar algo

Viajar

Outro

Salvar essas informações no perfil.

Depois direcionar para o Dashboard.

==================================================
5. LAYOUT PRINCIPAL

Criar área autenticada com layout profissional.

Desktop:

Sidebar lateral.

Mobile:

Navegação inferior ou menu responsivo.

Menu:

🏠 Dashboard

💰 Lançamentos

📅 Contas

💳 Cartões

🎯 Metas

📊 Relatórios

🧠 Inteligência

🛍️ Posso comprar?

⚙️ Configurações

Criar botão destacado:

+ Novo lançamento

==================================================
6. DASHBOARD

Criar dashboard completo.

No topo:

Olá, [nome]!

"Veja como está sua vida financeira."

Cards principais:

Saldo disponível

Mostrar saldo calculado.

Receitas

Total de receitas do período.

Despesas

Total de despesas do período.

Comprometido

Percentual da renda comprometida.

Mostrar variação em relação ao mês anterior quando houver dados.

Criar seletor:

Este mês

Mês anterior

Últimos 3 meses

Personalizado

==================================================
7. SAÚDE FINANCEIRA

Criar card:

Como está sua vida financeira?

Classificar automaticamente:

🟢 Saudável

🟡 Atenção

🔴 Crítica

A classificação deve utilizar os dados reais.

Criar explicação simples.

Exemplo:

"Você está gastando 72% da sua renda. Seu nível de comprometimento está dentro de uma faixa controlada."

Não inventar informações.

==================================================
8. GRÁFICOS

Dashboard deve possuir:

Receitas x Despesas

Gráfico mensal.

Gastos por categoria

Gráfico de distribuição.

Evolução do saldo

Gráfico de evolução.

Os gráficos devem ser responsivos.

Se não houver dados:

Mostrar estado vazio amigável.

==================================================
9. LANÇAMENTOS

Criar CRUD COMPLETO.

Página:

Lançamentos

Permitir:

criar

editar

excluir

visualizar

pesquisar

filtrar

ordenar

Tipos:

Receita

Despesa

Campos:

descrição

valor

tipo

categoria

data

conta

cartão

forma de pagamento

observação

recorrente

parcelado

Formas de pagamento:

Dinheiro

Pix

Débito

Crédito

Transferência

Outro

Valores em formato brasileiro:

R$ 1.234,56

Datas:

DD/MM/AAAA

==================================================
10. PARCELAMENTOS

Implementar sistema real de parcelas.

Exemplo:

Compra:

R$ 1.200

12 parcelas

Gerar:

100,00 — 1/12
100,00 — 2/12
100,00 — 3/12
...
100,00 — 12/12

Cada parcela deve possuir sua data correta.

As parcelas futuras devem aparecer nos respectivos meses.

Permitir visualizar:

"Parcela 3 de 12"

==================================================
11. CATEGORIAS

Criar categorias padrão:

Alimentação

Moradia

Transporte

Saúde

Educação

Lazer

Compras

Assinaturas

Contas

Impostos

Viagens

Dívidas

Outros

Permitir categorias personalizadas.

Cada usuário pode criar, editar e excluir suas próprias categorias.

==================================================
12. CONTAS FINANCEIRAS

Criar módulo:

Minhas contas

Tipos:

Conta corrente

Poupança

Conta digital

Carteira

Dinheiro

Outro

Campos:

nome

banco

tipo

saldo inicial

Mostrar:

Saldo atual.

Permitir:

criar

editar

excluir

O saldo deve ser atualizado conforme receitas e despesas.

==================================================
13. CARTÕES

Criar módulo completo:

Meus cartões

Campos:

nome

banco

limite

dia de fechamento

dia de vencimento

Mostrar:

limite total

limite utilizado

limite disponível

fatura atual

Permitir cadastrar compras.

Compras parceladas devem refletir corretamente nas futuras faturas.

Criar página detalhada do cartão.

==================================================
14. CONTAS A PAGAR

Criar módulo:

Contas

Campos:

descrição

valor

vencimento

categoria

conta

recorrência

status

observação

Status:

Pendente

Pago

Atrasado

Criar filtros:

Todas

Pendentes

Pagas

Atrasadas

Criar:

Próximos 7 dias

Próximos 30 dias

Permitir marcar conta como paga.

==================================================
15. CONTAS RECORRENTES

Permitir cadastrar despesas recorrentes.

Exemplos:

Aluguel

Internet

Netflix

Academia

Telefone

Criar automaticamente os próximos lançamentos conforme a recorrência.

Permitir:

mensal

semanal

anual

==================================================
16. METAS FINANCEIRAS

Criar módulo:

Metas

Campos:

nome

objetivo

valor alvo

valor atual

prazo

descrição

Exemplos:

Reserva de emergência

Viagem

Carro

Casa

Quitar dívidas

Curso

Criar barra de progresso.

Mostrar:

Valor atual

Valor restante

Percentual

Prazo

Calcular quanto o usuário precisa economizar por mês para alcançar a meta.

==================================================
17. RELATÓRIOS

Criar página:

Relatórios

Filtros:

período

categoria

tipo

conta

cartão

Mostrar:

total de receitas

total de despesas

saldo

gastos por categoria

evolução mensal

maiores gastos

comparação com período anterior

Criar gráficos profissionais.

==================================================
18. INTELIGÊNCIA FINANZZI

Criar página:

Inteligência Finanzzi

Esta página deve analisar automaticamente os dados reais cadastrados.

Criar:

Diagnóstico financeiro

Exemplo:

"Você recebeu R$ 5.000 este mês."

"Suas despesas foram R$ 3.900."

"Você terminou o mês com R$ 1.100 de saldo."

Principais gastos

Mostrar categorias com maior impacto.

Comparação

Comparar com mês anterior.

Oportunidades

Encontrar possíveis economias.

Próximas ações

Mostrar até 3 recomendações práticas.

Exemplo:

"Seus gastos com alimentação aumentaram 18%."

"Reduzindo R$ 150 por mês nessa categoria, você poderá economizar R$ 1.800 em um ano."

IMPORTANTE:

Todas as informações devem ser calculadas a partir dos dados reais do usuário.

Não inventar valores.

Não apresentar diagnósticos médicos, jurídicos ou aconselhamento financeiro profissional.

Tratar as recomendações como orientação educativa para organização financeira.

==================================================
19. "POSSO COMPRAR?"

Criar uma ferramenta especial:

🛍️ Posso comprar?

Usuário informa:

o que deseja comprar

valor

quantidade de parcelas

O sistema analisa:

renda mensal

despesas

parcelas atuais

contas futuras

saldo

comprometimento mensal

Resultado:

🟢 Compra confortável

🟡 Compra exige atenção

🔴 Compra não recomendada

Mostrar explicação.

Exemplo:

"Essa compra adicionaria R$ 250 por mês ao seu orçamento."

"Você já possui R$ 1.850 em compromissos parcelados."

"Considerando seus compromissos atuais, essa compra merece cautela."

Não garantir que uma compra é financeiramente segura. Utilizar os dados apenas como ferramenta educativa.

==================================================
20. BANCO DE DADOS SUPABASE

Criar estrutura adequada com tabelas:

profiles

accounts

categories

transactions

credit_cards

credit_card_purchases

bills

goals

Criar relacionamentos.

Usar UUID.

Criar:

created_at

updated_at

quando apropriado.

Toda informação financeira deve estar vinculada ao usuário.

==================================================
21. RLS

ATENÇÃO:

Ativar Row Level Security em TODAS as tabelas.

Cada usuário somente pode:

SELECT seus dados

INSERT seus dados

UPDATE seus dados

DELETE seus dados

Usar auth.uid() nas policies.

Nunca permitir que um usuário consulte dados de outro usuário.

==================================================
22. SEGURANÇA

Nunca colocar:

service_role key

senhas

secrets

no frontend.

Utilizar somente variáveis públicas apropriadas.

Validar operações no banco.

Não confiar apenas na interface para segurança.

==================================================
23. RESPONSIVIDADE

Mobile-first.

No celular:

botões grandes

formulários confortáveis

cards adaptáveis

tabelas transformadas em cards quando necessário

gráficos responsivos

navegação inferior

botão de novo lançamento acessível

Desktop:

sidebar

grids

gráficos lado a lado

melhor aproveitamento da tela

==================================================
24. UX

Criar:

loading states

skeletons quando apropriado

toasts

mensagens de erro

mensagens de sucesso

confirmação antes de excluir

estados vazios

Exemplo:

"Você ainda não possui lançamentos."

"Adicione seu primeiro lançamento para começar a entender seu dinheiro."

==================================================
25. CONFIGURAÇÕES

Criar:

Configurações

Permitir:

alterar nome

visualizar email

alterar senha

preferências

sair

Criar seção:

Minha conta

==================================================
26. ARQUITETURA

Organizar o código profissionalmente.

Separar:

components

pages

services

types

hooks

lib

Não duplicar lógica.

Utilizar TypeScript.

Evitar any.

Criar componentes reutilizáveis.

Manter código limpo.

==================================================
27. PREPARAÇÃO PARA MONETIZAÇÃO

Preparar arquitetura para futuramente possuir:

Plano gratuito

Plano PRO

Plano PREMIUM

Assinaturas

Pagamentos

Limites de funcionalidades

IMPORTANTE:

Não implementar gateway de pagamento agora se isso comprometer o MVP.

A arquitetura deve permitir adicionar pagamentos posteriormente.

==================================================
28. PLANO GRATUITO FUTURO

Preparar a estrutura para futuramente limitar:

Lançamentos

Metas

Cartões

Relatórios

Recursos inteligentes

Não bloquear funcionalidades no MVP atual.

==================================================
29. IA FUTURA

Não adicionar API paga de IA neste momento.

A Inteligência Finanzzi inicial deve funcionar utilizando regras, cálculos e análise dos dados reais.

Organizar o código de forma que futuramente seja possível adicionar uma API de IA.

==================================================
30. DESIGN FINAL

O aplicativo deve parecer um produto comercial real.

Evitar:

visual genérico de template

excesso de cores

telas vazias

textos técnicos

aparência de sistema administrativo antigo

Criar sensação de:

"Meu dinheiro está organizado."

Usar linguagem simples e amigável.

Exemplos:

"Você está indo bem."

"Vamos melhorar esse resultado?"

"Seu maior gasto este mês foi..."

"Você está próximo da sua meta!"

==================================================
31. CHECKLIST FINAL

Antes de considerar o projeto concluído:

✓ Autenticação funcionando

✓ Cadastro funcionando

✓ Login funcionando

✓ Logout funcionando

✓ Recuperação de senha funcionando

✓ Dashboard funcionando

✓ Receitas funcionando

✓ Despesas funcionando

✓ Categorias funcionando

✓ Contas funcionando

✓ Cartões funcionando

✓ Parcelamentos funcionando

✓ Contas a pagar funcionando

✓ Metas funcionando

✓ Relatórios funcionando

✓ Inteligência Finanzzi funcionando

✓ Posso comprar funcionando

✓ RLS funcionando

✓ Usuários isolados corretamente

✓ CRUD funcionando

✓ Responsividade funcionando

✓ Sem erros TypeScript

✓ Sem imports quebrados

✓ Sem botões falsos

✓ Sem dados fictícios permanentes

✓ Sem secrets expostos

✓ Landing page funcionando

✓ Navegação funcionando

✓ Estados vazios funcionando

✓ Mensagens de erro funcionando

✓ Mensagens de sucesso funcionando

==================================================
32. REGRA MAIS IMPORTANTE

Não entregue apenas uma interface bonita.

ENTREGUE UM APLICATIVO FUNCIONAL.

Se precisar escolher entre adicionar mais funcionalidades ou garantir que as funcionalidades principais estejam funcionando perfeitamente, escolha funcionamento.

O resultado final deve ser o:

FINANZZI

Inteligência para o seu dinheiro.

Um organizador financeiro pessoal moderno, seguro, responsivo e preparado para se tornar um produto SaaS comercial.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://finanzi-smart-money.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a4c4c0ad-bc7e-4a55-8791-2bac8f362776).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
