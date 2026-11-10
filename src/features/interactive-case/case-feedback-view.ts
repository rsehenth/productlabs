import type { CaseFeedback, CaseMetric } from '@/types/interactive-case'
import type { FeedbackCategory, FeedbackSource } from '@/types/domain'

/**
 * Regras puras de leitura, filtragem e seleção de feedbacks do Interactive Case.
 *
 * As funções nunca alteram o dataset: recebem as entidades do cenário e devolvem
 * novas estruturas. A seleção é representada apenas por IDs, para que a próxima
 * etapa do caso possa reutilizá-la.
 */

export type CaseFeedbackFilter = 'all' | 'related'

export interface CaseFeedbackMetricRef {
  id: string
  name: string
}

export interface CaseFeedbackView {
  id: string
  content: string
  category: FeedbackCategory
  source: FeedbackSource
  metrics: readonly CaseFeedbackMetricRef[]
  simulated: boolean
}

type CaseMetricRef = Pick<CaseMetric, 'id' | 'name'>

export function buildCaseFeedbackViews(
  feedbacks: readonly CaseFeedback[],
  metrics: readonly CaseMetricRef[],
): CaseFeedbackView[] {
  const metricById = new Map(metrics.map((metric) => [metric.id, metric.name]))

  return feedbacks.map((feedback) => ({
    id: feedback.id,
    content: feedback.content,
    category: feedback.category,
    source: feedback.source,
    metrics: feedback.metricIds.flatMap((metricId) => {
      const name = metricById.get(metricId)
      return name ? [{ id: metricId, name }] : []
    }),
    simulated: feedback.origin.kind === 'simulated',
  }))
}

export function isCaseFeedbackRelatedToMetric(
  view: CaseFeedbackView,
  metricId: string | null,
): boolean {
  if (metricId === null) return false
  return view.metrics.some((metric) => metric.id === metricId)
}

export function filterCaseFeedbackViews(
  views: readonly CaseFeedbackView[],
  filter: CaseFeedbackFilter,
  metricId: string | null,
): CaseFeedbackView[] {
  if (filter === 'all') return [...views]
  return views.filter((view) => isCaseFeedbackRelatedToMetric(view, metricId))
}

export function addCaseEvidenceId(
  ids: readonly string[],
  feedbackId: string,
): readonly string[] {
  if (ids.includes(feedbackId)) return ids
  return [...ids, feedbackId]
}

export function removeCaseEvidenceId(
  ids: readonly string[],
  feedbackId: string,
): readonly string[] {
  if (!ids.includes(feedbackId)) return ids
  return ids.filter((id) => id !== feedbackId)
}

export function toggleCaseEvidenceId(
  ids: readonly string[],
  feedbackId: string,
): readonly string[] {
  return ids.includes(feedbackId)
    ? removeCaseEvidenceId(ids, feedbackId)
    : addCaseEvidenceId(ids, feedbackId)
}

export function selectCaseEvidence(
  views: readonly CaseFeedbackView[],
  ids: readonly string[],
): CaseFeedbackView[] {
  const byId = new Map(views.map((view) => [view.id, view]))
  const seen = new Set<string>()
  const selected: CaseFeedbackView[] = []

  for (const id of ids) {
    if (seen.has(id)) continue
    const view = byId.get(id)
    if (!view) continue
    seen.add(id)
    selected.push(view)
  }

  return selected
}

export function caseEvidenceCategories(
  selected: readonly CaseFeedbackView[],
): FeedbackCategory[] {
  const categories: FeedbackCategory[] = []
  for (const view of selected) {
    if (!categories.includes(view.category)) categories.push(view.category)
  }
  return categories
}

export function caseEvidenceCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'evidência selecionada' : 'evidências selecionadas'}`
}
