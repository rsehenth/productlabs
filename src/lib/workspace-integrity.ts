import type { WorkspaceState } from '@/types/workspace'
import { t } from '@/lib/i18n'
import { metricValueError } from '@/lib/number'

function uniqueIssues(ids: string[], label: string): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return [...duplicates].map((id) =>
    t('{label}: identificador duplicado ({id}).', { label: t(label), id }),
  )
}

export function collectIntegrityIssues(workspace: WorkspaceState): string[] {
  const issues: string[] = []

  issues.push(
    ...uniqueIssues(
      workspace.metrics.map((record) => record.id),
      'Indicadores',
    ),
    ...uniqueIssues(
      workspace.observations.map((record) => record.id),
      'Observações',
    ),
    ...uniqueIssues(
      workspace.feedbacks.map((record) => record.id),
      'Feedbacks',
    ),
    ...uniqueIssues(
      workspace.decisions.map((record) => record.id),
      'Decisões',
    ),
  )

  const metricIds = new Set(workspace.metrics.map((metric) => metric.id))
  const metricsById = new Map(workspace.metrics.map((metric) => [metric.id, metric]))
  const feedbackIds = new Set(workspace.feedbacks.map((feedback) => feedback.id))
  const periods = new Set<string>()

  for (const observation of workspace.observations) {
    const metric = metricsById.get(observation.metricId)
    if (!metric) {
      issues.push(t('Observação {id}: indicador inexistente.', { id: observation.id }))
    } else {
      const valueError = metricValueError(observation.value, metric.unit)
      if (valueError) {
        issues.push(t('Observação {id}: {error}', { id: observation.id, error: valueError }))
      }
    }
    const key = `${observation.metricId}:${observation.period}`
    if (periods.has(key)) {
      issues.push(
        t('Indicador {metricId}: mais de uma observação no período {period}.', {
          metricId: observation.metricId,
          period: observation.period,
        }),
      )
    }
    periods.add(key)
  }

  for (const feedback of workspace.feedbacks) {
    if (new Set(feedback.metricIds).size !== feedback.metricIds.length) {
      issues.push(
        t('Feedback {id}: indicadores relacionados duplicados.', { id: feedback.id }),
      )
    }
    for (const id of feedback.metricIds) {
      if (!metricIds.has(id)) {
        issues.push(
          t('Feedback {feedbackId}: indicador inexistente ({id}).', {
            feedbackId: feedback.id,
            id,
          }),
        )
      }
    }
  }

  for (const decision of workspace.decisions) {
    if (new Set(decision.metricIds).size !== decision.metricIds.length) {
      issues.push(
        t('Decisão {id}: indicadores relacionados duplicados.', { id: decision.id }),
      )
    }
    if (new Set(decision.feedbackIds).size !== decision.feedbackIds.length) {
      issues.push(
        t('Decisão {id}: feedbacks relacionados duplicados.', { id: decision.id }),
      )
    }
    for (const id of decision.metricIds) {
      if (!metricIds.has(id)) {
        issues.push(
          t('Decisão {decisionId}: indicador inexistente ({id}).', {
            decisionId: decision.id,
            id,
          }),
        )
      }
    }
    for (const id of decision.feedbackIds) {
      if (!feedbackIds.has(id)) {
        issues.push(
          t('Decisão {decisionId}: feedback inexistente ({id}).', {
            decisionId: decision.id,
            id,
          }),
        )
      }
    }
  }

  return issues
}

export function hasSimulatedRecords(workspace: WorkspaceState): boolean {
  return [
    ...workspace.metrics,
    ...workspace.observations,
    ...workspace.feedbacks,
    ...workspace.decisions,
  ].some((record) => record.simulated === true)
}
