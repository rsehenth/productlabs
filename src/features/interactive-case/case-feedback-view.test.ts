import { describe, expect, it } from 'vitest'
import { PROFRESOLVE_GROWTH_CONVERSION_CASE } from '@/data/interactive-case/profresolve-growth-conversion-demo'
import {
  addCaseEvidenceId,
  buildCaseFeedbackViews,
  caseEvidenceCategories,
  caseEvidenceCountLabel,
  filterCaseFeedbackViews,
  isCaseFeedbackRelatedToMetric,
  removeCaseEvidenceId,
  selectCaseEvidence,
  toggleCaseEvidenceId,
  type CaseFeedbackView,
} from '@/features/interactive-case/case-feedback-view'
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_SOURCE_LABELS } from '@/lib/domain-labels'

const scenario = PROFRESOLVE_GROWTH_CONVERSION_CASE
const feedbacks = scenario.feedbacks
const views = buildCaseFeedbackViews(feedbacks, scenario.metrics)

const CONVERSION_ID = 'case-metric-free-to-premium-conversion'
const ONBOARDING_ID = 'case-metric-onboarding-completion'
const VISITS_ID = 'case-metric-premium-page-visits'

const PLAN_ID = 'case-feedback-plan-comparison'
const ONBOARDING_FEEDBACK_ID = 'case-feedback-onboarding-turma'

const RELATED_TO_CONVERSION = [
  'case-feedback-plan-comparison',
  'case-feedback-price-per-teacher',
  'case-feedback-support-discovery',
  'case-feedback-onboarding-turma',
  'case-feedback-import-students',
  'case-feedback-free-limits',
  'case-feedback-school-purchase',
  'case-feedback-activation-value',
]

const RELATED_TO_ONBOARDING = [
  'case-feedback-onboarding-turma',
  'case-feedback-import-students',
  'case-feedback-activation-value',
]

const RELATED_TO_VISITS = [
  'case-feedback-plan-comparison',
  'case-feedback-price-per-teacher',
  'case-feedback-support-discovery',
]

function viewById(id: string): CaseFeedbackView {
  const view = views.find((item) => item.id === id)
  if (!view) throw new Error(`Feedback ausente: ${id}`)
  return view
}

function idsOf(list: readonly CaseFeedbackView[]): string[] {
  return list.map((view) => view.id)
}

describe('carregamento dos feedbacks', () => {
  it('carrega os oito feedbacks do dataset existente sem duplicar conteúdo', () => {
    expect(feedbacks).toHaveLength(8)
    expect(views).toHaveLength(8)
    expect(idsOf(views)).toEqual(feedbacks.map((feedback) => feedback.id))
    expect(new Set(idsOf(views)).size).toBe(8)
    expect(new Set(views.map((view) => view.content)).size).toBe(8)
  })

  it('preserva conteúdo, categoria e fonte originais', () => {
    for (const [index, view] of views.entries()) {
      const source = feedbacks[index]
      expect(source).toBeDefined()
      if (!source) continue

      expect(view.content).toBe(source.content)
      expect(view.category).toBe(source.category)
      expect(view.source).toBe(source.source)
      expect(FEEDBACK_CATEGORY_LABELS[view.category]).toBeTruthy()
      expect(FEEDBACK_SOURCE_LABELS[view.source]).toBeTruthy()
    }
  })

  it('identifica explicitamente todos os relatos como simulados', () => {
    expect(views.every((view) => view.simulated)).toBe(true)
    expect(feedbacks.every((feedback) => feedback.origin.kind === 'simulated')).toBe(true)
  })

  it('exibe as categorias existentes no cenário', () => {
    expect(new Set(views.map((view) => view.category))).toEqual(
      new Set(['usability', 'pricing', 'other', 'performance']),
    )
    expect(viewById('case-feedback-plan-comparison').category).toBe('usability')
    expect(viewById('case-feedback-price-per-teacher').category).toBe('pricing')
    expect(viewById('case-feedback-import-students').category).toBe('performance')
    expect(viewById('case-feedback-support-discovery').category).toBe('other')
  })

  it('exibe as fontes existentes no cenário', () => {
    expect(new Set(views.map((view) => view.source))).toEqual(
      new Set(['survey', 'app-review', 'interview', 'support-ticket', 'community']),
    )
    expect(viewById('case-feedback-plan-comparison').source).toBe('survey')
    expect(viewById('case-feedback-onboarding-turma').source).toBe('support-ticket')
    expect(viewById('case-feedback-import-students').source).toBe('community')
  })
})

