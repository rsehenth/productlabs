import { describe, expect, it } from 'vitest'
import {
  isDecisionRecord,
  isProductMetric,
  isWorkspaceState,
} from '@/lib/storage/validation'
import { buildDecision, buildMetric, buildWorkspace } from '@/test/fixtures'

describe('compatibilidade com rascunhos', () => {
  it('aceita indicador com descrição vazia', () => {
    expect(isProductMetric(buildMetric({ description: '' }))).toBe(true)
  })

  it('aceita decisão em rascunho sem hipótese ou decisão', () => {
    expect(
      isDecisionRecord(
        buildDecision({ status: 'draft', hypothesis: '', decision: '' }),
      ),
    ).toBe(true)
  })

  it('continua exigindo título e problema', () => {
    expect(isDecisionRecord(buildDecision({ title: '   ' }))).toBe(false)
    expect(isDecisionRecord(buildDecision({ problem: '' }))).toBe(false)
  })

  it('aceita workspace com rascunho persistido', () => {
    expect(
      isWorkspaceState(
        buildWorkspace({
          decisions: [buildDecision({ status: 'draft', hypothesis: '', decision: '' })],
        }),
      ),
    ).toBe(true)
  })
})
