import { describe, expect, it } from 'vitest'
import type { DecisionRecord, MetricObservation, ProductMetric, UserFeedback } from '@/types/domain'
import {
  isDecisionRecord,
  isMetricObservation,
  isProductMetric,
  isUserFeedback,
  isWorkspaceState,
  validateWorkspace,
} from '@/lib/storage/validation'
import { DEMO_DATASET } from '@/data/demo/demo-dataset'

const metric: ProductMetric = {
  id: 'metric-1',
  name: 'Ativação no primeiro dia',
  description: 'Contas que concluem a primeira ação de valor.',
  unit: 'percent',
  desiredDirection: 'increase',
  createdAt: '2026-01-10T12:00:00.000Z',
}

const observation: MetricObservation = {
  id: 'observation-1',
  metricId: 'metric-1',
  period: '2026-01',
  value: 61.5,
  createdAt: '2026-02-01T09:00:00.000Z',
}

const feedback: UserFeedback = {
  id: 'feedback-1',
  content: 'Não encontrei onde convidar meu time.',
  category: 'usability',
  source: 'interview',
  receivedAt: '2026-02-03T10:00:00.000Z',
  metricIds: ['metric-1'],
}

const decision: DecisionRecord = {
  id: 'decision-1',
  title: 'Template de configuração',
  problem: 'Ativação caindo há três meses.',
  hypothesis: 'Um template reduz o tempo até o primeiro valor.',
  metricIds: ['metric-1'],
  feedbackIds: ['feedback-1'],
  alternatives: ['Manter o fluxo atual', 'Criar template'],
  decision: 'Testar o template com dois segmentos.',
  successCriteria: ['Ativação acima de 58%'],
  nextSteps: ['Selecionar segmentos'],
  status: 'investigating',
  createdAt: '2026-02-04T09:00:00.000Z',
  updatedAt: '2026-02-05T09:00:00.000Z',
}

describe('validateWorkspace', () => {
  it('aceita um workspace com os quatro modelos preenchidos', () => {
    const result = validateWorkspace({
      metrics: [metric],
      observations: [observation],
      feedbacks: [feedback],
      decisions: [decision],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.metrics).toHaveLength(1)
      expect(result.value.decisions[0]?.title).toBe('Template de configuração')
    }
  })

  it('aceita o dataset demonstrativo completo', () => {
    expect(validateWorkspace(DEMO_DATASET).ok).toBe(true)
    expect(isWorkspaceState(DEMO_DATASET)).toBe(true)
  })

  it('aceita campos técnicos extras sem reclamar', () => {
    const result = validateWorkspace({
      metrics: [{ ...metric, tags: ['onboarding'] }],
      observations: [],
      feedbacks: [],
      decisions: [],
      revision: 4,
    })

    expect(result.ok).toBe(true)
  })

  it('rejeita payload que não é objeto', () => {
    const result = validateWorkspace(null)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues[0]?.path).toBe('workspace')
  })

  it('exige as quatro coleções', () => {
    const result = validateWorkspace({ metrics: [], feedbacks: [], decisions: [] })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toContain('observations')
    }
  })

  it('aponta o caminho do registro inválido', () => {
    const result = validateWorkspace({
      metrics: [metric, { ...metric, id: 'metric-2', unit: 'liters' }],
      observations: [],
      feedbacks: [],
      decisions: [],
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toContain('metrics[1].unit')
    }
  })

  it('rejeita coleção que não é lista', () => {
    const result = validateWorkspace({
      metrics: {},
      observations: [],
      feedbacks: [],
      decisions: [],
    })

    expect(result.ok).toBe(false)
  })
})

describe('isProductMetric', () => {
  it('aceita uma métrica válida', () => {
    expect(isProductMetric(metric)).toBe(true)
  })

  it.each([
    ['nome vazio', { ...metric, name: '   ' }],
    ['unidade desconhecida', { ...metric, unit: 'liters' }],
    ['direção desconhecida', { ...metric, desiredDirection: 'up' }],
    ['data inválida', { ...metric, createdAt: '10/01/2026' }],
    ['id ausente', { ...metric, id: undefined }],
    ['simulated não booleano', { ...metric, simulated: 'yes' }],
  ])('rejeita %s', (_label, value) => {
    expect(isProductMetric(value)).toBe(false)
  })
})

describe('isMetricObservation', () => {
  it('aceita uma observação válida', () => {
    expect(isMetricObservation(observation)).toBe(true)
  })

  it.each([
    ['período fora do formato YYYY-MM', { ...observation, period: '2026-13' }],
    ['valor textual', { ...observation, value: '61' }],
    ['valor não finito', { ...observation, value: Number.POSITIVE_INFINITY }],
    ['métrica ausente', { ...observation, metricId: '' }],
  ])('rejeita %s', (_label, value) => {
    expect(isMetricObservation(value)).toBe(false)
  })
})

describe('isUserFeedback', () => {
  it('aceita um feedback válido', () => {
    expect(isUserFeedback(feedback)).toBe(true)
  })

  it.each([
    ['categoria desconhecida', { ...feedback, category: 'praise' }],
    ['fonte desconhecida', { ...feedback, source: 'email' }],
    ['metricIds não é lista', { ...feedback, metricIds: 'metric-1' }],
    ['conteúdo vazio', { ...feedback, content: '' }],
  ])('rejeita %s', (_label, value) => {
    expect(isUserFeedback(value)).toBe(false)
  })
})

describe('isDecisionRecord', () => {
  it('aceita uma decisão válida', () => {
    expect(isDecisionRecord(decision)).toBe(true)
  })

  it.each([
    ['hipótese ausente', { ...decision, hypothesis: undefined }],
    ['status desconhecido', { ...decision, status: 'archived' }],
    ['alternativas não é lista', { ...decision, alternatives: 'nenhuma' }],
    ['updatedAt inválido', { ...decision, updatedAt: 'ontem' }],
  ])('rejeita %s', (_label, value) => {
    expect(isDecisionRecord(value)).toBe(false)
  })
})
