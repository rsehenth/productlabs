import type { WorkspaceState } from '@/types/workspace'

export const STORAGE_KEY = 'product-decision-lab:workspace'

/** Versão atual do envelope persistido. Incrementar ao mudar o formato. */
export const SCHEMA_VERSION = 1

export interface StoredWorkspace {
  schemaVersion: number
  savedAt: string
  data: WorkspaceState
}

export function createEmptyWorkspace(): WorkspaceState {
  return { metrics: [], observations: [], feedbacks: [], decisions: [] }
}

/** Converte o payload da versão N para N+1. Ainda não há migrações. */
export type Migration = (data: unknown) => unknown

export const migrations: Record<number, Migration> = {}