describe('relação entre feedbacks e indicadores', () => {
  it('resolve os nomes dos indicadores a partir dos IDs do dataset', () => {
    const view = viewById('case-feedback-plan-comparison')

    expect(view.metrics).toEqual([
      { id: CONVERSION_ID, name: 'Conversão de usuários gratuitos para Premium' },
      { id: VISITS_ID, name: 'Visitas à página de planos Premium' },
    ])
  })

  it('relaciona cada indicador ao conjunto correto de feedbacks', () => {
    expect(idsOf(filterCaseFeedbackViews(views, 'related', CONVERSION_ID))).toEqual(
      RELATED_TO_CONVERSION,
    )
    expect(idsOf(filterCaseFeedbackViews(views, 'related', ONBOARDING_ID))).toEqual(
      RELATED_TO_ONBOARDING,
    )
    expect(idsOf(filterCaseFeedbackViews(views, 'related', VISITS_ID))).toEqual(
      RELATED_TO_VISITS,
    )
  })

  it('usa somente os IDs do dataset, sem correspondência por texto', () => {
    const planComparison = viewById('case-feedback-plan-comparison')

    expect(planComparison.content.toLowerCase()).toContain('premium')
    expect(isCaseFeedbackRelatedToMetric(planComparison, ONBOARDING_ID)).toBe(false)

    const onboarding = viewById(ONBOARDING_FEEDBACK_ID)
    expect(isCaseFeedbackRelatedToMetric(onboarding, ONBOARDING_ID)).toBe(true)
    expect(isCaseFeedbackRelatedToMetric(onboarding, VISITS_ID)).toBe(false)
  })

  it('não relaciona feedbacks quando nenhum indicador está selecionado', () => {
    expect(filterCaseFeedbackViews(views, 'related', null)).toEqual([])
    expect(isCaseFeedbackRelatedToMetric(viewById('case-feedback-plan-comparison'), null)).toBe(
      false,
    )
  })
})

describe('filtro de visualização', () => {
  it('exibe todos os feedbacks no filtro padrão', () => {
    const all = filterCaseFeedbackViews(views, 'all', CONVERSION_ID)

    expect(all).toHaveLength(8)
    expect(idsOf(all)).toEqual(feedbacks.map((feedback) => feedback.id))
  })

  it('exibe apenas os relacionados ao indicador selecionado', () => {
    const related = filterCaseFeedbackViews(views, 'related', ONBOARDING_ID)

    expect(related).toHaveLength(3)
    expect(idsOf(related)).not.toContain('case-feedback-plan-comparison')
    expect(idsOf(related)).not.toContain('case-feedback-free-limits')
  })

  it('não altera a coleção original ao filtrar', () => {
    const before = idsOf(views)

    filterCaseFeedbackViews(views, 'related', ONBOARDING_ID)
    filterCaseFeedbackViews(views, 'all', VISITS_ID)

    expect(idsOf(views)).toEqual(before)
    expect(views).toHaveLength(8)
  })
})

