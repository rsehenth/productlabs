import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Notice } from '@/components/ui/notice'
import { PageHeader } from '@/components/ui/page-header'
import { useLanguage } from '@/hooks/use-language'
import { PROFRESOLVE_GROWTH_CONVERSION_CASE } from '@/data/interactive-case/profresolve-growth-conversion-demo'
import {
  buildCaseDecisionOptionViews,
  buildCaseDecisionSummary,
  caseDecisionMissingRequirements,
  caseDecisionRequirementMessages,
  selectCaseDecisionOption,
} from '@/features/interactive-case/case-decision-view'
import { CaseDecisionOptions } from '@/features/interactive-case/case-decision-options'
import { CaseDecisionSummary } from '@/features/interactive-case/case-decision-summary'
import { CaseEvidenceSummary } from '@/features/interactive-case/case-evidence-summary'
import { CaseFeedbackAnalysis } from '@/features/interactive-case/case-feedback-analysis'
import {
  buildCaseFeedbackViews,
  removeCaseEvidenceId,
  selectCaseEvidence,
  toggleCaseEvidenceId,
  type CaseFeedbackFilter,
} from '@/features/interactive-case/case-feedback-view'
import { CaseHypothesisEditor } from '@/features/interactive-case/case-hypothesis-editor'
import { CaseInvestigation } from '@/features/interactive-case/case-investigation'
import { CaseMetricCard } from '@/features/interactive-case/case-metric-card'
import { CasePhaseMarker } from '@/features/interactive-case/case-kind-tag'
import { CaseProgress } from '@/features/interactive-case/case-progress'
import {
  buildCaseMetricViews,
  selectCaseMetricView,
} from '@/features/interactive-case/case-metric-view'
import { formatPeriod } from '@/lib/domain-labels'

const SCENARIO = PROFRESOLVE_GROWTH_CONVERSION_CASE
const CASE_METRIC_VIEWS = buildCaseMetricViews(SCENARIO.metrics)
const CASE_FEEDBACK_VIEWS = buildCaseFeedbackViews(SCENARIO.feedbacks, SCENARIO.metrics)
const CASE_DECISION_OPTION_VIEWS = buildCaseDecisionOptionViews(
  SCENARIO.decisionOptions,
  SCENARIO.metrics,
  SCENARIO.feedbacks,
)

const CASE_DESCRIPTION =
  'Explore os indicadores de um cenário demonstrativo inspirado no ProfResolve e identifique os sinais que merecem investigação.'

const SIMULATION_NOTICE =
  'Cenário simulado: os indicadores apresentados não representam dados reais de produção do ProfResolve.'

