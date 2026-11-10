import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { ProductMetric } from '@/types/domain'
import type { MetricSummary } from '@/lib/analytics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  METRIC_DIRECTION_LABELS,
  METRIC_UNIT_LABELS,
  formatAbsoluteVariation,
  formatMetricValue,
  formatPeriod,
  formatRelativeVariation,
} from '@/lib/domain-labels'

interface MetricCardProps {
  metric: ProductMetric
  summary: MetricSummary
  feedbackCount: number
  decisionCount: number
  onOpen: () => void
}

export function MetricCard({
  metric,
  summary,
  feedbackCount,
  decisionCount,
  onOpen,
}: MetricCardProps) {
  const { latest, previous, variation } = summary
  const DirectionIcon = variation?.direction === 'up' ? TrendingUp : variation?.direction === 'down' ? TrendingDown : Minus
  const DesiredIcon = metric.desiredDirection === 'increase' ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="h-full">
      <CardHeader className="gap-1.5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 text-[15px] leading-snug font-medium wrap-anywhere">{metric.name}</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {METRIC_UNIT_LABELS[metric.unit]}
          </Badge>
        </div>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {metric.description || 'Sem descrição registrada.'}
        </p>
      </CardHeader>

      <CardContent className="mt-auto space-y-4 wrap-anywhere">
        <div>
          <p className="font-mono text-[2rem] leading-none font-medium tracking-[-0.07em] text-foreground tabular-nums">
            {latest ? formatMetricValue(latest.value, metric.unit) : '—'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {latest ? `Último período: ${formatPeriod(latest.period)}` : 'Nenhuma observação'}
          </p>
        </div>

        {/* Bloco de altura mínima fixa: a variação fica na mesma posição em todos os cartões. */}
        <div className="min-h-[5.25rem] rounded-lg bg-muted/70 px-3 py-2.5">
          {variation ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-mono text-sm font-medium text-foreground tabular-nums">
                  <DirectionIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Variação absoluta: </span>
                  {formatAbsoluteVariation(variation.absolute, metric.unit)}
                </p>
                <VariationBadge favorable={variation.favorable} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {variation.relative === null ? (
                  formatRelativeVariation(null)
                ) : (
                  <>
                    <span className="font-mono text-foreground">
                      {formatRelativeVariation(variation.relative)}
                    </span>{' '}
                    em termos relativos
                  </>
                )}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {variation.direction === 'flat'
                  ? 'Sem variação em relação ao período anterior.'
                  : `Antes: ${formatMetricValue(variation.previous.value, metric.unit)} em ${formatPeriod(variation.previous.period)}`}
              </p>
            </>
          ) : (
            <>
              <Badge variant="outline">Sem comparação</Badge>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Histórico insuficiente para comparação.
                {previous ? '' : ' Registre ao menos duas observações.'}
              </p>
            </>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <DesiredIcon className="size-3.5" aria-hidden="true" />
          Direção desejada: {METRIC_DIRECTION_LABELS[metric.desiredDirection].toLowerCase()}
        </p>
      </CardContent>

      <CardFooter className="mt-4 justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {summary.observations.length} obs. · {feedbackCount} feedbacks · {decisionCount}{' '}
          decisões
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpen}
          aria-label={`Abrir indicador ${metric.name}`}
        >
          Abrir indicador
        </Button>
      </CardFooter>
    </Card>
  )
}

export function VariationBadge({ favorable }: { favorable: boolean | null }) {
  if (favorable === null) return <Badge variant="outline">Estável</Badge>
  return favorable ? (
    <Badge variant="success">Favorável</Badge>
  ) : (
    <Badge variant="destructive">Desfavorável</Badge>
  )
}
