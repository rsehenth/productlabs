import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { MetricObservation, ProductMetric } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Notice } from '@/components/ui/notice'
import { useLanguage } from '@/hooks/use-language'
import { useWorkspace } from '@/hooks/use-workspace'
import { metricSummary } from '@/lib/analytics'
import {
  DECISION_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  METRIC_DIRECTION_LABELS,
  METRIC_UNIT_LABELS,
  formatAbsoluteVariation,
  formatMetricValue,
  formatPeriod,
  formatRelativeVariation,
} from '@/lib/domain-labels'
import { formatDate } from '@/lib/dates'
import { locationHref } from '@/lib/routing'
import { CONFLICT_MESSAGE } from '@/lib/storage/workspace-storage'
import { truncate } from '@/lib/text'
import { VariationBadge } from '@/features/overview/metric-card'
import { ObservationForm } from '@/features/overview/observation-form'

const MetricChart = lazy(() =>
  import('@/features/overview/metric-chart').then((module) => ({
    default: module.MetricChart,
  })),
)

type ObservationEditor =
  | { mode: 'create' }
  | { mode: 'edit'; observation: MetricObservation }
  | null

interface MetricDetailDialogProps {
  metric: ProductMetric | null
  onClose: () => void
  onEdit: (metric: ProductMetric) => void
  onDeleted: () => void
}

