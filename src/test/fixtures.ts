import type {
  DecisionRecord,
  MetricObservation,
  ProductMetric,
  UserFeedback,
} from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'

export function buildMetric(overrides: Partial<ProductMetric> = {}): ProductMetric {
  return {
    id: 'metric-1',
    name: 'Conversão Free → Premium',
    description: 'Contas gratuitas que passam para o plano pago.',
    unit: 'percent',
    desiredDirection: 'increase',
    createdAt: '2026-01-10T12:00:00.000Z',
    ...overrides,
  }
}

export function buildObservation(
  overrides: Partial<MetricObservation> = {},
): MetricObservation {
  return {
    id: 'observation-1',
    metricId: 'metric-1',
    period: '2026-01',
    value: 4.5,
    createdAt: '2026-02-01T09:00:00.000Z',
    ...overrides,
  }
}

export function buildFeedback(overrides: Partial<UserFeedback> = {}): UserFeedback {
  return {
    id: 'feedback-1',
    content: 'Não encontrei onde convidar meu time.',
    category: 'usability',
    source: 'interview',
    receivedAt: '2026-02-03T10:00:00.000Z',
    metricIds: [],
    ...overrides,
  }
}

export function buildDecision(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    id: 'decision-1',
    title: 'Melhorar compreensão dos planos Premium',
    problem: 'A conversão para Premium caiu no período observado.',
    hypothesis: 'Uma apresentação mais clara dos benefícios reduz dúvidas.',
    metricIds: [],
    feedbackIds: [],
    alternatives: ['Manter o fluxo atual', 'Reorganizar a página de planos'],
    decision: 'Priorizar melhorias na comunicação dos planos.',
    successCriteria: ['Conversão acima de 4,5%'],
    nextSteps: ['Revisar a apresentação dos planos'],
    status: 'investigating',
    createdAt: '2026-02-04T09:00:00.000Z',
    updatedAt: '2026-02-05T09:00:00.000Z',
    ...overrides,
  }
}

export function buildWorkspace(overrides: Partial<WorkspaceState> = {}): WorkspaceState {
  return { metrics: [], observations: [], feedbacks: [], decisions: [], ...overrides }
}
