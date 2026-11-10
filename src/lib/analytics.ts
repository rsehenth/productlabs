import type { MetricObservation, ProductMetric } from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'

export type VariationDirection = 'up' | 'down' | 'flat'

export interface MetricVariation {
  previous: MetricObservation
  current: MetricObservation
  absolute: number
  relative: number | null
  direction: VariationDirection
  /** `null` quando não houve mudança: não existe evolução favorável nem desfavorável. */
  favorable: boolean | null
}

export interface MetricSummary {
  observations: MetricObservation[]
  latest: MetricObservation | null
  previous: MetricObservation | null
  variation: MetricVariation | null
}

export function sortObservations(observations: MetricObservation[]): MetricObservation[] {
  return [...observations].sort(
    (a, b) => a.period.localeCompare(b.period) || a.createdAt.localeCompare(b.createdAt),
  )
}

export function observationsForMetric(
  workspace: Pick<WorkspaceState, 'observations'>,
  metricId: string,
): MetricObservation[] {
  return sortObservations(
    workspace.observations.filter((observation) => observation.metricId === metricId),
  )
}

export function latestObservation(
  workspace: Pick<WorkspaceState, 'observations'>,
  metricId: string,
): MetricObservation | null {
  return observationsForMetric(workspace, metricId).at(-1) ?? null
}

export function computeVariation(
  previous: MetricObservation,
  current: MetricObservation,
  metric: Pick<ProductMetric, 'unit' | 'desiredDirection'>,
): MetricVariation {
  const absolute = current.value - previous.value
  const relative =
    previous.value === 0 ? null : (absolute / Math.abs(previous.value)) * 100
  const direction: VariationDirection =
    absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat'

  const favorable =
    direction === 'flat'
      ? null
      : metric.desiredDirection === 'increase'
        ? direction === 'up'
        : direction === 'down'

  return { previous, current, absolute, relative, direction, favorable }
}

export function metricSummary(
  workspace: Pick<WorkspaceState, 'observations'>,
  metric: ProductMetric,
): MetricSummary {
  const observations = observationsForMetric(workspace, metric.id)
  const latest = observations.at(-1) ?? null
  const previous = observations.length > 1 ? (observations.at(-2) ?? null) : null
  return {
    observations,
    latest,
    previous,
    variation: latest && previous ? computeVariation(previous, latest, metric) : null,
  }
}

export const DECISION_STATUS_ORDER = [
  'draft',
  'investigating',
  'decided',
  'validated',
  'abandoned',
] as const
