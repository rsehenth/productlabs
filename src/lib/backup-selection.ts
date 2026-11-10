import {
  MAX_BACKUP_BYTES,
  parseBackup,
  type BackupParseResult,
  type BackupSummary,
} from '@/lib/backup'
import type { WorkspaceSaveResult } from '@/lib/storage/workspace-storage'
import type { WorkspaceState } from '@/types/workspace'

export interface BackupFileLike {
  name: string
  size: number
  text: () => Promise<string>
}

export type BackupSelectionPhase =
  | 'idle'
  | 'reading'
  | 'ready'
  | 'invalid'
  | 'importing'
  | 'imported'
  | 'failed'

export interface BackupSelectionState {
  phase: BackupSelectionPhase
  fileName: string | null
  /** Só existe em `ready`, `importing`, `imported` e `failed`: o backup validado desta seleção. */
  summary: BackupSummary | null
  error: string | null
  issues: string[]
}

const IDLE: BackupSelectionState = {
  phase: 'idle',
  fileName: null,
  summary: null,
  error: null,
  issues: [],
}

/**
 * Seleção de backup com identidade por solicitação: cada `select` incrementa `seq`; uma leitura
 * só grava estado se ainda for a vigente. O workspace validado fica aqui, nunca em estado React.
 */
export function createBackupSelection(
  replaceWorkspace: (next: WorkspaceState) => Promise<WorkspaceSaveResult>,
) {
  let seq = 0
  let state = IDLE
  let validated: { seq: number; workspace: WorkspaceState; summary: BackupSummary } | null = null
  const listeners = new Set<() => void>()

  function set(next: BackupSelectionState) {
    state = next
    listeners.forEach((listener) => listener())
  }

  async function select(file: BackupFileLike) {
    // Troca de arquivo bloqueada durante e depois da gravação.
    if (state.phase === 'importing' || state.phase === 'imported') return
    const mine = ++seq
    validated = null
    const base = { ...IDLE, fileName: file.name }

    if (file.size > MAX_BACKUP_BYTES) {
      set({ ...base, phase: 'invalid', error: 'O arquivo excede o limite de 5 MB.' })
      return
    }

    set({ ...base, phase: 'reading' })
    let result: BackupParseResult
    try {
      result = parseBackup(await file.text())
    } catch {
      if (mine !== seq) return
      set({ ...base, phase: 'invalid', error: 'Não foi possível ler o arquivo selecionado.' })
      return
    }
    if (mine !== seq) return // leitura antiga: descartada

    if (!result.ok) {
      set({ ...base, phase: 'invalid', error: result.error, issues: result.issues })
      return
    }
    validated = { seq: mine, workspace: result.workspace, summary: result.summary }
    set({ ...base, phase: 'ready', summary: result.summary })
  }

  async function confirm(): Promise<BackupSummary | null> {
    const current = validated
    const canConfirm = state.phase === 'ready' || state.phase === 'failed'
    if (!canConfirm || !current || current.seq !== seq) return null

    set({ ...state, phase: 'importing', error: null, issues: [] })
    const saved = await replaceWorkspace(current.workspace)
    if (!saved.ok) {
      if (current.seq === seq) set({ ...state, phase: 'failed', error: saved.error })
      return null
    }
    set({ ...state, phase: 'imported' })
    return current.summary
  }

  return {
    select,
    confirm,
    /** Chamado ao desmontar: leituras pendentes passam a ser obsoletas. */
    invalidate: () => {
      seq++
    },
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
