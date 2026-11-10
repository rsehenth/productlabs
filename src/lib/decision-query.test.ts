import { describe, expect, it } from 'vitest'
import {
  EMPTY_DECISION_FILTERS,
  decisionStatusCounts,
  filterDecisions,
  hasActiveDecisionFilters,
} from '@/lib/decision-query'
import { buildDecision } from '@/test/fixtures'

const decisions = [
  buildDecision({
    id: 'decision-1',
    title: 'Melhorar compreensão dos planos',
    problem: 'A conversão para Premium caiu.',
    status: 'investigating',
    updatedAt: '2026-02-05T10:00:00.000Z',
  }),
  buildDecision({
    id: 'decision-2',
    title: 'Redesenho do assistente',
    problem: 'Os tickets de onboarding cresceram.',
    status: 'draft',
    updatedAt: '2026-03-01T10:00:00.000Z',
  }),
  buildDecision({
    id: 'decision-3',
    title: 'Novo modelo de preços',
    problem: 'O plano gratuito limita a ativação.',
    status: 'decided',
    updatedAt: '2026-01-01T10:00:00.000Z',
  }),
]

describe('filterDecisions', () => {
  it('filtra por status', () => {
    expect(
      filterDecisions(decisions, {
        ...EMPTY_DECISION_FILTERS,
        status: 'draft',
      }).map((item) => item.id),
    ).toEqual(['decision-2'])
  })

  it('pesquisa por título ignorando acentuação', () => {
    expect(
      filterDecisions(decisions, {
        ...EMPTY_DECISION_FILTERS,
        search: 'compreensao',
      }).map((item) => item.id),
    ).toEqual(['decision-1'])
  })

  it('pesquisa por problema', () => {
    expect(
      filterDecisions(decisions, {
        ...EMPTY_DECISION_FILTERS,
        search: 'tickets',
      }).map((item) => item.id),
    ).toEqual(['decision-2'])
  })

  it('combina busca e status', () => {
    expect(
      filterDecisions(decisions, {
        search: 'plano',
        status: 'decided',
      }).map((item) => item.id),
    ).toEqual(['decision-3'])
  })

  it('ordena por atualização mais recente', () => {
    expect(
      filterDecisions(decisions, EMPTY_DECISION_FILTERS).map((item) => item.id),
    ).toEqual(['decision-2', 'decision-1', 'decision-3'])
  })
})

describe('decisionStatusCounts', () => {
  it('conta todos os status, inclusive zero', () => {
    expect(decisionStatusCounts(decisions)).toEqual({
      draft: 1,
      investigating: 1,
      decided: 1,
      validated: 0,
      abandoned: 0,
    })
  })
})

describe('hasActiveDecisionFilters', () => {
  it('detecta filtros ativos', () => {
    expect(hasActiveDecisionFilters(EMPTY_DECISION_FILTERS)).toBe(false)
    expect(
      hasActiveDecisionFilters({ ...EMPTY_DECISION_FILTERS, status: 'draft' }),
    ).toBe(true)
    expect(hasActiveDecisionFilters({ ...EMPTY_DECISION_FILTERS, search: 'x' })).toBe(
      true,
    )
  })
})
