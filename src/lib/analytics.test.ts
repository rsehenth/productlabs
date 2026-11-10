import { describe, expect, it } from 'vitest'
import {
  computeVariation,
  latestObservation,
  metricSummary,
  observationsForMetric,
  sortObservations,
} from '@/lib/analytics'
import { formatAbsoluteVariation, formatRelativeVariation } from '@/lib/domain-labels'
import { buildMetric, buildObservation, buildWorkspace } from '@/test/fixtures'

describe('ordenação de observações', () => {
  it('ordena cronologicamente mesmo com entrada desordenada', () => {
    const observations = [
      buildObservation({ id: 'c', period: '2026-10' }),
      buildObservation({ id: 'a', period: '2026-01' }),
      buildObservation({ id: 'b', period: '2026-07' }),
    ]

    expect(sortObservations(observations).map((item) => item.period)).toEqual([
      '2026-01',
      '2026-07',
      '2026-10',
    ])
  })

  it('filtra observações por indicador', () => {
    const workspace = buildWorkspace({
      observations: [
        buildObservation({ id: 'a', metricId: 'metric-1' }),
        buildObservation({ id: 'b', metricId: 'metric-2' }),
      ],
    })

    expect(observationsForMetric(workspace, 'metric-1')).toHaveLength(1)
  })

  it('identifica a observação mais recente', () => {
    const workspace = buildWorkspace({
      observations: [
        buildObservation({ id: 'a', period: '2026-10', value: 3.8 }),
        buildObservation({ id: 'b', period: '2026-07', value: 4.2 }),
      ],
    })

    expect(latestObservation(workspace, 'metric-1')?.value).toBe(3.8)
  })

  it('retorna null quando não há observações', () => {
    const workspace = buildWorkspace()
    expect(latestObservation(workspace, 'metric-1')).toBeNull()
    expect(metricSummary(workspace, buildMetric()).variation).toBeNull()
  })
})

describe('cálculo de variação', () => {
  const increase = buildMetric({ unit: 'percent', desiredDirection: 'increase' })

  it('calcula pontos percentuais separados da variação relativa', () => {
    const previous = buildObservation({ id: 'prev', period: '2026-09', value: 4.5 })
    const current = buildObservation({ id: 'curr', period: '2026-10', value: 3.8 })

    const variation = computeVariation(previous, current, increase)

    expect(variation.absolute).toBeCloseTo(-0.7, 6)
    expect(variation.relative).toBeCloseTo(-15.5556, 3)
    expect(variation.direction).toBe('down')
    expect(variation.favorable).toBe(false)
  })

  it('formata pontos percentuais e variação relativa de forma distinta', () => {
    expect(formatAbsoluteVariation(-0.7, 'percent')).toBe('-0,7 p.p.')
    expect(formatRelativeVariation(-15.5556)).toBe('-15,6%')
  })

  it('calcula contagem com absoluto e relativo', () => {
    const previous = buildObservation({ id: 'prev', value: 1000 })
    const current = buildObservation({ id: 'curr', value: 1200 })
    const metric = buildMetric({ unit: 'count' })

    const variation = computeVariation(previous, current, metric)

    expect(variation.absolute).toBe(200)
    expect(variation.relative).toBeCloseTo(20, 6)
    expect(variation.favorable).toBe(true)
    expect(formatAbsoluteVariation(200, 'count')).toBe('+200')
  })

  it('interpreta duração conforme a direção desejada', () => {
    const previous = buildObservation({ id: 'prev', value: 10 })
    const current = buildObservation({ id: 'curr', value: 8 })

    expect(
      computeVariation(previous, current, buildMetric({ desiredDirection: 'decrease' }))
        .favorable,
    ).toBe(true)
    expect(
      computeVariation(previous, current, buildMetric({ desiredDirection: 'increase' }))
        .favorable,
    ).toBe(false)
  })

  it('mantém a variação absoluta quando o valor anterior é zero', () => {
    const previous = buildObservation({ id: 'prev', value: 0 })
    const current = buildObservation({ id: 'curr', value: 10 })

    const variation = computeVariation(previous, current, buildMetric({ unit: 'count' }))

    expect(variation.absolute).toBe(10)
    expect(variation.relative).toBeNull()
    expect(formatRelativeVariation(variation.relative)).toBe(
      'Variação relativa indisponível.',
    )
  })

  it('marca valores iguais como estáveis, sem favorabilidade', () => {
    const previous = buildObservation({ id: 'prev', value: 10 })
    const current = buildObservation({ id: 'curr', value: 10 })

    const variation = computeVariation(previous, current, buildMetric())

    expect(variation.absolute).toBe(0)
    expect(variation.relative).toBe(0)
    expect(variation.direction).toBe('flat')
    expect(variation.favorable).toBeNull()
  })
})

describe('resumo do indicador', () => {
  it('não calcula tendência com apenas uma observação', () => {
    const metric = buildMetric()
    const workspace = buildWorkspace({ observations: [buildObservation()] })

    const summary = metricSummary(workspace, metric)

    expect(summary.latest).not.toBeNull()
    expect(summary.previous).toBeNull()
    expect(summary.variation).toBeNull()
  })

  it('ordena antes de comparar períodos fora de ordem', () => {
    const metric = buildMetric()
    const workspace = buildWorkspace({
      observations: [
        buildObservation({ id: 'new', period: '2026-10', value: 3.8 }),
        buildObservation({ id: 'old', period: '2026-09', value: 4.5 }),
      ],
    })

    const summary = metricSummary(workspace, metric)

    expect(summary.previous?.value).toBe(4.5)
    expect(summary.latest?.value).toBe(3.8)
    expect(summary.variation?.absolute).toBeCloseTo(-0.7, 6)
  })
})
