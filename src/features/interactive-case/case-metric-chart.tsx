import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { METRIC_UNIT_LABELS, formatMetricValue, formatPeriod, formatPeriodShort } from '@/lib/domain-labels'
import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import {
  caseTrendSentence,
  type CaseMetricView,
} from '@/features/interactive-case/case-metric-view'

export function CaseMetricChart({ view }: { view: CaseMetricView }) {
  return (
    <figure className="rounded-lg border border-border/70 bg-background/40 p-4">
      <figcaption className="sr-only">
        {caseTrendSentence(view)} Períodos observados:{' '}
        {view.series
          .map(
            (point) =>
              `${formatPeriod(point.period)}: ${formatMetricValue(point.value, view.unit)}`,
          )
          .join('; ')}
        .
      </figcaption>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-0.5">
          <CaseKindTag kind="simulated" />
          <p className="text-xs font-medium text-foreground">{view.name}</p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Unidade: {METRIC_UNIT_LABELS[view.unit]}
        </span>
      </div>

      <div className="mt-3 h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={view.series} margin={{ top: 12, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={formatPeriodShort}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              dy={6}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatMetricValue(Number(value), view.unit)}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              width={56}
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
                formatMetricValue(
                  typeof value === 'number' ? value : Number(value),
                  view.unit,
                ),
                view.name,
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: 'var(--color-chart-1)' }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <ReferenceDot
              x={view.first.period}
              y={view.first.value}
              r={5}
              fill="var(--color-chart-1)"
              stroke="var(--color-background)"
              strokeWidth={2}
            />
            <ReferenceDot
              x={view.last.period}
              y={view.last.value}
              r={5}
              fill="var(--color-chart-2)"
              stroke="var(--color-background)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-1" aria-hidden="true" />
          Primeira observação
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-2" aria-hidden="true" />
          Última observação
        </span>
      </div>
    </figure>
  )
}
