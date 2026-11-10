// WFA-01: regressão de integridade entre abas (duas sessões sobre o mesmo storage).
import { describe, expect, it } from 'vitest'
import { createBackup } from '@/lib/backup'
import * as operations from '@/lib/domain/operations'
import { createEmptyWorkspace, STORAGE_KEY } from './schema'
import { createWorkspaceSession } from './workspace-session'
import { CONFLICT_MESSAGE, loadWorkspace, saveWorkspace } from './workspace-storage'
import { LOCKS_UNSUPPORTED_MESSAGE, type LockManagerLike } from './write-lock'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

/** Exclusão mútua FIFO equivalente ao navigator.locks, compartilhada pelas "abas". */
function fakeLocks(): LockManagerLike {
  let tail: Promise<unknown> = Promise.resolve()
  return {
    request(_name, _options, callback) {
      const run = tail.then(() => callback())
      tail = run.catch(() => undefined)
      return run
    },
  }
}

const metric = (name: string) => ({
  name,
  description: '',
  unit: 'percent' as const,
  desiredDirection: 'increase' as const,
})
const feedback = (content: string) => ({
  content,
  category: 'usability' as const,
  source: 'interview' as const,
  receivedAt: '2026-03-02T12:00:00.000Z',
  metricIds: [],
})

function twoTabs() {
  const storage = memoryStorage()
  const locks = fakeLocks()
  return {
    storage,
    a: createWorkspaceSession(storage, locks),
    b: createWorkspaceSession(storage, locks),
  }
}

const stored = (storage: ReturnType<typeof memoryStorage>) => loadWorkspace(storage).workspace

