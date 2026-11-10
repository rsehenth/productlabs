import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { VariationBadge } from '@/features/overview/metric-card'
import { METRIC_UNIT_LABELS, formatMetricValue, formatPeriod } from '@/lib/domain-labels'
import {
  caseDirectionInterpretation,
  formatCaseVariation,
  type CaseMetricView,
} from '@/features/interactive-case/case-metric-view'

export function CaseMetricCard({ view }: { view: CaseMetricView }) {
  const { t } = useLanguage()
  return (
    <Card className="h-full border-dashed">
      <CardHeader className="gap-2">
        <CaseKindTag kind="simulated" />
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{t(view.name)}</CardTitle>
          <Badge variant="outline">{METRIC_UNIT_LABELS[view.unit]}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{t(view.description)}</p>
      </CardHeader>

      <CardContent className="mt-auto space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <dl className="flex items-end gap-6">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                {t('Inicial')}
              </dt>
              <dd className="font-mono text-lg tabular-nums text-muted-foreground">
                {formatMetricValue(view.first.value, view.unit)}
              </dd>
              <dd className="font-mono text-[11px] text-muted-foreground/80">
                {formatPeriod(view.first.period)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                {t('Final')}
              </dt>
              <dd className="font-mono text-[2rem] leading-none font-medium tracking-[-0.05em] tabular-nums text-foreground">
                {formatMetricValue(view.last.value, view.unit)}
              </dd>
              <dd className="font-mono text-[11px] text-muted-foreground/80">
                {formatPeriod(view.last.period)}
              </dd>
            </div>
          </dl>
          <VariationBadge favorable={view.variation.favorable} />
        </div>

        <div className="space-y-0.5 text-xs leading-relaxed text-muted-foreground">
          <p>
            {t('Variação: {value} entre {from} e {to}.', {
              value: formatCaseVariation(view.unit, view.variation.absolute),
              from: formatPeriod(view.first.period),
              to: formatPeriod(view.last.period),
            })}
          </p>
          <p>{caseDirectionInterpretation(view)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
