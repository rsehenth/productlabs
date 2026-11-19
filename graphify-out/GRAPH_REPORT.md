# Graph Report - ProductDecisionLab  (2026-11-13)

> **NOTA HISTÓRICA (acrescentada em 15/11/2026):** Este relatório é um **snapshot histórico** gerado em **13/11/2026**. A proveniência registrada abaixo aponta para o commit `95519585` (`95519585d183600c946f74c272b650b71d1e132a`), anterior ao HEAD atual — **não é necessariamente uma representação atualizada do HEAD**. Os dados estruturados completos (`graph.json`), o visualizador (`graph.html`) e o manifesto (`manifest.json`) foram **retirados do versionamento futuro** (removidos do índice Git e ignorados, mantidos fisicamente) e **podem continuar sendo utilizados localmente**. Este relatório **não representa uma validação manual integral da arquitetura**.

## Corpus Check
- 151 files · ~92,523 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .woff2 4, (none) 2, .css 1)

## Summary
- 1144 nodes · 3590 edges · 48 communities (42 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95519585`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useLanguage
- decision-form.tsx
- operations.ts
- routing.ts
- validation.ts
- backup.ts
- 4c5d2-performance.cjs
- 4c5c2-responsive.cjs
- 4c5b3a-integrity.cjs
- 4c5d1-compatibility.cjs
- Guia de testes de navegador
- workspace-storage.ts
- 4c5b3b-interactive-tour.cjs
- Tour guiado Como funciona
- compilerOptions
- vitest
- case-metric-view.ts
- package.json
- demo-dataset.ts
- components.json
- Product Decision Lab
- use-workspace.ts
- compilerOptions
- 4c5c1-accessibility.cjs
- multitab.test.ts
- devDependencies
- refinement-4b6b.cjs
- case-decision-view.test.tsx
- case-feedback-view.test.ts
- case-decision-view.ts
- interactive-case-page.test.tsx
- Prontidao da versao atual
- eslint.config.js
- 4c5c2-zoom.cjs
- createWorkspaceSession
- messages.ts
- vite.config.ts
- CaseFeedbackView
- scripts
- Product Decision Lab — prontidão da versão atual
- profresolve-growth-conversion-demo.ts
- Portuguese dark-mode application HTML
- tsconfig.json
- Masked blurred ellipse highlights

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 92 edges
2. `t()` - 60 edges
3. `Button()` - 53 edges
4. `react` - 43 edges
5. `cn()` - 39 edges
6. `Notice()` - 36 edges
7. `InteractiveCasePage()` - 32 edges
8. `vitest` - 31 edges
9. `Tour guiado Como funciona` - 30 edges
10. `formatMetricValue()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `10. Restrições de segurança e persistência` --references--> `WorkspaceProvider()`  [INFERRED]
  docs/PRODUCT-GUIDED-TOUR.md → src/hooks/workspace-provider.tsx
- `7. Componentes e rotas envolvidos` --references--> `Button()`  [INFERRED]
  docs/PRODUCT-GUIDED-TOUR.md → src/components/ui/button.tsx
- `6. Correspondência entre etapas e funcionalidades reais` --references--> `CaseProgress()`  [INFERRED]
  docs/PRODUCT-GUIDED-TOUR.md → src/features/interactive-case/case-progress.tsx
- `6. Correspondência entre etapas e funcionalidades reais` --references--> `VariationBadge()`  [INFERRED]
  docs/PRODUCT-GUIDED-TOUR.md → src/features/overview/metric-card.tsx
- `6. Correspondência entre etapas e funcionalidades reais` --references--> `MetricDetailDialog()`  [INFERRED]
  docs/PRODUCT-GUIDED-TOUR.md → src/features/overview/metric-detail-dialog.tsx

## Import Cycles
- None detected.

## Communities (48 total, 6 thin omitted)

### Community 0 - "useLanguage"
Cohesion: 0.06
Nodes (104): class-variance-authority, lucide-react, react, AppHeaderProps, savedLabel(), storageIndicator(), StorageTone, TONE_CLASS (+96 more)

### Community 1 - "decision-form.tsx"
Cohesion: 0.05
Nodes (77): 6. Correspondência entre etapas e funcionalidades reais, Field(), FieldProps, Input(), Label(), NoticeTone, Select(), Textarea() (+69 more)

### Community 2 - "operations.ts"
Cohesion: 0.07
Nodes (69): BadgeProps, VARIANTS, caseEvidenceCountLabel(), CaseFeedbackMetricRef, CaseMetricRef, IncompatibleDecision, nowIso(), decisionStatusErrors() (+61 more)

### Community 3 - "routing.ts"
Cohesion: 0.08
Nodes (52): 4. Arquitetura da implementação, 7. Componentes e rotas envolvidos, App(), DecisionsPage, FeedbacksPage, InteractiveCasePage, OverviewPage, RouteView() (+44 more)

### Community 4 - "validation.ts"
Cohesion: 0.10
Nodes (41): CASE_SIMULATION_NOTICE, PROFRESOLVE_CASE_ID, allObservations, caseRecordIds, expectDeepFrozen(), feedbackIds, metricIds, periods (+33 more)

### Community 5 - "backup.ts"
Cohesion: 0.09
Nodes (33): download(), ImportBackupDialogProps, backupFileName(), BackupParseResult, BackupSummary, createBackup(), DECISION_IMPORT_GUIDANCE, findIncompatibleDecisions() (+25 more)

### Community 6 - "4c5d2-performance.cjs"
Cohesion: 0.06
Nodes (27): CATEGORIES, fs, h1(), instrumentEvents(), LARGE, largeDataset(), loadRoute(), monthPeriods() (+19 more)

### Community 7 - "4c5c2-responsive.cjs"
Cohesion: 0.20
Nodes (36): assert, auditDialog(), auditLayout(), btn(), buildWorkspace(), chartContained(), check(), { chromium } (+28 more)

### Community 8 - "4c5b3a-integrity.cjs"
Cohesion: 0.11
Nodes (22): addObservation(), assert, button(), { chromium }, closeMetricDetail(), createDecision(), createFeedback(), createMetric() (+14 more)

### Community 9 - "4c5d1-compatibility.cjs"
Cohesion: 0.08
Nodes (25): assert, button(), createMetric(), dialog(), ENGINES, fs, go(), h1() (+17 more)

### Community 10 - "Guia de testes de navegador"
Cohesion: 0.08
Nodes (27): 10. Interpretando PASS, FAIL e BLOCKED, 11. Isolamento dos dados, 12. Resultados e evidências, 13. Restrições e cuidados, 1. Vitest × Playwright, 2. Scripts de navegador existentes, 3. Pré-requisitos, 4. Build de produção e preview (+19 more)

### Community 11 - "workspace-storage.ts"
Cohesion: 0.16
Nodes (18): PERIODS, views, createEmptyWorkspace(), Migration, migrations, SCHEMA_VERSION, STORAGE_KEY, StoredWorkspace (+10 more)

### Community 12 - "4c5b3b-interactive-tour.cjs"
Cohesion: 0.12
Nodes (21): assert, assertClean(), button(), { chromium }, createDecision(), createFeedback(), createMetric(), dialog() (+13 more)

### Community 13 - "Tour guiado Como funciona"
Cohesion: 0.11
Nodes (23): 10. Restrições de segurança e persistência, 11. Limitações conhecidas, 12. Procedimento de manutenção, 13. Histórico do roteiro, 1. Objetivo do guia, 2. Público e proposta de uso, 3. Forma de acionamento, 5. Inventário das etapas (+15 more)

### Community 14 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 15 - "vitest"
Cohesion: 0.29
Nodes (13): vitest, fullWorkspace(), relatedWorkspace(), scenario(), relatedWorkspace(), decisionWith(), EMPTY, mixedWorkspace() (+5 more)

### Community 16 - "case-metric-view.ts"
Cohesion: 0.17
Nodes (20): buildCaseMetricView(), buildCaseMetricViews(), caseDirectionInterpretation(), CaseMetricPoint, selectCaseMetricView(), toMetricObservations(), MetricCardProps, MetricDetailDialogProps (+12 more)

### Community 17 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, lucide-react@^1.70.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-slot@^1.5.0, react@^19.3.1, react-dom@^19.3.1 (+12 more)

### Community 18 - "demo-dataset.ts"
Cohesion: 0.18
Nodes (17): DEMO_DATASET, DEMO_DATASET_NOTICE, DEMO_DECISIONS, DEMO_FEEDBACKS, DEMO_METRICS, DEMO_OBSERVATIONS, DEMO_PRODUCT_NAME, DemoChartPoint (+9 more)

### Community 19 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 20 - "Product Decision Lab"
Cohesion: 0.12
Nodes (19): Browser and lab performance limits, Decision Workspace, Demo readiness with limitations, Evidence driven product loop, Feedback Discovery, React TypeScript Vite UI, Guided tour, Hash routing (+11 more)

### Community 21 - "use-workspace.ts"
Cohesion: 0.26
Nodes (14): FeedbackFormDialogProps, WorkspaceContextValue, BackupFile, MetricDeletion, ObservationInput, OperationResult, BLOCKED, SessionSnapshot (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "4c5c1-accessibility.cjs"
Cohesion: 0.14
Nodes (8): assert, { chromium }, go(), measureContrast(), effectiveBackground(), parse(), openCase(), { test }

### Community 24 - "multitab.test.ts"
Cohesion: 0.17
Nodes (9): fakeLocks(), memoryStorage(), stored(), twoTabs(), CONFLICT_MESSAGE, LockedResult, LockManagerLike, LOCKS_UNSUPPORTED_MESSAGE (+1 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint@^10.14.0, tailwindcss@^4.3.4, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~6.0.0, vitest@^5.1.0 (+6 more)

### Community 26 - "refinement-4b6b.cjs"
Cohesion: 0.23
Nodes (9): assert, button(), { chromium }, createFeedback(), createMetric(), dialog(), go(), submit() (+1 more)

### Community 27 - "case-decision-view.test.tsx"
Cohesion: 0.18
Nodes (12): buildCaseDecisionOptionViews(), CASE_DECISION_REQUIREMENT_MESSAGES, caseDecisionRequirementMessages(), selectCaseDecisionOption(), buildSummary(), FEEDBACK_VIEWS, OPTION_VIEWS, renderOptions() (+4 more)

### Community 28 - "case-feedback-view.test.ts"
Cohesion: 0.18
Nodes (11): addCaseEvidenceId(), filterCaseFeedbackViews(), isCaseFeedbackRelatedToMetric(), removeCaseEvidenceId(), RELATED_TO_CONVERSION, RELATED_TO_ONBOARDING, RELATED_TO_VISITS, views (+3 more)

### Community 29 - "case-decision-view.ts"
Cohesion: 0.21
Nodes (12): buildCaseDecisionSummary(), CASE_HYPOTHESIS_MAX_LENGTH, CASE_HYPOTHESIS_MIN_LENGTH, CaseDecisionFeedbackRef, CaseDecisionMetricRef, caseDecisionMissingRequirements(), CaseDecisionRequirement, CaseFeedbackRef (+4 more)

### Community 30 - "interactive-case-page.test.tsx"
Cohesion: 0.18
Nodes (9): CaseFeedbackAnalysisProps, buildCaseFeedbackViews(), CaseFeedbackFilter, AnalysisOptions, feedbackViews, renderAnalysis(), renderCard(), renderPage() (+1 more)

### Community 31 - "Prontidao da versao atual"
Cohesion: 0.18
Nodes (11): Case and tour UX limits, Commercial production NOT READY, Historical transfer and CLS caveat, Presentation data durability limits, Professional demo READY WITH LIMITATIONS, Prontidao da versao atual, Reported ignored readiness summary, Reported open findings (+3 more)

### Community 32 - "eslint.config.js"
Cohesion: 0.18
Nodes (10): @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.14.0, typescript-eslint@^8.72.1, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 33 - "4c5c2-zoom.cjs"
Cohesion: 0.18
Nodes (6): { chromium }, FACTOR, fs, os, out, path

### Community 34 - "createWorkspaceSession"
Cohesion: 0.27
Nodes (8): WorkspaceProvider(), store(), createWorkspaceSession(), commit(), fail(), guarded(), readRawWorkspace(), withWriteLock()

### Community 35 - "messages.ts"
Cohesion: 0.20
Nodes (9): decisions, EN_MESSAGES, feedbacks, interactiveCase, navigation, overview, productTour, shared (+1 more)

### Community 36 - "vite.config.ts"
Cohesion: 0.22
Nodes (6): @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 37 - "CaseFeedbackView"
Cohesion: 0.22
Nodes (9): CaseDecisionOptionsProps, CaseDecisionSummaryProps, CaseDecisionEvidenceSplit, CaseDecisionOptionView, CaseDecisionSummaryContent, CaseDecisionSummaryInput, CaseEvidenceSummaryProps, CaseFeedbackCardProps (+1 more)

### Community 38 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, preview, test, test:watch, typecheck

### Community 39 - "Product Decision Lab — prontidão da versão atual"
Cohesion: 0.29
Nodes (5): Ações restantes, Limitações e cuidados de apresentação, O que está implementado, Principais resultados de validação, Product Decision Lab — prontidão da versão atual

### Community 40 - "profresolve-growth-conversion-demo.ts"
Cohesion: 0.40
Nodes (3): deepFreeze(), PROFRESOLVE_GROWTH_CONVERSION_CASE, CaseScenario

### Community 41 - "Portuguese dark-mode application HTML"
Cohesion: 0.67
Nodes (3): SVG favicon /favicon.svg, Portuguese dark-mode application HTML, Application module entry /src/main.tsx

## Knowledge Gaps
- **37 isolated node(s):** `SVG favicon /favicon.svg`, `Application module entry /src/main.tsx`, `Masked blurred ellipse highlights`, `SVG favicon (48 x 46)`, `Evidence driven product loop` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `7. Componentes e rotas envolvidos` connect `routing.ts` to `useLanguage`, `Tour guiado Como funciona`, `4c5c2-responsive.cjs`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `useLanguage()` (e.g. with `getLanguage()` and `setLanguage()`) actually correct?**
  _`useLanguage()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SVG favicon /favicon.svg`, `Application module entry /src/main.tsx`, `Masked blurred ellipse highlights` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.060213274498988785 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `useLanguage` to `decision-form.tsx`, `routing.ts`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Should `decision-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053077058719802506 - nodes in this community are weakly interconnected._
- **Why does `feedbacks()` connect `4c5c2-responsive.cjs` to `routing.ts`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._