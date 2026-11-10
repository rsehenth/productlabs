// P2-01: aviso de decisões incompatíveis antes da exportação e orientação na importação.
import { describe, expect, it } from 'vitest'
import {
  DECISION_IMPORT_GUIDANCE,
  findIncompatibleDecisions,
  parseBackup,
  serializeBackup,
} from '@/lib/backup'
import { updateDecision, type DecisionInput } from '@/lib/domain/operations'
import { buildDecision, buildWorkspace } from '@/test/fixtures'

const EMPTY = { hypothesis: '', decision: '', successCriteria: [] as string[] }
const legacy = (over: Parameters<typeof buildDecision>[0]) =>
  buildDecision({ ...EMPTY, ...over })

describe('P2-01 — detecção antes da exportação', () => {
  it('A: workspace válido não tem decisões incompatíveis', () => {
    const ws = buildWorkspace({
      decisions: [legacy({ id: 'ok', status: 'decided', hypothesis: 'h', decision: 'd' })],
    })
    expect(findIncompatibleDecisions(ws)).toEqual([])
    expect(parseBackup(serializeBackup(ws)).ok).toBe(true)
  })

  it('B: validada sem critério de sucesso é detectada, com a pendência', () => {
    const ws = buildWorkspace({
      decisions: [
        legacy({
          id: 'v',
          title: 'Revisar onboarding',
          status: 'validated',
          hypothesis: 'h',
          decision: 'd',
        }),
      ],
    })
    const found = findIncompatibleDecisions(ws)
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ id: 'v', title: 'Revisar onboarding', status: 'validated' })
    expect(found[0]?.pendencies.join(' ')).toContain('critério de sucesso')
  })

  it('C: múltiplas incompatíveis, sem duplicação nem falsos positivos', () => {
    const ws = buildWorkspace({
      decisions: [
        legacy({ id: 'a', status: 'investigating' }),
        legacy({ id: 'b', status: 'validated' }),
        legacy({ id: 'c', status: 'draft' }),
      ],
    })
    const found = findIncompatibleDecisions(ws)
    expect(found.map((d) => d.id)).toEqual(['a', 'b'])
    expect(found[1]?.pendencies).toHaveLength(3)
  })

  it('G: rascunhos e abandonadas incompletos não geram aviso', () => {
    const ws = buildWorkspace({
      decisions: [
        legacy({ id: 'd', status: 'draft' }),
        legacy({ id: 'x', status: 'abandoned' }),
      ],
    })
    expect(findIncompatibleDecisions(ws)).toEqual([])
  })

  it('D/E: a cópia continua exportável e preserva os dados sem alterações', () => {
    const ws = buildWorkspace({ decisions: [legacy({ id: 'bad', status: 'validated' })] })
    const file = JSON.parse(serializeBackup(ws)) as { data: unknown }
    expect(file.data).toEqual(JSON.parse(JSON.stringify(ws)))
    expect(ws.decisions[0]?.status).toBe('validated')
    expect(ws.decisions[0]?.successCriteria).toEqual([])
  })

  it('F: após corrigir pela operação do formulário, não há mais incompatibilidade', () => {
    const bad = legacy({ id: 'bad', status: 'validated' })
    const ws = buildWorkspace({ decisions: [bad] })
    expect(findIncompatibleDecisions(ws)).toHaveLength(1)

    const input: DecisionInput = {
      title: bad.title,
      problem: bad.problem,
      hypothesis: 'h',
      metricIds: [],
      feedbackIds: [],
      alternatives: [],
      decision: 'd',
      successCriteria: ['c'],
      nextSteps: [],
      status: 'validated',
    }
    const result = updateDecision(ws, 'bad', input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const fixed = buildWorkspace({ decisions: [result.value] })
    expect(findIncompatibleDecisions(fixed)).toEqual([])
    expect(parseBackup(serializeBackup(fixed)).ok).toBe(true)
  })
})

describe('P2-01 — importação', () => {
  it('H: decisão incompatível segue recusada, com detalhes e orientação', () => {
    const r = parseBackup(
      serializeBackup(buildWorkspace({ decisions: [legacy({ id: 'bad', status: 'validated' })] })),
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain(DECISION_IMPORT_GUIDANCE)
    expect(r.error).toContain('Workspace de origem')
    expect(r.issues).toHaveLength(3)
    expect(r.issues[0]).toContain('bad')
  })

  it('H: erros não relacionados não recebem a orientação', () => {
    for (const text of ['{ não é json', JSON.stringify({ schemaVersion: 999, data: {} })]) {
      const r = parseBackup(text)
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).not.toContain('Workspace de origem')
    }
  })

  it('I: backup válido continua importando', () => {
    const ws = buildWorkspace({ decisions: [legacy({ id: 'd', status: 'draft' })] })
    expect(parseBackup(serializeBackup(ws)).ok).toBe(true)
  })
})
