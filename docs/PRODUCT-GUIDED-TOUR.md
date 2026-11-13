# Tour guiado "Como funciona"

Fonte de referência permanente do tour. Criado na etapa 4C.4d. Código em `src/features/product-tour/`.

> **Regra permanente de evolução.** Sempre que o Product Decision Lab receber uma nova funcionalidade ou mudança relevante de escopo, este documento e o tour devem ser revisados **na mesma entrega**. Sem essa revisão, a expansão não está documentalmente concluída. Procedimento na seção 12.

## 1. Objetivo do guia

Ensinar a **usar** o produto, não apenas nomear telas. Ao fim, o visitante deve entender: para que serve o produto; como os quatro módulos se relacionam (métricas → feedbacks → hipóteses → alternativas → decisões); quais funcionalidades existem e como executar as principais operações; como as evidências sustentam decisões; como funcionam os dados simulados; os limites de armazenamento e backup; e como explorar sozinho.

## 2. Público e proposta de uso

Visitantes de uma aplicação demonstrativa de Product Management (por exemplo, quem avalia o portfólio), com ou sem dados cadastrados. O tour é opcional, curto (15 etapas) e reiniciável.

## 3. Forma de acionamento

- Botão **Como funciona** no cabeçalho global (`app-header.tsx`), visível em desktop e mobile, com ícone `CircleHelp`.
- O tour **só abre por clique ou teclado no botão**. Nunca abre sozinho, não exige autenticação e não grava preferência alguma.
- Pode ser reiniciado quantas vezes se desejar. Não há chamada na Overview, para evitar redundância com o cabeçalho.

## 4. Arquitetura da implementação

| Arquivo | Papel |
| --- | --- |
| `tour-steps.ts` | Roteiro: blocos, etapas, textos, rotas e `targetId`. Também `nextBlockStart`, `clampStep`, `progressLabel`. **Único lugar a editar para mudar conteúdo.** |
| `tour-layout.ts` | Funções puras: `placePanel` (posição do painel na viewport, evitando cobrir o alvo) e `isUsableBox`. |
| `product-tour.tsx` | Componente: estado em memória, navegação, busca do alvo, destaque, foco e teclado. |
| `tour-*.test.ts` | Testes do roteiro e do layout. |

Decisões:

- **Estado em `useState`** dentro de `ProductTour`, montado em `AppShell` (acima das rotas); sobrevive à navegação. Sem store, sem LocalStorage, sem acesso a `WorkspaceProvider`.
- **Carregamento sob demanda:** `AppShell` importa o componente com `React.lazy` e só o monta quando o tour abre (cerca de 5 kB gzip, fora do bundle de entrada).
- **Navegação:** `window.location.replace(routeHref(rota))` sobre o roteador de hash existente (`useRoute` reage ao `hashchange`). `replace` evita encher o histórico; ao encerrar, a localização inicial é restaurada.
- **Destaque:** elementos reais marcados com `data-tour-id` (seção 6). O componente procura o alvo com `MutationObserver` por no máximo 3 s (as páginas são `lazy`), rola até ele (`scroll-margin-top: 5rem` em `index.css`), mede com `getBoundingClientRect` e acompanha scroll e resize. O painel **nunca espera** o alvo.
- **Sem alvo** (ausente, oculto ou dependente de dados): só a explicação, sem falha.
- **Modal:** `#root` recebe `inert` enquanto o tour está aberto; o painel é renderizado por portal em `document.body`. Assim nada do app é clicável ou focável, nenhum formulário abre por engano e não há conflito com os diálogos Radix.

## 5. Inventário das etapas

Cinco blocos, 15 etapas. Ordem e textos finais estão em `tour-steps.ts`.

| # | Id | Bloco | Rota | Alvo (`data-tour-id`) | Assunto |
| --- | --- | --- | --- | --- | --- |
| 1 | `a1-objetivo` | A | overview | n/d | Objetivo; o tour não altera dados |
| 2 | `a2-fluxo` | A | overview | `app-nav` | Fluxo métricas → decisões; navegação |
| 3 | `a3-workspace-demo` | A | overview | `demo-preview` | Workspace × cenário demonstrativo |
| 4 | `b1-indicadores` | B | overview | `metric-new` | Criar/editar indicadores; unidade e direção |
| 5 | `b2-observacoes` | B | overview | `metric-list` | Observações, gráficos, variação absoluta/relativa |
| 6 | `b3-classificacao` | B | overview | n/d | Favorável/desfavorável; vínculos; exclusão |
| 7 | `c1-registrar` | C | feedbacks | `feedback-new` | Registrar: conteúdo, fonte, categoria, data, indicadores |
| 8 | `c2-filtros` | C | feedbacks | `feedback-filters` | Pesquisa, filtros, edição, exclusão |
| 9 | `c3-evidencia` | C | feedbacks | n/d | Evidência; associação ≠ causalidade |
| 10 | `d1-problema` | D | decisions | `decision-new` | Problema, hipótese, alternativas |
| 11 | `d2-decisao` | D | decisions | n/d | Decisão, critérios, próximos passos, vínculos |
| 12 | `d3-status` | D | decisions | `decision-filters` | Cinco status; Validated manual; Markdown |
| 13 | `e1-caso` | E | interactive-case | `case-progress` | ProfResolve; fases Investigar, Analisar, Decidir |
| 14 | `e2-isolamento` | E | interactive-case | n/d | Memória; sem IA nem avaliação automática |
| 15 | `e3-armazenamento` | E | overview | `local-data` | Armazenamento local, backup JSON, importação; por onde começar |

