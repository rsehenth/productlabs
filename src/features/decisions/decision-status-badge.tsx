import type { DecisionStatus } from '@/types/domain'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { DECISION_STATUS_LABELS } from '@/lib/domain-labels'

// Cores neutras: abandonada não é falha e validada é um registro manual, não certificação.
const VARIANTS: Record<DecisionStatus, BadgeProps['variant']> = {
  draft: 'outline',
  investigating: 'default',
  decided: 'secondary',
  validated: 'secondary',
  abandoned: 'outline',
}

export function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return <Badge variant={VARIANTS[status]}>{DECISION_STATUS_LABELS[status]}</Badge>
}
