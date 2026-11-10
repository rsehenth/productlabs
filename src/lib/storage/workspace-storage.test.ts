import { describe, expect, it } from 'vitest'
import { DEMO_DATASET } from '@/data/demo/demo-dataset'
import { createEmptyWorkspace, SCHEMA_VERSION, STORAGE_KEY } from '@/lib/storage/schema'
import {
  clearWorkspace,
  loadWorkspace,
  saveWorkspace,
  type StorageLike,
} from '@/lib/storage/workspace-storage'

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
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

function envelope(data: unknown, schemaVersion = SCHEMA_VERSION): string {
  return JSON.stringify({ schemaVersion, savedAt: '2026-11-01T10:00:00.000Z', data })
}

describe('loadWorkspace', () => {
  it('reporta storage indisponível sem lançar erro', () => {
    const result = loadWorkspace(null)

    expect(result.status).toBe('unavailable')
    expect(result.workspace).toEqual(createEmptyWorkspace())
  })

  it('inicia vazio quando não há nada salvo', () => {
    const result = loadWorkspace(createMemoryStorage())

    expect(result.status).toBe('empty')
    expect(result.workspace).toEqual(createEmptyWorkspace())
    expect(result.issues).toEqual([])
  })

  it('não carrega o dataset demonstrativo automaticamente', () => {
    const storage = createMemoryStorage()

    loadWorkspace(storage)

    expect(storage.data.has(STORAGE_KEY)).toBe(false)
  })

  it('recupera um workspace salvo', () => {
    const storage = createMemoryStorage()
    saveWorkspace(DEMO_DATASET, storage)

    const result = loadWorkspace(storage)

    expect(result.status).toBe('ok')
    expect(result.workspace.metrics).toHaveLength(DEMO_DATASET.metrics.length)
    expect(result.savedAt).toBeTypeOf('string')
  })

  it('trata JSON corrompido sem apagar o conteúdo original', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: '{not-json' })

    const result = loadWorkspace(storage)

    expect(result.status).toBe('invalid')
    expect(result.workspace).toEqual(createEmptyWorkspace())
    expect(storage.data.get(STORAGE_KEY)).toBe('{not-json')
  })

  it('trata envelope sem schemaVersion', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({ data: createEmptyWorkspace() }),
    })

    expect(loadWorkspace(storage).status).toBe('invalid')
  })

  it('recusa versão futura do schema', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: envelope(createEmptyWorkspace(), SCHEMA_VERSION + 1),
    })

    const result = loadWorkspace(storage)

    expect(result.status).toBe('unsupported-version')
    expect(result.workspace).toEqual(createEmptyWorkspace())
  })

  it('descarta dados que não passam na validação', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: envelope({
        metrics: [{ id: 'x', name: '', unit: 'percent', desiredDirection: 'increase' }],
        observations: [],
        feedbacks: [],
        decisions: [],
      }),
    })

    const result = loadWorkspace(storage)

    expect(result.status).toBe('invalid')
    expect(result.workspace.metrics).toEqual([])
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('sobrevive a um storage que lança na leitura', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }

    expect(loadWorkspace(storage).status).toBe('unavailable')
  })
})

describe('saveWorkspace', () => {
  it('grava o envelope versionado', () => {
    const storage = createMemoryStorage()
    const result = saveWorkspace(createEmptyWorkspace(), storage)

    expect(result.ok).toBe(true)
    const raw = storage.data.get(STORAGE_KEY)
    expect(raw).toBeTypeOf('string')
    const parsed = JSON.parse(raw ?? '{}') as { schemaVersion?: number; savedAt?: string }
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION)
    expect(parsed.savedAt).toBeTypeOf('string')
  })

  it('faz round-trip preservando os registros', () => {
    const storage = createMemoryStorage()
    saveWorkspace(DEMO_DATASET, storage)

    const result = loadWorkspace(storage)

    expect(result.workspace.feedbacks).toEqual(DEMO_DATASET.feedbacks)
    expect(result.workspace.decisions).toEqual(DEMO_DATASET.decisions)
  })

  it('recusa gravar workspace inválido', () => {
    const storage = createMemoryStorage()
    const invalid = { ...createEmptyWorkspace(), metrics: [{ id: 'sem-campos' }] } as never

    const result = saveWorkspace(invalid, storage)

    expect(result.ok).toBe(false)
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
  })

  it('retorna erro quando o storage rejeita a escrita', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }

    const result = saveWorkspace(createEmptyWorkspace(), storage)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/armazenamento local/i)
  })

  it('retorna erro sem storage disponível', () => {
    expect(saveWorkspace(createEmptyWorkspace(), null).ok).toBe(false)
  })
})

describe('clearWorkspace', () => {
  it('remove o envelope salvo', () => {
    const storage = createMemoryStorage()
    saveWorkspace(DEMO_DATASET, storage)

    expect(clearWorkspace(storage).ok).toBe(true)
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
    expect(loadWorkspace(storage).status).toBe('empty')
  })
})
