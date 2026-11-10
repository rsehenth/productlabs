import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { demoChartSeries, findDemoMetric, formatDemoValue } from '@/data/demo/demo-dataset'
import { useLanguage } from '@/hooks/use-language'
import { formatPeriod, formatPeriodShort } from '@/lib/domain-labels'

const METRIC_ID = 'demo-metric-activation'

export function DemoActivationChart() {
  const { t } = useLanguage()
  const metric = findDemoMetric(METRIC_ID)
  const series = demoChartSeries(METRIC_ID)
  const values = series.map((point) => point.value)
  const first = values[0]
  const last = values[values.length - 1]

  if (!metric || series.length === 0) return null

  const step = 5
  const min = Math.floor((Math.min(...values) - 2) / step) * step
  const max = Math.ceil((Math.max(...values) + 2) / step) * step
  const ticks = Array.from({ length: (max - min) / step + 1 }, (_, index) => min + index * step)

  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-foreground">{t(metric.name)}</p>
        <span className="text-[11px] text-muted-foreground">{t('% das contas novas')}</span>
      </div>

      <div className="mt-3 h-40 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.7} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={formatPeriodShort}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}
              dy={6}
            />
            <YAxis
              domain={[min, max]}
              ticks={ticks}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--color-muted-foreground)' }}
              itemStyle={{ color: 'var(--color-foreground)' }}
              labelFormatter={(label) => formatPeriod(String(label))}
              formatter={(value) => [
                typeof value === 'number' ? formatDemoValue(METRIC_ID, value) : String(value),
                t(metric.name),
              ]}
            />
            <Line
              type="linear"
              dataKey="value"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: 'var(--color-chart-1)', fill: 'var(--color-card)' }}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {first !== undefined && last !== undefined ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t('Série simulada: {first} em {from} e {last} em {to}.', {
            first: formatDemoValue(METRIC_ID, first),
            from: formatPeriod(series[0]?.period ?? ''),
            last: formatDemoValue(METRIC_ID, last),
            to: formatPeriod(series[series.length - 1]?.period ?? ''),
          })}
        </p>
      ) : null}
    </div>
  )
}
