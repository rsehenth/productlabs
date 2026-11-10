import { useState, type FormEvent } from 'react'
import type { FeedbackCategory, FeedbackSource, UserFeedback } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFormErrors } from '@/hooks/use-form-errors'
import { useWorkspace } from '@/hooks/use-workspace'
import { dateInputToIso, isoToDateInput } from '@/lib/dates'
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_SOURCE_LABELS, METRIC_UNIT_LABELS } from '@/lib/domain-labels'
import { FIELD_LIMITS } from '@/lib/domain/operations'
import { fieldAria } from '@/lib/field-a11y'

function todayInput(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

interface FeedbackFormDialogProps {
  feedback?: UserFeedback
  onClose: () => void
  onSaved: (feedback: UserFeedback) => void
}

export function FeedbackFormDialog({
  feedback,
  onClose,
  onSaved,
}: FeedbackFormDialogProps) {
  const { workspace, createFeedback, updateFeedback } = useWorkspace()
  const [content, setContent] = useState(feedback?.content ?? '')
  const [category, setCategory] = useState<FeedbackCategory>(feedback?.category ?? 'usability')
  const [source, setSource] = useState<FeedbackSource>(feedback?.source ?? 'interview')
  const [date, setDate] = useState(
    feedback ? isoToDateInput(feedback.receivedAt) : todayInput(),
  )
  const [metricIds, setMetricIds] = useState<string[]>(feedback?.metricIds ?? [])
  const [saving, setSaving] = useState(false)
  const { formRef, fieldErrors, setFieldErrors, error, setError, focusError, reportError } = useFormErrors()

  function toggleMetric(id: string) {
    setMetricIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const receivedAt = dateInputToIso(date)
    if (!receivedAt) {
      setFieldErrors({ receivedAt: 'Informe uma data válida.' })
      focusError('field')
      return
    }

    const input = { content, category, source, receivedAt, metricIds }
    setSaving(true)
    const result = feedback
      ? await updateFeedback(feedback.id, input)
      : await createFeedback(input)
    setSaving(false)

    if (!result.ok) {
      reportError(result)
      return
    }
    onSaved(result.value)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose()
      }}
      title={feedback ? 'Editar feedback' : 'Novo feedback'}
      description="Registre a fala do usuário, uma observação de pesquisa ou um relato de suporte. A classificação é manual."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="feedback-form" disabled={saving}>
            {saving ? 'Salvando…' : feedback ? 'Salvar alterações' : 'Criar feedback'}
          </Button>
        </>
      }
    >
      <form id="feedback-form" ref={formRef} tabIndex={-1} onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <Notice tone="error" tabIndex={-1}>{error}</Notice> : null}

        <Field
          id="feedback-content"
          label="Conteúdo"
          required
          error={fieldErrors.content}
          hint={`Registre o relato nas palavras do usuário. Até ${FIELD_LIMITS.feedbackContent} caracteres.`}
        >
          <Textarea
            id="feedback-content"
            rows={6}
            value={content}
            maxLength={FIELD_LIMITS.feedbackContent}
            onChange={(event) => setContent(event.target.value)}
            aria-invalid={Boolean(fieldErrors.content)}
            aria-describedby={fieldAria('feedback-content', {
              hint: `Registre o relato nas palavras do usuário. Até ${FIELD_LIMITS.feedbackContent} caracteres.`,
              error: fieldErrors.content,
            })}
            autoFocus
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="feedback-category" label="Categoria" required error={fieldErrors.category}>
            <Select
              id="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
              aria-invalid={Boolean(fieldErrors.category)}
            >
              {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="feedback-source" label="Fonte" required error={fieldErrors.source}>
            <Select
              id="feedback-source"
              value={source}
              onChange={(event) => setSource(event.target.value as FeedbackSource)}
              aria-invalid={Boolean(fieldErrors.source)}
            >
              {Object.entries(FEEDBACK_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="feedback-date"
            label="Data"
            required
            error={fieldErrors.receivedAt}
          >
            <Input
              id="feedback-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(fieldErrors.receivedAt)}
              aria-describedby={fieldAria('feedback-date', { error: fieldErrors.receivedAt })}
            />
          </Field>
        </div>

        <fieldset
          className="space-y-2"
          aria-invalid={Boolean(fieldErrors.metricIds)}
          tabIndex={fieldErrors.metricIds ? -1 : undefined}
          aria-describedby={fieldErrors.metricIds ? 'feedback-metrics-error' : undefined}
        >
          <legend className="text-sm font-medium text-foreground">
            Indicadores relacionados{' '}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </legend>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Marque os indicadores que este relato ajuda a investigar. É uma associação manual, não prova causa.
            {metricIds.length > 0 ? (
              <span className="ml-1 font-mono text-foreground">
                {metricIds.length} selecionado(s).
              </span>
            ) : null}
          </p>
          {workspace.metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum indicador cadastrado. Você pode salvar o feedback sem associação.
            </p>
          ) : (
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-2">
              {workspace.metrics.map((metric) => (
                <label
                  key={metric.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md px-2 py-2 hover:bg-accent/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                    metricIds.includes(metric.id) ? 'bg-accent/30' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-[var(--color-primary)]"
                    checked={metricIds.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                  />
                  <span className="min-w-0">
                    <span className="block break-words text-sm text-foreground">{metric.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {METRIC_UNIT_LABELS[metric.unit]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
          {fieldErrors.metricIds ? (
            <p id="feedback-metrics-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.metricIds}
            </p>
          ) : null}
        </fieldset>
      </form>
    </Dialog>
  )
}
