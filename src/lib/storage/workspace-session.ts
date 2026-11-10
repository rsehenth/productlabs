import type { WorkspaceState } from '@/types/workspace'
import type { OperationResult } from '@/lib/domain/operations'
import { createEmptyWorkspace } from './schema'
import {
  clearWorkspace,
  loadWorkspace,
  saveWorkspace,
  type StorageLike,
  type WorkspaceLoadStatus,
  type WorkspaceSaveResult,
} from './workspace-storage'
import { withWriteLock, type LockManagerLike } from './write-lock'

export interface SessionSnapshot {
  workspace: WorkspaceState
  status: WorkspaceLoadStatus
  savedAt: string | null
  saveError: string | null
  /** Outra aba alterou os dados: gravações são recusadas até atualizar (WFA-01). */
  stale: boolean
}

const BLOCKED: WorkspaceLoadStatus[] = ['invalid', 'unsupported-version']

/**
 * Uma "aba": mantém o workspace carregado e a revisão (conteúdo bruto) esperada.
 * Toda gravação roda sob lock exclusivo e só persiste se o storage ainda tem a revisão esperada.
 */
export function createWorkspaceSession(
  // `undefined` => padrões do navegador; `null` => ausência explícita (testes).
  store?: StorageLike | null,
  locks?: LockManagerLike | null,
) {
  const initial = loadWorkspace(store)
  let raw = initial.raw
  let snapshot: SessionSnapshot = {
    workspace: initial.workspace,
    status: initial.status,
    savedAt: initial.savedAt,
    saveError: null,
    stale: false,
  }
  const listeners = new Set<() => void>()

  function set(patch: Partial<SessionSnapshot>) {
    snapshot = { ...snapshot, ...patch }
    listeners.forEach((listener) => listener())
  }

  function fail(error: string, conflict?: boolean) {
    set(conflict ? { stale: true } : { saveError: error })
    return { ok: false as const, error, conflict }
  }

  function commit(next: WorkspaceState): WorkspaceSaveResult {
    const saved = saveWorkspace(next, store, raw)
    if (!saved.ok) {
      fail(saved.error, saved.conflict)
      return saved
    }
    raw = saved.raw
    set({
      workspace: next,
      status: 'ok',
      savedAt: new Date().toISOString(),
      saveError: null,
      stale: false,
    })
    return saved
  }

  async function guarded<T>(write: () => T): Promise<T | { ok: false; error: string }> {
    const locked = await withWriteLock(write, locks)
    return locked.ok ? locked.value : fail(locked.error)
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    clearSaveError: () => set({ saveError: null }),
    /** Chamado pelo evento `storage`: só avisa; a garantia é a checagem sob lock. */
    notifyExternalChange(newValue: string | null) {
      if (newValue !== raw) set({ stale: true })
    },
    refresh() {
      const fresh = loadWorkspace(store)
      raw = fresh.raw
      snapshot = {
        workspace: fresh.workspace,
        status: fresh.status,
        savedAt: fresh.savedAt,
        saveError: null,
        stale: false,
      }
      set({})
    },
    run<T>(operation: (state: WorkspaceState) => OperationResult<T>) {
      return guarded(() => {
        if (BLOCKED.includes(snapshot.status)) {
          return {
            ok: false as const,
            error:
              'Existem dados locais inválidos. Exporte o conteúdo bruto ou descarte-os explicitamente antes de salvar.',
          }
        }
        const result = operation(snapshot.workspace)
        if (!result.ok) return result
        const saved = commit(result.workspace)
        return saved.ok ? result : { ok: false as const, error: saved.error }
      }) as Promise<OperationResult<T>>
    },
    replace: (next: WorkspaceState) =>
      guarded(() => commit(next)) as Promise<WorkspaceSaveResult>,
    discard: () =>
      guarded(() => {
        const result = clearWorkspace(store, raw)
        if (!result.ok) {
          fail(result.error, result.conflict)
          return result
        }
        raw = null
        set({
          workspace: createEmptyWorkspace(),
          status: 'empty',
          savedAt: null,
          saveError: null,
          stale: false,
        })
        return result
      }) as Promise<WorkspaceSaveResult>,
  }
}

export type WorkspaceSession = ReturnType<typeof createWorkspaceSession>
