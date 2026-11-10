import { lazy, Suspense, useMemo, useState } from 'react'
import { Activity, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Notice } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { useLanguage } from '@/hooks/use-language'
import { useWorkspace } from '@/hooks/use-workspace'
import { metricSummary } from '@/lib/analytics'
import { routeHref, useRoute } from '@/lib/routing'
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
  const { t } = useLanguage()
  const { workspace } = useWorkspace()
  const { params, navigate } = useRoute()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ProductMetric | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<'success' | 'info'>('success')

  const metricCards = useMemo(
    () => workspace.metrics.map((metric) => ({
      metric,
      summary: metricSummary(workspace, metric),
      feedbackCount: workspace.feedbacks.filter((feedback) =>
        feedback.metricIds.includes(metric.id),
      ).length,
      decisionCount: workspace.decisions.filter((decision) =>
        decision.metricIds.includes(metric.id),
      ).length,
    })),
    [workspace],
  )

  const selectedMetric = params.metric
    ? (workspace.metrics.find((metric) => metric.id === params.metric) ?? null)
    : null

  const totalObservations = workspace.observations.length
  const isEmpty = workspace.metrics.length === 0

  return (
    <>
      <PageHeader
        title="Product Overview"
        description={t(
          'Conecte métricas e feedbacks para formular hipóteses, comparar alternativas e documentar decisões de produto fundamentadas em evidências.',
        )}
        actions={
          <>
            <ExportBackupButton
              label={t('Exportar backup')}
              onExported={(message, compatible) => {
                setNoticeTone(compatible ? 'success' : 'info')
                setNotice(message)
              }}
            />
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              {t('Importar backup')}
            </Button>
            <Button data-tour-id="metric-new" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              {t('Novo indicador')}
            </Button>
          </>
        }
      />

      {notice ? (
        <Notice tone={noticeTone} onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      ) : null}

      <section data-tour-id="local-data" aria-labelledby="local-data-title" className="rounded-xl border border-border bg-card px-5 py-4">
        <h2 id="local-data-title" className="text-sm font-semibold text-foreground">{t('Seus dados no workspace')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(
            'Os registros ficam neste navegador, sem sincronização em nuvem com outros dispositivos ou perfis. Limpar os dados do site pode apagá-los definitivamente; a aplicação não faz recuperação automática. Exporte um backup manualmente pelos botões acima. Ao importar, todo o workspace atual é substituído.',
          )}
        </p>
      </section>

      {isEmpty ? (
        <>
          <EmptyState
            icon={Activity}
            title={t('Comece pelo seu primeiro indicador')}
            description={t(
              'Cadastre uma métrica de produto e acompanhe sua evolução ao longo do tempo. Os dados ficam apenas neste navegador.',
            )}
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              {t('Criar indicador')}
            </Button>
          </EmptyState>

          <section aria-labelledby="start-title" className="space-y-2">
            <h2 id="start-title" className="font-display text-xl font-semibold tracking-tight text-foreground">
              {t('Explore o laboratório')}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <a className="text-primary underline underline-offset-4" href={routeHref('feedbacks')}>{t('Registre feedbacks')}</a>{' '}
              {t('e')}{' '}
              <a className="text-primary underline underline-offset-4" href={routeHref('decisions')}>{t('documente decisões')}</a>{' '}
              {t('com suas hipóteses e alternativas. Você também pode')}{' '}
              <a className="text-primary underline underline-offset-4" href={routeHref('interactive-case')}>{t('experimentar o Interactive Case')}</a>
              {t(', um cenário simulado separado do workspace.')}
            </p>
          </section>

          <section data-tour-id="demo-preview" aria-labelledby="demo-preview-title" className="space-y-3">
            <div>
              <h2 id="demo-preview-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {t('Prévia demonstrativa')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t(
                  'Esta prévia usa um produto fictício e não é gravada no workspace. Seus registros permanecem separados.',
                )}
              </p>
            </div>
            <Suspense
              fallback={<p role="status" className="text-sm text-muted-foreground">{t('Carregando prévia…')}</p>}
            >
              <DemoDatasetPreview />
            </Suspense>
          </section>
        </>
      ) : (
        <>
          <section aria-label={t('Resumo do workspace')}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
              {[
                { label: t('Indicadores'), value: workspace.metrics.length },
                { label: t('Observações'), value: totalObservations },
                { label: t('Feedbacks'), value: workspace.feedbacks.length },
                { label: t('Decisões'), value: workspace.decisions.length },
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

          <section data-tour-id="metric-list" aria-labelledby="metrics-title" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="metrics-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {t('Indicadores')}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {t('{count} cadastrado(s)', { count: workspace.metrics.length })}
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
              {metricCards.map(({ metric, summary, feedbackCount, decisionCount }) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  summary={summary}
                  feedbackCount={feedbackCount}
                  decisionCount={decisionCount}
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
            setNotice(t('Indicador criado.'))
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
            setNotice(t('Indicador atualizado.'))
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
            setNotice(t('Indicador excluído.'))
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
              t(
                'Backup importado: {metrics} indicadores, {observations} observações, {feedbacks} feedbacks e {decisions} decisões.',
                {
                  metrics: summary.metrics,
                  observations: summary.observations,
                  feedbacks: summary.feedbacks,
                  decisions: summary.decisions,
                },
              ),
            )
          }}
        />
      ) : null}
    </>
  )
}
