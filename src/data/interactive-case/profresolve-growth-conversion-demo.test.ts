import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CASE_SIMULATION_NOTICE,
  PROFRESOLVE_CASE_ID,
  PROFRESOLVE_GROWTH_CONVERSION_CASE,
} from '@/data/interactive-case/profresolve-growth-conversion-demo'
import type { CaseMetric } from '@/types/interactive-case'
import { createEmptyWorkspace } from '@/lib/storage/schema'
import { loadWorkspace, type StorageLike } from '@/lib/storage/workspace-storage'
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_SOURCES,
  METRIC_DIRECTIONS,
  METRIC_UNITS,
} from '@/lib/storage/validation'

const scenario = PROFRESOLVE_GROWTH_CONVERSION_CASE
const metricIds = new Set(scenario.metrics.map((metric) => metric.id))
const feedbackIds = new Set(scenario.feedbacks.map((feedback) => feedback.id))
const allObservations = scenario.metrics.flatMap((metric) => metric.observations)
const periods = [...new Set(allObservations.map((observation) => observation.period))]
const caseRecordIds = [
  scenario.id,
  ...scenario.metrics.map((metric) => metric.id),
  ...scenario.metrics.flatMap((metric) => metric.observations.map((observation) => observation.id)),
  ...scenario.feedbacks.map((feedback) => feedback.id),
  ...scenario.decisionOptions.map((option) => option.id),
]

