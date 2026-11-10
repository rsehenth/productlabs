import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricObservation, ProductMetric } from '@/types/domain'
import { useLanguage } from '@/hooks/use-language'
import { sortObservations } from '@/lib/analytics'
import { locale } from '@/lib/i18n'
import { formatMetricValue, formatPeriod, formatPeriodShort } from '@/lib/domain-labels'

/** Moeda no eixo em notação compacta para não cortar rótulos longos; tooltip e legenda mantêm o valor exato. */
function formatAxisValue(value: number, unit: ProductMetric['unit']): string {
  if (unit !== 'currency') return formatMetricValue(value, unit)
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

const AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--color-muted-foreground)',
  fontFamily: 'var(--font-mono)',
}

export function MetricChart({
  metric,
  observations,
}: {
  metric: ProductMetric
  observations: MetricObservation[]
}) {
  const { t: translate } = useLanguage()
  const series = sortObservations(observations).map((observation) => ({
    period: observation.period,
    value: observation.value,
  }))
  if (series.length === 0) return null

  const first = series[0]
  const last = series[series.length - 1]

  return (
    <figure className="rounded-lg border border-border bg-card p-4">
      <figcaption className="sr-only">
        {translate(
          'Evolução de {name} com {count} observação(ões){range}.',
          {
            name: metric.name,
            count: series.length,
            range:
              first && last
                ? translate(
                    ', de {firstValue} em {firstPeriod} a {lastValue} em {lastPeriod}',
                    {
                      firstValue: formatMetricValue(first.value, metric.unit),
                      firstPeriod: formatPeriod(first.period),
                      lastValue: formatMetricValue(last.value, metric.unit),
                      lastPeriod: formatPeriod(last.period),
                    },
                  )
                : '',
          },
        )}
      </figcaption>
      <div className="h-60 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 12, right: 16, bottom: 0, left: -6 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.7} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-input)' }}
              interval="preserveStartEnd"
              tickFormatter={formatPeriodShort}
              tick={AXIS_TICK}
              dy={8}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatAxisValue(Number(value), metric.unit)}
              tick={AXIS_TICK}
              width={metric.unit === 'currency' ? 84 : 72}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={({ active, payload, label }) => {
                const point = active ? payload?.[0] : undefined
                if (!point) return null
                return (
                  <div className="rounded-md border border-input bg-popover px-3 py-2 shadow-md">
                    <p className="text-xs text-muted-foreground">{formatPeriod(String(label))}</p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-foreground tabular-nums">
                      {formatMetricValue(Number(point.value), metric.unit)}
                    </p>
                  </div>
                )
              }}
            />
            <Line
              type="linear"
              dataKey="value"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, index } = props as { cx: number; cy: number; index: number }
                const isLast = index === series.length - 1
                return (
                  <g key={index}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLast ? 5 : 3.5}
                      fill={isLast ? 'var(--color-chart-1)' : 'var(--color-card)'}
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                    />
                  </g>
                )
              }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {first && last ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {series.length === 1
            ? translate('Uma observação: {value} em {period}.', {
                value: formatMetricValue(first.value, metric.unit),
                period: formatPeriod(first.period),
              })
            : translate('{firstValue} em {firstPeriod} → {lastValue} em {lastPeriod}.', {
                firstValue: formatMetricValue(first.value, metric.unit),
                firstPeriod: formatPeriod(first.period),
                lastValue: formatMetricValue(last.value, metric.unit),
                lastPeriod: formatPeriod(last.period),
              })}
        </p>
      ) : null}
    </figure>
  )
}
