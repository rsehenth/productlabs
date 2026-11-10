import type { WorkspaceState } from '@/types/workspace'
import {
  createEmptyWorkspace,
  migrations,
  SCHEMA_VERSION,
  STORAGE_KEY,
  type StoredWorkspace,
} from './schema'
import { isPlainObject, validateWorkspace, type ValidationIssue } from './validation'
import { t } from '@/lib/i18n'
import { collectIntegrityIssues } from '@/lib/workspace-integrity'

/** Permite injetar um storage falso nos testes. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type WorkspaceLoadStatus =
  | 'ok'
  | 'empty'
  | 'invalid'
  | 'unsupported-version'
  | 'unavailable'

export interface WorkspaceLoadResult {
  workspace: WorkspaceState
  status: WorkspaceLoadStatus
  issues: ValidationIssue[]
  savedAt: string | null
  /** Conteúdo bruto lido: é a "revisão" que a aba espera encontrar ao gravar (WFA-01). */
  raw: string | null
}

export type WorkspaceSaveResult =
  | { ok: true; raw: string | null }
  | { ok: false; error: string; conflict?: boolean }

export const CONFLICT_MESSAGE =
  'Os dados deste Workspace foram alterados em outra aba. Atualize as informações antes de continuar para evitar perda de dados.'

function resolveStorage(): StorageLike | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function failure(
  status: Exclude<WorkspaceLoadStatus, 'ok'>,
  issues: ValidationIssue[],
  savedAt: string | null = null,
): WorkspaceLoadResult {
  return { workspace: createEmptyWorkspace(), status, issues, savedAt, raw: null }
}

function readSavedAt(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null
}

/**
 * Valida o envelope salvo, aplica migrações pendentes e devolve um workspace
 * utilizável. Nunca lança: qualquer problema resulta em workspace vazio.
 */
export function parseStoredWorkspace(parsed: unknown): WorkspaceLoadResult {
  // `raw` só é conhecido por quem leu o storage; ver loadWorkspace.
  if (!isPlainObject(parsed)) {
    return failure('invalid', [{ path: 'envelope', message: 'deve ser um objeto' }])
  }

  const savedAt = readSavedAt(parsed.savedAt)
  const version = parsed.schemaVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return failure(
      'invalid',
      [{ path: 'schemaVersion', message: 'deve ser um inteiro positivo' }],
      savedAt,
    )
  }
  if (version > SCHEMA_VERSION) {
    return failure(
      'unsupported-version',
      [
        {
          path: 'schemaVersion',
          message: `versão ${version} é mais nova que a suportada (${SCHEMA_VERSION})`,
        },
      ],
      savedAt,
    )
  }

  let data = parsed.data
  for (let current = version; current < SCHEMA_VERSION; current += 1) {
    const migrate = migrations[current]
    if (!migrate) {
      return failure(
        'unsupported-version',
        [{ path: 'schemaVersion', message: `não há migração da versão ${current}` }],
        savedAt,
      )
    }
    data = migrate(data)
  }

  const validation = validateWorkspace(data)
  if (!validation.ok) return failure('invalid', validation.issues, savedAt)

  const integrityIssues = collectIntegrityIssues(validation.value)
  if (integrityIssues.length > 0) {
    return failure(
      'invalid',
      integrityIssues.map((message) => ({ path: 'workspace', message })),
      savedAt,
    )
  }

  return { workspace: validation.value, status: 'ok', issues: [], savedAt, raw: null }
}

export function loadWorkspace(
  storage: StorageLike | null = resolveStorage(),
): WorkspaceLoadResult {
  if (!storage) {
    return failure('unavailable', [
      { path: 'storage', message: 'LocalStorage indisponível neste navegador' },
    ])
  }

  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return failure('unavailable', [
      { path: 'storage', message: 'falha ao ler o LocalStorage' },
    ])
  }

  if (raw === null) {
    return {
      workspace: createEmptyWorkspace(),
      status: 'empty',
      issues: [],
      savedAt: null,
      raw: null,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      ...failure('invalid', [
        { path: 'storage', message: 'o conteúdo salvo não é um JSON válido' },
      ]),
      raw,
    }
  }

  return { ...parseStoredWorkspace(parsed), raw }
}

export function readRawWorkspace(
  storage: StorageLike | null = resolveStorage(),
): string | null {
  if (!storage) return null
  try {
    return storage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Lê o conteúdo atual e recusa a operação se difere do esperado pela aba.
 * Só é atômico quando chamado dentro do lock de gravação (ver write-lock.ts).
 */
function checkExpected(
  storage: StorageLike,
  expectedRaw: string | null | undefined,
): WorkspaceSaveResult | null {
  if (expectedRaw === undefined) return null
  let current: string | null
  try {
    current = storage.getItem(STORAGE_KEY)
  } catch {
    return { ok: false, error: t('Não foi possível ler o armazenamento local para verificar conflitos.') }
  }
  return current === expectedRaw
    ? null
    : { ok: false, error: CONFLICT_MESSAGE, conflict: true }
}

/** `expectedRaw`: conteúdo que a aba carregou/gravou por último; `undefined` desliga a checagem. */
export function saveWorkspace(
  workspace: WorkspaceState,
  storage: StorageLike | null = resolveStorage(),
  expectedRaw?: string | null,
): WorkspaceSaveResult {
  if (!storage) {
    return { ok: false, error: t('LocalStorage indisponível neste navegador.') }
  }

  const validation = validateWorkspace(workspace)
  if (!validation.ok) {
    return { ok: false, error: t('Workspace inválido: nada foi gravado.') }
  }
  if (collectIntegrityIssues(validation.value).length > 0) {
    return { ok: false, error: t('Workspace inconsistente: nada foi gravado.') }
  }

  const conflict = checkExpected(storage, expectedRaw)
  if (conflict) return conflict

  const payload: StoredWorkspace = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data: workspace,
  }

  try {
    const raw = JSON.stringify(payload)
    storage.setItem(STORAGE_KEY, raw)
    return { ok: true, raw }
  } catch {
    return {
      ok: false,
      error: t('Não foi possível gravar no armazenamento local (cota ou permissão).'),
    }
  }
}

export function clearWorkspace(
  storage: StorageLike | null = resolveStorage(),
  expectedRaw?: string | null,
): WorkspaceSaveResult {
  if (!storage) {
    return { ok: false, error: t('LocalStorage indisponível neste navegador.') }
  }
  const conflict = checkExpected(storage, expectedRaw)
  if (conflict) return conflict
  try {
    storage.removeItem(STORAGE_KEY)
    return { ok: true, raw: null }
  } catch {
    return { ok: false, error: t('Não foi possível limpar o armazenamento local.') }
  }
}