export function MetricDetailDialog({
  metric: currentMetric,
  onClose,
  onEdit,
  onDeleted,
}: MetricDetailDialogProps) {
  const { t } = useLanguage()
  const { workspace, deleteMetric, deleteObservation } = useWorkspace()
  const [editor, setEditor] = useState<ObservationEditor>(null)
  const [lastMetric, setLastMetric] = useState(currentMetric)
  const [deletingObservation, setDeletingObservation] = useState<MetricObservation | null>(null)
  const [confirmMetricDelete, setConfirmMetricDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const deletingRef = useRef(false)
  const [savingObservation, setSavingObservation] = useState(false)
  const savingObservationRef = useRef(false)
  const busy = deleting || savingObservation
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string[]>([])
  const addObservation = useRef<HTMLButtonElement>(null)
  const editTrigger = useRef<HTMLButtonElement>(null)
  const deleteTrigger = useRef<HTMLButtonElement>(null)
  const metricDeleteTrigger = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLButtonElement | 'metric-delete' | null>(null)

  useEffect(() => {
    const requested = returnFocus.current
    if (!requested) return
    returnFocus.current = null
    const trigger = requested === 'metric-delete' ? metricDeleteTrigger.current : requested
    const destination = trigger?.isConnected && !trigger.disabled ? trigger : addObservation.current
    destination?.focus()
  }, [editor, deletingObservation, confirmMetricDelete])

  if (currentMetric && currentMetric !== lastMetric) setLastMetric(currentMetric)
  // Keep an open draft even if a refresh could not reload its indicator.
  const metric = currentMetric ?? (editor ? lastMetric : null)
  if (!metric) return null

  const summary = metricSummary(workspace, metric)
  const linkedFeedbacks = workspace.feedbacks.filter((feedback) =>
    feedback.metricIds.includes(metric.id),
  )
  const linkedDecisions = workspace.decisions.filter((decision) =>
    decision.metricIds.includes(metric.id),
  )

  function closeEditor() {
    returnFocus.current = editTrigger.current
    setEditor(null)
  }

  function closeObservationConfirmation() {
    returnFocus.current = deleteTrigger.current
    setDeletingObservation(null)
  }

  function closeMetricConfirmation() {
    returnFocus.current = 'metric-delete'
    setConfirmMetricDelete(false)
  }

  async function handleMetricDelete(id: string) {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeleting(true)
    const result = await deleteMetric(id)
    deletingRef.current = false
    setDeleting(false)
    if (!result.ok) {
      if (result.error !== CONFLICT_MESSAGE) setError(result.error)
      setErrorDetails(result.details ?? [])
      closeMetricConfirmation()
      return
    }
    onDeleted()
  }

  async function handleObservationDelete(observation: MetricObservation) {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeleting(true)
    const result = await deleteObservation(observation.id)
    deletingRef.current = false
    setDeleting(false)
    if (!result.ok) {
      if (result.error !== CONFLICT_MESSAGE) setError(result.error)
      setErrorDetails([])
      return
    }
    closeObservationConfirmation()
    setError(null)
    setNotice(t('Observação excluída.'))
  }

  const hasDependencies = linkedDecisions.length > 0 || linkedFeedbacks.length > 0
  const { variation, latest } = summary
  const DirectionIcon =
    variation?.direction === 'up' ? TrendingUp : variation?.direction === 'down' ? TrendingDown : Minus
  const DesiredIcon = metric.desiredDirection === 'increase' ? ArrowUpRight : ArrowDownRight

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !deletingRef.current && !savingObservationRef.current) onClose()
      }}
      title={metric.name}
      description={metric.description || t('Sem descrição registrada.')}
      className="max-w-4xl"
      footer={
        <Button variant="outline" onClick={onClose} disabled={busy}>
          {t('Fechar')}
        </Button>
      }
    >
      <div className="space-y-6">
        {error ? (
          <Notice tone="error" onDismiss={() => setError(null)}>
            <p>{error}</p>
            {errorDetails.length > 0 ? (
              <ul className="mt-1 space-y-0.5 text-xs">
                {errorDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Notice>
        ) : null}
        {notice ? (
          <Notice tone="success" onDismiss={() => setNotice(null)}>
            {notice}
          </Notice>
        ) : null}

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{METRIC_UNIT_LABELS[metric.unit]}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <DesiredIcon className="size-3.5" aria-hidden="true" />
            {t('Direção desejada: {direction}', {
              direction: METRIC_DIRECTION_LABELS[metric.desiredDirection].toLowerCase(),
            })}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t('{count} observações', { count: summary.observations.length })}</span>
        </p>

        <section aria-labelledby="metric-summary-title">
          <h2 id="metric-summary-title" className="sr-only">
            {t('Situação atual')}
          </h2>
          {latest ? (
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border wrap-anywhere sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="bg-card px-5 py-4">
                <p className="text-xs text-muted-foreground">{t('Último valor registrado')}</p>
                <p className="mt-2 font-mono text-4xl leading-none font-medium tracking-[-0.07em] text-foreground tabular-nums">
                  {formatMetricValue(latest.value, metric.unit)}
                </p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {formatPeriod(latest.period)}
                </p>
              </div>

              <div className="bg-card px-5 py-4">
                {variation ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 font-mono text-lg font-medium text-foreground tabular-nums">
                        <DirectionIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="sr-only">{t('Variação absoluta: ')}</span>
                        {formatAbsoluteVariation(variation.absolute, metric.unit)}
                      </p>
                      <VariationBadge favorable={variation.favorable} />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {variation.relative === null ? (
                        formatRelativeVariation(null)
                      ) : (
                        <>
                          <span className="font-mono text-foreground">
                            {formatRelativeVariation(variation.relative)}
                          </span>{' '}
                          {t('em termos relativos')}
                        </>
                      )}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {variation.direction === 'flat'
                        ? t('Sem variação em relação ao período anterior.')
                        : t('Antes: {value} em {period}', {
                            value: formatMetricValue(variation.previous.value, metric.unit),
                            period: formatPeriod(variation.previous.period),
                          })}
                    </p>
                    {variation.favorable === false ? (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {t('O aplicativo não determina a causa da variação.')}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Badge variant="outline">{t('Sem comparação')}</Badge>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        'Histórico insuficiente para comparação. Registre ao menos duas observações.',
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {summary.observations.length > 0 ? (
          <Suspense
            fallback={<p role="status" className="text-sm text-muted-foreground">{t('Carregando gráfico…')}</p>}
          >
            <MetricChart metric={metric} observations={summary.observations} />
          </Suspense>
        ) : null}

        <section aria-labelledby="metric-history-title" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="metric-history-title"
              className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground"
            >
              {t('Histórico de observações')}
            </h2>
            <Button
              ref={addObservation}
              size="sm"
              variant="outline"
              className="max-sm:min-h-11"
              onClick={(event) => {
                editTrigger.current = event.currentTarget
                setEditor({ mode: 'create' })
                setError(null)
              }}
              disabled={editor !== null || deleting}
            >
              {t('Adicionar observação')}
            </Button>
          </div>

          {editor ? (
            <ObservationForm
              metric={metric}
              observation={editor.mode === 'edit' ? editor.observation : undefined}
              onCancel={closeEditor}
              onSavingChange={(saving) => {
                savingObservationRef.current = saving
                setSavingObservation(saving)
              }}
              onSaved={() => {
                closeEditor()
                setError(null)
                setNotice(t('Observação salva.'))
              }}
            />
          ) : null}

          {summary.observations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('Nenhuma observação registrada para este indicador.')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm max-sm:table-fixed">
                <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-2 py-2.5 font-medium max-sm:w-20 sm:px-4">
                      {t('Período')}
                    </th>
                    <th scope="col" className="px-2 py-2.5 text-right font-medium sm:px-4">
                      {t('Valor')}
                    </th>
                    <th scope="col" className="px-2 py-2.5 text-right font-medium max-sm:w-26 sm:px-4">
                      {t('Ações')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.observations.map((observation) => (
                    <tr key={observation.id} className="border-t border-border">
                      <th
                        scope="row"
                        className="px-2 py-2 text-left font-mono text-[13px] font-normal text-muted-foreground sm:px-4"
                      >
                        {formatPeriod(observation.period)}
                      </th>
                      <td className="px-2 py-2 text-right font-mono text-[13px] wrap-anywhere tabular-nums text-foreground sm:px-4">
                        {formatMetricValue(observation.value, metric.unit)}
                      </td>
                      <td className="px-1 py-1.5 sm:px-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="max-sm:size-11 max-sm:p-0"
                            disabled={busy}
                            aria-label={t('Editar observação de {period}', {
                              period: formatPeriod(observation.period),
                            })}
                            onClick={(event) => {
                              editTrigger.current = event.currentTarget
                              setEditor({ mode: 'edit', observation })
                              setError(null)
                            }}
                          >
                            <Pencil className="sm:hidden" aria-hidden="true" />
                            <span className="max-sm:sr-only">{t('Editar')}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive-foreground max-sm:size-11 max-sm:p-0"
                            disabled={busy}
                            aria-label={t('Excluir observação de {period}', {
                              period: formatPeriod(observation.period),
                            })}
                            onClick={(event) => {
                              deleteTrigger.current = event.currentTarget
                              setDeletingObservation(observation)
                            }}
                          >
                            <Trash2 className="sm:hidden" aria-hidden="true" />
                            <span className="max-sm:sr-only">{t('Excluir')}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {deletingObservation ? (
            <div
              role="group"
              aria-label={t('Confirmar exclusão da observação')}
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-4"
            >
              <p className="text-sm text-foreground">
                {t('Excluir a observação de {period} ({value})? Esta ação não pode ser desfeita.', {
                  period: formatPeriod(deletingObservation.period),
                  value: formatMetricValue(deletingObservation.value, metric.unit),
                })}
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="max-sm:min-h-11"
                  autoFocus
                  disabled={busy}
                  onClick={closeObservationConfirmation}
                >
                  {t('Cancelar')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="max-sm:min-h-11"
                  disabled={busy}
                  onClick={() => handleObservationDelete(deletingObservation)}
                >
                  {deleting ? t('Excluindo…') : t('Confirmar exclusão')}
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="metric-evidence-title" className="space-y-3">
          <h2
            id="metric-evidence-title"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground"
          >
            {t('Evidências vinculadas')}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-medium text-foreground">
                {t('Feedbacks')}{' '}
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  ({linkedFeedbacks.length})
                </span>
              </h3>
              {linkedFeedbacks.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('Nenhum feedback vinculado a este indicador.')}
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {linkedFeedbacks.map((feedback) => (
                    <li key={feedback.id} className="text-sm leading-relaxed">
                      <p className="text-foreground">
                        {truncate(feedback.content, 140)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {FEEDBACK_CATEGORY_LABELS[feedback.category]} ·{' '}
                        {formatDate(feedback.receivedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href={locationHref('feedbacks')}
                className="mt-3 inline-block text-xs text-primary underline-offset-4 hover:underline"
              >
                {t('Abrir Feedbacks')}
              </a>
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-medium text-foreground">
                {t('Decisões')}{' '}
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  ({linkedDecisions.length})
                </span>
              </h3>
              {linkedDecisions.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('Nenhuma decisão vinculada a este indicador.')}
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {linkedDecisions.map((decision) => (
                    <li key={decision.id}>
                      <a
                        href={locationHref('decisions', { record: decision.id })}
                        className="text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {decision.title}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {DECISION_STATUS_LABELS[decision.status]}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href={locationHref('decisions')}
                className="mt-3 inline-block text-xs text-primary underline-offset-4 hover:underline"
              >
                {t('Abrir Decisions')}
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="metric-danger-title" className="space-y-3 border-t border-border pt-5">
          <h2
            id="metric-danger-title"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground"
          >
            {t('Gerenciar indicador')}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onEdit(metric)} disabled={busy}>
              {t('Editar indicador')}
            </Button>
            {!hasDependencies && !confirmMetricDelete ? (
              <Button
                ref={metricDeleteTrigger}
                variant="outline"
                className="border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                disabled={busy}
                onClick={() => setConfirmMetricDelete(true)}
              >
                {t('Excluir indicador')}
              </Button>
            ) : null}
          </div>

          {hasDependencies ? (
            <Notice tone="error">
              <p>
                {t(
                  'Este indicador está vinculado a {decisions} decisão(ões) e {feedbacks} feedback(s). Remova os vínculos antes de excluir.',
                  { decisions: linkedDecisions.length, feedbacks: linkedFeedbacks.length },
                )}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {linkedDecisions.map((decision) => (
                  <li key={decision.id}>{t('Decisão: {title}', { title: decision.title })}</li>
                ))}
                {linkedFeedbacks.map((feedback) => (
                  <li key={feedback.id}>
                    {t('Feedback: {content}', { content: truncate(feedback.content, 70) })}
                  </li>
                ))}
              </ul>
            </Notice>
          ) : null}

          {confirmMetricDelete ? (
            <div
              role="group"
              aria-label={t('Confirmar exclusão do indicador')}
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-4"
            >
              <p className="text-sm text-foreground">
                {t(
                  'Excluir este indicador também removerá {count} observação(ões). Esta ação não pode ser desfeita.',
                  { count: summary.observations.length },
                )}
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="max-sm:min-h-11"
                  autoFocus
                  disabled={busy}
                  onClick={closeMetricConfirmation}
                >
                  {t('Cancelar')}
                </Button>
                <Button variant="destructive" size="sm" className="max-sm:min-h-11" disabled={busy} onClick={() => handleMetricDelete(metric.id)}>
                  {deleting ? t('Excluindo…') : t('Confirmar exclusão')}
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Dialog>
  )
}
