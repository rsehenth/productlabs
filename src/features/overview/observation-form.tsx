import { useState, type FormEvent } from 'react'
import type { MetricObservation, ProductMetric } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { useFormErrors } from '@/hooks/use-form-errors'
import { useLanguage } from '@/hooks/use-language'
import { useWorkspace } from '@/hooks/use-workspace'
import { METRIC_UNIT_LABELS, formatMetricValue, formatPeriod } from '@/lib/domain-labels'
import { fieldAria } from '@/lib/field-a11y'
import { formatEditableNumber, parseLocaleNumber } from '@/lib/number'

function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

interface ObservationFormProps {
  metric: ProductMetric
  observation?: MetricObservation
  onCancel: () => void
  onSaved: (observation: MetricObservation) => void
  onSavingChange: (saving: boolean) => void
}

export function ObservationForm({
  metric,
  observation,
  onCancel,
  onSaved,
  onSavingChange,
}: ObservationFormProps) {
  const { t } = useLanguage()
  const { createObservation, updateObservation } = useWorkspace()
  const [period, setPeriod] = useState(observation?.period ?? currentPeriod())
  const [value, setValue] = useState(
    observation ? formatEditableNumber(observation.value) : '',
  )
  const [saving, setSaving] = useState(false)
  const { formRef, fieldErrors, setFieldErrors, error, setError, focusError, reportError } = useFormErrors()


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null)

    const parsed = parseLocaleNumber(value)
    if (parsed === null) {
      setFieldErrors({ value: t('Informe um número válido.') })
      focusError('field')
      return
    }

    const input = { metricId: metric.id, period, value: parsed }
    setSaving(true)
    onSavingChange(true)
    const result = observation
      ? await updateObservation(observation.id, input)
      : await createObservation(input)
    setSaving(false)
    onSavingChange(false)

    if (!result.ok) {
      reportError(result)
      return
    }
    onSaved(result.value)
  }

  return (
    <form
      ref={formRef}
      tabIndex={-1}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-input bg-muted/50 p-4"
      noValidate
    >
      <h3 className="text-sm font-semibold text-foreground">
        {observation
          ? t('Editar observação de {period}', { period: formatPeriod(observation.period) })
          : t('Nova observação')}
      </h3>
      {error ? <Notice tone="error" tabIndex={-1}>{error}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="observation-period"
          label={t('Período')}
          required
          error={fieldErrors.period}
          hint={t('Mês de referência.')}
        >
          <Input
            id="observation-period"
            type="month"
            className="aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value)
              setFieldErrors((previous) => ({ ...previous, period: '' }))
            }}
            aria-invalid={Boolean(fieldErrors.period)}
            aria-describedby={fieldAria('observation-period', {
              hint: t('Mês de referência.'),
              error: fieldErrors.period,
            })}
          />
        </Field>

        <Field
          id="observation-value"
          label={t('Valor · {unit}', { unit: METRIC_UNIT_LABELS[metric.unit] })}
          required
          error={fieldErrors.value}
          hint={t('Ex.: {value}. Aceita vírgula decimal.', {
            value: formatMetricValue(4.5, metric.unit),
          })}
        >
          <Input
            id="observation-value"
            inputMode="decimal"
            className="font-mono tabular-nums aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setFieldErrors((previous) => ({ ...previous, value: '' }))
            }}
            aria-invalid={Boolean(fieldErrors.value)}
            aria-describedby={fieldAria('observation-value', {
              hint: t('Aceita vírgula decimal.'),
              error: fieldErrors.value,
            })}
            autoFocus
          />
        </Field>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="max-sm:min-h-11" onClick={onCancel} disabled={saving}>
          {t('Cancelar')}
        </Button>
        <Button type="submit" size="sm" className="max-sm:min-h-11" disabled={saving}>
          {saving ? t('Salvando…') : t('Salvar observação')}
        </Button>
      </div>
    </form>
  )
}
