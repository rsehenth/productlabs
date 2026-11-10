import type { DecisionRecord } from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import { metricSummary } from '@/lib/analytics'
import { formatDate, formatDateTime, formatPeriodLong } from '@/lib/dates'
import { t } from '@/lib/i18n'
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
      ? t('Nenhum indicador relacionado.')
      : metrics
          .map((metric) => {
            const summary = metricSummary(workspace, metric)
            const latest = summary.latest
            return [
              `- **${metric.name}**`,
              latest
                ? `  - ${t('Último valor: {value}', {
                    value: formatMetricValue(latest.value, metric.unit),
                  })}`
                : `  - ${t('Sem observações registradas.')}`,
              latest
                ? `  - ${t('Período: {period}', {
                    period: formatPeriodLong(latest.period),
                  })}`
                : null,
            ]
              .filter(Boolean)
              .join('\n')
          })
          .join('\n')

  const feedbackLines =
    feedbacks.length === 0
      ? t('Nenhum feedback relacionado.')
      : feedbacks
          .map((feedback, index) => {
            const content = feedback.content.split('\n').join('\n    ')
            return [
              `- **${t('Feedback {index}', { index: index + 1 })}**`,
              `  - ${t('Categoria: {label}', { label: FEEDBACK_CATEGORY_LABELS[feedback.category] })}`,
              `  - ${t('Fonte: {label}', { label: FEEDBACK_SOURCE_LABELS[feedback.source] })}`,
              `  - ${t('Data: {date}', { date: formatDate(feedback.receivedAt) })}`,
              `  - ${t('Conteúdo: {content}', { content })}`,
            ].join('\n')
          })
          .join('\n')

  return [
    '# Product Decision Record',
    '',
    `## ${t('Título')}`,
    decision.title,
    '',
    `## ${t('Status')}`,
    DECISION_STATUS_LABELS[decision.status],
    '',
    `## ${t('Problema')}`,
    decision.problem,
    '',
    `## ${t('Indicadores relacionados')}`,
    metricLines,
    '',
    `## ${t('Feedbacks relacionados')}`,
    feedbackLines,
    '',
    `## ${t('Hipótese')}`,
    decision.hypothesis || t('Não registrada.'),
    '',
    `## ${t('Alternativas consideradas')}`,
    numbered(decision.alternatives, t('Nenhuma alternativa registrada.')),
    '',
    `## ${t('Decisão')}`,
    decision.decision || t('Não registrada.'),
    '',
    `## ${t('Critérios de sucesso')}`,
    bullets(decision.successCriteria, t('Nenhum critério registrado.')),
    '',
    `## ${t('Próximos passos')}`,
    bullets(decision.nextSteps, t('Nenhum próximo passo registrado.')),
    '',
    `## ${t('Metadados')}`,
    t('Criado em: {date}', { date: formatDateTime(decision.createdAt) }),
    t('Atualizado em: {date}', { date: formatDateTime(decision.updatedAt) }),
    '',
    '---',
    t('Gerado pelo Product Decision Lab.'),
    t(
      'Este documento registra uma decisão de produto e suas evidências. Uma hipótese registrada não é um resultado validado automaticamente.',
    ),
    '',
  ].join('\n')
}

export function decisionFileName(decision: DecisionRecord): string {
  return `${slugify(decision.title) || 'decision-record'}.md`
}
