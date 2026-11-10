import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import type { DecisionRecord, DecisionStatus } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFormErrors } from '@/hooks/use-form-errors'
import { useWorkspace } from '@/hooks/use-workspace'
import {
  DECISION_STATUS_RULES,
  FIELD_LIMITS,
  type DecisionInput,
} from '@/lib/domain/operations'
import {
  DECISION_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  METRIC_UNIT_LABELS,
  formatMetricValue,
} from '@/lib/domain-labels'
import { latestObservation } from '@/lib/analytics'
import { formatDate } from '@/lib/dates'
import { createId } from '@/lib/ids'
import { fieldAria } from '@/lib/field-a11y'
import { matchesSearch, truncate } from '@/lib/text'

interface ListItem {
  key: string
  value: string
}

function toItems(values: string[]): ListItem[] {
  if (values.length === 0) return [{ key: createId('item'), value: '' }]
  return values.map((value) => ({ key: createId('item'), value }))
}

interface DecisionFormProps {
  initial?: DecisionRecord
  onCancel: () => void
  onSaved: (decision: DecisionRecord) => void
}

export function DecisionForm({ initial, onCancel, onSaved }: DecisionFormProps) {
  const { workspace, createDecision, updateDecision } = useWorkspace()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [problem, setProblem] = useState(initial?.problem ?? '')
  const [hypothesis, setHypothesis] = useState(initial?.hypothesis ?? '')
  const [decision, setDecision] = useState(initial?.decision ?? '')
  const [status, setStatus] = useState<DecisionStatus>(initial?.status ?? 'draft')
  const [metricIds, setMetricIds] = useState<string[]>(initial?.metricIds ?? [])
  const [feedbackIds, setFeedbackIds] = useState<string[]>(initial?.feedbackIds ?? [])
  const [alternatives, setAlternatives] = useState<ListItem[]>(() =>
    toItems(initial?.alternatives ?? []),
  )
  const [successCriteria, setSuccessCriteria] = useState<ListItem[]>(() =>
    toItems(initial?.successCriteria ?? []),
  )
  const [nextSteps, setNextSteps] = useState<ListItem[]>(() =>
    toItems(initial?.nextSteps ?? []),
  )
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const { formRef, fieldErrors, error, setError, reportError } = useFormErrors()

  const filteredFeedbacks = workspace.feedbacks
    .filter((feedback) =>
      matchesSearch(
        `${feedback.content} ${FEEDBACK_CATEGORY_LABELS[feedback.category]}`,
        feedbackSearch,
      ),
    )
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))

  function toggleId(
    id: string,
    setter: (updater: (previous: string[]) => string[]) => void,
  ) {
    setter((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    )
  }

  function updateItem(
    setter: (updater: (previous: ListItem[]) => ListItem[]) => void,
    key: string,
    value: string,
  ) {
    setter((previous) =>
      previous.map((item) => (item.key === key ? { ...item, value } : item)),
    )
  }

  function addItem(setter: (updater: (previous: ListItem[]) => ListItem[]) => void) {
    setter((previous) => [...previous, { key: createId('item'), value: '' }])
  }

  function removeItem(
    setter: (updater: (previous: ListItem[]) => ListItem[]) => void,
    key: string,
  ) {
    setter((previous) => previous.filter((item) => item.key !== key))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null)
    const input: DecisionInput = {
      title,
      problem,
      hypothesis,
      metricIds,
      feedbackIds,
      alternatives: alternatives.map((item) => item.value),
      decision,
      successCriteria: successCriteria.map((item) => item.value),
      nextSteps: nextSteps.map((item) => item.value),
      status,
    }

    setSaving(true)
    const result = initial
      ? await updateDecision(initial.id, input)
      : await createDecision(input)
    setSaving(false)

    if (!result.ok) {
      reportError(result)
      return
    }
    onSaved(result.value)
  }

  return (
    <form
      id="decision-form"
      ref={formRef}
      tabIndex={-1}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-xl border border-border/80 bg-card p-5"
    >
      {error ? (
        <Notice tone="error" tabIndex={-1}>
          <p>{error}</p>
          <p>Nada foi salvo. O que você digitou continua neste formulário.</p>
        </Notice>
      ) : null}

      <section aria-labelledby="decision-section-identification" className="space-y-4">
        <div>
          <h2 id="decision-section-identification" className="text-sm font-semibold text-foreground">
            Contexto
          </h2>
          <p className="text-xs text-muted-foreground">
            Um registro começa pelo problema que você está tentando resolver.
          </p>
        </div>

        <Field
          id="decision-title"
          label="Título da decisão"
          required
          error={fieldErrors.title}
          hint={`Ex.: Melhorar compreensão dos planos Premium. Até ${FIELD_LIMITS.decisionTitle} caracteres.`}
        >
          <Input
            id="decision-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldAria('decision-title', {
              hint: 'Ex.: Melhorar compreensão dos planos Premium.',
              error: fieldErrors.title,
            })}
            autoFocus
          />
        </Field>

        <Field
          id="decision-problem"
          label="Problema investigado"
          required
          error={fieldErrors.problem}
          hint="Descreva o problema observado. Uma variação de métrica não comprova a causa."
        >
          <Textarea
            id="decision-problem"
            rows={4}
            value={problem}
            maxLength={FIELD_LIMITS.decisionText}
            onChange={(event) => setProblem(event.target.value)}
            aria-invalid={Boolean(fieldErrors.problem)}
            aria-describedby={fieldAria('decision-problem', {
              hint: 'Descreva o problema observado.',
              error: fieldErrors.problem,
            })}
          />
        </Field>
      </section>

      <section aria-labelledby="decision-section-hypothesis" className="space-y-4 border-t border-border/60 pt-5">
        <div>
          <h2 id="decision-section-hypothesis" className="text-sm font-semibold text-foreground">
            Hipótese
          </h2>
          <p className="text-xs text-muted-foreground">
            Uma hipótese é uma aposta a ser investigada, não uma conclusão validada.
          </p>
        </div>
        <Field
          id="decision-hypothesis"
          label="Hipótese de produto"
          required={
            status === 'investigating' || status === 'decided' || status === 'validated'
          }
          error={fieldErrors.hypothesis}
          hint="Ex.: Uma apresentação mais clara dos benefícios Premium pode reduzir dúvidas na assinatura."
        >
          <Textarea
            id="decision-hypothesis"
            rows={3}
            value={hypothesis}
            maxLength={FIELD_LIMITS.decisionText}
            onChange={(event) => setHypothesis(event.target.value)}
            aria-invalid={Boolean(fieldErrors.hypothesis)}
            aria-describedby={fieldAria('decision-hypothesis', {
              hint: 'Descreva a aposta a ser investigada.',
              error: fieldErrors.hypothesis,
            })}
          />
        </Field>
      </section>

      <DecisionListSection
        id="decision-alternatives"
        title="Alternativas consideradas"
        description="Opções de ação avaliadas antes da escolha. Não são evidências."
        error={fieldErrors.alternatives}
        items={alternatives}
        placeholder="Descreva uma alternativa"
        addLabel="Adicionar alternativa"
        onAdd={() => addItem(setAlternatives)}
        onRemove={(key) => removeItem(setAlternatives, key)}
        onChange={(key, value) => updateItem(setAlternatives, key, value)}
      />

      <section aria-labelledby="decision-section-decision" className="space-y-4 border-t border-border/60 pt-5">
        <div>
          <h2 id="decision-section-decision" className="text-sm font-semibold text-foreground">
            Decisão
          </h2>
          <p className="text-xs text-muted-foreground">
            Descreva a direção escolhida com base nas evidências disponíveis.
          </p>
        </div>
        <Field
          id="decision-text"
          label="Decisão registrada"
          required={status === 'decided' || status === 'validated'}
          error={fieldErrors.decision}
        >
          <Textarea
            id="decision-text"
            rows={3}
            value={decision}
            maxLength={FIELD_LIMITS.decisionText}
            onChange={(event) => setDecision(event.target.value)}
            aria-invalid={Boolean(fieldErrors.decision)}
            aria-describedby={fieldAria('decision-text', { error: fieldErrors.decision })}
          />
        </Field>
      </section>

      <DecisionListSection
        id="decision-criteria"
        title="Critérios de sucesso"
        requiredNote={status === 'validated' ? 'Obrigatório para o status Validada: registre ao menos um critério.' : undefined}
        description="Como você saberá se a decisão funcionou. Evite metas automáticas: registre seus próprios critérios."
        error={fieldErrors.successCriteria}
        items={successCriteria}
        placeholder="Ex.: Ativação acima de 58% até dezembro"
        addLabel="Adicionar critério"
        onAdd={() => addItem(setSuccessCriteria)}
        onRemove={(key) => removeItem(setSuccessCriteria, key)}
        onChange={(key, value) => updateItem(setSuccessCriteria, key, value)}
      />

      <section aria-labelledby="decision-section-evidence" className="space-y-4 border-t border-border/60 pt-5">
        <div>
          <h2 id="decision-section-evidence" className="text-sm font-semibold text-foreground">
            Evidências relacionadas
          </h2>
          <p className="text-xs text-muted-foreground">
            Registros do workspace relacionados ao problema. Um vínculo não estabelece causalidade.
          </p>
        </div>

        <fieldset
          className="min-w-0 space-y-2"
          aria-invalid={Boolean(fieldErrors.metricIds)}
          tabIndex={fieldErrors.metricIds ? -1 : undefined}
          aria-describedby={fieldErrors.metricIds ? 'decision-metrics-error' : undefined}
        >
          <legend className="text-sm font-medium text-foreground">
            Indicadores relacionados{' '}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </legend>
          {workspace.metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum indicador cadastrado. Você pode registrar a decisão sem evidências
              quantitativas.
            </p>
          ) : (
            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-2 sm:grid-cols-2">
              {workspace.metrics.map((metric) => {
                const latest = latestObservation(workspace, metric.id)
                return (
                  <label
                    key={metric.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent/40 max-sm:min-h-11"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[var(--color-primary)]"
                      checked={metricIds.includes(metric.id)}
                      onChange={() => toggleId(metric.id, setMetricIds)}
                    />
                    <span className="min-w-0">
                      <span className="block break-words text-sm text-foreground">{metric.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {METRIC_UNIT_LABELS[metric.unit]}
                        {latest
                          ? ` · ${formatMetricValue(latest.value, metric.unit)} em ${latest.period}`
                          : ' · sem observações'}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          {fieldErrors.metricIds ? (
            <p id="decision-metrics-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.metricIds}
            </p>
          ) : null}
        </fieldset>

        <fieldset
          className="min-w-0 space-y-2"
          aria-invalid={Boolean(fieldErrors.feedbackIds)}
          tabIndex={fieldErrors.feedbackIds ? -1 : undefined}
          aria-describedby={fieldErrors.feedbackIds ? 'decision-feedbacks-error' : undefined}
        >
          <legend className="text-sm font-medium text-foreground">
            Feedbacks relacionados{' '}
            <span className="font-normal text-muted-foreground">
              (opcional · {feedbackIds.length} selecionado(s))
            </span>
          </legend>
          {workspace.feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum feedback cadastrado. Registre relatos na área Feedbacks para usá-los como
              evidência.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="decision-feedback-search" className="sr-only">
                  Pesquisar feedbacks
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="decision-feedback-search"
                    className="pl-9"
                    placeholder="Pesquisar feedbacks por conteúdo ou categoria"
                    value={feedbackSearch}
                    onChange={(event) => setFeedbackSearch(event.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/70 bg-background/40 p-2">
                {filteredFeedbacks.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted-foreground">
                    Nenhum feedback corresponde à pesquisa.
                  </p>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <label
                      key={feedback.id}
                      className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent/40 max-sm:min-h-11"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 accent-[var(--color-primary)]"
                        checked={feedbackIds.includes(feedback.id)}
                        onChange={() => toggleId(feedback.id, setFeedbackIds)}
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm text-foreground">
                          {truncate(feedback.content, 160)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {FEEDBACK_CATEGORY_LABELS[feedback.category]} ·{' '}
                          {formatDate(feedback.receivedAt)}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
          {fieldErrors.feedbackIds ? (
            <p id="decision-feedbacks-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.feedbackIds}
            </p>
          ) : null}
        </fieldset>
      </section>

      <DecisionListSection
        id="decision-next-steps"
        title="Próximos passos"
        description="Lista simples de ações. Não é um gerenciador de tarefas."
        error={fieldErrors.nextSteps}
        items={nextSteps}
        placeholder="Ex.: Revisar a apresentação dos planos"
        addLabel="Adicionar próximo passo"
        onAdd={() => addItem(setNextSteps)}
        onRemove={(key) => removeItem(setNextSteps, key)}
        onChange={(key, value) => updateItem(setNextSteps, key, value)}
      />

      <section aria-labelledby="decision-section-status" className="space-y-3 border-t border-border/60 pt-5">
        <h2 id="decision-section-status" className="text-sm font-semibold text-foreground">
          Status
        </h2>
        <Field
          id="decision-status"
          label="Status do registro"
          required
          error={fieldErrors.status}
          hint={DECISION_STATUS_RULES[status]}
        >
          <Select
            id="decision-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as DecisionStatus)}
            aria-invalid={Boolean(fieldErrors.status)}
            aria-describedby={fieldAria('decision-status', {
              hint: DECISION_STATUS_RULES[status],
              error: fieldErrors.status,
            })}
          >
            {Object.entries(DECISION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-xs text-muted-foreground">
          O status é uma classificação registrada por você. O sistema não valida hipóteses
          automaticamente.
        </p>
      </section>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="button" variant="outline" className="max-sm:min-h-11" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" className="max-sm:min-h-11" disabled={saving}>
          {saving ? 'Salvando…' : initial ? 'Salvar alterações' : 'Salvar decisão'}
        </Button>
      </div>
    </form>
  )
}

interface DecisionListSectionProps {
  id: string
  title: string
  description: string
  requiredNote?: string
  error?: string
  items: ListItem[]
  placeholder: string
  addLabel: string
  onAdd: () => void
  onRemove: (key: string) => void
  onChange: (key: string, value: string) => void
}

function DecisionListSection({
  id,
  title,
  description,
  requiredNote,
  error,
  items,
  placeholder,
  addLabel,
  onAdd,
  onRemove,
  onChange,
}: DecisionListSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-3 border-t border-border/60 pt-5">
      <div>
        <h2 id={`${id}-title`} className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        {requiredNote ? <p className="text-xs text-primary">{requiredNote}</p> : null}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.key} className="flex items-start gap-2">
              <span className="mt-2 w-6 shrink-0 text-xs text-muted-foreground">
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <label htmlFor={`${id}-${item.key}`} className="sr-only">
                  {title} — item {index + 1}
                </label>
                <Input
                  id={`${id}-${item.key}`}
                  value={item.value}
                  maxLength={FIELD_LIMITS.listItem}
                  placeholder={placeholder}
                  onChange={(event) => onChange(item.key, event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.key)}
                aria-label={`Remover ${title.toLowerCase()} item ${index + 1}`}
              >
                Remover
              </Button>
            </div>
          ))
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="max-sm:min-h-11"
        data-field-error={error && items.length === 0 ? '' : undefined}
        aria-describedby={error && items.length === 0 ? id + '-error' : undefined}
        onClick={onAdd}
      >
        {addLabel}
      </Button>
    </section>
  )
}