describe('WFA-01 — gravações entre abas', () => {
  it('A: recusa gravação baseada em estado desatualizado e preserva a anterior', async () => {
    const { storage, a, b } = twoTabs()

    expect((await a.run((s) => operations.createMetric(s, metric('Métrica da aba A')))).ok).toBe(true)
    const result = await b.run((s) => operations.createFeedback(s, feedback('Feedback da aba B')))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(CONFLICT_MESSAGE)
    expect(b.getSnapshot().stale).toBe(true)
    expect(b.getSnapshot().saveError).toBeNull()
    expect(stored(storage).metrics.map((m) => m.name)).toEqual(['Métrica da aba A'])
    expect(stored(storage).feedbacks).toHaveLength(0)
  })

  it('B/C: após atualizar, a aba salva e nada confirmado se perde no reload', async () => {
    const { storage, a, b } = twoTabs()
    await a.run((s) => operations.createMetric(s, metric('Métrica da aba A')))
    await b.run((s) => operations.createFeedback(s, feedback('Feedback da aba B')))

    b.refresh()
    expect(b.getSnapshot().stale).toBe(false)
    const retry = await b.run((s) => operations.createFeedback(s, feedback('Feedback da aba B')))

    expect(retry.ok).toBe(true)
    const reloaded = createWorkspaceSession(storage, fakeLocks()).getSnapshot().workspace
    expect(reloaded.metrics.map((m) => m.name)).toEqual(['Métrica da aba A'])
    expect(reloaded.feedbacks.map((f) => f.content)).toEqual(['Feedback da aba B'])
  })

  it('D: exclusão com estado desatualizado é impedida', async () => {
    const storage = memoryStorage()
    const seed = operations.createMetric(createEmptyWorkspace(), metric('Alvo'))
    if (!seed.ok) throw new Error('seed')
    saveWorkspace(seed.workspace, storage)
    const locks = fakeLocks()
    const a = createWorkspaceSession(storage, locks)
    const b = createWorkspaceSession(storage, locks)
    const id = seed.value.id

    await a.run((s) => operations.createFeedback(s, feedback('Novo na aba A')))
    const result = await b.run((s) => operations.deleteMetric(s, id))

    expect(result.ok).toBe(false)
    expect(stored(storage).metrics).toHaveLength(1)
    expect(stored(storage).feedbacks).toHaveLength(1)
  })

  it('E: importação com estado desatualizado não descarta alterações recentes', async () => {
    const { storage, a, b } = twoTabs()
    await a.run((s) => operations.createMetric(s, metric('Recente')))
    const backup = createBackup(createEmptyWorkspace()).data

    const result = await b.replace(backup)

    expect(result.ok).toBe(false)
    expect(stored(storage).metrics.map((m) => m.name)).toEqual(['Recente'])
    b.refresh()
    expect((await b.replace(backup)).ok).toBe(true)
  })

  it('E2: descartar dados com estado desatualizado também é recusado', async () => {
    const { storage, a, b } = twoTabs()
    await a.run((s) => operations.createMetric(s, metric('Recente')))

    expect((await b.discard()).ok).toBe(false)
    expect(storage.data.has(STORAGE_KEY)).toBe(true)
  })

  it('F: falha do armazenamento não confirma sucesso nem marca conflito', async () => {
    const storage = memoryStorage()
    storage.setItem = () => {
      throw new DOMException('cheio', 'QuotaExceededError')
    }
    const tab = createWorkspaceSession(storage, fakeLocks())

    const result = await tab.run((s) => operations.createMetric(s, metric('X')))

    expect(result.ok).toBe(false)
    expect(tab.getSnapshot().saveError).not.toBeNull()
    expect(tab.getSnapshot().stale).toBe(false)
    expect(storage.data.size).toBe(0)
  })

  it('G: operações simultâneas — exatamente uma vence, nenhuma perda silenciosa', async () => {
    const { storage, a, b } = twoTabs()

    const [ra, rb] = await Promise.all([
      a.run((s) => operations.createMetric(s, metric('Simultânea A'))),
      b.run((s) => operations.createMetric(s, metric('Simultânea B'))),
    ])

    expect([ra.ok, rb.ok].filter(Boolean)).toHaveLength(1)
    expect(stored(storage).metrics).toHaveLength(1)
    const winner = ra.ok ? a : b
    const loser = ra.ok ? b : a
    expect(winner.getSnapshot().stale).toBe(false)
    expect(loser.getSnapshot().stale).toBe(true)
  })

  it('G2: operações simultâneas na mesma aba são serializadas e ambas persistem', async () => {
    const { storage, a } = twoTabs()

    const results = await Promise.all([
      a.run((s) => operations.createMetric(s, metric('Um'))),
      a.run((s) => operations.createMetric(s, metric('Dois'))),
    ])

    expect(results.every((r) => r.ok)).toBe(true)
    expect(stored(storage).metrics).toHaveLength(2)
  })

  it('evento storage marca a aba como desatualizada sem alterar dados', async () => {
    const { a, b } = twoTabs()
    await a.run((s) => operations.createMetric(s, metric('X')))

    b.notifyExternalChange('conteúdo diferente')
    expect(b.getSnapshot().stale).toBe(true)
    expect(b.getSnapshot().workspace.metrics).toHaveLength(0)
  })

  it('sem Web Locks recusa gravar, explica a limitação e não toca o storage', async () => {
    const storage = memoryStorage()
    const tab = createWorkspaceSession(storage, null)

    const result = await tab.run((s) => operations.createMetric(s, metric('X')))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(LOCKS_UNSUPPORTED_MESSAGE)
    expect(storage.data.size).toBe(0)
  })

  it('H: dados gravados antes da correção (sem metadados de revisão) seguem legíveis e editáveis', async () => {
    const legacy = JSON.stringify({
      schemaVersion: 1,
      savedAt: '2026-11-01T10:00:00.000Z',
      data: createEmptyWorkspace(),
    })
    const storage = memoryStorage({ [STORAGE_KEY]: legacy })
    const tab = createWorkspaceSession(storage, fakeLocks())

    expect(tab.getSnapshot().status).toBe('ok')
    expect((await tab.run((s) => operations.createMetric(s, metric('Depois')))).ok).toBe(true)
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!).schemaVersion).toBe(1)
  })
})
