import { describe, expect, it } from 'vitest'
import type {
  DecisionStatus,
  FeedbackCategory,
  FeedbackSource,
  MetricDirection,
  MetricUnit,
} from '@/types/domain'
import {
  createDecision,
  createFeedback,
  createMetric,
  createObservation,
  deleteDecision,
  deleteFeedback,
  deleteMetric,
  deleteObservation,
  updateDecision,
  updateFeedback,
  updateMetric,
  updateObservation,
  type DecisionInput,
  type FeedbackInput,
  type MetricInput,
  type ObservationInput,
} from '@/lib/domain/operations'
import {
  buildDecision,
  buildFeedback,
  buildMetric,
  buildObservation,
  buildWorkspace,
} from '@/test/fixtures'

const NOW = '2026-03-01T10:00:00.000Z'

function metricInput(overrides: Partial<MetricInput> = {}): MetricInput {
  return {
    name: 'Conversão Free → Premium',
    description: 'Contas gratuitas que passam para o plano pago.',
    unit: 'percent',
    desiredDirection: 'increase',
    ...overrides,
  }
}

function observationInput(overrides: Partial<ObservationInput> = {}): ObservationInput {
  return { metricId: 'metric-1', period: '2026-03', value: 4.2, ...overrides }
}

function feedbackInput(overrides: Partial<FeedbackInput> = {}): FeedbackInput {
  return {
    content: 'Não encontrei onde convidar meu time.',
    category: 'usability' as FeedbackCategory,
    source: 'interview' as FeedbackSource,
    receivedAt: '2026-03-02T12:00:00.000Z',
    metricIds: [],
    ...overrides,
  }
}

function decisionInput(overrides: Partial<DecisionInput> = {}): DecisionInput {
  return {
    title: 'Melhorar compreensão dos planos Premium',
    problem: 'A conversão para Premium caiu no período observado.',
    hypothesis: 'Uma apresentação mais clara dos benefícios reduz dúvidas.',
    metricIds: [],
    feedbackIds: [],
    alternatives: ['Manter o fluxo atual'],
    decision: 'Priorizar melhorias na comunicação dos planos.',
    successCriteria: ['Conversão acima de 4,5%'],
    nextSteps: ['Revisar a apresentação dos planos'],
    status: 'investigating' as DecisionStatus,
    ...overrides,
  }
}

function relatedWorkspace() {
  const metric = buildMetric()
  const feedback = buildFeedback({ metricIds: [metric.id] })
  return {
    metric,
    feedback,
    workspace: buildWorkspace({
      metrics: [metric],
      observations: [
        buildObservation({ id: 'observation-1', period: '2026-01', value: 4.5 }),
        buildObservation({ id: 'observation-2', period: '2026-02', value: 4.3 }),
      ],
      feedbacks: [feedback],
    }),
  }
}

