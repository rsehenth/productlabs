import type { WorkspaceState } from '@/types/workspace'
import { metricValueError } from '@/lib/number'

function uniqueIssues(ids: string[], label: string): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return [...duplicates].map((id) => `${label}: identificador duplicado (${id}).`)
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
      issues.push(`Observação ${observation.id}: indicador inexistente.`)
    } else {
      const valueError = metricValueError(observation.value, metric.unit)
      if (valueError) issues.push(`Observação ${observation.id}: ${valueError}`)
    }
    const key = `${observation.metricId}:${observation.period}`
    if (periods.has(key)) {
      issues.push(
        `Indicador ${observation.metricId}: mais de uma observação no período ${observation.period}.`,
      )
    }
    periods.add(key)
  }

  for (const feedback of workspace.feedbacks) {
    if (new Set(feedback.metricIds).size !== feedback.metricIds.length) {
      issues.push(`Feedback ${feedback.id}: indicadores relacionados duplicados.`)
    }
    for (const id of feedback.metricIds) {
      if (!metricIds.has(id)) {
        issues.push(`Feedback ${feedback.id}: indicador inexistente (${id}).`)
      }
    }
  }

  for (const decision of workspace.decisions) {
    if (new Set(decision.metricIds).size !== decision.metricIds.length) {
      issues.push(`Decisão ${decision.id}: indicadores relacionados duplicados.`)
    }
    if (new Set(decision.feedbackIds).size !== decision.feedbackIds.length) {
      issues.push(`Decisão ${decision.id}: feedbacks relacionados duplicados.`)
    }
    for (const id of decision.metricIds) {
      if (!metricIds.has(id)) {
        issues.push(`Decisão ${decision.id}: indicador inexistente (${id}).`)
      }
    }
    for (const id of decision.feedbackIds) {
      if (!feedbackIds.has(id)) {
        issues.push(`Decisão ${decision.id}: feedback inexistente (${id}).`)
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
