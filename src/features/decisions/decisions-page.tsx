import { useState } from 'react'
import { GitBranch, Plus, Search, X } from 'lucide-react'
import type { DecisionRecord, DecisionStatus } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Notice, type NoticeTone } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { Select } from '@/components/ui/select'
import { useWorkspace } from '@/hooks/use-workspace'
import { formatDateTime } from '@/lib/dates'
import { DECISION_STATUS_LABELS } from '@/lib/domain-labels'
import {
  EMPTY_DECISION_FILTERS,
  decisionStatusCounts,
  filterDecisions,
  hasActiveDecisionFilters,
  type DecisionFilters,
} from '@/lib/decision-query'
import { useRoute } from '@/lib/routing'
import { truncate } from '@/lib/text'
import { DecisionDetail } from '@/features/decisions/decision-detail'
import { DecisionForm } from '@/features/decisions/decision-form'
import { DecisionStatusBadge } from '@/features/decisions/decision-status-badge'

type FormState = { mode: 'create' } | { mode: 'edit'; decision: DecisionRecord } | null
type PageNotice = { tone: NoticeTone; message: string } | null

export function DecisionsPage() {
  const { workspace } = useWorkspace()
  const { params, navigate } = useRoute()
  const [filters, setFilters] = useState<DecisionFilters>(EMPTY_DECISION_FILTERS)
  const [form, setForm] = useState<FormState>(null)
  const [notice, setNotice] = useState<PageNotice>(null)

  const counts = decisionStatusCounts(workspace.decisions)
  const filtered = filterDecisions(workspace.decisions, filters)
  const filtersActive = hasActiveDecisionFilters(filters)
  const selected = params.record
    ? (workspace.decisions.find((decision) => decision.id === params.record) ?? null)
    : null

  function updateFilter<K extends keyof DecisionFilters>(
    key: K,
    value: DecisionFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  if (form) {
    return (
      <>
        <PageHeader
          title={form.mode === 'edit' ? 'Editar decisão' : 'Nova decisão'}
          description="Documente o problema, as evidências, a hipótese, as alternativas e a decisão registrada."
          badge={<Badge variant="outline">Decision Record</Badge>}
        />
        <DecisionForm
          initial={form.mode === 'edit' ? form.decision : undefined}
          onCancel={() => setForm(null)}
          onSaved={(decision) => {
            const editing = form.mode === 'edit'
            document.querySelector<HTMLElement>('main')?.focus()
            setForm(null)
            setNotice({
              tone: 'success',
              message: editing ? 'Decisão atualizada.' : 'Decisão criada.',
            })
            navigate('decisions', { record: decision.id })
          }}
        />
      </>
    )
  }

  if (selected && !form) {
    return (
      <>
        {notice ? (
          <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.message}
          </Notice>
        ) : null}
        <DecisionDetail
          decision={selected}
          onBack={() => {
            document.querySelector<HTMLElement>('main')?.focus()
            navigate('decisions')
          }}
          onEdit={(decision) => setForm({ mode: 'edit', decision })}
          onDeleted={() => {
            setNotice({ tone: 'success', message: 'Decisão excluída.' })
            navigate('decisions')
          }}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Decision Workspace"
        description="Transforme problemas, métricas e feedbacks em hipóteses e decisões fundamentadas."
        badge={<Badge variant="outline">MVP funcional</Badge>}
        actions={
          <Button onClick={() => setForm({ mode: 'create' })}>
            <Plus aria-hidden="true" />
            Nova decisão
          </Button>
        }
      />

      {notice ? (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.message}
        </Notice>
      ) : null}

      <section aria-label="Resumo de decisões" className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-foreground">{workspace.decisions.length}</span>{' '}
          registro(s) no workspace.
        </p>
        {workspace.decisions.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <li>
              {DECISION_STATUS_LABELS.investigating}{' '}
              <span className="font-mono text-foreground">{counts.investigating}</span>
            </li>
            <li>
              {DECISION_STATUS_LABELS.decided}{' '}
              <span className="font-mono text-foreground">{counts.decided}</span>
            </li>
          </ul>
        ) : null}
      </section>

      {workspace.decisions.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="Nenhuma decisão documentada"
          description="Crie um Decision Record para conectar um problema às evidências quantitativas e qualitativas e registrar a direção escolhida."
        >
          <Button onClick={() => setForm({ mode: 'create' })}>
            <Plus aria-hidden="true" />
            Criar decisão
          </Button>
        </EmptyState>
      ) : (
        <>
          <section
            aria-label="Pesquisa e filtros de decisões"
            className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <div>
                <label htmlFor="decision-search" className="sr-only">
                  Pesquisar decisões
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="decision-search"
                    className="pl-9"
                    placeholder="Pesquisar por título ou problema"
                    value={filters.search}
                    onChange={(event) => updateFilter('search', event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="decision-filter-status" className="sr-only">
                  Filtrar por status
                </label>
                <Select
                  id="decision-filter-status"
                  value={filters.status}
                  onChange={(event) =>
                    updateFilter('status', event.target.value as DecisionStatus | 'all')
                  }
                >
                  <option value="all">Todos os status</option>
                  {Object.entries(DECISION_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {filtersActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(EMPTY_DECISION_FILTERS)}
              >
                <X aria-hidden="true" />
                Limpar filtros
              </Button>
            ) : null}
          </section>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhuma decisão encontrada"
              description="Nenhum registro corresponde à busca e ao filtro atuais. Ajuste os critérios para ver mais resultados."
            >
              <Button variant="outline" onClick={() => setFilters(EMPTY_DECISION_FILTERS)}>
                Limpar busca e filtros
              </Button>
            </EmptyState>
          ) : (
            <section aria-label="Lista de decisões" className="space-y-3">
              <h2 className="sr-only">Lista de decisões</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Exibindo {filtered.length} de {workspace.decisions.length} registro(s).
              </p>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {filtered.map((decision) => {
                  const recorded = decision.status === 'decided' || decision.status === 'validated'
                  const reasoning = recorded
                    ? { label: 'Decisão registrada', text: decision.decision || decision.hypothesis }
                    : decision.hypothesis.trim()
                      ? { label: 'Hipótese', text: decision.hypothesis }
                      : { label: 'Decisão registrada', text: decision.decision }
                  const metricCount = decision.metricIds.length
                  const feedbackCount = decision.feedbackIds.length

                  return (
                    <li key={decision.id}>
                      <article className="grid gap-x-8 gap-y-3 p-4 sm:p-5 md:grid-cols-[11rem_minmax(0,1fr)]">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-start">
                          <DecisionStatusBadge status={decision.status} />
                          <p className="font-mono text-xs text-muted-foreground">
                            Atualizado em {formatDateTime(decision.updatedAt)}
                          </p>
                        </div>

                        <div className="min-w-0 space-y-3">
                          <h3 className="break-words text-base font-medium leading-snug text-foreground">
                            {decision.title}
                          </h3>
                          <p className="max-w-[68ch] break-words text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {truncate(decision.problem, 240)}
                          </p>

                          {reasoning.text.trim() ? (
                            <div className="max-w-[68ch] border-l-2 border-border pl-4">
                              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                                {reasoning.label}
                              </p>
                              <p className="mt-1 break-words text-sm leading-relaxed text-foreground line-clamp-2">
                                {truncate(reasoning.text, 200)}
                              </p>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              <p>
                                {metricCount + feedbackCount === 0 ? (
                                  'Sem evidências vinculadas'
                                ) : (
                                  <>
                                    Evidências:{' '}
                                    <span className="font-mono text-foreground">{metricCount}</span>{' '}
                                    {metricCount === 1 ? 'indicador' : 'indicadores'}
                                    {' · '}
                                    <span className="font-mono text-foreground">{feedbackCount}</span>{' '}
                                    {feedbackCount === 1 ? 'feedback' : 'feedbacks'}
                                  </>
                                )}
                              </p>
                              {decision.alternatives.length > 0 ? (
                                <p>
                                  Alternativas consideradas:{' '}
                                  <span className="font-mono text-foreground">
                                    {decision.alternatives.length}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="max-sm:h-11"
                              aria-label={`Abrir registro: ${decision.title}`}
                              onClick={() => navigate('decisions', { record: decision.id })}
                            >
                              Abrir registro
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
    </>
  )
}
