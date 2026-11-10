import type { FeedbackCategory, FeedbackSource, UserFeedback } from '@/types/domain'
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_SOURCE_LABELS } from '@/lib/domain-labels'
import { matchesSearch } from '@/lib/text'

export interface FeedbackFilters {
  search: string
  category: FeedbackCategory | 'all'
  source: FeedbackSource | 'all'
  metricId: string | 'all'
}

export const EMPTY_FEEDBACK_FILTERS: FeedbackFilters = {
  search: '',
  category: 'all',
  source: 'all',
  metricId: 'all',
}

export function feedbackSearchText(feedback: UserFeedback): string {
  return [
    feedback.content,
    FEEDBACK_CATEGORY_LABELS[feedback.category],
    FEEDBACK_SOURCE_LABELS[feedback.source],
  ].join(' ')
}

export function filterFeedbacks(
  feedbacks: UserFeedback[],
  filters: FeedbackFilters,
): UserFeedback[] {
  return feedbacks
    .filter((feedback) => {
      if (filters.category !== 'all' && feedback.category !== filters.category) return false
      if (filters.source !== 'all' && feedback.source !== filters.source) return false
      if (filters.metricId !== 'all' && !feedback.metricIds.includes(filters.metricId)) {
        return false
      }
      return matchesSearch(feedbackSearchText(feedback), filters.search)
    })
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
}

export function hasActiveFeedbackFilters(filters: FeedbackFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.source !== 'all' ||
    filters.metricId !== 'all'
  )
}
