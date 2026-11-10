import type { CaseMetric } from '@/types/interactive-case'
import type { MetricObservation, MetricUnit } from '@/types/domain'
import { computeVariation, sortObservations } from '@/lib/analytics'
import type { MetricVariation } from '@/lib/analytics'
import { t } from '@/lib/i18n'
import {
  formatAbsoluteVariation,
  formatMetricValue,
  formatPeriod,
} from '@/lib/domain-labels'

export interface CaseMetricPoint {
  period: string
  value: number
}

export interface CaseMetricView {
  id: string
  name: string
  description: string
  unit: MetricUnit
  series: CaseMetricPoint[]
  first: CaseMetricPoint
  last: CaseMetricPoint
  variation: MetricVariation
}

/** Adapta as observações do cenário ao formato aceito pelos cálculos do Workspace. */
function toMetricObservations(metric: CaseMetric): MetricObservation[] {
  return sortObservations(
    metric.observations.map((observation) => ({
      id: observation.id,
      metricId: metric.id,
      period: observation.period,
      value: observation.value,
      createdAt: '',
    })),
  )
}

export function buildCaseMetricView(metric: CaseMetric): CaseMetricView | null {
  const observations = toMetricObservations(metric)
  const first = observations[0]
  const last = observations[observations.length - 1]
  if (!first || !last || observations.length < 2) return null

  return {
    id: metric.id,
    name: metric.name,
    description: metric.description,
    unit: metric.unit,
    series: observations.map((observation) => ({
      period: observation.period,
      value: observation.value,
    })),
    first: { period: first.period, value: first.value },
    last: { period: last.period, value: last.value },
    variation: computeVariation(first, last, metric),
  }
}

export function buildCaseMetricViews(metrics: readonly CaseMetric[]): CaseMetricView[] {
  const views: CaseMetricView[] = []
  for (const metric of metrics) {
    const view = buildCaseMetricView(metric)
    if (view) views.push(view)
  }
  return views
}

export function selectCaseMetricView(
  views: readonly CaseMetricView[],
  metricId: string | null,
): CaseMetricView | null {
  if (views.length === 0) return null
  return views.find((view) => view.id === metricId) ?? views[0] ?? null
}

export function formatCaseVariation(unit: MetricUnit, delta: number): string {
  if (unit === 'percent') return formatAbsoluteVariation(delta, unit)
  const formatted = formatMetricValue(delta, unit)
  return delta > 0 ? `+${formatted}` : formatted
}

export function caseTrendSentence(view: CaseMetricView): string {
  const name = t(view.name)
  const firstValue = formatMetricValue(view.first.value, view.unit)
  const lastValue = formatMetricValue(view.last.value, view.unit)
  const from = formatPeriod(view.first.period)
  const to = formatPeriod(view.last.period)
  const periods = t('{count} períodos', { count: view.series.length })

  switch (view.variation.direction) {
    case 'up':
      return t(
        '{name}: aumento de {firstValue} em {from} para {lastValue} em {to}, ao longo de {periods}.',
        { name, firstValue, from, lastValue, to, periods },
      )
    case 'down':
      return t(
        '{name}: queda de {firstValue} em {from} para {lastValue} em {to}, ao longo de {periods}.',
        { name, firstValue, from, lastValue, to, periods },
      )
    case 'flat':
      return t(
        '{name}: estável em {firstValue} entre {from} e {to}, ao longo de {periods}.',
        { name, firstValue, from, to, periods },
      )
  }
}

export function caseDirectionInterpretation(view: CaseMetricView): string {
  const trend =
    view.variation.direction === 'up'
      ? t('Tendência de aumento')
      : view.variation.direction === 'down'
        ? t('Tendência de queda')
        : t('Sem variação no intervalo')
  const relation =
    view.variation.favorable === null
      ? ''
      : view.variation.favorable
        ? t(', alinhada à direção desejada')
        : t(', oposta à direção desejada')
  return `${trend}${relation}.`
}
