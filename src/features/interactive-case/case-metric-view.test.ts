import { describe, expect, it, vi } from 'vitest'
import {
  PROFRESOLVE_CASE_ID,
  PROFRESOLVE_GROWTH_CONVERSION_CASE,
} from '@/data/interactive-case/profresolve-growth-conversion-demo'
import {
  buildCaseMetricView,
  buildCaseMetricViews,
  caseDirectionInterpretation,
  caseTrendSentence,
  formatCaseVariation,
  selectCaseMetricView,
} from '@/features/interactive-case/case-metric-view'
import { formatMetricValue } from '@/lib/domain-labels'
import { createEmptyWorkspace } from '@/lib/storage/schema'
import { loadWorkspace, type StorageLike } from '@/lib/storage/workspace-storage'
import { ROUTE_IDS, parseLocation } from '@/lib/routing'

const scenario = PROFRESOLVE_GROWTH_CONVERSION_CASE
const views = buildCaseMetricViews(scenario.metrics)
const PERIODS = ['2026-06', '2026-07', '2026-08', '2026-09']

const CONVERSION_ID = 'case-metric-free-to-premium-conversion'
const ONBOARDING_ID = 'case-metric-onboarding-completion'
const VISITS_ID = 'case-metric-premium-page-visits'

function viewById(id: string) {
  const view = views.find((item) => item.id === id)
  if (!view) throw new Error(`Indicador ausente: ${id}`)
  return view
}

describe('carregamento do cenário', () => {
  it('carrega o cenário ProfResolve a partir do dataset existente', () => {
    expect(scenario.id).toBe(PROFRESOLVE_CASE_ID)
    expect(scenario.productName).toBe('ProfResolve')
    expect(scenario.metrics).toHaveLength(3)
    expect(views).toHaveLength(scenario.metrics.length)
    expect(views.map((view) => view.id)).toEqual(scenario.metrics.map((metric) => metric.id))
  })

  it('calcula uma série por indicador sem alterar o dataset', () => {
    const snapshot = JSON.stringify(scenario)

    const rebuilt = buildCaseMetricViews(scenario.metrics)
    expect(rebuilt).toHaveLength(3)

    expect(JSON.stringify(scenario)).toBe(snapshot)
    expect(Object.isFrozen(scenario)).toBe(true)
    expect(Object.isFrozen(scenario.metrics[0])).toBe(true)
    expect(rebuilt[0]?.series).not.toBe(scenario.metrics[0]?.observations)
  })
})

describe('três indicadores e quatro períodos', () => {
  it('expõe os três indicadores esperados', () => {
    expect(views.map((view) => view.id)).toEqual([CONVERSION_ID, ONBOARDING_ID, VISITS_ID])
    expect(viewById(CONVERSION_ID).name).toBe(
      'Conversão de usuários gratuitos para Premium',
    )
    expect(viewById(ONBOARDING_ID).name).toBe('Conclusão do onboarding gratuito')
    expect(viewById(VISITS_ID).name).toBe('Visitas à página de planos Premium')
  })

  it('apresenta os quatro períodos de junho a setembro de 2026 em cada série', () => {
    for (const view of views) {
      expect(view.series).toHaveLength(4)
      expect(view.series.map((point) => point.period)).toEqual(PERIODS)
      expect(view.first.period).toBe(PERIODS[0])
      expect(view.last.period).toBe(PERIODS[3])
      expect(view.variation.previous.period).toBe(PERIODS[0])
      expect(view.variation.current.period).toBe(PERIODS[3])
    }
  })
})

describe('cálculo das variações', () => {
  it('calcula a variação da conversão em pontos percentuais', () => {
    const view = viewById(CONVERSION_ID)

    expect(view.first.value).toBe(5.2)
    expect(view.last.value).toBe(3.4)
    expect(view.variation.absolute).toBeCloseTo(-1.8, 6)
    expect(view.variation.direction).toBe('down')
    expect(view.variation.favorable).toBe(false)
    expect(formatCaseVariation(view.unit, view.variation.absolute)).toBe('-1,8 p.p.')
  })

  it('calcula a variação do onboarding em pontos percentuais', () => {
    const view = viewById(ONBOARDING_ID)

    expect(view.first.value).toBe(60)
    expect(view.last.value).toBe(43)
    expect(view.variation.absolute).toBeCloseTo(-17, 6)
    expect(view.variation.direction).toBe('down')
    expect(view.variation.favorable).toBe(false)
    expect(formatCaseVariation(view.unit, view.variation.absolute)).toBe('-17 p.p.')
  })

  it('calcula a variação das visitas em contagem absoluta', () => {
    const view = viewById(VISITS_ID)

    expect(view.first.value).toBe(3200)
    expect(view.last.value).toBe(4200)
    expect(view.variation.absolute).toBe(1000)
    expect(view.variation.relative).toBeCloseTo(31.25, 6)
    expect(view.variation.direction).toBe('up')
    expect(view.variation.favorable).toBe(true)
    expect(formatCaseVariation(view.unit, view.variation.absolute)).toBe('+1.000')
  })

  it('não confunde variação absoluta com variação relativa', () => {
    const view = viewById(CONVERSION_ID)

    expect(formatCaseVariation(view.unit, view.variation.absolute)).toContain('p.p.')
    expect(formatCaseVariation(view.unit, view.variation.absolute)).not.toContain('%')
    expect(view.variation.relative).not.toBeCloseTo(view.variation.absolute, 3)
  })
})

