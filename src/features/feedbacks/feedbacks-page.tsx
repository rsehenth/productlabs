import { useState } from 'react'
import { MessageSquareQuote, Plus, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Notice, type NoticeTone } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { Select } from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'
import { useWorkspace } from '@/hooks/use-workspace'
import { CONFLICT_MESSAGE } from '@/lib/storage/workspace-storage'
import { formatDate } from '@/lib/dates'
import {
  DECISION_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_SOURCE_LABELS,
  METRIC_UNIT_LABELS,
} from '@/lib/domain-labels'
import {
  EMPTY_FEEDBACK_FILTERS,
  filterFeedbacks,
  hasActiveFeedbackFilters,
  type FeedbackFilters,
} from '@/lib/feedback-query'
import { locationHref } from '@/lib/routing'
import type { FeedbackCategory, FeedbackSource, UserFeedback } from '@/types/domain'
import { FeedbackFormDialog } from '@/features/feedbacks/feedback-form-dialog'

type FormState = { mode: 'create' } | { mode: 'edit'; feedback: UserFeedback } | null
type PageNotice = { tone: NoticeTone; message: string } | null

export function FeedbacksPage() {
  const { t } = useLanguage()
  const { workspace, deleteFeedback } = useWorkspace()
  const [filters, setFilters] = useState<FeedbackFilters>(EMPTY_FEEDBACK_FILTERS)
  const [form, setForm] = useState<FormState>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserFeedback | null>(null)
  const [notice, setNotice] = useState<PageNotice>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = filterFeedbacks(workspace.feedbacks, filters)
  const filtersActive = hasActiveFeedbackFilters(filters)

  const categoryCounts = workspace.feedbacks.reduce<Record<string, number>>(
    (counts, feedback) => {
      counts[feedback.category] = (counts[feedback.category] ?? 0) + 1
      return counts
    },
    {},
  )

  const deleteDecisions = deleteTarget
    ? workspace.decisions.filter((decision) => decision.feedbackIds.includes(deleteTarget.id))
    : []

  function updateFilter<K extends keyof FeedbackFilters>(key: K, value: FeedbackFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    const result = await deleteFeedback(deleteTarget.id)
    setDeleting(false)
    if (!result.ok) {
      if (result.error !== CONFLICT_MESSAGE) setNotice({ tone: 'error', message: result.error })
      setDeleteTarget(null)
      return
    }
    setDeleteTarget(null)
    setNotice({ tone: 'success', message: t('Feedback excluído.') })
  }

  return (
    <>
      <PageHeader
        title="Feedback Discovery"
        description={t(
          'Organize a voz dos usuários e conecte informações qualitativas aos problemas identificados nas métricas.',
        )}
        badge={<Badge variant="outline">{t('MVP funcional')}</Badge>}
        actions={
          <Button data-tour-id="feedback-new" onClick={() => setForm({ mode: 'create' })}>
            <Plus aria-hidden="true" />
            {t('Novo feedback')}
          </Button>
        }
      />

      {notice ? (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.message}
        </Notice>
      ) : null}

      <section aria-label={t('Resumo de feedbacks')} className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          {t('{count} feedback(s) no workspace.', { count: workspace.feedbacks.length })}
        </p>
        {workspace.feedbacks.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => {
              const count = categoryCounts[key] ?? 0
              if (count === 0) return null
              return (
                <li key={key}>
                  {label} <span className="font-mono text-foreground">{count}</span>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      {workspace.feedbacks.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title={t('Nenhum feedback no workspace')}
          description={t(
            'Registre relatos de entrevistas, tickets, pesquisas e avaliações para conectá-los aos indicadores e às decisões.',
          )}
        >
          <Button onClick={() => setForm({ mode: 'create' })}>
            <Plus aria-hidden="true" />
            {t('Criar feedback')}
          </Button>
        </EmptyState>
      ) : (
        <>
          <section
            data-tour-id="feedback-filters"
            aria-label={t('Pesquisa e filtros')}
            className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label htmlFor="feedback-search" className="sr-only">
                  {t('Pesquisar feedbacks')}
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="feedback-search"
                    className="pl-9"
                    placeholder={t('Pesquisar por conteúdo, categoria ou fonte')}
                    value={filters.search}
                    onChange={(event) => updateFilter('search', event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="feedback-filter-category" className="sr-only">
                  {t('Filtrar por categoria')}
                </label>
                <Select
                  id="feedback-filter-category"
                  value={filters.category}
                  onChange={(event) =>
                    updateFilter('category', event.target.value as FeedbackCategory | 'all')
                  }
                >
                  <option value="all">{t('Todas as categorias')}</option>
                  {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="feedback-filter-source" className="sr-only">
                  {t('Filtrar por fonte')}
                </label>
                <Select
                  id="feedback-filter-source"
                  value={filters.source}
                  onChange={(event) =>
                    updateFilter('source', event.target.value as FeedbackSource | 'all')
                  }
                >
                  <option value="all">{t('Todas as fontes')}</option>
                  {Object.entries(FEEDBACK_SOURCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="feedback-filter-metric" className="sr-only">
                  {t('Filtrar por indicador')}
                </label>
                <Select
                  id="feedback-filter-metric"
                  value={filters.metricId}
                  onChange={(event) => updateFilter('metricId', event.target.value)}
                >
                  <option value="all">{t('Todos os indicadores')}</option>
                  {workspace.metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {filtersActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(EMPTY_FEEDBACK_FILTERS)}
              >
                <X aria-hidden="true" />
                {t('Limpar filtros')}
              </Button>
            ) : null}
          </section>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t('Nenhum feedback encontrado')}
              description={t(
                'Nenhum registro corresponde à busca e aos filtros atuais. Ajuste os critérios para ver mais resultados.',
              )}
            >
              <Button variant="outline" onClick={() => setFilters(EMPTY_FEEDBACK_FILTERS)}>
                {t('Limpar busca e filtros')}
              </Button>
            </EmptyState>
          ) : (
            <section aria-label={t('Lista de feedbacks')} className="space-y-3">
              <h2 className="sr-only">{t('Lista de feedbacks')}</h2>
              <p className="font-mono text-xs text-muted-foreground">
                {t('Exibindo {shown} de {total} feedback(s).', {
                  shown: filtered.length,
                  total: workspace.feedbacks.length,
                })}
              </p>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {filtered.map((feedback) => {
                  const metrics = workspace.metrics.filter((metric) =>
                    feedback.metricIds.includes(metric.id),
                  )
                  const decisions = workspace.decisions.filter((decision) =>
                    decision.feedbackIds.includes(feedback.id),
                  )
                  const label = t('{category} de {date}', {
                    category: FEEDBACK_CATEGORY_LABELS[feedback.category],
                    date: formatDate(feedback.receivedAt),
                  })

                  return (
                    <li key={feedback.id}>
                      <article className="grid gap-x-8 gap-y-3 p-4 sm:p-5 md:grid-cols-[13rem_minmax(0,1fr)]">
                        <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                          <p className="font-mono">{formatDate(feedback.receivedAt)}</p>
                          <p className="text-sm font-medium text-foreground">
                            {FEEDBACK_CATEGORY_LABELS[feedback.category]}
                          </p>
                          <p>
                            <span className="sr-only">{t('Fonte: ')}</span>
                            {FEEDBACK_SOURCE_LABELS[feedback.source]}
                          </p>
                        </div>

                        <div className="min-w-0 space-y-4">
                          <p className="max-w-[68ch] whitespace-pre-line break-words border-l-2 border-border pl-4 text-[15px] leading-relaxed text-foreground">
                            {feedback.content}
                          </p>

                          <div className="space-y-1.5 text-xs">
                            <p className="text-muted-foreground">
                              {metrics.length === 0
                                ? t('Sem indicador associado.')
                                : metrics.length === 1
                                  ? t('Associado a 1 indicador:')
                                  : t('Associado a {count} indicadores:', {
                                      count: metrics.length,
                                    })}
                            </p>
                            {metrics.length > 0 ? (
                              <ul className="flex flex-wrap gap-1.5">
                                {metrics.map((metric) => (
                                  <li key={metric.id} className="min-w-0 max-w-full">
                                    <a
                                      href={locationHref('overview', { metric: metric.id })}
                                      className="block break-words rounded-md border border-border px-2 py-1 text-foreground underline-offset-4 hover:border-input hover:underline"
                                    >
                                      {metric.name}
                                      <span className="ml-1 font-mono text-muted-foreground">
                                        {METRIC_UNIT_LABELS[metric.unit]}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>

                          {decisions.length > 0 ? (
                            <div className="space-y-1 text-xs">
                              <p className="text-muted-foreground">{t('Citado como evidência em:')}</p>
                              <ul className="space-y-1">
                                {decisions.map((decision) => (
                                  <li key={decision.id} className="break-words">
                                    <a
                                      href={locationHref('decisions', { record: decision.id })}
                                      className="text-foreground underline-offset-4 hover:text-primary hover:underline"
                                    >
                                      {decision.title}
                                    </a>
                                    <span className="text-muted-foreground">
                                      {' '}
                                      · {DECISION_STATUS_LABELS[decision.status]}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="max-sm:min-h-11"
                              aria-label={t('Editar feedback: {label}', { label })}
                              onClick={() => setForm({ mode: 'edit', feedback })}
                            >
                              {t('Editar')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="max-sm:min-h-11"
                              aria-label={t('Excluir feedback: {label}', { label })}
                              onClick={() => setDeleteTarget(feedback)}
                            >
                              {t('Excluir')}
                            </Button>
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {form ? (
        <FeedbackFormDialog
          feedback={form.mode === 'edit' ? form.feedback : undefined}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null)
            setNotice({
              tone: 'success',
              message:
                form.mode === 'edit' ? t('Feedback atualizado.') : t('Feedback criado.'),
            })
          }}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          title={t('Excluir feedback')}
          description={
            deleteDecisions.length > 0
              ? t(
                  'Este feedback é evidência de decisões registradas e não pode ser excluído diretamente.',
                )
              : t('Esta ação remove o feedback do workspace e não pode ser desfeita.')
          }
          confirmLabel={t('Excluir feedback')}
          onConfirm={handleDelete}
          blocked={deleteDecisions.length > 0}
          pending={deleting}
          details={[
            `${FEEDBACK_CATEGORY_LABELS[deleteTarget.category]} · ${formatDate(deleteTarget.receivedAt)} · “${
              deleteTarget.content.length > 120
                ? `${deleteTarget.content.slice(0, 120).trimEnd()}…`
                : deleteTarget.content
            }”`,
            ...(deleteDecisions.length > 0
              ? [
                  ...deleteDecisions.map((decision) =>
                    t('Decisão: {title}', { title: decision.title }),
                  ),
                  t(
                    'Abra a decisão, remova este feedback das evidências e tente novamente.',
                  ),
                ]
              : []),
          ]}
        />
      ) : null}
    </>
  )
}
