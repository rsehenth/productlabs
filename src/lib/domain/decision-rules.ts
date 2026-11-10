import type { DecisionStatus } from '@/types/domain'

/** Fonte única das exigências por status: usada pelo formulário (operations) e pela importação (backup). */
export function decisionStatusErrors(d: {
  status: DecisionStatus
  hypothesis: string
  decision: string
  successCriteria: string[]
}): Record<string, string> {
  const errors: Record<string, string> = {}
  if (
    (d.status === 'investigating' || d.status === 'decided' || d.status === 'validated') &&
    !d.hypothesis.trim()
  ) {
    errors.hypothesis = 'A hipótese é obrigatória neste status.'
  }
  if ((d.status === 'decided' || d.status === 'validated') && !d.decision.trim()) {
    errors.decision = 'A decisão registrada é obrigatória neste status.'
  }
  if (d.status === 'validated' && !d.successCriteria.some((item) => item.trim())) {
    errors.successCriteria = 'Adicione ao menos um critério de sucesso para o status Validada.'
  }
  return errors
}
