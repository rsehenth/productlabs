import { useLanguage } from '@/hooks/use-language'

export function CaseProgress() {
  const { t } = useLanguage()
  const phases = [
    { id: 'investigate', index: '01', label: t('Investigar'), hint: t('Indicadores e contexto') },
    { id: 'analyze', index: '02', label: t('Analisar'), hint: t('Feedbacks e evidências') },
    { id: 'decide', index: '03', label: t('Decidir'), hint: t('Hipótese e alternativa') },
  ]
  return (
    <div data-tour-id="case-progress">
      <ol aria-label={t('Etapas disponíveis no Interactive Case')} className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {phases.map((phase) => (
          <li key={phase.id} className="flex items-start gap-3 bg-card px-4 py-3">
            <span className="font-mono text-sm tabular-nums text-primary">{phase.index}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{phase.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{phase.hint}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">{t('Disponível')}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

