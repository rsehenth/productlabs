import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/hooks/use-language'
import { CASE_HYPOTHESIS_MAX_LENGTH } from '@/features/interactive-case/case-decision-view'

const HYPOTHESIS_PLACEHOLDER =
  'Exemplo: a queda na conversão pode estar relacionada à dificuldade de compreender o valor do Premium antes de concluir a primeira experiência com o produto.'

const HYPOTHESIS_HINT =
  'Uma hipótese é uma explicação que ainda precisa ser validada. Não é necessário encontrar uma resposta definitiva.'

interface CaseHypothesisEditorProps {
  value: string
  onChange: (value: string) => void
}

export function CaseHypothesisEditor({ value, onChange }: CaseHypothesisEditorProps) {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="case-hypothesis-title" className="space-y-3">
      <div>
        <CaseKindTag kind="hypothesis" note={t('explicação ainda não verificada')} className="mb-1" />
        <h2 id="case-hypothesis-title" className="text-lg font-semibold text-foreground">
          {t('03 — Formular uma hipótese e decidir')}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t(
            'Com base nos indicadores e feedbacks analisados, formule uma explicação possível para o problema e escolha qual direção de produto investigaria primeiro.',
          )}
        </p>
      </div>

      <Card className="border-l-2 border-l-chart-3">
        <CardContent className="space-y-3 p-5">
          <Field
            id="case-hypothesis"
            label={t('Sua hipótese de produto')}
            hint={t(HYPOTHESIS_HINT)}
          >
            <Textarea
              id="case-hypothesis"
              rows={4}
              value={value}
              maxLength={CASE_HYPOTHESIS_MAX_LENGTH}
              placeholder={t(HYPOTHESIS_PLACEHOLDER)}
              onChange={(event) => onChange(event.target.value)}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            {t('{count} de {max} caracteres.', {
              count: value.length,
              max: CASE_HYPOTHESIS_MAX_LENGTH,
            })}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
