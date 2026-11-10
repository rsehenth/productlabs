# Etapa 4B.6b.1 — Foco nos formulários

## Diagnóstico

O baseline desta execução já contém `useFormErrors`: após a renderização dos erros, o hook foca o primeiro controle inválido, o aviso geral ou o botão de atualização do workspace. Os quatro envios inválidos foram reproduzidos em Chromium, mas nenhum terminou com foco no `body`. Portanto, não foi possível confirmar a causa histórica do sintoma registrado na 4B.6a ou atribuir sua correção a esta etapa. O diálogo compartilhado permanece responsável pelo retorno de foco ao fechar.

Foi encontrada outra perda de foco na jornada solicitada: ao salvar uma decisão válida, o formulário e seu botão são desmontados, e o foco terminava no `body`. A página agora foca o `main` persistente antes de trocar o formulário pelo detalhe. A mesma transição atende criação e edição, sem alterar o salvamento.

## Arquivo modificado

- `src/features/decisions/decisions-page.tsx`: foco no `main` ao concluir o salvamento de uma decisão.
- Os quatro formulários, o hook de erros e o `Dialog` foram inspecionados; não houve mudança neles.

## Jornadas em navegador

Chromium via Playwright, com contextos isolados e dados fictícios. As leituras de foco foram feitas após a resposta da operação ou a mudança correspondente na interface.

| Jornada | Resultado e elemento ativo |
| --- | --- |
| Indicador inválido | Diálogo aberto; `#metric-name`; descrição digitada preservada. Tab avançou para `#metric-description`. |
| Indicador corrigido e salvo | Detalhe aberto; botão Fechar do diálogo. Reabertura do formulário: `#metric-name`. |
| Observação inválida | Editor aberto; `#observation-value`. Tab avançou para Cancelar. |
| Observação corrigida e salva | Editor fechado; botão Adicionar observação. |
| Feedback inválido | Diálogo aberto; `#feedback-content`. |
| Feedback corrigido e salvo | Diálogo fechado; botão Novo feedback. Reabertura: `#feedback-content`. |
| Decisão inválida | Formulário aberto; `#decision-title`; problema digitado preservado. |
| Decisão corrigida e salva | Antes: `body`. Depois: `main`; detalhe exibido. Reabertura em edição: `#decision-title`. |
| Falha de persistência simulada no feedback | Aviso de erro do formulário (`role=alert`, `tabindex=-1`); diálogo e conteúdo preservados. |
| Conflito real entre duas abas no feedback | Botão Atualizar dados dentro do diálogo; conteúdo preservado. |

Uma operação de feedback com lock temporariamente ocupado também foi observada: após a liberação e o retorno da validação, o foco estava em `#feedback-content`. Nenhum atraso arbitrário foi adicionado ao código.

## Quality gates

Baseline e resultado final: `npm run typecheck`, `npm run lint`, `npm test` e `npm run build` passaram. Os 392 testes existentes em 26 arquivos continuam passando. O build mantém o aviso anterior sobre chunk maior que 500 kB.

## Limitações

Não foi adicionado teste de regressão automatizado ao projeto: a infraestrutura Vitest existente usa ambiente Node sem DOM e não inclui Playwright como dependência. As verificações de foco acima foram executadas no navegador pela ferramenta disponível, mas não integram a suíte. Não foram testados leitores de tela, outros navegadores, todos os erros possíveis nem todas as variantes de conflito e persistência em cada formulário. O sintoma histórico de validação no `body` não foi reproduzido neste baseline.
