import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_SOURCE_LABELS } from '@/lib/domain-labels'
import type { CaseFeedbackView } from '@/features/interactive-case/case-feedback-view'

interface CaseFeedbackCardProps {
  view: CaseFeedbackView
  selected: boolean
  highlightedMetricId: string | null
  onToggle: (feedbackId: string) => void
}

export function CaseFeedbackCard({
  view,
  selected,
  highlightedMetricId,
  onToggle,
}: CaseFeedbackCardProps) {
  const { t } = useLanguage()
  return (
    <Card className={cn('border-dashed', selected && 'border-solid border-primary/50 bg-primary/5')}>
      <CardHeader className="gap-2">
        <CaseKindTag kind="evidence" note={t('relato fictício')} />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{FEEDBACK_CATEGORY_LABELS[view.category]}</Badge>
          <Badge variant="outline">{FEEDBACK_SOURCE_LABELS[view.source]}</Badge>
          {view.simulated ? <Badge variant="simulated">{t('Dado simulado')}</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="max-w-[60ch] border-l-2 border-chart-2/50 pl-3 text-[15px] leading-relaxed text-foreground">
          {t(view.content)}
        </p>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
            {t('Indicadores relacionados')}
          </p>
          {view.metrics.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('Nenhum indicador relacionado.')}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {view.metrics.map((metric) => (
                <li key={metric.id}>
                  <Badge
                    variant={metric.id === highlightedMetricId ? 'default' : 'outline'}
                  >
                    {t(metric.name)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <label
          htmlFor={`case-evidence-${view.id}`}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-xs font-medium text-foreground max-sm:min-h-11"
        >
          <input
            id={`case-evidence-${view.id}`}
            type="checkbox"
            className="size-4 cursor-pointer accent-primary"
            checked={selected}
            onChange={() => onToggle(view.id)}
          />
          {selected ? t('Evidência selecionada') : t('Selecionar evidência')}
        </label>
      </CardFooter>
    </Card>
  )
}
