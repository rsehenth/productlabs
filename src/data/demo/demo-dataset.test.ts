import { describe, expect, it } from 'vitest'
import {
  DEMO_DATASET,
  DEMO_DATASET_NOTICE,
  DEMO_DECISIONS,
  DEMO_FEEDBACKS,
  DEMO_METRICS,
  DEMO_OBSERVATIONS,
  demoChartSeries,
} from '@/data/demo/demo-dataset'

const metricIds = new Set(DEMO_METRICS.map((metric) => metric.id))
const feedbackIds = new Set(DEMO_FEEDBACKS.map((feedback) => feedback.id))

describe('dataset demonstrativo', () => {
  it('marca todos os registros como simulados', () => {
    const simulated = [
      ...DEMO_DATASET.metrics,
      ...DEMO_DATASET.observations,
      ...DEMO_DATASET.feedbacks,
      ...DEMO_DATASET.decisions,
    ]

    expect(simulated.length).toBeGreaterThan(0)
    expect(simulated.every((record) => record.simulated === true)).toBe(true)
    expect(DEMO_DATASET_NOTICE).toMatch(/simulado/i)
  })

  it('usa ids únicos por coleção', () => {
    for (const records of [
      DEMO_DATASET.metrics,
      DEMO_DATASET.observations,
      DEMO_DATASET.feedbacks,
      DEMO_DATASET.decisions,
    ]) {
      const ids = records.map((record) => record.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('relaciona observações a métricas existentes', () => {
    for (const observation of DEMO_OBSERVATIONS) {
      expect(metricIds.has(observation.metricId)).toBe(true)
      expect(observation.period).toMatch(/^\d{4}-\d{2}$/)
    }
  })

  it('tem uma observação por métrica e período', () => {
    const keys = DEMO_OBSERVATIONS.map((item) => `${item.metricId}:${item.period}`)
    expect(new Set(keys).size).toBe(keys.length)
    expect(DEMO_OBSERVATIONS).toHaveLength(DEMO_METRICS.length * 6)
  })

  it('relaciona feedbacks e decisões a registros existentes', () => {
    for (const feedback of DEMO_FEEDBACKS) {
      expect(feedback.metricIds.every((id) => metricIds.has(id))).toBe(true)
    }
    for (const decision of DEMO_DECISIONS) {
      expect(decision.metricIds.every((id) => metricIds.has(id))).toBe(true)
      expect(decision.feedbackIds.every((id) => feedbackIds.has(id))).toBe(true)
    }
  })

  it('mantém a narrativa coerente entre ativação e tempo até o valor', () => {
    const activation = demoChartSeries('demo-metric-activation')
    const timeToValue = demoChartSeries('demo-metric-time-to-value')

    expect(activation).toHaveLength(6)
    expect(timeToValue).toHaveLength(6)

    const firstActivation = activation[0]
    const lastActivation = activation[activation.length - 1]
    const firstTimeToValue = timeToValue[0]
    const lastTimeToValue = timeToValue[timeToValue.length - 1]

    expect(firstActivation && lastActivation && firstTimeToValue && lastTimeToValue).toBeTruthy()
    if (!firstActivation || !lastActivation || !firstTimeToValue || !lastTimeToValue) return

    expect(lastActivation.value).toBeLessThan(firstActivation.value)
    expect(lastTimeToValue.value).toBeGreaterThan(firstTimeToValue.value)
  })
})
