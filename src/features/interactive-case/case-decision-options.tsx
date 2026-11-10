import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Notice } from '@/components/ui/notice'
import {
  splitCaseEvidenceByOption,
  type CaseDecisionOptionView,
} from '@/features/interactive-case/case-decision-view'
import type { CaseFeedbackView } from '@/features/interactive-case/case-feedback-view'
import { cn } from '@/lib/utils'

interface CaseDecisionOptionsProps {
  options: readonly CaseDecisionOptionView[]
  selectedId: string | null
  selectedEvidence: readonly CaseFeedbackView[]
  onSelect: (optionId: string) => void
}

const OPTIONS_NOTICE =
  'As três alternativas são hipotéticas e não indicam qual delas é superior. A escolha representa a direção que você considera mais apropriada para investigar neste momento.'

function OptionSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1 border-t border-border/60 pt-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">{title}</p>
      {children}
    </div>
  )
}

export function CaseDecisionOptions({
  options,
  selectedId,
  selectedEvidence,
  onSelect,
}: CaseDecisionOptionsProps) {
  const { t } = useLanguage()
  const selected = options.find((option) => option.id === selectedId) ?? null
  const split = splitCaseEvidenceByOption(selectedEvidence, selected)

  return (
    <section aria-labelledby="case-decision-options-title" className="space-y-4">
      <div>
        <CaseKindTag
          kind="alternative"
          note={t('possibilidades de ação, não evidências')}
          className="mb-1"
        />
        <h2 id="case-decision-options-title" className="text-lg font-semibold text-foreground">
          {t('Alternativas de decisão')}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t('Examine as três direções possíveis e escolha uma para investigar primeiro.')}
        </p>
      </div>

      <Notice tone="info">{t(OPTIONS_NOTICE)}</Notice>

      <fieldset className="space-y-4">
        <legend className="sr-only">{t('Selecionar uma alternativa de decisão')}</legend>
        <ul className="grid gap-4 lg:grid-cols-3">
          {options.map((option) => {
            const isSelected = option.id === selectedId
            return (
              <li key={option.id}>
                <div
                  className={cn(
                    'flex h-full flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 transition-colors',
                    isSelected && 'border-primary/60 bg-primary/5',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`case-decision-option-${option.id}`}
                      type="radio"
                      name="case-decision-option"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => onSelect(option.id)}
                      aria-label={t('Selecionar alternativa: {title}', {
                        title: t(option.title),
                      })}
                      className="mt-0.5 size-4 cursor-pointer accent-primary"
                    />
                    <div className="space-y-2">
                      <label
                        htmlFor={`case-decision-option-${option.id}`}
                        className="flex cursor-pointer items-center py-1 text-sm font-medium leading-relaxed text-foreground max-sm:min-h-11"
                      >
                        {t(option.title)}
                      </label>
                      {isSelected ? <Badge variant="default">{t('Selecionada')}</Badge> : null}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(option.description)}
                  </p>

                  <OptionSection title={t('Benefícios potenciais')}>
                    <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-foreground">
                      {option.benefits.map((benefit) => (
                        <li key={benefit}>{t(benefit)}</li>
                      ))}
                    </ul>
                  </OptionSection>

                  <OptionSection title={t('Riscos')}>
                    <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-foreground">
                      {option.risks.map((risk) => (
                        <li key={risk}>{t(risk)}</li>
                      ))}
                    </ul>
                  </OptionSection>

                  <OptionSection title={t('Indicadores relacionados')}>
                    <ul className="flex flex-wrap gap-2">
                      {option.metrics.map((metric) => (
                        <li key={metric.id}>
                          <Badge variant="outline">{t(metric.name)}</Badge>
                        </li>
                      ))}
                    </ul>
                  </OptionSection>

                  <OptionSection title={t('Feedbacks relacionados')}>
                    <ul className="space-y-2">
                      {option.feedbacks.map((feedback) => (
                        <li
                          key={feedback.id}
                          className="rounded-lg border border-border/70 bg-background/40 p-2 text-xs leading-relaxed text-muted-foreground"
                        >
                          {t(feedback.content)}
                        </li>
                      ))}
                    </ul>
                  </OptionSection>

                  <OptionSection title={t('Informações adicionais necessárias')}>
                    <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                      {option.additionalInformation.map((information) => (
                        <li key={information}>{t(information)}</li>
                      ))}
                    </ul>
                  </OptionSection>
                </div>
              </li>
            )
          })}
        </ul>
      </fieldset>

      {selected ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {t('Evidências selecionadas relacionadas a esta alternativa')}
              </p>
              {split.related.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(
                    'Nenhuma das evidências selecionadas está relacionada a esta alternativa no cenário.',
                  )}
                </p>
              ) : (
                <ul className="space-y-2">
                  {split.related.map((view) => (
                    <li
                      key={view.id}
                      className="rounded-lg border border-l-2 border-chart-2/30 border-l-chart-2/70 bg-chart-2/5 p-3 text-sm leading-relaxed text-foreground"
                    >
                      {t(view.content)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {t('Outras evidências selecionadas')}
              </p>
              {split.other.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t('Nenhuma outra evidência selecionada.')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {split.other.map((view) => (
                    <li
                      key={view.id}
                      className="rounded-lg border border-l-2 border-border/70 border-l-chart-2/40 bg-background/40 p-3 text-sm leading-relaxed text-foreground"
                    >
                      {t(view.content)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground/80">
              {t(
                'Esta separação é apenas informativa: a quantidade de evidências relacionadas não comprova a causa do problema nem a efetividade da alternativa.',
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t(
            'Selecione uma alternativa para ver como as evidências escolhidas se relacionam com ela.',
          )}
        </p>
      )}
    </section>
  )
}
