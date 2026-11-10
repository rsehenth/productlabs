import { lazy, Suspense, useState } from 'react'
import { Activity, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Notice } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { useWorkspace } from '@/hooks/use-workspace'
import { metricSummary } from '@/lib/analytics'
import { useRoute } from '@/lib/routing'
import { ExportBackupButton } from '@/features/overview/export-backup-button'
import { ImportBackupDialog } from '@/features/overview/import-backup-dialog'
import { MetricCard } from '@/features/overview/metric-card'
import { MetricDetailDialog } from '@/features/overview/metric-detail-dialog'
import { MetricFormDialog } from '@/features/overview/metric-form-dialog'
import type { ProductMetric } from '@/types/domain'

const DemoDatasetPreview = lazy(() =>
  import('@/features/overview/demo-dataset-preview').then((module) => ({
    default: module.DemoDatasetPreview,
  })),
)

export function OverviewPage() {
  const { workspace } = useWorkspace()
  const { params, navigate } = useRoute()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ProductMetric | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<'success' | 'info'>('success')

  const selectedMetric = params.metric
    ? (workspace.metrics.find((metric) => metric.id === params.metric) ?? null)
    : null

  const totalObservations = workspace.observations.length
  const isEmpty = workspace.metrics.length === 0

  return (
    <>
      <PageHeader
        title="Product Overview"
        description="Acompanhe indicadores, identifique variações e conecte sinais quantitativos às suas investigações de produto."
        actions={
          <>
            <ExportBackupButton
              label="Exportar backup"
              onExported={(message, compatible) => {
                setNoticeTone(compatible ? 'success' : 'info')
                setNotice(message)
              }}
            />
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              Importar backup
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Novo indicador
            </Button>
          </>
        }
      />

      {notice ? (
        <Notice tone={noticeTone} onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      {isEmpty ? (
        <>
          <EmptyState
            icon={Activity}
            title="Comece pelo seu primeiro indicador"
            description="Cadastre uma métrica de produto e acompanhe sua evolução ao longo do tempo. Os dados ficam apenas neste navegador."
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Criar indicador
            </Button>
          </EmptyState>

          <section aria-labelledby="demo-preview-title" className="space-y-3">
            <div>
              <h2 id="demo-preview-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Prévia demonstrativa
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Esta prévia usa um produto fictício e não é gravada no workspace. Seus dados
                começam vazios e permanecem separados.
              </p>
            </div>
            <Suspense
              fallback={<p className="text-sm text-muted-foreground">Carregando prévia…</p>}
            >
              <DemoDatasetPreview />
            </Suspense>
          </section>
        </>
      ) : (
        <>
          <section aria-label="Resumo do workspace">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
              {[
                { label: 'Indicadores', value: workspace.metrics.length },
                { label: 'Observações', value: totalObservations },
                { label: 'Feedbacks', value: workspace.feedbacks.length },
                { label: 'Decisões', value: workspace.decisions.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card px-5 py-4">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="mt-1.5 font-mono text-3xl leading-none font-medium text-foreground tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="metrics-title" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="metrics-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Indicadores
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {workspace.metrics.length} cadastrado(s)
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
              {workspace.metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  summary={metricSummary(workspace, metric)}
                  feedbackCount={
                    workspace.feedbacks.filter((feedback) =>
                      feedback.metricIds.includes(metric.id),
                    ).length
                  }
                  decisionCount={
                    workspace.decisions.filter((decision) =>
                      decision.metricIds.includes(metric.id),
                    ).length
                  }
                  onOpen={() => navigate('overview', { metric: metric.id })}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {createOpen ? (
        <MetricFormDialog
          onClose={() => setCreateOpen(false)}
          onSaved={(metric) => {
            setCreateOpen(false)
            setNoticeTone('success')
            setNotice('Indicador criado.')
            navigate('overview', { metric: metric.id })
          }}
        />
      ) : null}

      {editingMetric ? (
        <MetricFormDialog
          metric={editingMetric}
          onClose={() => setEditingMetric(null)}
          onSaved={() => {
            setEditingMetric(null)
            setNoticeTone('success')
            setNotice('Indicador atualizado.')
          }}
        />
      ) : null}

      {params.metric ? (
        <MetricDetailDialog
          key={params.metric}
          metric={selectedMetric}
          onClose={() => navigate('overview')}
          onEdit={(metric) => {
            navigate('overview')
            setEditingMetric(metric)
          }}
          onDeleted={() => {
            navigate('overview')
            setNoticeTone('success')
            setNotice('Indicador excluído.')
          }}
        />
      ) : null}

      {importOpen ? (
        <ImportBackupDialog
          onClose={() => setImportOpen(false)}
          onImported={(summary) => {
            setImportOpen(false)
            setNoticeTone('success')
            setNotice(
              `Backup importado: ${summary.metrics} indicadores, ${summary.observations} observações, ${summary.feedbacks} feedbacks e ${summary.decisions} decisões.`,
            )
          }}
        />
      ) : null}
    </>
  )
}
