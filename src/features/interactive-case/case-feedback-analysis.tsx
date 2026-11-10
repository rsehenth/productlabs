import { Notice } from '@/components/ui/notice'
import { Select } from '@/components/ui/select'
import { CaseFeedbackCard } from '@/features/interactive-case/case-feedback-card'
import {
  filterCaseFeedbackViews,
  type CaseFeedbackFilter,
  type CaseFeedbackView,
} from '@/features/interactive-case/case-feedback-view'

interface CaseFeedbackAnalysisProps {
  views: readonly CaseFeedbackView[]
  selectedMetricId: string | null
  filter: CaseFeedbackFilter
  onFilterChange: (filter: CaseFeedbackFilter) => void
  selectedIds: readonly string[]
  onToggleEvidence: (feedbackId: string) => void
}

const SIMULATION_NOTICE =
  'Todos os comentários apresentados neste cenário são fictícios e foram criados exclusivamente para demonstração.'

const INTERPRETATION_NOTICE =
  'Feedbacks ajudam a formular hipóteses, mas não comprovam, isoladamente, a causa de uma variação nos indicadores.'

export function CaseFeedbackAnalysis({
  views,
  selectedMetricId,
  filter,
  onFilterChange,
  selectedIds,
  onToggleEvidence,
}: CaseFeedbackAnalysisProps) {
  const visible = filterCaseFeedbackViews(views, filter, selectedMetricId)
  const selectedSet = new Set(selectedIds)

  return (
    <section aria-labelledby="case-feedback-title" className="space-y-4">
      <div>
        <h2 id="case-feedback-title" className="text-lg font-semibold text-foreground">
          02 — Analisar a voz dos usuários
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Explore os feedbacks disponíveis e identifique quais relatos podem ajudar a formular
          hipóteses sobre o problema.
        </p>
      </div>

      <Notice tone="info">{SIMULATION_NOTICE}</Notice>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="case-feedback-filter"
          className="text-xs font-medium text-foreground"
        >
          Visualizar
        </label>
        <Select
          id="case-feedback-filter"
          className="w-auto min-w-56"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as CaseFeedbackFilter)}
        >
          <option value="all">Todos os feedbacks</option>
          <option value="related">Relacionados ao indicador selecionado</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Exibindo {visible.length} de {views.length} feedback(s).
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum feedback relacionado ao indicador selecionado. Altere o filtro para visualizar
          todos os relatos.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((view) => (
            <CaseFeedbackCard
              key={view.id}
              view={view}
              selected={selectedSet.has(view.id)}
              highlightedMetricId={selectedMetricId}
              onToggle={onToggleEvidence}
            />
          ))}
        </div>
      )}

      <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        <p>{INTERPRETATION_NOTICE}</p>
        <p className="text-muted-foreground/80">
          Observação: a variação registrada em um indicador. Evidência qualitativa: o relato de um
          usuário. Hipótese: uma explicação possível, ainda não verificada.
        </p>
      </div>
    </section>
  )
}