function metricById(id: string) {
  return scenario.metrics.find((metric) => metric.id === id)
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== 'object') return
  expect(Object.isFrozen(value)).toBe(true)
  for (const nested of Object.values(value)) expectDeepFrozen(nested)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('cenário demonstrativo do Interactive Case', () => {
  it('usa o identificador estável e único do cenário', () => {
    expect(PROFRESOLVE_CASE_ID).toBe('profresolve-growth-conversion-demo')
    expect(scenario.id).toBe(PROFRESOLVE_CASE_ID)
    expect(scenario.type).toBe('demonstrative-case-study')
    expect(scenario.productName).toBe('ProfResolve')
    expect(scenario.title).toContain('ProfResolve')
    expect(scenario.mainQuestion.trim().length).toBeGreaterThan(0)
    expect(caseRecordIds.filter((id) => id === scenario.id)).toHaveLength(1)
  })

  it('mantém indicadores com contrato completo', () => {
    expect(scenario.metrics.length).toBeGreaterThanOrEqual(2)
    expect(scenario.metrics.length).toBeLessThanOrEqual(3)

    for (const metric of scenario.metrics) {
      expect(metric.id).toMatch(/^case-metric-/)
      expect(metric.name.trim().length).toBeGreaterThan(0)
      expect(metric.description.trim().length).toBeGreaterThan(0)
      expect(METRIC_UNITS).toContain(metric.unit)
      expect(METRIC_DIRECTIONS).toContain(metric.desiredDirection)
      expect(metric.observations).toHaveLength(4)
      expect(metric.origin.kind).toBe('simulated')
    }
  })

  it('usa quatro períodos mensais válidos em todos os indicadores', () => {
    expect(periods).toHaveLength(4)
    for (const period of periods) {
      expect(period).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    }

    for (const metric of scenario.metrics) {
      const ownPeriods = metric.observations.map((observation) => observation.period)
      expect(ownPeriods).toEqual(periods)
      expect(new Set(ownPeriods).size).toBe(ownPeriods.length)
    }
  })

  it('mantém todos os valores numéricos finitos', () => {
    for (const observation of allObservations) {
      expect(Number.isFinite(observation.value)).toBe(true)
      expect(observation.value).toBeGreaterThanOrEqual(0)

      if (observation.numerator !== undefined) {
        expect(Number.isInteger(observation.numerator)).toBe(true)
        expect(observation.numerator).toBeGreaterThanOrEqual(0)
      }
      if (observation.denominator !== undefined) {
        expect(Number.isInteger(observation.denominator)).toBe(true)
        expect(observation.denominator).toBeGreaterThan(0)
      }
    }
  })

  it('mantém taxas coerentes com numeradores e denominadores', () => {
    for (const metric of scenario.metrics) {
      for (const observation of metric.observations) {
        if (metric.unit !== 'percent') continue

        const { numerator, denominator } = observation
        expect(numerator).toBeTypeOf('number')
        expect(denominator).toBeTypeOf('number')
        if (numerator === undefined || denominator === undefined) continue

        expect(numerator).toBeLessThanOrEqual(denominator)
        expect(round((numerator / denominator) * 100, 1)).toBe(observation.value)
      }
    }

    const conversion = metricById('case-metric-free-to-premium-conversion')
    const onboarding = metricById('case-metric-onboarding-completion')
    const visits = metricById('case-metric-premium-page-visits')
    const firstConversion = conversion?.observations[0]
    const lastConversion = conversion?.observations.at(-1)
    const firstOnboarding = onboarding?.observations[0]
    const lastOnboarding = onboarding?.observations.at(-1)
    const firstVisits = visits?.observations[0]
    const lastVisits = visits?.observations.at(-1)

    expect(firstConversion && lastConversion).toBeTruthy()
    expect(firstOnboarding && lastOnboarding).toBeTruthy()
    expect(firstVisits && lastVisits).toBeTruthy()
    if (
      !firstConversion ||
      !lastConversion ||
      !firstOnboarding ||
      !lastOnboarding ||
      !firstVisits ||
      !lastVisits
    ) {
      return
    }

    expect(firstConversion.value).toBeGreaterThan(lastConversion.value)
    expect(firstOnboarding.value).toBeGreaterThan(lastOnboarding.value)
    expect(firstVisits.value).toBeLessThan(lastVisits.value)
  })

  it('usa identificadores únicos em todas as coleções', () => {
    expect(new Set(caseRecordIds).size).toBe(caseRecordIds.length)
    expect(new Set(scenario.metrics.map((metric) => metric.id)).size).toBe(
      scenario.metrics.length,
    )
    expect(new Set(scenario.feedbacks.map((feedback) => feedback.id)).size).toBe(
      scenario.feedbacks.length,
    )
    expect(new Set(scenario.decisionOptions.map((option) => option.id)).size).toBe(
      scenario.decisionOptions.length,
    )
    expect(new Set(allObservations.map((observation) => observation.id)).size).toBe(
      allObservations.length,
    )
  })

  it('relaciona feedbacks a indicadores existentes e preserva perspectivas distintas', () => {
    expect(scenario.feedbacks).toHaveLength(8)

    const categories = new Set(scenario.feedbacks.map((feedback) => feedback.category))
    const sources = new Set(scenario.feedbacks.map((feedback) => feedback.source))
    const metricSets = new Set(
      scenario.feedbacks.map((feedback) => [...feedback.metricIds].sort().join('|')),
    )

    expect(categories.size).toBeGreaterThanOrEqual(3)
    expect(sources.size).toBeGreaterThanOrEqual(3)
    expect(metricSets.size).toBeGreaterThan(1)

    for (const feedback of scenario.feedbacks) {
      expect(feedback.content.trim().length).toBeGreaterThan(0)
      expect(FEEDBACK_CATEGORIES).toContain(feedback.category)
      expect(FEEDBACK_SOURCES).toContain(feedback.source)
      expect(feedback.origin.kind).toBe('simulated')
      expect(feedback.metricIds.length).toBeGreaterThan(0)
      expect(new Set(feedback.metricIds).size).toBe(feedback.metricIds.length)

      for (const metricId of feedback.metricIds) {
        expect(metricIds.has(metricId)).toBe(true)
      }
    }

    for (const metricId of metricIds) {
      expect(scenario.feedbacks.some((feedback) => feedback.metricIds.includes(metricId))).toBe(
        true,
      )
    }
  })

  it('estrutura três alternativas com benefícios, riscos e limites', () => {
    expect(scenario.decisionOptions).toHaveLength(3)

    for (const option of scenario.decisionOptions) {
      expect(option.id).toMatch(/^case-option-/)
      expect(option.description.trim().length).toBeGreaterThan(0)
      expect(option.benefits.length).toBeGreaterThan(0)
      expect(option.risks.length).toBeGreaterThanOrEqual(2)
      expect(option.additionalInformation.length).toBeGreaterThan(0)

      for (const list of [option.benefits, option.risks, option.additionalInformation]) {
        expect(list.every((item) => item.trim().length > 0)).toBe(true)
      }

      expect(option.metricIds.length + option.feedbackIds.length).toBeGreaterThan(0)
      expect('recommended' in option).toBe(false)
      expect('isCorrect' in option).toBe(false)
    }
  })

  it('não deixa referências órfãs nas alternativas', () => {
    for (const option of scenario.decisionOptions) {
      expect(new Set(option.metricIds).size).toBe(option.metricIds.length)
      expect(new Set(option.feedbackIds).size).toBe(option.feedbackIds.length)

      for (const metricId of option.metricIds) {
        expect(metricIds.has(metricId)).toBe(true)
      }
      for (const feedbackId of option.feedbackIds) {
        expect(feedbackIds.has(feedbackId)).toBe(true)
      }
    }

    for (const metricId of metricIds) {
      expect(scenario.decisionOptions.some((option) => option.metricIds.includes(metricId))).toBe(
        true,
      )
    }
    for (const feedbackId of feedbackIds) {
      expect(
        scenario.decisionOptions.some((option) => option.feedbackIds.includes(feedbackId)),
      ).toBe(true)
    }
  })

  it('identifica explicitamente a origem simulada de todas as informações', () => {
    expect(CASE_SIMULATION_NOTICE).toMatch(/simulad/i)
    expect(`${scenario.description} ${scenario.problem}`).toMatch(/simulad/i)
    expect(scenario.origin.kind).toBe('simulated')
    expect(scenario.origin.note).toMatch(/simulad|demonstrativ/i)

    const origins = [
      scenario.origin,
      ...scenario.metrics.map((metric) => metric.origin),
      ...scenario.feedbacks.map((feedback) => feedback.origin),
    ]

    for (const origin of origins) {
      expect(origin.kind).toBe('simulated')
      expect(origin.note.trim().length).toBeGreaterThan(0)
      expect(origin.note).toMatch(/simulad|exercício|demonstrativ/i)

      if (origin.kind === 'documented') {
        expect(origin.reference.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('não grava o cenário no Workspace nem no LocalStorage', async () => {
    const getItem = vi.fn(() => null)
    const setItem = vi.fn()
    const removeItem = vi.fn()
    const storage: StorageLike = { getItem, setItem, removeItem }

    const loaded = loadWorkspace(storage)
    expect(loaded.status).toBe('empty')
    expect(loaded.workspace).toEqual(createEmptyWorkspace())
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()

    const workspaceIds = new Set([
      ...loaded.workspace.metrics.map((metric) => metric.id),
      ...loaded.workspace.observations.map((observation) => observation.id),
      ...loaded.workspace.feedbacks.map((feedback) => feedback.id),
      ...loaded.workspace.decisions.map((decision) => decision.id),
    ])
    for (const id of caseRecordIds) expect(workspaceIds.has(id)).toBe(false)

    vi.stubGlobal('localStorage', storage)
    vi.resetModules()
    const imported = await import('@/data/interactive-case/profresolve-growth-conversion-demo')
    expect(imported.PROFRESOLVE_GROWTH_CONVERSION_CASE.id).toBe(PROFRESOLVE_CASE_ID)
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
  })

  it('mantém o cenário imutável durante a utilização', () => {
    expectDeepFrozen(scenario)
    expect(Reflect.set(scenario, 'title', 'Alterado')).toBe(false)
    expect(scenario.title).toBe('ProfResolve — Growth & Monetization')

    const metrics = scenario.metrics as unknown as CaseMetric[]
    const firstMetric = metrics[0]
    expect(firstMetric).toBeDefined()
    if (!firstMetric) return

    expect(() => metrics.push(firstMetric)).toThrow(TypeError)
    expect(Reflect.set(firstMetric, 'name', 'Alterado')).toBe(false)
    expect(firstMetric.name).toBe('Conversão de usuários gratuitos para Premium')

    const observation = firstMetric.observations[0]
    expect(observation).toBeDefined()
    if (observation) {
      expect(Reflect.set(observation, 'value', 99)).toBe(false)
      expect(observation.value).not.toBe(99)
    }
  })
})
