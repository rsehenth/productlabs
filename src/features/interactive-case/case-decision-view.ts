import type { CaseFeedbackView } from '@/features/interactive-case/case-feedback-view'
import type { CaseDecisionOption, CaseFeedback, CaseMetric } from '@/types/interactive-case'
import { t } from '@/lib/i18n'

/**
 * Regras puras da etapa de decisão do Interactive Case.
 *
 * As funções recebem dados do cenário e estado da interface, devolvendo novas
 * estruturas. Nenhuma delas avalia a qualidade da escolha, atribui pontuação ou
 * altera o dataset demonstrativo.
 */

export const CASE_HYPOTHESIS_MIN_LENGTH = 15
export const CASE_HYPOTHESIS_MAX_LENGTH = 1000

export const CASE_DECISION_REQUIREMENT_MESSAGES = {
  hypothesis: 'Escreva uma hipótese para continuar.',
  evidence: 'Selecione pelo menos uma evidência.',
  option: 'Escolha uma alternativa de decisão.',
} as const

export type CaseDecisionRequirement = keyof typeof CASE_DECISION_REQUIREMENT_MESSAGES

export interface CaseDecisionMetricRef {
  id: string
  name: string
}

export interface CaseDecisionFeedbackRef {
  id: string
  content: string
}

export interface CaseDecisionOptionView {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  risks: readonly string[]
  metrics: readonly CaseDecisionMetricRef[]
  feedbacks: readonly CaseDecisionFeedbackRef[]
  additionalInformation: readonly string[]
}

type CaseMetricRef = Pick<CaseMetric, 'id' | 'name'>
type CaseFeedbackRef = Pick<CaseFeedback, 'id' | 'content'>

export function buildCaseDecisionOptionViews(
  options: readonly CaseDecisionOption[],
  metrics: readonly CaseMetricRef[],
  feedbacks: readonly CaseFeedbackRef[],
): CaseDecisionOptionView[] {
  const metricById = new Map(metrics.map((metric) => [metric.id, metric.name]))
  const feedbackById = new Map(feedbacks.map((feedback) => [feedback.id, feedback.content]))

  return options.map((option) => ({
    id: option.id,
    title: option.title,
    description: option.description,
    benefits: option.benefits,
    risks: option.risks,
    metrics: option.metricIds.flatMap((metricId) => {
      const name = metricById.get(metricId)
      return name ? [{ id: metricId, name }] : []
    }),
    feedbacks: option.feedbackIds.flatMap((feedbackId) => {
      const content = feedbackById.get(feedbackId)
      return content ? [{ id: feedbackId, content }] : []
    }),
    additionalInformation: option.additionalInformation,
  }))
}

export function selectCaseDecisionOption(
  views: readonly CaseDecisionOptionView[],
  optionId: string | null,
): CaseDecisionOptionView | null {
  if (optionId === null) return null
  return views.find((view) => view.id === optionId) ?? null
}

export function normalizeCaseHypothesis(value: string): string {
  return value.trim()
}

export function isCaseHypothesisValid(value: string): boolean {
  const normalized = normalizeCaseHypothesis(value)
  return (
    normalized.length >= CASE_HYPOTHESIS_MIN_LENGTH &&
    normalized.length <= CASE_HYPOTHESIS_MAX_LENGTH
  )
}

export function caseDecisionMissingRequirements(
  hypothesis: string,
  evidenceCount: number,
  optionId: string | null,
): CaseDecisionRequirement[] {
  const missing: CaseDecisionRequirement[] = []
  if (!isCaseHypothesisValid(hypothesis)) missing.push('hypothesis')
  if (evidenceCount <= 0) missing.push('evidence')
  if (!optionId) missing.push('option')
  return missing
}

export function caseDecisionRequirementMessages(
  requirements: readonly CaseDecisionRequirement[],
): string[] {
  return requirements.map((requirement) =>
    t(CASE_DECISION_REQUIREMENT_MESSAGES[requirement]),
  )
}

export interface CaseDecisionEvidenceSplit {
  related: CaseFeedbackView[]
  other: CaseFeedbackView[]
}

export function splitCaseEvidenceByOption(
  selected: readonly CaseFeedbackView[],
  option: CaseDecisionOptionView | null,
): CaseDecisionEvidenceSplit {
  if (!option) return { related: [], other: [...selected] }

  const relatedIds = new Set(option.feedbacks.map((feedback) => feedback.id))
  const related: CaseFeedbackView[] = []
  const other: CaseFeedbackView[] = []

  for (const view of selected) {
    if (relatedIds.has(view.id)) related.push(view)
    else other.push(view)
  }

  return { related, other }
}

export interface CaseDecisionSummaryInput {
  problem: string
  metricName: string | null
  selectedEvidence: readonly CaseFeedbackView[]
  hypothesis: string
  option: CaseDecisionOptionView | null
}

export interface CaseDecisionSummaryContent {
  problem: string
  metricName: string | null
  evidence: readonly CaseFeedbackView[]
  hypothesis: string
  option: CaseDecisionOptionView
}

export function buildCaseDecisionSummary(
  input: CaseDecisionSummaryInput,
): CaseDecisionSummaryContent | null {
  if (!isCaseHypothesisValid(input.hypothesis)) return null
  if (input.selectedEvidence.length === 0) return null
  if (input.option === null) return null

  return {
    problem: input.problem,
    metricName: input.metricName,
    evidence: [...input.selectedEvidence],
    hypothesis: normalizeCaseHypothesis(input.hypothesis),
    option: input.option,
  }
}
