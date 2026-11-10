# Etapa 4B.3a — Refinamento visual do Feedback Discovery

## 1. Status final

**APPROVED WITH LIMITATIONS.** Página de listagem refinada e inspecionada em 4 larguras com dados fictícios
(15 e 30 registros) em navegador isolado. Limitações na seção 17.

## 2. Problemas encontrados (antes das alterações)

- **Rolagem horizontal no celular (390 px): a página media 697 px.** Texto longo sem espaços e nomes de
  indicador estouravam o cartão; o texto do feedback era cortado e os botões Editar/Excluir ficavam fora da tela.
- Cada registro era um cartão separado e idêntico, com selo de categoria + selo de fonte + data no topo: os
  metadados competiam com o texto.
- Linhas de texto com ~1100 px em 1440 px (ilegível para leitura longa).
- Resumo com um selo por categoria (6 selos) — ruído.
- Indicadores associados em pílulas amarelas de acento (sugere importância/destaque automático) e rótulos em
  caixa-alta minúscula pouco legíveis.
- Placeholder da busca cortado em 1440 px (4 colunas de filtros).
- Botões "Editar"/"Excluir" sem nome distinto por registro para leitor de tela.
- Sem `h2` na lista (hierarquia h1 → itens).

## 3. Melhorias implementadas

- Lista única (`ul`) em um só contêiner com divisórias, em vez de uma pilha de cartões.
- Cada registro (`article`): coluna de contexto à esquerda (data mono, categoria em texto, fonte em texto
  secundário) e o texto do feedback à direita como citação (filete lateral, 15 px, máx. 68ch). No celular, a
  coluna de contexto vira um cabeçalho acima do texto.
- Categorias e fontes sem selos coloridos; resumo de categorias em texto com contagem mono.
- Indicadores: "Associado a N indicador(es):" ou "Sem indicador associado." (neutro, sem sugerir erro);
  links neutros com borda discreta e unidade em mono; quebram linha em nomes longos. Redação de associação,
  nunca de causa.
- Decisões que citam o feedback: "Citado como evidência em:" (dado e links existentes, preservados).
- Busca ocupa linha inteira; três filtros na linha abaixo (placeholder completo).
- `aria-label` por registro nas ações ("Editar feedback: Defeito de 28/10/2026"); `h2` oculto visualmente
  para a lista; fonte com prefixo `sr-only`.
- `break-words`/`min-w-0` eliminam o estouro horizontal.

## 4. Arquivos modificados

- `src/features/feedbacks/feedbacks-page.tsx` (único arquivo de código)
- `docs/VISUAL-REFINEMENT-4B3A.md` (este relatório)

Sem alterações em componentes globais, tokens, domínio, schemas, persistência, formulários ou testes.

## 5–6. Organização e apresentação

Cabeçalho → resumo (contagem + categorias) → busca e filtros → contagem "Exibindo X de Y" → lista.
O domínio **não possui título** nem campo de expansão: a identificação é categoria + fonte + data, e o texto
é sempre exibido por inteiro (sem truncar). Nenhum campo ou mecanismo foi criado.

## 7. Categorias e fontes

Texto discreto, sem cor por categoria; sem verde/vermelho; o amarelo de identidade não é usado como sinal de
importância. Apenas os valores existentes (`FEEDBACK_CATEGORY_LABELS`, `FEEDBACK_SOURCE_LABELS`).

## 8. Indicadores vinculados

Distinguidos: nenhum / 1 / vários, por texto (não só por cor). IDs, links (`overview?metric=`) e relações
inalterados.

## 9. Busca e filtros existentes

Existem: busca textual, categoria, fonte e indicador. Apenas o layout mudou; `feedback-query.ts`
(lógica, ordenação, combinação) intocado. Filtro de categoria testado no navegador (30 registros → 6 "Defeito").
"Limpar filtros" preservado.

## 10. Estados vazios

Workspace vazio e busca/filtro sem resultados usam o `EmptyState` existente, com textos já distintos
(código inalterado). Busca sem resultados confirmada no navegador ("Nenhum feedback encontrado").
O estado vazio do workspace não foi recapturado visualmente (código não alterado).

## 11. Responsividade

1440, 1280, 768, 390: `scrollWidth` = largura da janela menos a barra de rolagem (sem rolagem horizontal).
Antes, 390 px = 697 px. Texto de 90 caracteres sem espaços e 3 indicadores (um com nome de 65 caracteres)
quebram corretamente em 390 px. Layout em duas colunas a partir de `md` (768).

## 12. Acessibilidade

Estrutura `ul/li/article`; `h1` + `h2` (oculto) da lista; rótulos de busca/filtros preservados; ações com nome
único por registro; informação de fonte e associação em texto. Contraste: metadados usam `muted-foreground`
(token existente, ~7:1 sobre o card). Foco visível vem do estilo global (`outline` com `--color-ring`).
Teste de teclado completo e leitor de tela não foram executados (ver limitações).

## 13–15. Testes e quality gates

- `tsc -b` (typecheck): aprovado.
- `eslint .`: aprovado.
- `vitest run`: **389 testes aprovados (25 arquivos)**.
- `npm run build`: aprovado (`tsc -b` + `vite build`, executado via node direto).

## 16. Jornadas no navegador (Playwright, workspace fictício isolado)

Abrir Feedbacks com 15 registros → verificar metadados e indicadores → busca sem resultados → filtro de
categoria → abrir edição de um registro (texto correto) → cancelar → navegar para Decisions e voltar → recarregar
(30 registros preservados). Criação/salvar/excluir não foram exercitados (4B.3b).

## 17. Limitações restantes

- O dev server via `npx` não iniciou neste ambiente (Node 26); usado `node node_modules/vite/bin/vite.js`. Não
  é problema do projeto.
- Verificação por teclado e leitor de tela não executadas; foco depende dos estilos globais (4B.6).
- `Badge "MVP funcional"` e `PageHeader` são globais/inalterados.
- Foi usada a captura do Playwright; o painel do navegador embutido estava oculto e não renderizava capturas.
- Sem rolagem/paginação para muitos registros (fora do escopo): 30 registros fazem uma lista longa.

## 18. Possíveis regressões

Textos antigos "Indicadores relacionados"/"Usado como evidência" foram reescritos; nenhum teste os referencia
na página de Feedbacks (apenas o Interactive Case, componente separado).

## 19. Preparação para a 4B.3b

Formulário de criação/edição e exclusão intactos para o CRUD completo. Confirmar na 4B.3b: salvar edição,
exclusão com e sem decisões vinculadas, mensagens de `Notice`.
