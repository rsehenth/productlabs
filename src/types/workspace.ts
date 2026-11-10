import type {
  DecisionRecord,
  MetricObservation,
  ProductMetric,
  UserFeedback,
} from './domain'

/** Dados do usuário. O dataset demonstrativo nunca é gravado aqui. */
export interface WorkspaceState {
  metrics: ProductMetric[]
  observations: MetricObservation[]
  feedbacks: UserFeedback[]
  decisions: DecisionRecord[]
}
