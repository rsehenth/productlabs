import { describe, expect, it } from 'vitest'
import {
  EMPTY_FEEDBACK_FILTERS,
  filterFeedbacks,
  hasActiveFeedbackFilters,
} from '@/lib/feedback-query'
import { buildFeedback } from '@/test/fixtures'

const feedbacks = [
  buildFeedback({
    id: 'feedback-1',
    content: 'Não encontrei o convite do time.',
    category: 'usability',
    source: 'interview',
    metricIds: ['metric-1'],
    receivedAt: '2026-02-01T10:00:00.000Z',
  }),
  buildFeedback({
    id: 'feedback-2',
    content: 'A sincronização travou durante a configuração.',
    category: 'bug',
    source: 'support-ticket',
    metricIds: ['metric-2'],
    receivedAt: '2026-03-01T10:00:00.000Z',
  }),
  buildFeedback({
    id: 'feedback-3',
    content: 'O preço do plano Premium parece alto.',
    category: 'pricing',
    source: 'survey',
    metricIds: ['metric-1'],
    receivedAt: '2026-01-01T10:00:00.000Z',
  }),
]

describe('filterFeedbacks', () => {
  it('pesquisa conteúdo sem diferenciar maiúsculas', () => {
    expect(
      filterFeedbacks(feedbacks, { ...EMPTY_FEEDBACK_FILTERS, search: 'CONVITE' }).map(
        (item) => item.id,
      ),
    ).toEqual(['feedback-1'])
  })

  it('pesquisa ignorando acentuação', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        search: 'configuracao',
      }).map((item) => item.id),
    ).toEqual(['feedback-2'])
  })

  it('pesquisa pelo rótulo da categoria e da fonte', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        search: 'usabilidade',
      }).map((item) => item.id),
    ).toEqual(['feedback-1'])
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        search: 'ticket de suporte',
      }).map((item) => item.id),
    ).toEqual(['feedback-2'])
  })

  it('filtra por categoria', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        category: 'pricing',
      }).map((item) => item.id),
    ).toEqual(['feedback-3'])
  })

  it('filtra por fonte', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        source: 'survey',
      }).map((item) => item.id),
    ).toEqual(['feedback-3'])
  })

  it('filtra por indicador relacionado', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        metricId: 'metric-1',
      }).map((item) => item.id),
    ).toEqual(['feedback-1', 'feedback-3'])
  })

  it('combina busca e filtros', () => {
    expect(
      filterFeedbacks(feedbacks, {
        search: 'time',
        category: 'usability',
        source: 'all',
        metricId: 'metric-1',
      }).map((item) => item.id),
    ).toEqual(['feedback-1'])
  })

  it('retorna lista vazia quando nada corresponde', () => {
    expect(
      filterFeedbacks(feedbacks, {
        ...EMPTY_FEEDBACK_FILTERS,
        search: 'inexistente',
      }),
    ).toEqual([])
  })

  it('ordena por data mais recente', () => {
    expect(
      filterFeedbacks(feedbacks, EMPTY_FEEDBACK_FILTERS).map((item) => item.id),
    ).toEqual(['feedback-2', 'feedback-1', 'feedback-3'])
  })
})

describe('hasActiveFeedbackFilters', () => {
  it('detecta filtros ativos e limpos', () => {
    expect(hasActiveFeedbackFilters(EMPTY_FEEDBACK_FILTERS)).toBe(false)
    expect(
      hasActiveFeedbackFilters({ ...EMPTY_FEEDBACK_FILTERS, category: 'bug' }),
    ).toBe(true)
    expect(
      hasActiveFeedbackFilters({ ...EMPTY_FEEDBACK_FILTERS, search: '  ' }),
    ).toBe(false)
  })
})
