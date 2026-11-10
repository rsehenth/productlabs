import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, STORAGE_KEY } from '@/lib/storage/schema'
import {
  loadWorkspace,
  saveWorkspace,
  type StorageLike,
} from '@/lib/storage/workspace-storage'
import {
  buildDecision,
  buildFeedback,
  buildMetric,
  buildObservation,
  buildWorkspace,
} from '@/test/fixtures'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
  }
}

function store(storage: ReturnType<typeof createMemoryStorage>, data: unknown) {
  const raw = JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    savedAt: '2026-03-01T10:00:00.000Z',
    data,
  })
  storage.setItem(STORAGE_KEY, raw)
  return raw
}

function relatedWorkspace() {
  const metric = buildMetric()
  const feedback = buildFeedback({ metricIds: [metric.id] })
  const decision = buildDecision({
    metricIds: [metric.id],
    feedbackIds: [feedback.id],
  })
  return buildWorkspace({
    metrics: [metric],
    observations: [buildObservation()],
    feedbacks: [feedback],
    decisions: [decision],
  })
}

describe('integridade do workspace armazenado', () => {
  it('carrega workspace relacionado e consistente', () => {
    const storage = createMemoryStorage()
    store(storage, relatedWorkspace())

    const result = loadWorkspace(storage)

    expect(result.status).toBe('ok')
    expect(result.workspace.metrics).toHaveLength(1)
  })

  it('rejeita observação órfã sem apagar o conteúdo', () => {
    const storage = createMemoryStorage()
    const raw = store(
      storage,
      buildWorkspace({ observations: [buildObservation({ metricId: 'missing' })] }),
    )

    const result = loadWorkspace(storage)

    expect(result.status).toBe('invalid')
    expect(result.issues.some((issue) => /indicador inexistente/i.test(issue.message))).toBe(
      true,
    )
    expect(storage.data.get(STORAGE_KEY)).toBe(raw)
  })

  it('rejeita ids duplicados', () => {
    const metric = buildMetric()
    const storage = createMemoryStorage()
    store(storage, buildWorkspace({ metrics: [metric, { ...metric }] }))

    expect(loadWorkspace(storage).status).toBe('invalid')
  })

  it('rejeita períodos duplicados', () => {
    const storage = createMemoryStorage()
    store(
      storage,
      buildWorkspace({
        metrics: [buildMetric()],
        observations: [
          buildObservation({ id: 'a', period: '2026-01' }),
          buildObservation({ id: 'b', period: '2026-01' }),
        ],
      }),
    )

    expect(loadWorkspace(storage).status).toBe('invalid')
  })

  it('rejeita percentual fora do intervalo', () => {
    const storage = createMemoryStorage()
    store(
      storage,
      buildWorkspace({
        metrics: [buildMetric({ unit: 'percent' })],
        observations: [buildObservation({ value: 150 })],
      }),
    )

    expect(loadWorkspace(storage).status).toBe('invalid')
  })

  it('recusa gravar workspace inconsistente', () => {
    const storage = createMemoryStorage()
    const result = saveWorkspace(
      buildWorkspace({ observations: [buildObservation({ metricId: 'missing' })] }),
      storage,
    )

    expect(result.ok).toBe(false)
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
  })

  it('aceita gravar workspace relacionado', () => {
    const storage = createMemoryStorage()
    const workspace = relatedWorkspace()

    expect(saveWorkspace(workspace, storage).ok).toBe(true)
    expect(loadWorkspace(storage).workspace).toEqual(workspace)
  })
})

describe('falha de storage na gravação', () => {
  it('não altera o conteúdo anterior quando setItem falha', () => {
    const storage = createMemoryStorage()
    const workspace = relatedWorkspace()
    expect(saveWorkspace(workspace, storage).ok).toBe(true)
    const before = storage.data.get(STORAGE_KEY)

    const failing: StorageLike = {
      getItem: storage.getItem,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: storage.removeItem,
    }

    expect(saveWorkspace(buildWorkspace(), failing).ok).toBe(false)
    expect(storage.data.get(STORAGE_KEY)).toBe(before)
  })
})
