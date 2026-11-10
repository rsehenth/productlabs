import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FEEDBACK_CATEGORY_LABELS } from '@/lib/domain-labels'
import { truncate } from '@/lib/text'
import {
  caseEvidenceCategories,
  caseEvidenceCountLabel,
  type CaseFeedbackView,
} from '@/features/interactive-case/case-feedback-view'

interface CaseEvidenceSummaryProps {
  selected: readonly CaseFeedbackView[]
  onRemove: (feedbackId: string) => void
  onClear: () => void
}

export function CaseEvidenceSummary({ selected, onRemove, onClear }: CaseEvidenceSummaryProps) {
  const categories = caseEvidenceCategories(selected)

  return (
    <section aria-labelledby="case-evidence-title" className="space-y-3">
      <div className="space-y-1">
        <CaseKindTag kind="evidence" note="sua seleção" />
        <h2 id="case-evidence-title" className="text-lg font-semibold text-foreground">
          Evidências selecionadas
        </h2>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          {selected.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Você ainda não selecionou evidências. Analise os feedbacks e escolha os relatos que
              considera relevantes para a investigação.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {caseEvidenceCountLabel(selected.length)}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <li key={category}>
                        <Badge variant="secondary">{FEEDBACK_CATEGORY_LABELS[category]}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="max-sm:min-h-11" onClick={onClear}>
                  Limpar seleção
                </Button>
              </div>

              <ul className="space-y-3">
                {selected.map((view) => (
                  <li
                    key={view.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-l-2 border-border/70 border-l-chart-2/60 bg-background/40 p-3"
                  >
                    <p className="max-w-2xl text-sm leading-relaxed text-foreground">
                      {view.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="max-sm:min-h-11"
                      aria-label={`Remover evidência: ${truncate(view.content, 60)}`}
                      onClick={() => onRemove(view.id)}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
