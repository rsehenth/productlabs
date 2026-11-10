import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { CaseMetricChart } from '@/features/interactive-case/case-metric-chart'
import {
  caseTrendSentence,
  formatCaseVariation,
  type CaseMetricView,
} from '@/features/interactive-case/case-metric-view'

interface CaseInvestigationProps {
  views: readonly CaseMetricView[]
  selected: CaseMetricView | null
  onSelect: (metricId: string) => void
}

export function CaseInvestigation({ views, selected, onSelect }: CaseInvestigationProps) {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="case-investigation-title" className="space-y-4">
      <div>
        <h2 id="case-investigation-title" className="text-lg font-semibold text-foreground">
          {t('Investigação visual')}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t('Selecione um indicador para explorar sua evolução nos quatro períodos simulados.')}
        </p>
      </div>

      <div role="group" aria-label={t('Selecionar indicador')} className="flex flex-wrap gap-2">
        {views.map((view) => {
          const isSelected = view.id === selected?.id
          return (
            <Button
              key={view.id}
              size="sm"
              className="max-sm:min-h-11"
              variant={isSelected ? 'default' : 'outline'}
              aria-pressed={isSelected}
              onClick={() => onSelect(view.id)}
            >
              {t(view.name)}
            </Button>
          )
        })}
      </div>

      {selected ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            <CaseMetricChart view={selected} />

            <div className="space-y-1">
              <p className="text-sm leading-relaxed text-foreground">
                {caseTrendSentence(selected)}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('Variação no intervalo:')}{' '}
                <span className="font-medium text-foreground">
                  {formatCaseVariation(selected.unit, selected.variation.absolute)}
                </span>
              </p>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground/80">
              {t(
                'Os indicadores podem apresentar tendências simultâneas sem que isso comprove relação causal.',
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('Nenhum indicador disponível para investigação.')}
        </p>
      )}
    </section>
  )
}
