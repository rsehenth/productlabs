# Graph Report - ProductDecisionLab  (2026-11-09)

## Corpus Check
- 152 files · ~72,798 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .woff2 4, (none) 1, .css 1)

## Summary
- 1167 nodes · 3208 edges · 54 communities (49 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- decisions-page.tsx
- routing.ts
- workspace-storage.ts
- Operacoes e modelos de dominio
- demo-dataset.ts
- decision-form.tsx
- Validacao estrutural dos registros
- Contratos auditoria e integridade
- Configuracao TypeScript da aplicacao
- Workspace — Revalidação de integração (Etapa 4A.3a)
- Configuracao dos componentes UI
- interactive-case-page.tsx
- Etapa 4B.4a — Refinamento visual do Decision Workspace (listagem)
- Configuracao TypeScript do Node
- vitest
- Lint e ferramentas de desenvolvimento
- devDependencies
- Dependencias de interface
- import-backup-dialog.tsx
- Configuracao Vite e Vitest
- Comandos do projeto
- Preferencias de engenharia
- decision-detail.tsx
- Etapa 4A.3c — Auditoria de compatibilidade de navegadores
- HTML e entradas da aplicacao
- Referencias TypeScript
- Identidade visual do favicon
- backup.ts
- Etapa 4B.3b — Refinamento dos formulários e interações do Feedback Discovery
- feedbacks-page.tsx
- Etapa 4B.4b — Detalhes, formulário e exportação Markdown
- Etapa 4B.3a — Refinamento visual do Feedback Discovery
- Etapa 4B.5b — Validação funcional do Interactive Product Case
- createWorkspaceSession
- Etapa 4B.4c — Fechamento funcional do Decision Workspace
- WFA-03 — Correção da condição de corrida na leitura de backups
- refinement-4b6b.cjs
- multitab.test.ts
- Etapa 4B.6b.1 — Foco nos formulários
- package.json
- Etapa 4B.1 — Identidade visual, layout global e navegação
- Etapa 4B.2b — Refinamento visual dos detalhes e formulários do Product Analytics
- Etapa 4B.6b.3 — Controles, contraste e diálogos
- Etapa 4B.6a — Componentes globais e acessibilidade
- Button
- Etapa 4B.6b — Acabamento final, acessibilidade e regressão integrada
- use-workspace.ts
- P2-01 — Aviso de backups incompatíveis e orientação de recuperação
- WFA-02 — Consistência das regras de decisão entre formulário e backup
- decisionStatusErrors
- MetricDetailDialog
- Etapa 4B.6b.2 — Mensagens e recuperação de conflitos

## God Nodes (most connected - your core abstractions)
1. `Button()` - 48 edges
2. `react` - 41 edges
3. `cn()` - 39 edges
4. `Notice()` - 38 edges
5. `InteractiveCasePage()` - 32 edges
6. `Dialog()` - 31 edges
7. `vitest` - 29 edges
8. `Badge()` - 29 edges
9. `formatMetricValue()` - 27 edges
10. `Card()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `19. Possíveis regressões` --references--> `ConfirmDialog()`  [INFERRED]
  docs/VISUAL-REFINEMENT-4B3B.md → src/components/ui/confirm-dialog.tsx
- `3. Melhorias implementadas` --references--> `ConfirmDialog()`  [INFERRED]
  docs/VISUAL-REFINEMENT-4B4B.md → src/components/ui/confirm-dialog.tsx
- `11. Acessibilidade` --references--> `Dialog()`  [INFERRED]
  docs/VISUAL-REFINEMENT-4B2B.md → src/components/ui/dialog.tsx
- `18. Limitações restantes` --references--> `Dialog()`  [INFERRED]
  docs/VISUAL-REFINEMENT-4B3B.md → src/components/ui/dialog.tsx
- `16. Acessibilidade` --references--> `Dialog()`  [INFERRED]
  docs/VISUAL-REFINEMENT-4B4B.md → src/components/ui/dialog.tsx

## Import Cycles
- None detected.

## Communities (54 total, 5 thin omitted)

### Community 0 - "decisions-page.tsx"
Cohesion: 0.16
Nodes (19): 8. Estados vazios, 10. Estados vazios, EmptyState(), DecisionsPage(), FormState, PageNotice, IncompatibleDecision, DecisionFilters (+11 more)

### Community 1 - "routing.ts"
Cohesion: 0.11
Nodes (34): 5. Componentes compartilhados refinados, App(), RouteView(), AppHeader(), AppHeaderProps, savedLabel(), storageIndicator(), StorageTone (+26 more)

### Community 2 - "workspace-storage.ts"
Cohesion: 0.18
Nodes (14): WorkspaceProvider(), createEmptyWorkspace(), Migration, migrations, STORAGE_KEY, StoredWorkspace, ValidationIssue, failure() (+6 more)

### Community 3 - "Operacoes e modelos de dominio"
Cohesion: 0.09
Nodes (46): 2. Causa raiz, handleSubmit(), handleSubmit(), handleSubmit(), handleSubmit(), ErrorTarget, focusError(), reportError() (+38 more)

### Community 4 - "demo-dataset.ts"
Cohesion: 0.08
Nodes (46): recharts, DEMO_DATASET, DEMO_DATASET_NOTICE, DEMO_DECISIONS, DEMO_FEEDBACKS, DEMO_METRICS, DEMO_OBSERVATIONS, DEMO_PRODUCT_NAME (+38 more)

### Community 5 - "decision-form.tsx"
Cohesion: 0.12
Nodes (26): 16. Limitações restantes, 18. Preparação para a próxima etapa, 9. Estados de erro, 3. Melhorias realizadas, 14–16. Testes e gates, 3. Problemas reproduzidos e causas, react, Field() (+18 more)

### Community 6 - "Validacao estrutural dos registros"
Cohesion: 0.08
Nodes (46): CASE_SIMULATION_NOTICE, deepFreeze(), allObservations, caseRecordIds, expectDeepFrozen(), feedbackIds, metricIds, periods (+38 more)

### Community 7 - "Contratos auditoria e integridade"
Cohesion: 0.09
Nodes (28): Validated replacement backup contract, DecisionRecord, LocalStorage workspace envelope v1, MetricObservation, ProductMetric, UserFeedback, Four-collection workspace, Workspace data model and contracts (+20 more)

### Community 8 - "Configuracao TypeScript da aplicacao"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 9 - "Workspace — Revalidação de integração (Etapa 4A.3a)"
Cohesion: 0.06
Nodes (33): Jornada integrada, 13. Jornadas no navegador (Playwright/Chromium, build em `vite preview`, duas páginas no mesmo BrowserContext), 14. Evidência de que o WFA-01 não foi reproduzido, 15. Limitações restantes, 16. Riscos de regressão, 17. Preparação para WFA-02, 3. Estratégia técnica, 4. Coordenação entre abas (+25 more)

### Community 10 - "Configuracao dos componentes UI"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 11 - "interactive-case-page.tsx"
Cohesion: 0.05
Nodes (97): react-dom, Badge(), badgeVariants, Card(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+89 more)

### Community 12 - "Etapa 4B.4a — Refinamento visual do Decision Workspace (listagem)"
Cohesion: 0.06
Nodes (35): 10. Acessibilidade, 11–13. Testes e gates, 14. Cenários verificados no navegador, 15. Limitações restantes, 16. Possíveis regressões, 17. Preparação para a 4B.2b, 1. Status final, 2. Problemas visuais identificados (com 7 indicadores de teste) (+27 more)

### Community 13 - "Configuracao TypeScript do Node"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 14 - "vitest"
Cohesion: 0.30
Nodes (13): vitest, fullWorkspace(), relatedWorkspace(), scenario(), relatedWorkspace(), decisionWith(), EMPTY, mixedWorkspace() (+5 more)

### Community 15 - "Lint e ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (10): @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.14.0, typescript-eslint@^8.72.1, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 16 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint@^10.14.0, tailwindcss@^4.3.4, @types/node@^24.19.2, @types/react-dom@^19.3.0, typescript@~6.0.0, vitest@^5.1.0, eslint (+4 more)

### Community 17 - "Dependencias de interface"
Cohesion: 0.13
Nodes (15): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, lucide-react@^1.70.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-slot@^1.5.0, react@^19.3.1, react-dom@^19.3.1 (+7 more)

### Community 18 - "import-backup-dialog.tsx"
Cohesion: 0.11
Nodes (21): 5. Como leituras antigas são invalidadas, 6. Vínculo entre prévia e conteúdo validado, 7. Proteção da confirmação, ImportBackupDialogProps, BackupParseResult, BackupSummary, BackupFileLike, BackupSelectionPhase (+13 more)

### Community 19 - "Configuracao Vite e Vitest"
Cohesion: 0.22
Nodes (6): @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 20 - "Comandos do projeto"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, test, test:watch, typecheck

### Community 22 - "decision-detail.tsx"
Cohesion: 0.15
Nodes (22): BadgeProps, DecisionDetail(), handleExport(), Empty(), ListRow(), LongText(), RecordSection(), DecisionStatusBadge() (+14 more)

### Community 23 - "Etapa 4A.3c — Auditoria de compatibilidade de navegadores"
Cohesion: 0.11
Nodes (18): 10. Erros de console, 11. Problemas encontrados, 12. Classificação, 13. Testes automatizados e quality gates, 14. Limitações não verificadas, 15. Navegadores que podem ser considerados suportados, 16. Riscos para publicação, 17. Recomendação final (+10 more)

### Community 24 - "HTML e entradas da aplicacao"
Cohesion: 0.67
Nodes (3): SVG favicon /favicon.svg, Portuguese dark-mode application HTML, Application module entry /src/main.tsx

### Community 27 - "backup.ts"
Cohesion: 0.21
Nodes (15): BackupFile, createBackup(), DECISION_IMPORT_GUIDANCE, MAX_BACKUP_BYTES, parseBackup(), parseBackupValue(), serializeBackup(), summarize() (+7 more)

### Community 28 - "Etapa 4B.3b — Refinamento dos formulários e interações do Feedback Discovery"
Cohesion: 0.12
Nodes (17): 10. Erros e salvamento, 11. Responsividade, 12. Acessibilidade, 13. Jornada CRUD (navegador, workspace demo local com dados fictícios), 14. Teste entre abas, 15–17. Testes e gates, 18. Limitações restantes, 19. Possíveis regressões (+9 more)

### Community 29 - "feedbacks-page.tsx"
Cohesion: 0.11
Nodes (26): NoticeTone, Select(), FeedbackFormDialog(), todayInput(), FeedbacksPage(), FormState, PageNotice, dateInputToIso() (+18 more)

### Community 30 - "Etapa 4B.4b — Detalhes, formulário e exportação Markdown"
Cohesion: 0.12
Nodes (16): 12. Exclusão, 13. Exportação Markdown, 14. Estados assíncronos, 15. Responsividade, 16. Acessibilidade, 17. Jornadas funcionais (dados fictícios, localStorage semeado), 18. Teste entre abas, 19–20. Quality gates (+8 more)

### Community 31 - "Etapa 4B.3a — Refinamento visual do Feedback Discovery"
Cohesion: 0.12
Nodes (16): 11. Responsividade, 12. Acessibilidade, 13–15. Testes e quality gates, 16. Jornadas no navegador (Playwright, workspace fictício isolado), 17. Limitações restantes, 18. Possíveis regressões, 19. Preparação para a 4B.3b, 1. Status final (+8 more)

### Community 32 - "Etapa 4B.5b — Validação funcional do Interactive Product Case"
Cohesion: 0.06
Nodes (31): 11. Preparação para a 4B.5b, 1. Baseline, 2. Estrutura real do caso, 3. Problemas visuais encontrados, 4. Melhorias, 5. Arquivos modificados, 6. Responsividade e acessibilidade, 7. Isolamento do Workspace (+23 more)

### Community 33 - "createWorkspaceSession"
Cohesion: 0.29
Nodes (11): 1. Causa raiz confirmada, 2. Arquivos modificados, store(), createWorkspaceSession(), commit(), fail(), guarded(), checkExpected() (+3 more)

### Community 34 - "Etapa 4B.4c — Fechamento funcional do Decision Workspace"
Cohesion: 0.11
Nodes (18): 10. Responsividade, 11. Correção semântica da listagem, 12. Arquivos modificados, 13. Testes e gates, 14. Defeitos encontrados, 15. Não executado, 16. Limitações restantes, 17. Recomendação para a 4B.5 (+10 more)

### Community 35 - "WFA-03 — Correção da condição de corrida na leitura de backups"
Cohesion: 0.15
Nodes (12): 10. Typecheck, lint e build, 11. Jornadas em Chromium (Playwright, servidor Vite local), 13. Limitações restantes, 14. Riscos de publicação ainda existentes, 1. Status final, 2. Causa raiz confirmada, 4. Estratégia adotada, 8. Testes adicionados (10) (+4 more)

### Community 36 - "refinement-4b6b.cjs"
Cohesion: 0.21
Nodes (9): assert, button(), { chromium }, createFeedback(), createMetric(), dialog(), go(), submit() (+1 more)

### Community 37 - "multitab.test.ts"
Cohesion: 0.17
Nodes (9): fakeLocks(), memoryStorage(), stored(), twoTabs(), CONFLICT_MESSAGE, LockedResult, LockManagerLike, LOCKS_UNSUPPORTED_MESSAGE (+1 more)

### Community 38 - "Etapa 4B.6b.1 — Foco nos formulários"
Cohesion: 0.29
Nodes (6): Arquivo modificado, Diagnóstico, Etapa 4B.6b.1 — Foco nos formulários, Jornadas em navegador, Limitações, Quality gates

### Community 39 - "package.json"
Cohesion: 0.29
Nodes (6): @types/react@^19.3.0, name, private, type, version, @types/react

### Community 40 - "Etapa 4B.1 — Identidade visual, layout global e navegação"
Cohesion: 0.14
Nodes (13): 14. Validações no navegador (painel embutido, viewport emulado), 15. Limitações restantes, 16. Possíveis regressões, 17. Preparação para a Etapa 4B.2, 1. Status, 2. Problemas visuais identificados, 3. Direção visual adotada, 4. Arquivos modificados (+5 more)

### Community 41 - "Etapa 4B.2b — Refinamento visual dos detalhes e formulários do Product Analytics"
Cohesion: 0.17
Nodes (12): 10. Responsividade, 11. Acessibilidade, 12–14. Testes e gates, 15. Jornadas realizadas no navegador (perfil isolado, dados apagados ao final), 17. Possíveis regressões, 1. Status final, 2. Problemas identificados (inspeção com dados de teste), 3. Melhorias implementadas (+4 more)

### Community 42 - "Etapa 4B.6b.3 — Controles, contraste e diálogos"
Cohesion: 0.20
Nodes (9): Arquivos, testes e gates, Baseline e método, Contraste, Diálogos e teclado, Etapa 4B.6b.3 — Controles, contraste e diálogos, Limitações e próxima etapa, Problemas reproduzidos e correções, Responsividade e jornadas (+1 more)

### Community 43 - "Etapa 4B.6a — Componentes globais e acessibilidade"
Cohesion: 0.18
Nodes (11): 10. Teclado, 12–13. Jornadas, 17. Regressões, 19. Para a 4B.6b, 2. Baseline, 4. Arquivos modificados, 5. PageHeader, 7. Field (+3 more)

### Community 44 - "Button"
Cohesion: 0.12
Nodes (35): 3. Estratégia, 10. Limitações / riscos, 18. Preparação para a 4B.6, 6. Retorno de foco, Baseline e diagnóstico, lucide-react, StaleNotice(), MESSAGES (+27 more)

### Community 45 - "Etapa 4B.6b — Acabamento final, acessibilidade e regressão integrada"
Cohesion: 0.20
Nodes (10): Baseline e método, Bundle e carregamento, Contraste e mensagens, Defeitos reproduzidos e corrigidos, Etapa 4B.6b — Acabamento final, acessibilidade e regressão integrada, Limitações e decisão, Recuperação em duas abas, Responsividade final (+2 more)

### Community 51 - "use-workspace.ts"
Cohesion: 0.18
Nodes (21): DecisionDetailProps, FeedbackFormDialogProps, MetricDetailDialogProps, MetricFormDialogProps, ObservationFormProps, WorkspaceContextValue, DecisionInput, FeedbackInput (+13 more)

### Community 52 - "P2-01 — Aviso de backups incompatíveis e orientação de recuperação"
Cohesion: 0.12
Nodes (15): 10. Testes adicionados (9), 11. Total de testes, 12. Gates, 13. Jornadas no navegador (Chromium, Playwright, Workspace isolado, dados fictícios), 14. Regressões, 15. Limitações, 16. Riscos de publicação, 1. Status final (+7 more)

### Community 53 - "WFA-02 — Consistência das regras de decisão entre formulário e backup"
Cohesion: 0.14
Nodes (13): 12. Jornadas no navegador, 13. Preservação após importação inválida, 14. Compatibilidade com backups anteriores, 15. WFA-01, 16. Limitações, 17. Preparação para WFA-03, 1. Status, 3. Regras efetivas (lidas do código) (+5 more)

### Community 55 - "decisionStatusErrors"
Cohesion: 0.29
Nodes (7): 5. Reutilização das regras do WFA-02, 5–11. Formulário, detalhe, status, hipótese/decisão, alternativas, evidências, critérios, 5. Estratégia, 12. Regressões WFA-01 e WFA-02, 3. Arquivos modificados, findIncompatibleDecisions(), decisionStatusErrors()

### Community 56 - "MetricDetailDialog"
Cohesion: 0.38
Nodes (6): MetricChart, MetricDetailDialog(), closeMetricConfirmation(), closeObservationConfirmation(), handleMetricDelete(), handleObservationDelete()

### Community 57 - "Etapa 4B.6b.2 — Mensagens e recuperação de conflitos"
Cohesion: 0.33
Nodes (5): Etapa 4B.6b.2 — Mensagens e recuperação de conflitos, Jornadas e integridade, Limitações, Testes e gates, Tipos de falha

## Knowledge Gaps
- **13 isolated node(s):** `Taste preference pointer`, `SVG favicon /favicon.svg`, `Application module entry /src/main.tsx`, `Masked blurred ellipse highlights`, `SVG favicon (48 x 46)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 478 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dialog()` connect `Button` to `decision-form.tsx`, `Etapa 4B.6b.1 — Foco nos formulários`, `Etapa 4B.2b — Refinamento visual dos detalhes e formulários do Product Analytics`, `interactive-case-page.tsx`, `MetricDetailDialog`, `Etapa 4B.3b — Refinamento dos formulários e interações do Feedback Discovery`, `feedbacks-page.tsx`, `Etapa 4B.4b — Detalhes, formulário e exportação Markdown`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Notice()` (e.g. with `18. Preparação para a próxima etapa` and `9. Estados de erro`) actually correct?**
  _`Notice()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Taste preference pointer`, `SVG favicon /favicon.svg`, `Application module entry /src/main.tsx` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routing.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11313131313131314 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `decisions-page.tsx`, `routing.ts`, `workspace-storage.ts`, `Operacoes e modelos de dominio`, `demo-dataset.ts`, `decision-form.tsx`, `Validacao estrutural dos registros`, `package.json`, `multitab.test.ts`, `interactive-case-page.tsx`, `devDependencies`, `import-backup-dialog.tsx`, `Configuracao Vite e Vitest`, `backup.ts`, `feedbacks-page.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Operacoes e modelos de dominio` be split into smaller, more focused modules?**
  _Cohesion score 0.09225589225589226 - nodes in this community are weakly interconnected._
- **Why does `Notice()` connect `Button` to `decisions-page.tsx`, `decision-form.tsx`, `interactive-case-page.tsx`, `decision-detail.tsx`, `MetricDetailDialog`, `feedbacks-page.tsx`, `Etapa 4B.3a — Refinamento visual do Feedback Discovery`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._