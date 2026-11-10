/**
 * Modelos de domínio do Product Decision Lab.
 *
 * Todos os registros usam identificadores estáveis (`id`) para que possam ser
 * relacionados entre si: observações apontam para métricas, feedbacks para
 * métricas e decisões para métricas e feedbacks.
 */

export type EntityId = string

/** Formato ISO 8601 completo (ex.: `2026-10-14T09:30:00.000Z`). */
export type IsoDateTime = string

/** Mês de referência de uma observação, no formato `YYYY-MM`. */
export type IsoMonth = string

export type MetricUnit = 'percent' | 'count' | 'currency' | 'hours' | 'score'

export type MetricDirection = 'increase' | 'decrease'

export interface ProductMetric {
  id: EntityId
  name: string
  description: string
  unit: MetricUnit
  /** Direção desejada: se o bom desempenho é subir ou cair. */
  desiredDirection: MetricDirection
  createdAt: IsoDateTime
  /** Marca registros fictícios do dataset demonstrativo. */
  simulated?: boolean
}

export interface MetricObservation {
  id: EntityId
  metricId: EntityId
  /** Período medido, no formato `YYYY-MM`. */
  period: IsoMonth
  value: number
  createdAt: IsoDateTime
  simulated?: boolean
}

export type FeedbackCategory =
  | 'bug'
  | 'usability'
  | 'performance'
  | 'feature-request'
  | 'pricing'
  | 'other'

export type FeedbackSource =
  | 'interview'
  | 'support-ticket'
  | 'survey'
  | 'app-review'
  | 'community'
  | 'other'

export interface UserFeedback {
  id: EntityId
  content: string
  category: FeedbackCategory
  source: FeedbackSource
  receivedAt: IsoDateTime
  metricIds: EntityId[]
  simulated?: boolean
}

export type DecisionStatus =
  | 'draft'
  | 'investigating'
  | 'decided'
  | 'validated'
  | 'abandoned'

export interface DecisionRecord {
  id: EntityId
  title: string
  /** Problema investigado, sustentado por métricas e feedbacks. */
  problem: string
  hypothesis: string
  metricIds: EntityId[]
  feedbackIds: EntityId[]
  alternatives: string[]
  decision: string
  successCriteria: string[]
  nextSteps: string[]
  status: DecisionStatus
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
  simulated?: boolean
}
