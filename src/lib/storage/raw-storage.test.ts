import { describe, expect, it } from 'vitest'
import { createEmptyWorkspace, STORAGE_KEY } from '@/lib/storage/schema'
import {
  loadWorkspace,
  readRawWorkspace,
  saveWorkspace,
  type StorageLike,
} from '@/lib/storage/workspace-storage'
import { buildWorkspace } from '@/test/fixtures'

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

describe('readRawWorkspace', () => {
  it('devolve o envelope bruto gravado', () => {
    const storage = createMemoryStorage()
    saveWorkspace(createEmptyWorkspace(), storage)

    const raw = readRawWorkspace(storage)

    expect(raw).toBeTypeOf('string')
    expect(raw).toBe(storage.data.get(STORAGE_KEY))
  })

  it('preserva conteúdo inválido para análise', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, '{not-json')

    expect(loadWorkspace(storage).status).toBe('invalid')
    expect(readRawWorkspace(storage)).toBe('{not-json')
  })

  it('retorna null sem storage disponível ou quando vazio', () => {
    expect(readRawWorkspace(null)).toBeNull()
    expect(readRawWorkspace(createMemoryStorage())).toBeNull()
  })

  it('sobrevive a falha de leitura', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }

    expect(readRawWorkspace(storage)).toBeNull()
  })
})

describe('workspace com registros relacionados', () => {
  it('faz round-trip completo', () => {
    const storage = createMemoryStorage()
    const workspace = buildWorkspace()

    expect(saveWorkspace(workspace, storage).ok).toBe(true)
    expect(loadWorkspace(storage).workspace).toEqual(workspace)
  })
})