Controles do painel: título, texto, módulo, progresso ("3 de 15"), **Anterior**, **Próximo** (**Concluir** na última), **Pular bloco** (vai ao primeiro passo do próximo bloco; oculto no bloco E) e **Sair do tour**. Antes de iniciar, se a página atual tem formulário ou campo de texto longo, o painel pede confirmação (seção 10).

## 6. Correspondência entre etapas e funcionalidades reais

| Etapa | Funcionalidade real | Onde |
| --- | --- | --- |
| 2 | Menu lateral e gaveta móvel | `sidebar.tsx` (`app-nav`), `mobile-nav.tsx` |
| 3 | Prévia demonstrativa (só sem indicadores) | `overview-page.tsx` (`demo-preview`) |
| 4 | "Novo indicador", `MetricFormDialog` (unidades e direções de `domain-labels.ts`) | `metric-new` |
| 5 | Lista de indicadores, `MetricDetailDialog` (observações, gráfico, variação) | `metric-list` (só com dados) |
| 6 | `VariationBadge`, listas de vínculos, bloqueio de exclusão com vínculos | `metric-detail-dialog.tsx` |
| 7 | "Novo feedback", `FeedbackFormDialog` | `feedback-new` |
| 8 | Seção "Pesquisa e filtros" (só com feedbacks) | `feedback-filters` |
| 10 | "Nova decisão", `DecisionForm` | `decision-new` |
| 12 | Filtros de decisões (só com decisões); status em `DECISION_STATUS_LABELS`; "Exportar Markdown" no detalhe | `decision-filters` |
| 13 | `CaseProgress` | `case-progress` |
| 15 | Seção "Seus dados no workspace" e botões de backup | `local-data` |

Pontos de destaque atuais: `app-nav`, `demo-preview`, `metric-new`, `metric-list`, `local-data` (Overview); `feedback-new`, `feedback-filters`; `decision-new`, `decision-filters`; `case-progress`.

## 7. Componentes e rotas envolvidos

- Rotas: `overview`, `feedbacks`, `decisions`, `interactive-case`. **Não existe quinta rota.**
- `AppShell` (monta o tour), `AppHeader` (botão), `Sidebar` (`app-nav`) e as quatro páginas (atributos `data-tour-id`).
- Componentes compartilhados: `Button`; tokens de `index.css` (`popover`, `border`, `primary`, `font-display`, `font-mono`).

## 8. Regras de acessibilidade

- Painel `role="dialog"` `aria-modal="true"`, com `aria-labelledby` (título) e `aria-describedby` (texto). O resto do app fica `inert`.
- Foco inicial no título; ordem de tabulação: Anterior, Próximo/Concluir, Pular bloco, Sair do tour. Tab e Shift+Tab circulam só pelo painel.
- Entre etapas, o foco permanece nos botões do painel (se o botão ficar desabilitado, vai à ação principal). Uma região `role="status"` anuncia uma vez "Etapa X de 15: título" a partir da segunda etapa.
- **Escape** encerra. O foco volta ao botão "Como funciona".
- Destaque por contorno amarelo de 2 px (`--color-primary` sobre fundo escuro). A informação não depende só do destaque: o painel descreve o elemento.
- Sem animações, o que atende a movimento reduzido; a rolagem até o alvo é instantânea.
- Botão do cabeçalho com 44 px de altura em telas pequenas.
- Nenhuma interação obrigatória por mouse.

Isto descreve o projeto e o que foi observado em teste; **não é declaração de conformidade WCAG**. Leitor de tela real não foi testado.

Na etapa 4C.5c.1, o painel foi reexecutado em Chromium com teclado e foco: abertura por Enter e Space, foco inicial no título, circulação de Tab e Shift+Tab apenas pelo painel, anúncio de etapa via `role="status"`, Escape e retorno de foco ao acionador. O contraste medido do painel (`popover`/`popover-foreground`, `muted-foreground`, `primary`) e do contorno de destaque atende aos critérios aplicáveis; ver o relatório interno da etapa (não distribuído no repositório). Na etapa 4C.5c.2, **zoom real do navegador em 200% e 400%** foi exercitado em Chromium (21 verificações por nível), por geometria DOM; capturas de tela sob zoom real não são confiáveis. Leitor de tela real e dispositivos físicos permanecem não verificados.

