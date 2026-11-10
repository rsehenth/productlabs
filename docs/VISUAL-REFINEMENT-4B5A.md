# Etapa 4B.5a — Refinamento visual do Interactive Product Case

**Status final: APPROVED WITH LIMITATIONS**

## 1. Baseline
389 testes aprovados antes de qualquer alteração (confirmado). WFA-01/02/03 e P2-01 intactos; nenhum código de domínio, persistência, dados do cenário ou componente global foi tocado.

## 2. Estrutura real do caso
Página única, sem progressão funcional: não há estado de etapa, pontuação, ramificação ou comparação. `CaseProgress` é um indicador estático (Investigar / Analisar / Decidir, todas "Disponível"). Conteúdo: contexto + pergunta principal, 3 indicadores simulados (cards), investigação visual (gráfico Recharts por indicador), 8 feedbacks fictícios (filtro + seleção como evidência), hipótese (texto livre, mín. 15 caracteres), 3 alternativas (radio) e síntese da decisão. Todo estado é `useState` local; nada é gravado no Workspace.

## 3. Problemas visuais encontrados
- Indicador de etapas minúsculo, sem hierarquia.
- Contexto curto; o problema (`SCENARIO.problem`) e o contexto (`SCENARIO.context`) existiam nos dados, mas não eram exibidos na abertura.
- Evidência, hipótese, alternativa e escolha usavam a mesma aparência (cartões idênticos).
- Valor final do indicador sem destaque nem período junto ao valor.
- Texto de feedback pequeno, sem distinção do restante.

## 4. Melhorias
- **Abertura:** aviso de simulação mantido logo abaixo do título; Contexto em duas colunas (narrativa com largura ~62ch + problema apresentado; pergunta principal em destaque).
- **Etapas:** stepper em grade (3 colunas / empilhado no mobile) com número, rótulo, descrição e "Disponível"; marcadores "Etapa 0X · …" antes de cada fase. Sem links, sem saltos, sem `aria-current`.
- **Rótulos de tipo** (`CaseKindTag`, texto + cor, sem amarelo da marca): Indicador simulado, Evidência qualitativa · relato fictício, Hipótese · explicação ainda não verificada, Alternativa · possibilidades de ação, não evidências, Escolha · dentro do cenário demonstrativo.
- **Métricas:** valor final em mono grande, inicial discreto, período sob cada valor; cards de mesma altura; borda tracejada = simulado.
- **Feedbacks:** texto 15px, largura ≤60ch, filete lateral, borda tracejada, rótulo "relato fictício" (sem autores/datas inventados).
- **Hipótese:** filete violeta (chart-3). **Evidências:** filete azul (chart-2). **Alternativas:** seções separadas por linha.
- **Síntese:** aviso editorial ("não representa uma decisão implementada…") movido para o topo; blocos "Evidências escolhidas (relatos fictícios)" e "Sua hipótese (não verificada)".
- Gráfico: apenas rótulo "Indicador simulado" adicionado; biblioteca, dados e tooltips inalterados.

## 5. Arquivos modificados
`interactive-case-page.tsx`, `case-progress.tsx`, `case-metric-card.tsx`, `case-metric-chart.tsx`, `case-feedback-card.tsx`, `case-evidence-summary.tsx`, `case-hypothesis-editor.tsx`, `case-decision-options.tsx`, `case-decision-summary.tsx`; novo `case-kind-tag.tsx`. Nenhum teste alterado ou adicionado.

## 6. Responsividade e acessibilidade
Verificado no navegador em 1440×900, 1280×800, 768×1024 e 390×844: sem rolagem horizontal (scrollWidth = largura útil), nenhum texto < 11px, aviso e etapa visíveis no mobile. Semântica HTML preservada (headings h1/h2, nav com `aria-label`, fieldset/radio, labels, figcaption do gráfico). Tipo de conteúdo é comunicado por texto, não só por cor. Controles continuam nativos (foco do navegador/Tailwind existente).
Não validado: contraste medido numericamente e navegação completa por Tab (usados controles nativos e tokens existentes).

## 7. Isolamento do Workspace
Workspace de teste criado pela UI (1 indicador). Snapshot de `localStorage['product-decision-lab:workspace']`: 315 bytes, `savedAt 2026-11-07T11:29:02.015Z`. Depois de abrir o caso, selecionar indicador, marcar 2 evidências, escrever hipótese, escolher alternativa, abrir a síntese, redimensionar para 390/768/1280, recarregar e voltar ao Overview: mesmos 315 bytes, mesmo `savedAt`, mesmos contadores (1 métrica, 0 observações/feedbacks/decisões); `sessionStorage` e IndexedDB vazios. Dados de teste removidos ao final.

## 8. Quality gates
Typecheck, ESLint e build aprovados; **389/389 testes aprovados** (25 arquivos).

## 9. Jornadas executadas
Abertura direta pela rota; estados inicial e completo (evidências + hipótese + alternativa + síntese); troca de módulo e retorno; recarga (o caso reinicia, comportamento já existente). Não há etapa final distinta nem retorno a etapa anterior (não existem).

## 10. Limitações / riscos
- Progressão continua puramente indicativa (por decisão de escopo).
- Marcadores "Etapa 02/03" repetem a numeração dos títulos existentes (testes exigem "02 — Analisar…"); redundância leve.
- Inspeção visual feita em capturas de baixa resolução; ajustes finos de espaçamento podem aparecer em revisão humana.
- Pendências globais para a 4B.6 (não corrigidas): `PageHeader` com títulos longos; `Dialog`.

## 11. Preparação para a 4B.5b
Componentes de rótulo (`CaseKindTag`, `CasePhaseMarker`) são locais e reutilizáveis; nenhuma dependência nova.
