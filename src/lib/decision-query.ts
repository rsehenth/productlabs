import type { DecisionRecord, DecisionStatus } from '@/types/domain'
import { matchesSearch } from '@/lib/text'

export interface DecisionFilters {
  search: string
  status: DecisionStatus | 'all'
}

export const EMPTY_DECISION_FILTERS: DecisionFilters = { search: '', status: 'all' }

export function filterDecisions(
  decisions: DecisionRecord[],
  filters: DecisionFilters,
): DecisionRecord[] {
  return decisions
    .filter((decision) => {
      if (filters.status !== 'all' && decision.status !== filters.status) return false
      return matchesSearch(`${decision.title} ${decision.problem}`, filters.search)
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function hasActiveDecisionFilters(filters: DecisionFilters): boolean {
  return filters.search.trim() !== '' || filters.status !== 'all'
}

export function decisionStatusCounts(
  decisions: DecisionRecord[],
): Record<DecisionStatus, number> {
  const counts: Record<DecisionStatus, number> = {
    draft: 0,
    investigating: 0,
    decided: 0,
    validated: 0,
    abandoned: 0,
  }
  for (const decision of decisions) counts[decision.status] += 1
  return counts
}
