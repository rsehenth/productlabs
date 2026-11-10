import { cn } from '@/lib/utils'

/**
 * Rótulo textual que separa os tipos de conteúdo do caso. A cor reforça o tipo, mas o
 * texto é o que o identifica (não depende apenas de cor). O amarelo da marca não é usado:
 * ele não deve sugerir resultado positivo.
 */
export type CaseKind = 'simulated' | 'evidence' | 'hypothesis' | 'alternative' | 'choice'

const KINDS: Record<CaseKind, { label: string; className: string }> = {
  simulated: { label: 'Indicador simulado', className: 'text-simulated' },
  evidence: { label: 'Evidência qualitativa', className: 'text-chart-2' },
  hypothesis: { label: 'Hipótese', className: 'text-chart-3' },
  alternative: { label: 'Alternativa', className: 'text-foreground' },
  choice: { label: 'Escolha', className: 'text-foreground' },
}

export function CaseKindTag({
  kind,
  note,
  className,
}: {
  kind: CaseKind
  note?: string
  className?: string
}) {
  const { label, className: tone } = KINDS[kind]
  return (
    <p
      className={cn(
        'font-mono text-[11px] font-medium uppercase tracking-[0.12em]',
        tone,
        className,
      )}
    >
      {label}
      {note ? <span className="font-normal normal-case tracking-normal text-muted-foreground"> · {note}</span> : null}
    </p>
  )
}

/** Marcador de capítulo: situa a etapa atual da narrativa sem criar navegação. */
export function CasePhaseMarker({
  index,
  label,
  description,
}: {
  index: string
  label: string
  description: string
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border pt-6">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-primary">
        Etapa {index} · {label}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
