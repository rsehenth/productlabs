import { useState, type FormEvent } from 'react'
import type { MetricDirection, MetricUnit, ProductMetric } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFormErrors } from '@/hooks/use-form-errors'
import { useWorkspace } from '@/hooks/use-workspace'
import {
  FIELD_LIMITS,
} from '@/lib/domain/operations'
import { METRIC_DIRECTION_LABELS, METRIC_UNIT_LABELS } from '@/lib/domain-labels'
import { fieldAria } from '@/lib/field-a11y'

interface MetricFormDialogProps {
  metric?: ProductMetric
  onClose: () => void
  onSaved: (metric: ProductMetric) => void
}

export function MetricFormDialog({ metric, onClose, onSaved }: MetricFormDialogProps) {
  const { createMetric, updateMetric } = useWorkspace()
  const [name, setName] = useState(metric?.name ?? '')
  const [description, setDescription] = useState(metric?.description ?? '')
  const [unit, setUnit] = useState<MetricUnit>(metric?.unit ?? 'percent')
  const [direction, setDirection] = useState<MetricDirection>(
    metric?.desiredDirection ?? 'increase',
  )
  const [saving, setSaving] = useState(false)
  const { formRef, fieldErrors, setFieldErrors, error, setError, reportError } = useFormErrors()

  function clearError(field: string) {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null)
    const input = { name, description, unit, desiredDirection: direction }
    setSaving(true)
    const result = metric ? await updateMetric(metric.id, input) : await createMetric(input)
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
      title={metric ? 'Editar indicador' : 'Novo indicador'}
      description="Indicadores representam medidas do produto. A direção desejada é uma configuração sua, não uma inferência automática."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="metric-form" disabled={saving}>
            {saving ? 'Salvando…' : metric ? 'Salvar alterações' : 'Criar indicador'}
          </Button>
        </>
      }
    >
      <form id="metric-form" ref={formRef} tabIndex={-1} onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <Notice tone="error" tabIndex={-1}>{error}</Notice> : null}

        <Field
          id="metric-name"
          label="Nome do indicador"
          required
          error={fieldErrors.name}
          hint={`Ex.: Conversão Free → Premium. Até ${FIELD_LIMITS.metricName} caracteres.`}
        >
          <Input
            id="metric-name"
            className="aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clearError('name')
            }}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldAria('metric-name', {
              hint: `Até ${FIELD_LIMITS.metricName} caracteres.`,
              error: fieldErrors.name,
            })}
            autoFocus
          />
        </Field>

        <Field
          id="metric-description"
          label="Descrição"
          error={fieldErrors.description}
          hint="Opcional. Explique o que o indicador mede."
        >
          <Textarea
            id="metric-description"
            className="aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40"
            value={description}
            rows={3}
            maxLength={FIELD_LIMITS.metricDescription}
            onChange={(event) => {
              setDescription(event.target.value)
              clearError('description')
            }}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldAria('metric-description', {
              hint: 'Opcional. Explique o que o indicador mede.',
              error: fieldErrors.description,
            })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="metric-unit" label="Unidade" required error={fieldErrors.unit}>
            <Select
              id="metric-unit"
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value as MetricUnit)
                clearError('unit')
              }}
              aria-invalid={Boolean(fieldErrors.unit)}
              aria-describedby={fieldAria('metric-unit', { error: fieldErrors.unit })}
            >
              {Object.entries(METRIC_UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="metric-direction"
            label="Direção desejada"
            required
            error={fieldErrors.desiredDirection}
            hint={
              direction === 'increase'
                ? 'Valores maiores contam como favoráveis.'
                : 'Valores menores contam como favoráveis.'
            }
          >
            <Select
              id="metric-direction"
              value={direction}
              onChange={(event) => {
                setDirection(event.target.value as MetricDirection)
                clearError('desiredDirection')
              }}
              aria-invalid={Boolean(fieldErrors.desiredDirection)}
              aria-describedby={fieldAria('metric-direction', {
                hint: 'direção',
                error: fieldErrors.desiredDirection,
              })}
            >
              {Object.entries(METRIC_DIRECTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </form>
    </Dialog>
  )
}
