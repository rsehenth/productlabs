import { describe, expect, it } from 'vitest'
import { ROUTE_IDS } from '@/lib/routing'
import {
  clampStep,
  nextBlockStart,
  progressLabel,
  TOUR_BLOCK_LABELS,
  TOUR_STEPS,
} from '@/features/product-tour/tour-steps'

describe('roteiro do tour', () => {
  it('tem ids únicos e usa só rotas existentes', () => {
    const ids = TOUR_STEPS.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const step of TOUR_STEPS) expect(ROUTE_IDS).toContain(step.route)
  })

  it('cobre os cinco blocos em ordem', () => {
    const blocks = TOUR_STEPS.map((step) => step.block)
    expect([...new Set(blocks)]).toEqual(Object.keys(TOUR_BLOCK_LABELS))
    expect([...blocks].sort()).toEqual(blocks)
  })

  it('tem título e texto em todas as etapas, e lista os cinco status', () => {
    for (const step of TOUR_STEPS) {
      expect(step.title.trim()).not.toBe('')
      expect(step.body.length).toBeGreaterThan(0)
    }
    expect(TOUR_STEPS.find((step) => step.items)?.items).toHaveLength(5)
  })

  it('não promete o que a interface não faz', () => {
    const text = TOUR_STEPS.flatMap((step) => [...step.body, ...(step.items ?? [])]).join(' ')
    expect(text).not.toMatch(/diagnostica automaticamente|navegar direto|sincroniza(?!ção)/i)
  })
})

describe('navegação do tour', () => {
  it('limita o índice e formata o progresso', () => {
    expect(clampStep(-3)).toBe(0)
    expect(clampStep(999)).toBe(TOUR_STEPS.length - 1)
    expect(clampStep(Number.NaN)).toBe(0)
    expect(progressLabel(2)).toBe(`3 de ${TOUR_STEPS.length}`)
  })

  it('pula para o primeiro passo do próximo bloco e retorna null no último', () => {
    const next = nextBlockStart(0)
    expect(TOUR_STEPS[next!]!.block).toBe('B')
    expect(TOUR_STEPS[next! - 1]!.block).toBe('A')
    expect(nextBlockStart(TOUR_STEPS.length - 1)).toBeNull()
  })
})