export function InteractiveCasePage() {
  const { t } = useLanguage()
  const [selectedId, setSelectedId] = useState<string | null>(
    CASE_METRIC_VIEWS[0]?.id ?? null,
  )
  const [feedbackFilter, setFeedbackFilter] = useState<CaseFeedbackFilter>('all')
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<readonly string[]>([])
  const [hypothesis, setHypothesis] = useState('')
  const [decisionOptionId, setDecisionOptionId] = useState<string | null>(null)
  const [summaryVisible, setSummaryVisible] = useState(false)

  const selected = selectCaseMetricView(CASE_METRIC_VIEWS, selectedId)
  const selectedEvidence = selectCaseEvidence(CASE_FEEDBACK_VIEWS, selectedFeedbackIds)
  const selectedOption = selectCaseDecisionOption(CASE_DECISION_OPTION_VIEWS, decisionOptionId)
  const missingRequirements = caseDecisionMissingRequirements(
    hypothesis,
    selectedEvidence.length,
    decisionOptionId,
  )
  const summaryContent = buildCaseDecisionSummary({
    problem: SCENARIO.problem,
    metricName: selected?.name ?? null,
    selectedEvidence,
    hypothesis,
    option: selectedOption,
  })
  const firstView = CASE_METRIC_VIEWS[0]
  const lastView = CASE_METRIC_VIEWS[CASE_METRIC_VIEWS.length - 1]

  function toggleEvidence(feedbackId: string) {
    setSelectedFeedbackIds((previous) => toggleCaseEvidenceId(previous, feedbackId))
  }

  function removeEvidence(feedbackId: string) {
    setSelectedFeedbackIds((previous) => removeCaseEvidenceId(previous, feedbackId))
  }

  return (
    <>
      <PageHeader
        title={t(SCENARIO.title)}
        description="Interactive Product Case"
        badge={<Badge variant="simulated">{t('Cenário simulado')}</Badge>}
      />

      <Notice tone="info">{t(SIMULATION_NOTICE)}</Notice>

      <CaseProgress />

      <section aria-labelledby="case-context-title" className="space-y-4">
        <h2 id="case-context-title" className="text-lg font-semibold text-foreground">
          {t('Contexto')}
        </h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="max-w-[62ch] space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>{t(CASE_DESCRIPTION)}</p>
            <p>{t(SCENARIO.context)}</p>
            <div className="space-y-1 border-l-2 border-border pl-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                {t('Problema apresentado')}
              </p>
              <p className="text-foreground">{t(SCENARIO.problem)}</p>
            </div>
          </div>
          <Card className="self-start border-l-2 border-l-primary">
            <CardContent className="space-y-2 p-5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                {t('Pergunta principal')}
              </p>
              <p className="font-display text-xl leading-snug font-medium text-foreground">
                {t(SCENARIO.mainQuestion)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <CasePhaseMarker
        index="01"
        label={t('Investigar')}
        description={t('Observe os indicadores simulados antes de explicar o que aconteceu.')}
      />

      <section aria-labelledby="case-metrics-title" className="space-y-4">
        <div>
          <h2 id="case-metrics-title" className="text-lg font-semibold text-foreground">
            {t('Painel de métricas')}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {firstView && lastView
              ? t(
                  'Indicadores simulados de {from} a {to}. As variações comparam a primeira e a última observação de cada série.',
                  {
                    from: formatPeriod(firstView.first.period),
                    to: formatPeriod(lastView.last.period),
                  },
                )
              : t('Indicadores simulados calculados a partir do cenário demonstrativo.')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CASE_METRIC_VIEWS.map((view) => (
            <CaseMetricCard key={view.id} view={view} />
          ))}
        </div>
      </section>

      <CaseInvestigation
        views={CASE_METRIC_VIEWS}
        selected={selected}
        onSelect={setSelectedId}
      />

      <CasePhaseMarker
        index="02"
        label={t('Analisar')}
        description={t('Relatos fictícios ajudam a formular hipóteses; não comprovam causas.')}
      />

      <CaseFeedbackAnalysis
        views={CASE_FEEDBACK_VIEWS}
        selectedMetricId={selected?.id ?? null}
        filter={feedbackFilter}
        onFilterChange={setFeedbackFilter}
        selectedIds={selectedFeedbackIds}
        onToggleEvidence={toggleEvidence}
      />

      <CaseEvidenceSummary
        selected={selectedEvidence}
        onRemove={removeEvidence}
        onClear={() => setSelectedFeedbackIds([])}
      />

      <CasePhaseMarker
        index="03"
        label={t('Decidir')}
        description={t('Registre uma hipótese e escolha uma direção dentro do cenário.')}
      />

      <CaseHypothesisEditor value={hypothesis} onChange={setHypothesis} />

      <CaseDecisionOptions
        options={CASE_DECISION_OPTION_VIEWS}
        selectedId={decisionOptionId}
        selectedEvidence={selectedEvidence}
        onSelect={setDecisionOptionId}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setSummaryVisible(true)}>{t('Ver síntese da minha decisão')}</Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t(
            'A síntese exige uma hipótese com pelo menos 15 caracteres, uma evidência selecionada e uma alternativa escolhida.',
          )}
        </p>
      </div>

      {summaryVisible ? (
        <CaseDecisionSummary
          summary={summaryContent}
          missingMessages={caseDecisionRequirementMessages(missingRequirements)}
        />
      ) : null}
    </>
  )
}