## 9. Comportamento com Workspace vazio ou preenchido

O tour independe dos dados. Alvos que só existem com dados (`metric-list`, `feedback-filters`, `decision-filters`) ou só sem dados (`demo-preview`) são destacados quando presentes; quando ausentes, a etapa aparece só com texto. Nenhum registro é criado para o tour. Os textos das etapas 5 e 8 já avisam que as telas surgem após o cadastro.

## 10. Restrições de segurança e persistência

- Não escreve no LocalStorage, no `WorkspaceProvider`, nos backups ou no Markdown. Nos smokes, o conteúdo de `product-decision-lab:workspace` ficou idêntico antes e depois.
- Não abre formulários, não exclui, não importa e não exporta. Não clica em nada da página.
- Trocar de rota desmonta a página atual. Como isso poderia descartar um rascunho (formulário de decisão, progresso do Interactive Case), o tour pergunta antes: se `main` contém `form` ou `textarea`, mostra "Iniciar o tour?" com Cancelar e Iniciar tour. Cancelar não altera nada.
- Ao encerrar (Concluir, Sair ou Escape), restaura a localização de origem, inclusive parâmetros de URL.
- Sem backend, autenticação, IA, dependências novas ou alteração de Web Locks e de contratos de backup ou Markdown.

## 11. Limitações conhecidas

- No mobile (abaixo de `md`) o menu lateral não existe, então a etapa 2 não tem destaque; o texto explica o botão de menu.
- Alvos muito grandes (a prévia demonstrativa) geram um contorno maior que a tela; o painel pode cobrir parte deles.
- A heurística de confirmação (`form` ou `textarea` em `main`) é aproximada. Progresso do Interactive Case sem textarea visível não seria detectado; hoje o Case sempre exibe o campo de hipótese.
- Os nomes dos status nos textos são estáticos, não lidos de `DECISION_STATUS_LABELS`.
- Não há navegação do detalhe da decisão para o feedback vinculado; o tour não a promete.
- Sem teste com leitor de tela, Firefox ou WebKit. Sem teste automatizado de componente (o projeto não usa jsdom); o comportamento foi verificado em Chromium com Playwright e scripts em `tests/browser/`.

## 12. Procedimento de manutenção

Regra permanente: sempre que o Product Decision Lab receber uma funcionalidade nova ou alteração relevante de escopo, o responsável pela implementação deve revisar, na mesma entrega:

1. `src/features/product-tour/tour-steps.ts`.
2. Este documento (`docs/PRODUCT-GUIDED-TOUR.md`).
3. Pontos `data-tour-id`.
4. Textos do README relacionados à funcionalidade.
5. Testes direcionados do tour.

Ao adicionar ou mudar funcionalidade:

1. Revisar o inventário (seções 5 e 6) e listar o que mudou.
2. Editar `tour-steps.ts` (texto, rota, `targetId`). Manter `Validated` como status manual e não prometer o que a interface não faz.
3. Se um novo elemento precisar de destaque, adicionar `data-tour-id="..."` estável nele (nunca localizar por classe ou texto).
4. Atualizar este documento (inventário, pontos de destaque, histórico da seção 13) e os textos do README que descrevem a funcionalidade.
5. Procurar conteúdo obsoleto: textos que citam botões, status, campos ou limites que mudaram.
6. Rodar `npx vitest run src/features/product-tour src/features/interactive-case`, `npm run typecheck`, `npm run lint`, `npm run build` e um smoke de navegador: abrir, percorrer as etapas em desktop e mobile, Escape e retorno de foco, com Workspace vazio e preenchido.
7. Registrar no relatório da etapa o impacto sobre o tour. Sem impacto: **"Tour revisado: sem alterações necessárias"**.

A contagem "X de N" vem de `TOUR_STEPS`; se o número de etapas mudar, ajuste as seções 2 e 5.

## 13. Histórico do roteiro

| Data | Etapa | Alteração |
| --- | --- | --- |
| 2026-11-10 | 4C.4d | Criação: 15 etapas em 5 blocos, botão no cabeçalho, destaque por `data-tour-id`, confirmação antes de sair de páginas com rascunho. |
| 2026-11-11 | 4C.5c.1 | Verificação de acessibilidade em Chromium (teclado, foco, contraste medido). Nenhuma alteração de roteiro, rota, alvo ou texto. Tour revisado: sem alterações necessárias. |
| 2026-11-13 | 4C.5e.1 | Correção editorial: nota de acessibilidade atualizada — zoom real de 200% e 400% verificado na etapa 4C.5c.2; leitor de tela real e dispositivos físicos seguem não verificados. Roteiro revisado: sem alterações necessárias. |