describe('métricas', () => {
  it('cria uma métrica válida com id e data controlados', () => {
    const result = createMetric(buildWorkspace(), metricInput({ name: '  Ativação  ' }), {
      id: 'metric-1',
      now: NOW,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      id: 'metric-1',
      name: 'Ativação',
      createdAt: NOW,
      unit: 'percent',
    })
    expect(result.workspace.metrics).toHaveLength(1)
  })

  it('rejeita nome vazio ou apenas espaços', () => {
    const result = createMetric(buildWorkspace(), metricInput({ name: '   ' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('rejeita unidade e direção inválidas', () => {
    const unitResult = createMetric(
      buildWorkspace(),
      metricInput({ unit: 'liters' as MetricUnit }),
    )
    const directionResult = createMetric(
      buildWorkspace(),
      metricInput({ desiredDirection: 'up' as MetricDirection }),
    )

    expect(unitResult.ok).toBe(false)
    expect(directionResult.ok).toBe(false)
  })

  it('edita a métrica preservando id e data de criação', () => {
    const metric = buildMetric()
    const result = updateMetric(buildWorkspace({ metrics: [metric] }), metric.id, {
      ...metricInput(),
      name: 'Conversão atualizada',
      unit: 'count',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.id).toBe(metric.id)
    expect(result.value.createdAt).toBe(metric.createdAt)
    expect(result.value.name).toBe('Conversão atualizada')
    expect(result.value.unit).toBe('count')
  })

  it('retorna erro ao editar métrica inexistente', () => {
    const result = updateMetric(buildWorkspace(), 'missing', metricInput())
    expect(result.ok).toBe(false)
  })

  it('exclui a métrica e suas observações, informando a quantidade', () => {
    const metric = buildMetric()
    const workspace = buildWorkspace({
      metrics: [metric],
      observations: [
        buildObservation({ id: 'observation-1', metricId: metric.id, period: '2026-01' }),
        buildObservation({ id: 'observation-2', metricId: metric.id, period: '2026-02' }),
        buildObservation({ id: 'observation-3', metricId: 'metric-2', period: '2026-01' }),
      ],
    })

    const result = deleteMetric(workspace, metric.id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.observationsRemoved).toBe(2)
    expect(result.workspace.metrics).toHaveLength(0)
    expect(result.workspace.observations.map((item) => item.id)).toEqual(['observation-3'])
  })

  it('bloqueia a exclusão quando há feedback vinculado', () => {
    const { workspace } = relatedWorkspace()
    const result = deleteMetric(workspace, 'metric-1')

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/feedback/i)
    expect(result.details?.some((detail) => detail.startsWith('Feedback:'))).toBe(true)
  })

  it('bloqueia a exclusão quando há decisão vinculada', () => {
    const metric = buildMetric()
    const decision = buildDecision({ metricIds: [metric.id] })
    const result = deleteMetric(
      buildWorkspace({ metrics: [metric], decisions: [decision] }),
      metric.id,
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/decisão/i)
    expect(result.details).toContain(`Decisão: ${decision.title}`)
  })

  it('libera a exclusão depois de remover os vínculos', () => {
    const metric = buildMetric()
    const decision = buildDecision({ metricIds: [metric.id] })
    let state = buildWorkspace({ metrics: [metric], decisions: [decision] })

    expect(deleteMetric(state, metric.id).ok).toBe(false)

    const updated = updateDecision(state, decision.id, decisionInput({ metricIds: [] }))
    expect(updated.ok).toBe(true)
    if (!updated.ok) return
    state = updated.workspace

    expect(deleteMetric(state, metric.id).ok).toBe(true)
  })
})

describe('observações', () => {
  it('cria uma observação válida', () => {
    const metric = buildMetric()
    const result = createObservation(
      buildWorkspace({ metrics: [metric] }),
      observationInput({ value: 4.5, period: '2026-04' }),
      { id: 'observation-1', now: NOW },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      id: 'observation-1',
      metricId: metric.id,
      period: '2026-04',
      value: 4.5,
      createdAt: NOW,
    })
  })

  it('rejeita período inválido', () => {
    const result = createObservation(
      buildWorkspace({ metrics: [buildMetric()] }),
      observationInput({ period: '2026-13' }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.period).toBeDefined()
  })

  it('rejeita período duplicado para o mesmo indicador', () => {
    const { workspace } = relatedWorkspace()
    const result = createObservation(workspace, observationInput({ period: '2026-01' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.period).toMatch(/já existe/i)
  })

  it('rejeita valor não finito', () => {
    const result = createObservation(
      buildWorkspace({ metrics: [buildMetric()] }),
      observationInput({ value: Number.POSITIVE_INFINITY }),
    )

    expect(result.ok).toBe(false)
  })

  it('rejeita percentual fora de 0–100', () => {
    const workspace = buildWorkspace({ metrics: [buildMetric({ unit: 'percent' })] })
    expect(createObservation(workspace, observationInput({ value: 101 })).ok).toBe(false)
    expect(createObservation(workspace, observationInput({ value: -1 })).ok).toBe(false)
  })

  it('rejeita contagem negativa e permite moeda negativa', () => {
    const countWorkspace = buildWorkspace({ metrics: [buildMetric({ unit: 'count' })] })
    const currencyWorkspace = buildWorkspace({
      metrics: [buildMetric({ unit: 'currency' })],
    })

    expect(createObservation(countWorkspace, observationInput({ value: -1 })).ok).toBe(
      false,
    )
    expect(createObservation(currencyWorkspace, observationInput({ value: -50 })).ok).toBe(
      true,
    )
  })

  it('rejeita observação para indicador inexistente', () => {
    const result = createObservation(
      buildWorkspace({ metrics: [buildMetric({ id: 'other' })] }),
      observationInput(),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.metricId).toBeDefined()
  })

  it('edita valor e período preservando id e data de criação', () => {
    const { workspace } = relatedWorkspace()
    const result = updateObservation(workspace, 'observation-2', {
      metricId: 'metric-1',
      period: '2026-06',
      value: 3.8,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.id).toBe('observation-2')
    expect(result.value.createdAt).toBe(workspace.observations[1]?.createdAt)
    expect(result.value.period).toBe('2026-06')
    expect(result.value.value).toBe(3.8)
  })

  it('rejeita edição que criaria período duplicado', () => {
    const { workspace } = relatedWorkspace()
    const result = updateObservation(workspace, 'observation-2', {
      metricId: 'metric-1',
      period: '2026-01',
      value: 3.8,
    })

    expect(result.ok).toBe(false)
  })

  it('exclui uma observação', () => {
    const { workspace } = relatedWorkspace()
    const result = deleteObservation(workspace, 'observation-1')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.workspace.observations.map((item) => item.id)).toEqual(['observation-2'])
  })
})

describe('feedbacks', () => {
  it('cria um feedback com indicador associado', () => {
    const metric = buildMetric()
    const result = createFeedback(
      buildWorkspace({ metrics: [metric] }),
      feedbackInput({ content: '  Relato do usuário  ', metricIds: [metric.id] }),
      { id: 'feedback-1' },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.content).toBe('Relato do usuário')
    expect(result.value.metricIds).toEqual([metric.id])
  })

  it('rejeita conteúdo vazio', () => {
    const result = createFeedback(buildWorkspace(), feedbackInput({ content: '  ' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.content).toBeDefined()
  })

  it('rejeita categoria, fonte e data inválidas', () => {
    const workspace = buildWorkspace()
    expect(
      createFeedback(workspace, feedbackInput({ category: 'praise' as FeedbackCategory }))
        .ok,
    ).toBe(false)
    expect(
      createFeedback(workspace, feedbackInput({ source: 'email' as FeedbackSource })).ok,
    ).toBe(false)
    expect(
      createFeedback(workspace, feedbackInput({ receivedAt: '03/03/2026' })).ok,
    ).toBe(false)
  })

  it('rejeita indicador inexistente e ids duplicados', () => {
    const workspace = buildWorkspace({ metrics: [buildMetric()] })
    const missing = createFeedback(workspace, feedbackInput({ metricIds: ['missing'] }))
    const duplicate = createFeedback(
      workspace,
      feedbackInput({ metricIds: ['metric-1', 'metric-1'] }),
    )

    expect(missing.ok).toBe(false)
    expect(duplicate.ok).toBe(false)
  })

  it('edita o feedback preservando o id', () => {
    const feedback = buildFeedback()
    const result = updateFeedback(
      buildWorkspace({ feedbacks: [feedback] }),
      feedback.id,
      feedbackInput({ content: 'Conteúdo atualizado', category: 'bug' }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.id).toBe(feedback.id)
    expect(result.value.content).toBe('Conteúdo atualizado')
    expect(result.value.category).toBe('bug')
  })

  it('exclui feedback sem dependências', () => {
    const feedback = buildFeedback()
    const result = deleteFeedback(buildWorkspace({ feedbacks: [feedback] }), feedback.id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.workspace.feedbacks).toHaveLength(0)
  })

  it('bloqueia a exclusão de feedback usado como evidência', () => {
    const feedback = buildFeedback()
    const decision = buildDecision({ feedbackIds: [feedback.id] })
    const result = deleteFeedback(
      buildWorkspace({ feedbacks: [feedback], decisions: [decision] }),
      feedback.id,
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.details).toContain(`Decisão: ${decision.title}`)
  })
})

describe('decisões', () => {
  it('cria um rascunho mínimo com título e problema', () => {
    const result = createDecision(
      buildWorkspace(),
      decisionInput({
        status: 'draft',
        hypothesis: '',
        decision: '',
        alternatives: [],
        successCriteria: [],
        nextSteps: [],
      }),
      { id: 'decision-1', now: NOW },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      id: 'decision-1',
      status: 'draft',
      hypothesis: '',
      decision: '',
      createdAt: NOW,
      updatedAt: NOW,
    })
  })

  it('exige título e problema sempre', () => {
    expect(
      createDecision(buildWorkspace(), decisionInput({ title: '  ', status: 'draft' })).ok,
    ).toBe(false)
    expect(
      createDecision(buildWorkspace(), decisionInput({ problem: ' ', status: 'draft' })).ok,
    ).toBe(false)
  })

  it('exige hipótese em investigação', () => {
    const result = createDecision(
      buildWorkspace(),
      decisionInput({ status: 'investigating', hypothesis: '' }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.fieldErrors?.hypothesis).toBeDefined()
  })

  it('exige hipótese e decisão quando decidida', () => {
    expect(
      createDecision(
        buildWorkspace(),
        decisionInput({ status: 'decided', decision: '' }),
      ).ok,
    ).toBe(false)
    expect(createDecision(buildWorkspace(), decisionInput({ status: 'decided' })).ok).toBe(
      true,
    )
  })

  it('exige critério de sucesso quando validada', () => {
    const withoutCriteria = createDecision(
      buildWorkspace(),
      decisionInput({ status: 'validated', successCriteria: [] }),
    )
    const withCriteria = createDecision(
      buildWorkspace(),
      decisionInput({ status: 'validated' }),
    )

    expect(withoutCriteria.ok).toBe(false)
    expect(withCriteria.ok).toBe(true)
  })

  it('rejeita status inválido', () => {
    const result = createDecision(
      buildWorkspace(),
      decisionInput({ status: 'archived' as DecisionStatus }),
    )
    expect(result.ok).toBe(false)
  })

  it('associa métricas e feedbacks existentes', () => {
    const metric = buildMetric()
    const feedback = buildFeedback({ metricIds: [metric.id] })
    const result = createDecision(
      buildWorkspace({ metrics: [metric], feedbacks: [feedback] }),
      decisionInput({ metricIds: [metric.id], feedbackIds: [feedback.id] }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.metricIds).toEqual([metric.id])
    expect(result.value.feedbackIds).toEqual([feedback.id])
  })

  it('rejeita vínculos inexistentes e duplicados', () => {
    const workspace = buildWorkspace({ metrics: [buildMetric()] })

    expect(
      createDecision(workspace, decisionInput({ metricIds: ['missing'] })).ok,
    ).toBe(false)
    expect(
      createDecision(workspace, decisionInput({ metricIds: ['metric-1', 'metric-1'] })).ok,
    ).toBe(false)
    expect(
      createDecision(workspace, decisionInput({ feedbackIds: ['missing'] })).ok,
    ).toBe(false)
  })

  it('atualiza status e timestamp, preservando a criação', () => {
    const decision = buildDecision({ status: 'draft', hypothesis: '' })
    const result = updateDecision(
      buildWorkspace({ decisions: [decision] }),
      decision.id,
      decisionInput({ status: 'decided' }),
      { now: NOW },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.status).toBe('decided')
    expect(result.value.createdAt).toBe(decision.createdAt)
    expect(result.value.updatedAt).toBe(NOW)
  })

  it('rejeita edição que remove campo obrigatório do novo status', () => {
    const decision = buildDecision({ status: 'investigating' })
    const result = updateDecision(
      buildWorkspace({ decisions: [decision] }),
      decision.id,
      decisionInput({ status: 'decided', decision: '  ' }),
    )

    expect(result.ok).toBe(false)
  })

  it('permite remover uma associação explicitamente', () => {
    const metric = buildMetric()
    const feedback = buildFeedback({ metricIds: [metric.id] })
    const decision = buildDecision({
      metricIds: [metric.id],
      feedbackIds: [feedback.id],
    })
    let state = buildWorkspace({
      metrics: [metric],
      feedbacks: [feedback],
      decisions: [decision],
    })

    expect(deleteMetric(state, metric.id).ok).toBe(false)
    expect(deleteFeedback(state, feedback.id).ok).toBe(false)

    const withoutMetric = updateDecision(
      state,
      decision.id,
      decisionInput({ metricIds: [], feedbackIds: [feedback.id] }),
    )
    expect(withoutMetric.ok).toBe(true)
    if (!withoutMetric.ok) return
    state = withoutMetric.workspace

    const feedbackWithoutMetric = updateFeedback(
      state,
      feedback.id,
      feedbackInput({ metricIds: [] }),
    )
    expect(feedbackWithoutMetric.ok).toBe(true)
    if (!feedbackWithoutMetric.ok) return
    state = feedbackWithoutMetric.workspace

    const metricDeleted = deleteMetric(state, metric.id)
    expect(metricDeleted.ok).toBe(true)
    if (!metricDeleted.ok) return
    state = metricDeleted.workspace

    const withoutFeedback = updateDecision(
      state,
      decision.id,
      decisionInput({ metricIds: [], feedbackIds: [] }),
    )
    expect(withoutFeedback.ok).toBe(true)
    if (!withoutFeedback.ok) return
    expect(deleteFeedback(withoutFeedback.workspace, feedback.id).ok).toBe(true)
  })

  it('exclui decisão e retorna erro para id inexistente', () => {
    const decision = buildDecision()
    const state = buildWorkspace({ decisions: [decision] })

    expect(deleteDecision(state, decision.id).ok).toBe(true)
    expect(deleteDecision(state, 'missing').ok).toBe(false)
  })
})
