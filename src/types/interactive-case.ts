/**
 * Modelos do Interactive Product Case.
 *
 * Este módulo é independente do Workspace: o cenário é estático, somente
 * leitura e nunca passa pelas operações de persistência do usuário.
 */
import type {
  FeedbackCategory,
  FeedbackSource,
  IsoMonth,
  MetricDirection,
  MetricUnit,
} from './domain'

export type CaseScenarioType = 'demonstrative-case-study'

/**
 * Procedência de uma informação do cenário. Dados simulados são identificados
 * explicitamente; dados documentados exigem uma referência verificável.
 */
export type CaseInformationOrigin =
  | {
      readonly kind: 'simulated'
      readonly note: string
    }
  | {
      readonly kind: 'documented'
      readonly note: string
      readonly reference: string
    }

export interface CaseMetricObservation {
  readonly id: string
  readonly period: IsoMonth
  readonly value: number
  /** Numerador da taxa, quando o indicador é uma razão. */
  readonly numerator?: number
  /** Denominador da taxa, quando o indicador é uma razão. */
  readonly denominator?: number
}

export interface CaseMetric {
  readonly id: string
  readonly name: string
  readonly unit: MetricUnit
  readonly description: string
  readonly desiredDirection: MetricDirection
  readonly observations: readonly CaseMetricObservation[]
  readonly origin: CaseInformationOrigin
}

export interface CaseFeedback {
  readonly id: string
  readonly content: string
  readonly category: FeedbackCategory
  /** Canal demonstrativo de onde o relato teria vindo. */
  readonly source: FeedbackSource
  /** Indicadores aos quais o relato se relaciona. */
  readonly metricIds: readonly string[]
  readonly origin: CaseInformationOrigin
}

export interface CaseDecisionOption {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly benefits: readonly string[]
  readonly risks: readonly string[]
  readonly metricIds: readonly string[]
  readonly feedbackIds: readonly string[]
  readonly additionalInformation: readonly string[]
}

export interface CaseScenario {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly context: string
  readonly productName: string
  readonly problem: string
  readonly objective: string
  readonly mainQuestion: string
  readonly type: CaseScenarioType
  readonly origin: CaseInformationOrigin
  readonly metrics: readonly CaseMetric[]
  readonly feedbacks: readonly CaseFeedback[]
  readonly decisionOptions: readonly CaseDecisionOption[]
}