describe('seleção de evidências', () => {
  it('seleciona uma evidência', () => {
    const selected = addCaseEvidenceId([], PLAN_ID)

    expect(selected).toEqual([PLAN_ID])
  })

  it('seleciona múltiplas evidências preservando a ordem de escolha', () => {
    let selected: readonly string[] = []
    selected = addCaseEvidenceId(selected, ONBOARDING_FEEDBACK_ID)
    selected = addCaseEvidenceId(selected, PLAN_ID)
    selected = addCaseEvidenceId(selected, 'case-feedback-import-students')

    expect(selected).toEqual([
      ONBOARDING_FEEDBACK_ID,
      PLAN_ID,
      'case-feedback-import-students',
    ])
  })

  it('não duplica identificadores já selecionados', () => {
    const once = addCaseEvidenceId([], PLAN_ID)
    const twice = addCaseEvidenceId(once, PLAN_ID)

    expect(twice).toEqual([PLAN_ID])
    expect(twice).toBe(once)
    expect(selectCaseEvidence(views, [PLAN_ID, PLAN_ID])).toHaveLength(1)
  })

  it('remove uma evidência individual', () => {
    const selected = addCaseEvidenceId(addCaseEvidenceId([], PLAN_ID), ONBOARDING_FEEDBACK_ID)

    expect(removeCaseEvidenceId(selected, PLAN_ID)).toEqual([ONBOARDING_FEEDBACK_ID])
    expect(removeCaseEvidenceId(selected, 'unknown')).toBe(selected)
  })

  it('alterna a seleção do mesmo feedback', () => {
    const selected = toggleCaseEvidenceId([], PLAN_ID)

    expect(selected).toEqual([PLAN_ID])
    expect(toggleCaseEvidenceId(selected, PLAN_ID)).toEqual([])
  })

  it('limpa toda a seleção removendo cada evidência', () => {
    let selected: readonly string[] = [PLAN_ID, ONBOARDING_FEEDBACK_ID]

    selected = removeCaseEvidenceId(selected, PLAN_ID)
    selected = removeCaseEvidenceId(selected, ONBOARDING_FEEDBACK_ID)

    expect(selected).toEqual([])
  })

  it('resolve os feedbacks selecionados em ordem de escolha e ignora IDs desconhecidos', () => {
    const selected = selectCaseEvidence(views, [
      ONBOARDING_FEEDBACK_ID,
      'unknown',
      PLAN_ID,
    ])

    expect(idsOf(selected)).toEqual([ONBOARDING_FEEDBACK_ID, PLAN_ID])
  })

  it('conta as evidências selecionadas', () => {
    expect(caseEvidenceCountLabel(0)).toBe('0 evidências selecionadas')
    expect(caseEvidenceCountLabel(1)).toBe('1 evidência selecionada')
    expect(caseEvidenceCountLabel(3)).toBe('3 evidências selecionadas')
  })

  it('lista as categorias presentes na seleção sem repetição', () => {
    const selected = selectCaseEvidence(views, [
      PLAN_ID,
      'case-feedback-import-students',
      ONBOARDING_FEEDBACK_ID,
    ])

    expect(caseEvidenceCategories(selected)).toEqual(['usability', 'performance'])
    expect(caseEvidenceCategories([])).toEqual([])
  })
})

describe('preservação da seleção', () => {
  const selected = [PLAN_ID, 'case-feedback-free-limits']

  it('mantém a seleção ao alternar o indicador', () => {
    const conversion = filterCaseFeedbackViews(views, 'related', CONVERSION_ID)
    const visits = filterCaseFeedbackViews(views, 'related', VISITS_ID)

    expect(idsOf(conversion)).toContain(PLAN_ID)
    expect(idsOf(visits)).toContain(PLAN_ID)
    expect(idsOf(visits)).not.toContain('case-feedback-free-limits')

    expect(selectCaseEvidence(views, selected).map((view) => view.id)).toEqual(selected)
  })

  it('mantém a seleção ao trocar o filtro, mesmo com evidências ocultas', () => {
    const related = filterCaseFeedbackViews(views, 'related', ONBOARDING_ID)
    expect(idsOf(related)).not.toContain(PLAN_ID)

    const summaryAfterFilter = selectCaseEvidence(views, selected)
    expect(summaryAfterFilter.map((view) => view.id)).toEqual(selected)
    expect(caseEvidenceCategories(summaryAfterFilter)).toEqual(['usability', 'other'])

    const all = filterCaseFeedbackViews(views, 'all', ONBOARDING_ID)
    expect(idsOf(all)).toContain(PLAN_ID)
  })
})

describe('integridade do dataset', () => {
  it('não altera o cenário ao carregar, filtrar e selecionar', () => {
    const snapshot = JSON.stringify(scenario)

    buildCaseFeedbackViews(scenario.feedbacks, scenario.metrics)
    filterCaseFeedbackViews(views, 'related', CONVERSION_ID)
    const selected = toggleCaseEvidenceId([], PLAN_ID)
    selectCaseEvidence(views, selected)
    caseEvidenceCategories(selectCaseEvidence(views, selected))

    expect(JSON.stringify(scenario)).toBe(snapshot)
    expect(Object.isFrozen(scenario)).toBe(true)
    expect(Object.isFrozen(scenario.feedbacks[0])).toBe(true)
    expect(Object.isFrozen(scenario.feedbacks[0]?.metricIds)).toBe(true)
  })

  it('não compartilha referências entre as views e os feedbacks do cenário', () => {
    const view = viewById(PLAN_ID)

    expect(view).not.toBe(feedbacks[0])
    expect(view.metrics).not.toBe(feedbacks[0]?.metricIds)
    expect(view.metrics[0]).not.toBe(feedbacks[0]?.metricIds[0])
  })
})
