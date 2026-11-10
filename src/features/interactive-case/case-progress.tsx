const CASE_PHASES = [
  { id: 'investigate', index: '01', label: 'Investigar', hint: 'Indicadores e contexto' },
  { id: 'analyze', index: '02', label: 'Analisar', hint: 'Feedbacks e evidências' },
  { id: 'decide', index: '03', label: 'Decidir', hint: 'Hipótese e alternativa' },
] as const

export function CaseProgress() {
  return (
    <div>
      <ol aria-label="Etapas disponíveis no Interactive Case" className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {CASE_PHASES.map((phase) => (
          <li key={phase.id} className="flex items-start gap-3 bg-card px-4 py-3">
            <span className="font-mono text-sm tabular-nums text-primary">{phase.index}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{phase.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{phase.hint}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">Disponível</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

