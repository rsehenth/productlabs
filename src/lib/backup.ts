import type { DecisionStatus } from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import { nowIso } from '@/lib/dates'
import { t } from '@/lib/i18n'
import { decisionStatusErrors } from '@/lib/domain/decision-rules'
import {
  migrations,
  SCHEMA_VERSION,
  type Migration,
} from '@/lib/storage/schema'
import { isPlainObject, validateWorkspace } from '@/lib/storage/validation'
import { collectIntegrityIssues, hasSimulatedRecords } from '@/lib/workspace-integrity'

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export interface BackupFile {
  schemaVersion: number
  exportedAt: string
  data: WorkspaceState
}

export interface BackupSummary {
  metrics: number
  observations: number
  feedbacks: number
  decisions: number
  exportedAt: string | null
}

export type BackupParseResult =
  | { ok: true; workspace: WorkspaceState; summary: BackupSummary }
  | { ok: false; error: string; issues: string[] }

export interface IncompatibleDecision {
  id: string
  title: string
  status: DecisionStatus
  pendencies: string[]
}

/** Decisões que o backup recusaria na restauração; reutiliza decisionStatusErrors (WFA-02). */
export function findIncompatibleDecisions(workspace: WorkspaceState): IncompatibleDecision[] {
  return workspace.decisions.flatMap((d) => {
    const pendencies = Object.values(decisionStatusErrors(d))
    return pendencies.length > 0
      ? [{ id: d.id, title: d.title, status: d.status, pendencies }]
      : []
  })
}

export const DECISION_IMPORT_GUIDANCE =
  'Se você ainda possui acesso ao Workspace de origem, abra as decisões indicadas, preencha os campos obrigatórios para seus status e exporte um novo backup. Se você possui apenas este arquivo JSON, mantenha uma cópia segura. Esta versão não oferece regularização automática de decisões durante a restauração.'

export function createBackup(workspace: WorkspaceState, exportedAt = nowIso()): BackupFile {
  return { schemaVersion: SCHEMA_VERSION, exportedAt, data: workspace }
}

export function serializeBackup(workspace: WorkspaceState, exportedAt = nowIso()): string {
  return JSON.stringify(createBackup(workspace, exportedAt), null, 2)
}

export function backupFileName(date = nowIso()): string {
  return `product-decision-lab-backup-${date.slice(0, 10)}.json`
}

function summarize(workspace: WorkspaceState, exportedAt: string | null): BackupSummary {
  return {
    metrics: workspace.metrics.length,
    observations: workspace.observations.length,
    feedbacks: workspace.feedbacks.length,
    decisions: workspace.decisions.length,
    exportedAt,
  }
}

export function parseBackupValue(input: unknown): BackupParseResult {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      error: t('O arquivo não é um backup válido.'),
      issues: [t('Envelope inválido.')],
    }
  }

  const version = input.schemaVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return {
      ok: false,
      error: t('Versão de schema ausente ou inválida.'),
      issues: [t('schemaVersion deve ser um inteiro positivo.')],
    }
  }
  if (version > SCHEMA_VERSION) {
    return {
      ok: false,
      error: t('Backup criado por uma versão mais nova da aplicação.'),
      issues: [
        t('Versão {version}, suportada até {supported}.', {
          version,
          supported: SCHEMA_VERSION,
        }),
      ],
    }
  }

  let data = input.data
  for (let current = version; current < SCHEMA_VERSION; current += 1) {
    const migrate: Migration | undefined = migrations[current]
    if (!migrate) {
      return {
        ok: false,
        error: t('Não há migração disponível para este backup.'),
        issues: [t('Nenhuma migração da versão {version}.', { version: current })],
      }
    }
    data = migrate(data)
  }

  const validation = validateWorkspace(data)
  if (!validation.ok) {
    return {
      ok: false,
      error: t('A estrutura do backup é inválida.'),
      issues: validation.issues.map((issue) => `${issue.path}: ${issue.message}`),
    }
  }

  if (hasSimulatedRecords(validation.value)) {
    return {
      ok: false,
      error: t('O backup contém registros simulados e não foi importado.'),
      issues: [
        t('O dataset demonstrativo não pode ser importado como dados do usuário.'),
      ],
    }
  }

  const integrityIssues = collectIntegrityIssues(validation.value)
  if (integrityIssues.length > 0) {
    return {
      ok: false,
      error: t('O backup contém inconsistências e não foi importado.'),
      issues: integrityIssues,
    }
  }

  // Só no backup: dados já persistidos continuam legíveis (ver docs/WFA-02-DECISION-VALIDATION-FIX.md).
  const decisionIssues = findIncompatibleDecisions(validation.value).flatMap((d) =>
    d.pendencies.map(
      (message) =>
        `${t('Decisão')} "${d.title}" (${d.id}, ${t('status')} ${d.status}): ${message}`,
    ),
  )
  if (decisionIssues.length > 0) {
    return {
      ok: false,
      error: t(
        'O backup contém uma decisão incompatível com as regras do Workspace. Verifique os campos obrigatórios para o status informado. {guidance}',
        { guidance: t(DECISION_IMPORT_GUIDANCE) },
      ),
      issues: decisionIssues,
    }
  }

  const exportedAtValue = input.exportedAt ?? input.savedAt
  const exportedAt =
    typeof exportedAtValue === 'string' && !Number.isNaN(Date.parse(exportedAtValue))
      ? exportedAtValue
      : null

  return {
    ok: true,
    workspace: validation.value,
    summary: summarize(validation.value, exportedAt),
  }
}

export function parseBackup(text: string): BackupParseResult {
  const bytes = new TextEncoder().encode(text).length
  if (bytes > MAX_BACKUP_BYTES) {
    return {
      ok: false,
      error: t('O arquivo excede o limite de 5 MB.'),
      issues: [t('Tamanho recebido: {bytes} bytes.', { bytes })],
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      ok: false,
      error: t('O arquivo não contém JSON válido.'),
      issues: [t('Falha ao interpretar o conteúdo.')],
    }
  }

  return parseBackupValue(parsed)
}
