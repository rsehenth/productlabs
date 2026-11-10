import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download, Pencil, Trash2 } from 'lucide-react'
import type { DecisionRecord } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Notice } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { useWorkspace } from '@/hooks/use-workspace'
import { latestObservation } from '@/lib/analytics'
import { formatDateTime } from '@/lib/dates'
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_SOURCE_LABELS,
  formatMetricValue,
  formatPeriod,
} from '@/lib/domain-labels'
import { downloadTextFile } from '@/lib/download'
import { buildDecisionMarkdown, decisionFileName } from '@/lib/markdown'
import { locationHref } from '@/lib/routing'
import { CONFLICT_MESSAGE } from '@/lib/storage/workspace-storage'
import { DecisionStatusBadge } from '@/features/decisions/decision-status-badge'

interface DecisionDetailProps {
  decision: DecisionRecord
  onBack: () => void
  onEdit: (decision: DecisionRecord) => void
  onDeleted: () => void
}

export function DecisionDetail({ decision, onBack, onEdit, onDeleted }: DecisionDetailProps) {
  const { workspace, deleteDecision } = useWorkspace()
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const metrics = decision.metricIds
    .map((id) => workspace.metrics.find((metric) => metric.id === id))
    .filter((metric) => metric !== undefined)
  const feedbacks = decision.feedbackIds
    .map((id) => workspace.feedbacks.find((feedback) => feedback.id === id))
    .filter((feedback) => feedback !== undefined)
  const missingRefs =
    decision.metricIds.length !== metrics.length ||
    decision.feedbackIds.length !== feedbacks.length

  function handleExport() {
    downloadTextFile(
      buildDecisionMarkdown(decision, workspace),
      decisionFileName(decision),
      'text/markdown;charset=utf-8',
    )
    setNotice(`Markdown gerado: ${decisionFileName(decision)}.`)
  }

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    const result = await deleteDecision(decision.id)
    setDeleting(false)
    if (!result.ok) {
      if (result.error !== CONFLICT_MESSAGE) setError(`${result.error} Nada foi excluído.`)
      setConfirmDelete(false)
      return
    }
    onDeleted()
  }

  return (
    <>
      <PageHeader
        title={decision.title}
        description="Registro de raciocínio: problema, hipótese, alternativas, decisão, evidências e critérios de sucesso."
        badge={<DecisionStatusBadge status={decision.status} />}
        actions={
          <>
            <Button variant="outline" className="max-sm:min-h-11" onClick={onBack}>
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Button>
            <Button variant="outline" className="max-sm:min-h-11" onClick={handleExport}>
              <Download aria-hidden="true" />
              Exportar Markdown
            </Button>
            <Button variant="outline" className="max-sm:min-h-11" onClick={() => onEdit(decision)}>
              <Pencil aria-hidden="true" />
              Editar
            </Button>
            <Button variant="destructive" className="max-sm:min-h-11" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" />
              Excluir
            </Button>
          </>
        }
      />

      {notice ? (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" onDismiss={() => setError(null)}>
          {error}
        </Notice>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir este registro?"
        description={`“${decision.title}” será removido permanentemente do workspace. Esta ação não pode ser desfeita.`}
        details={[
          'Indicadores e feedbacks vinculados não são excluídos; apenas o vínculo com este registro deixa de existir.',
        ]}
        confirmLabel="Confirmar exclusão"
        pending={deleting}
        onConfirm={handleDelete}
      />

      <Card>
        <CardContent className="space-y-0 p-5 sm:p-6 [&>section]:py-5 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0 [&>section+section]:border-t [&>section+section]:border-border/60">
          <RecordSection id="record-problem" title="Problema" hint="O que motivou a investigação.">
            <LongText>{decision.problem}</LongText>
          </RecordSection>

          <RecordSection
            id="record-hypothesis"
            title="Hipótese"
            hint="Uma aposta a investigar; não é um fato comprovado."
          >
            {decision.hypothesis ? (
              <div className="rounded-lg border-l-2 border-primary/50 bg-accent/30 px-3 py-2">
                <LongText strong>{decision.hypothesis}</LongText>
              </div>
            ) : (
              <Empty>Nenhuma hipótese registrada.</Empty>
            )}
          </RecordSection>

          <RecordSection
            id="record-alternatives"
            title="Alternativas consideradas"
            hint="Opções de ação avaliadas; não são evidências."
          >
            {decision.alternatives.length === 0 ? (
              <Empty>Nenhuma alternativa registrada.</Empty>
            ) : (
              <ol className="space-y-2">
                {decision.alternatives.map((alternative, index) => (
                  <ListRow key={`${index}-${alternative}`} marker={`${index + 1}`}>
                    {alternative}
                  </ListRow>
                ))}
              </ol>
            )}
          </RecordSection>

          <RecordSection
            id="record-decision"
            title="Decisão registrada"
            hint="A escolha documentada; não implica resultado positivo."
          >
            {decision.decision ? (
              <div className="rounded-lg border border-primary/30 px-3 py-2">
                <LongText strong>{decision.decision}</LongText>
              </div>
            ) : (
              <Empty>Nenhuma decisão registrada.</Empty>
            )}
          </RecordSection>

          <RecordSection
            id="record-evidence"
            title="Evidências vinculadas"
            hint="Registros do workspace relacionados a este problema. Um vínculo não estabelece causalidade."
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Indicadores · <span className="font-mono">{metrics.length}</span>
                </h3>
                {metrics.length === 0 ? (
                  <Empty>Nenhum indicador vinculado.</Empty>
                ) : (
                  <ul className="space-y-2">
                    {metrics.map((metric) => {
                      const latest = latestObservation(workspace, metric.id)
                      return (
                        <li key={metric.id} className="rounded-lg border border-border/70 p-3">
                          <a
                            href={locationHref('overview', { metric: metric.id })}
                            className="break-words text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                          >
                            {metric.name}
                          </a>
                          <p className="font-mono text-xs text-muted-foreground">
                            {latest
                              ? `Último valor: ${formatMetricValue(latest.value, metric.unit)} · ${formatPeriod(latest.period)}`
                              : 'Sem observações registradas.'}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Feedbacks · <span className="font-mono">{feedbacks.length}</span>
                </h3>
                {feedbacks.length === 0 ? (
                  <Empty>Nenhum feedback vinculado.</Empty>
                ) : (
                  <ul className="space-y-2">
                    {feedbacks.map((feedback, index) => (
                      <li key={feedback.id} className="rounded-lg border border-border/70 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Feedback {index + 1}</Badge>
                          <Badge variant="secondary">
                            {FEEDBACK_CATEGORY_LABELS[feedback.category]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {FEEDBACK_SOURCE_LABELS[feedback.source]}
                          </span>
                        </div>
                        <div className="mt-2">
                          <LongText>{feedback.content}</LongText>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {missingRefs ? (
                <p className="text-xs text-muted-foreground">
                  Algumas referências não estão mais disponíveis no workspace.
                </p>
              ) : null}
            </div>
          </RecordSection>

          <RecordSection
            id="record-criteria"
            title="Critérios de sucesso"
            hint="Condições definidas por você para avaliar o resultado."
          >
            {decision.successCriteria.length === 0 ? (
              <Empty>Nenhum critério registrado.</Empty>
            ) : (
              <ul className="space-y-2">
                {decision.successCriteria.map((criterion, index) => (
                  <ListRow key={`${index}-${criterion}`}>{criterion}</ListRow>
                ))}
              </ul>
            )}
          </RecordSection>

          <RecordSection id="record-next-steps" title="Próximos passos">
            {decision.nextSteps.length === 0 ? (
              <Empty>Nenhum próximo passo registrado.</Empty>
            ) : (
              <ol className="space-y-2">
                {decision.nextSteps.map((step, index) => (
                  <ListRow key={`${index}-${step}`} marker={`${index + 1}`}>
                    {step}
                  </ListRow>
                ))}
              </ol>
            )}
          </RecordSection>

          <section aria-labelledby="record-metadata" className="space-y-1">
            <h2 id="record-metadata" className="text-sm font-semibold text-foreground">
              Metadados
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Criado em {formatDateTime(decision.createdAt)}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Atualizado em {formatDateTime(decision.updatedAt)}
            </p>
          </section>
        </CardContent>
      </Card>
    </>
  )
}

function RecordSection({
  id,
  title,
  hint,
  children,
}: {
  id: string
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div>
        <h2 id={id} className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

function LongText({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <p
      className={`whitespace-pre-line break-words text-sm leading-relaxed ${strong ? 'text-foreground' : 'text-muted-foreground'}`}
    >
      {children}
    </p>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground/80">{children}</p>
}

function ListRow({ marker, children }: { marker?: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border/70 px-3 py-2">
      <span aria-hidden="true" className="mt-0.5 w-5 shrink-0 font-mono text-xs text-primary">
        {marker ?? '•'}
      </span>
      <span className="min-w-0 break-words text-sm leading-relaxed text-muted-foreground">
        {children}
      </span>
    </li>
  )
}