describe('formatação', () => {
  it('formata percentuais no padrão pt-BR', () => {
    expect(formatMetricValue(5.2, 'percent')).toBe('5,2%')
    expect(formatMetricValue(3.4, 'percent')).toBe('3,4%')
    expect(formatMetricValue(43, 'percent')).toBe('43%')
  })

  it('formata contagens com separador de milhar', () => {
    expect(formatMetricValue(3200, 'count')).toBe('3.200')
    expect(formatMetricValue(4200, 'count')).toBe('4.200')
    expect(formatCaseVariation('count', 1000)).toBe('+1.000')
  })
})

describe('seleção e alternância de indicadores', () => {
  it('seleciona o indicador informado', () => {
    expect(selectCaseMetricView(views, ONBOARDING_ID)?.id).toBe(ONBOARDING_ID)
    expect(selectCaseMetricView(views, VISITS_ID)?.first.value).toBe(3200)
  })

  it('usa o primeiro indicador como padrão', () => {
    expect(selectCaseMetricView(views, null)?.id).toBe(CONVERSION_ID)
    expect(selectCaseMetricView(views, 'unknown')?.id).toBe(CONVERSION_ID)
    expect(selectCaseMetricView([], CONVERSION_ID)).toBeNull()
  })

  it('mantém as séries independentes ao alternar', () => {
    const conversion = selectCaseMetricView(views, CONVERSION_ID)
    const visits = selectCaseMetricView(views, VISITS_ID)

    expect(conversion?.series.map((point) => point.value)).toEqual([5.2, 4.8, 4.1, 3.4])
    expect(visits?.series.map((point) => point.value)).toEqual([3200, 3410, 3750, 4200])
    expect(conversion?.unit).toBe('percent')
    expect(visits?.unit).toBe('count')
  })
})

describe('resumo textual da tendência', () => {
  it('descreve queda e aumento sem afirmar causalidade', () => {
    const conversion = caseTrendSentence(viewById(CONVERSION_ID))
    const onboarding = caseTrendSentence(viewById(ONBOARDING_ID))
    const visits = caseTrendSentence(viewById(VISITS_ID))

    expect(conversion).toContain('queda')
    expect(conversion).toContain('5,2%')
    expect(conversion).toContain('3,4%')
    expect(onboarding).toContain('queda')
    expect(visits).toContain('aumento')
    expect(visits).toContain('3.200')
    expect(visits).toContain('4.200')

    for (const sentence of [conversion, onboarding, visits]) {
      expect(sentence.toLowerCase()).not.toContain('causou')
      expect(sentence.toLowerCase()).not.toContain('porque')
      expect(sentence.toLowerCase()).not.toContain('provocou')
    }
  })

  it('interpreta a direção frente à direção desejada', () => {
    expect(caseDirectionInterpretation(viewById(CONVERSION_ID))).toBe(
      'Tendência de queda, oposta à direção desejada.',
    )
    expect(caseDirectionInterpretation(viewById(VISITS_ID))).toBe(
      'Tendência de aumento, alinhada à direção desejada.',
    )
  })
})

describe('isolamento dos dados', () => {
  it('não grava dados demonstrativos no Workspace nem no LocalStorage', () => {
    const getItem = vi.fn(() => null)
    const setItem = vi.fn()
    const removeItem = vi.fn()
    const storage: StorageLike = { getItem, setItem, removeItem }

    const loaded = loadWorkspace(storage)
    const rebuilt = buildCaseMetricViews(scenario.metrics)

    expect(loaded.status).toBe('empty')
    expect(loaded.workspace).toEqual(createEmptyWorkspace())
    expect(rebuilt).toHaveLength(3)
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()

    const workspaceIds = new Set([
      ...loaded.workspace.metrics.map((metric) => metric.id),
      ...loaded.workspace.observations.map((observation) => observation.id),
      ...loaded.workspace.feedbacks.map((feedback) => feedback.id),
      ...loaded.workspace.decisions.map((decision) => decision.id),
    ])
    for (const view of rebuilt) {
      expect(workspaceIds.has(view.id)).toBe(false)
    }
    expect(workspaceIds.size).toBe(0)
  })

  it('descarta indicadores sem observações suficientes', () => {
    const [firstMetric] = scenario.metrics
    expect(firstMetric).toBeDefined()
    if (!firstMetric) return

    const emptyMetric = {
      ...firstMetric,
      observations: [],
    }
    expect(buildCaseMetricView(emptyMetric)).toBeNull()
  })
})

describe('preservação das rotas existentes', () => {
  it('mantém as quatro rotas conhecidas', () => {
    expect(ROUTE_IDS).toEqual(['overview', 'feedbacks', 'decisions', 'interactive-case'])
    expect(parseLocation('#/interactive-case').route).toBe('interactive-case')
    expect(parseLocation('#/overview?metric=metric-1')).toEqual({
      route: 'overview',
      params: { metric: 'metric-1' },
    })
    expect(parseLocation('#/decisions').route).toBe('decisions')
    expect(parseLocation('#/feedbacks').route).toBe('feedbacks')
  })
})
