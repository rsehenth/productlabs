import type { DecisionRecord } from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import { metricSummary } from '@/lib/analytics'
import { formatDate, formatDateTime, formatPeriodLong } from '@/lib/dates'
import {
  DECISION_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_SOURCE_LABELS,
  formatMetricValue,
} from '@/lib/domain-labels'
import { slugify } from '@/lib/text'

function bullets(values: string[], emptyLabel: string): string {
  const items = values.map((value) => value.trim()).filter(Boolean)
  if (items.length === 0) return emptyLabel
  return items.map((value) => `- ${value}`).join('\n')
}

function numbered(values: string[], emptyLabel: string): string {
  const items = values.map((value) => value.trim()).filter(Boolean)
  if (items.length === 0) return emptyLabel
  return items.map((value, index) => `${index + 1}. ${value}`).join('\n')
}

export function buildDecisionMarkdown(
  decision: DecisionRecord,
  workspace: WorkspaceState,
): string {
  const metrics = decision.metricIds
    .map((id) => workspace.metrics.find((metric) => metric.id === id))
    .filter((metric) => metric !== undefined)

  const feedbacks = decision.feedbackIds
    .map((id) => workspace.feedbacks.find((feedback) => feedback.id === id))
    .filter((feedback) => feedback !== undefined)

  const metricLines =
    metrics.length === 0
      ? 'Nenhum indicador relacionado.'
      : metrics
          .map((metric) => {
            const summary = metricSummary(workspace, metric)
            const latest = summary.latest
            return [
              `- **${metric.name}**`,
              latest
                ? `  - Último valor: ${formatMetricValue(latest.value, metric.unit)}`
                : '  - Sem observações registradas.',
              latest ? `  - Período: ${formatPeriodLong(latest.period)}` : null,
            ]
              .filter(Boolean)
              .join('\n')
          })
          .join('\n')

  const feedbackLines =
    feedbacks.length === 0
      ? 'Nenhum feedback relacionado.'
      : feedbacks
          .map((feedback, index) => {
            const content = feedback.content.split('\n').join('\n    ')
            return [
              `- **Feedback ${index + 1}**`,
              `  - Categoria: ${FEEDBACK_CATEGORY_LABELS[feedback.category]}`,
              `  - Fonte: ${FEEDBACK_SOURCE_LABELS[feedback.source]}`,
              `  - Data: ${formatDate(feedback.receivedAt)}`,
              `  - Conteúdo: ${content}`,
            ].join('\n')
          })
          .join('\n')

  return [
    '# Product Decision Record',
    '',
    '## Título',
    decision.title,
    '',
    '## Status',
    DECISION_STATUS_LABELS[decision.status],
    '',
    '## Problema',
    decision.problem,
    '',
    '## Indicadores relacionados',
    metricLines,
    '',
    '## Feedbacks relacionados',
    feedbackLines,
    '',
    '## Hipótese',
    decision.hypothesis || 'Não registrada.',
    '',
    '## Alternativas consideradas',
    numbered(decision.alternatives, 'Nenhuma alternativa registrada.'),
    '',
    '## Decisão',
    decision.decision || 'Não registrada.',
    '',
    '## Critérios de sucesso',
    bullets(decision.successCriteria, 'Nenhum critério registrado.'),
    '',
    '## Próximos passos',
    bullets(decision.nextSteps, 'Nenhum próximo passo registrado.'),
    '',
    '## Metadados',
    `Criado em: ${formatDateTime(decision.createdAt)}`,
    `Atualizado em: ${formatDateTime(decision.updatedAt)}`,
    '',
    '---',
    'Gerado pelo Product Decision Lab.',
    'Este documento registra uma decisão de produto e suas evidências. Uma hipótese registrada não é um resultado validado automaticamente.',
    '',
  ].join('\n')
}

export function decisionFileName(decision: DecisionRecord): string {
  return `${slugify(decision.title) || 'decision-record'}.md`
}
