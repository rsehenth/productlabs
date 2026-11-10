// WFA-02: importação de backup aplica as mesmas exigências por status do formulário.
import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from '@/lib/backup'
import { createDecision, type DecisionInput } from '@/lib/domain/operations'
import { createWorkspaceSession } from '@/lib/storage/workspace-session'
import { CONFLICT_MESSAGE, loadWorkspace } from '@/lib/storage/workspace-storage'
import { STORAGE_KEY } from '@/lib/storage/schema'
import type { DecisionRecord, DecisionStatus } from '@/types/domain'
import {
  buildDecision,
  buildFeedback,
  buildMetric,
  buildObservation,
  buildWorkspace,
} from '@/test/fixtures'

const EMPTY = { hypothesis: '', decision: '', successCriteria: [] as string[] }
const decisionWith = (over: Partial<DecisionRecord>) => buildDecision({ ...EMPTY, ...over })
const backupOf = (decisions: DecisionRecord[]) =>
  parseBackup(serializeBackup(buildWorkspace({ decisions })))

describe('WFA-02 — importação x regras de status', () => {
  it('A: rascunho mínimo é aceito', () => {
    expect(backupOf([decisionWith({ status: 'draft' })]).ok).toBe(true)
  })

  it('B: investigação sem hipótese é recusada', () => {
    const r = backupOf([decisionWith({ status: 'investigating' })])
    expect(r.ok).toBe(false)
  })

  it('C: investigação com hipótese é aceita', () => {
    expect(backupOf([decisionWith({ status: 'investigating', hypothesis: 'h' })]).ok).toBe(true)
  })

  it('D: decidida sem decisão registrada é recusada', () => {
    expect(backupOf([decisionWith({ status: 'decided', hypothesis: 'h' })]).ok).toBe(false)
  })

  it('E: decidida completa é aceita', () => {
    const r = backupOf([decisionWith({ status: 'decided', hypothesis: 'h', decision: 'd' })])
    expect(r.ok).toBe(true)
  })

  it('F: validada sem requisitos (caso da auditoria) é recusada, com mensagem útil', () => {
    const r = backupOf([decisionWith({ status: 'validated', title: 'Minha decisão' })])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain('decisão incompatível')
    expect(r.issues).toHaveLength(3)
    expect(r.issues[0]).toContain('Minha decisão')
    expect(r.issues[0]).toContain('validated')
  })

  it('validada completa e abandonada sem extras são aceitas', () => {
    const ok = decisionWith({
      status: 'validated',
      hypothesis: 'h',
      decision: 'd',
      successCriteria: ['c'],
    })
    expect(backupOf([ok]).ok).toBe(true)
    expect(backupOf([decisionWith({ id: 'd2', status: 'abandoned' })]).ok).toBe(true)
  })

  it('texto só com espaços não satisfaz o requisito', () => {
    const r = backupOf([decisionWith({ status: 'investigating', hypothesis: '   ' })])
    expect(r.ok).toBe(false)
  })
})

function mixedWorkspace(invalid: DecisionRecord) {
  const metrics = [buildMetric({ id: 'm1' }), buildMetric({ id: 'm2', name: 'Outra' })]
  const feedbacks = ['f1', 'f2', 'f3'].map((id) => buildFeedback({ id, metricIds: ['m1'] }))
  return buildWorkspace({
    metrics,
    observations: [buildObservation({ id: 'o1', metricId: 'm1' })],
    feedbacks,
    decisions: [
      buildDecision({ id: 'ok', status: 'investigating' }),
      invalid,
    ],
  })
}

describe('WFA-02 — backup misto e preservação', () => {
  const invalid = decisionWith({ id: 'bad', status: 'validated' })

  it('G: uma decisão inválida recusa o backup inteiro, sem remover nem normalizar', () => {
    const ws = mixedWorkspace(invalid)
    const r = parseBackup(serializeBackup(ws))
    expect(r.ok).toBe(false)
    expect(ws.decisions).toHaveLength(2)
    expect(ws.decisions[1]?.status).toBe('validated')
  })

  it('H/J: importação inválida não chega ao replace; storage idêntico', async () => {
    const storage = memoryStorage()
    const session = createWorkspaceSession(storage, immediateLocks())
    const current = buildWorkspace({ metrics: [buildMetric({ id: 'keep' })] })
    expect((await session.replace(current)).ok).toBe(true)
    const before = storage.data.get(STORAGE_KEY)

    const parsed = parseBackup(serializeBackup(mixedWorkspace(invalid)))
    if (parsed.ok) await session.replace(parsed.workspace) // fluxo do diálogo
    expect(parsed.ok).toBe(false)
    expect(storage.data.get(STORAGE_KEY)).toBe(before)
  })

  it('I: backup válido completo preserva registros, IDs e relações', async () => {
    const ws = mixedWorkspace(
      decisionWith({
        id: 'good2',
        status: 'validated',
        hypothesis: 'h',
        decision: 'd',
        successCriteria: ['c'],
        metricIds: ['m1', 'm2'],
        feedbackIds: ['f1', 'f2', 'f3'],
      }),
    )
    const parsed = parseBackup(serializeBackup(ws))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.workspace).toEqual(ws)

    const storage = memoryStorage()
    const session = createWorkspaceSession(storage, immediateLocks())
    expect((await session.replace(parsed.workspace)).ok).toBe(true)
    expect(loadWorkspace(storage).workspace).toEqual(ws)
  })

  it('J: importação válida usa replace protegido; sessão desatualizada não sobrescreve', async () => {
    const storage = memoryStorage()
    const locks = immediateLocks()
    const a = createWorkspaceSession(storage, locks)
    const b = createWorkspaceSession(storage, locks)
    await a.replace(buildWorkspace({ metrics: [buildMetric({ id: 'recent' })] }))

    const parsed = parseBackup(serializeBackup(buildWorkspace({ decisions: [buildDecision()] })))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const result = await b.replace(parsed.workspace)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(CONFLICT_MESSAGE)
    expect(loadWorkspace(storage).workspace.metrics.map((m) => m.id)).toEqual(['recent'])
  })
})

describe('WFA-02 — K: formulário e backup concordam', () => {
  const statuses: DecisionStatus[] = ['draft', 'investigating', 'decided', 'validated', 'abandoned']
  const variants = [
    EMPTY,
    { ...EMPTY, hypothesis: 'h' },
    { ...EMPTY, hypothesis: 'h', decision: 'd' },
    { hypothesis: 'h', decision: 'd', successCriteria: ['c'] },
    { hypothesis: '', decision: 'd', successCriteria: ['c'] },
  ]

  it.each(statuses.flatMap((status) => variants.map((v) => [status, v] as const)))(
    '%s %j',
    (status, v) => {
      const input: DecisionInput = {
        title: 'T',
        problem: 'P',
        metricIds: [],
        feedbackIds: [],
        alternatives: [],
        nextSteps: [],
        status,
        ...v,
      }
      const form = createDecision(buildWorkspace(), input).ok
      const backup = backupOf([
        buildDecision({ ...v, title: 'T', problem: 'P', alternatives: [], nextSteps: [], status }),
      ]).ok
      expect(backup).toBe(form)
    },
  )
})

// --- helpers ---------------------------------------------------------------
function memoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

function immediateLocks() {
  let tail: Promise<unknown> = Promise.resolve()
  return {
    request<T>(_n: string, _o: unknown, cb: () => Promise<T> | T) {
      const run = tail.then(() => cb())
      tail = run.catch(() => undefined)
      return run
    },
  } as never
}
