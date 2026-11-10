import { describe, expect, it } from 'vitest'
import {
  MAX_BACKUP_BYTES,
  backupFileName,
  createBackup,
  parseBackup,
  parseBackupValue,
  serializeBackup,
} from '@/lib/backup'
import { collectIntegrityIssues } from '@/lib/workspace-integrity'
import { SCHEMA_VERSION } from '@/lib/storage/schema'
import {
  buildDecision,
  buildFeedback,
  buildMetric,
  buildObservation,
  buildWorkspace,
} from '@/test/fixtures'

function fullWorkspace() {
  const metric = buildMetric()
  const feedback = buildFeedback({ metricIds: [metric.id] })
  const decision = buildDecision({
    metricIds: [metric.id],
    feedbackIds: [feedback.id],
  })
  return buildWorkspace({
    metrics: [metric],
    observations: [
      buildObservation({ id: 'observation-1', period: '2026-01', value: 4.5 }),
      buildObservation({ id: 'observation-2', period: '2026-02', value: 4.3 }),
    ],
    feedbacks: [feedback],
    decisions: [decision],
  })
}

function envelope(data: unknown, schemaVersion = SCHEMA_VERSION) {
  return { schemaVersion, exportedAt: '2026-03-01T10:00:00.000Z', data }
}

describe('createBackup / serializeBackup', () => {
  it('gera envelope versionado com data de exportação', () => {
    const backup = createBackup(buildWorkspace(), '2026-03-01T10:00:00.000Z')

    expect(backup.schemaVersion).toBe(SCHEMA_VERSION)
    expect(backup.exportedAt).toBe('2026-03-01T10:00:00.000Z')
    expect(backup.data).toEqual(buildWorkspace())
  })

  it('serializa JSON válido e reimportável', () => {
    const workspace = fullWorkspace()
    const text = serializeBackup(workspace, '2026-03-01T10:00:00.000Z')
    const parsed = parseBackup(text)

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.workspace).toEqual(workspace)
    expect(parsed.summary).toEqual({
      metrics: 1,
      observations: 2,
      feedbacks: 1,
      decisions: 1,
      exportedAt: '2026-03-01T10:00:00.000Z',
    })
  })

  it('gera nome de arquivo com data', () => {
    expect(backupFileName('2026-03-01T10:00:00.000Z')).toBe(
      'product-decision-lab-backup-2026-03-01.json',
    )
  })
})

describe('parseBackup — rejeições', () => {
  it('rejeita JSON inválido', () => {
    const result = parseBackup('{not-json')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/JSON/i)
  })

  it('rejeita arquivo acima do limite', () => {
    const result = parseBackup('x'.repeat(MAX_BACKUP_BYTES + 1))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/5 MB/)
  })

  it('rejeita envelope que não é objeto', () => {
    expect(parseBackupValue(null).ok).toBe(false)
    expect(parseBackupValue([]).ok).toBe(false)
  })

  it('rejeita versão ausente, inválida ou futura', () => {
    expect(parseBackupValue({ data: buildWorkspace() }).ok).toBe(false)
    expect(parseBackupValue(envelope(buildWorkspace(), 0)).ok).toBe(false)
    expect(
      parseBackupValue(envelope(buildWorkspace(), SCHEMA_VERSION + 1)).ok,
    ).toBe(false)
  })

  it('rejeita estrutura de dados inválida', () => {
    const result = parseBackupValue(
      envelope({ metrics: [{ id: 'x' }], observations: [], feedbacks: [], decisions: [] }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('rejeita ids duplicados na mesma coleção', () => {
    const metric = buildMetric()
    const issues = collectIntegrityIssues(
      buildWorkspace({ metrics: [metric, { ...metric }] }),
    )

    expect(issues.some((issue) => /duplicado/i.test(issue))).toBe(true)
  })

  it('rejeita observação apontando para métrica inexistente', () => {
    const issues = collectIntegrityIssues(
      buildWorkspace({ observations: [buildObservation({ metricId: 'missing' })] }),
    )

    expect(issues.some((issue) => /indicador inexistente/i.test(issue))).toBe(true)
  })

  it('rejeita observações duplicadas por período', () => {
    const issues = collectIntegrityIssues(
      buildWorkspace({
        metrics: [buildMetric()],
        observations: [
          buildObservation({ id: 'a', period: '2026-01' }),
          buildObservation({ id: 'b', period: '2026-01' }),
        ],
      }),
    )

    expect(issues.some((issue) => /mais de uma observação/i.test(issue))).toBe(true)
  })

  it('rejeita feedback e decisão com referências órfãs', () => {
    const feedbackIssues = collectIntegrityIssues(
      buildWorkspace({ feedbacks: [buildFeedback({ metricIds: ['missing'] })] }),
    )
    const decisionIssues = collectIntegrityIssues(
      buildWorkspace({
        decisions: [buildDecision({ metricIds: ['missing'], feedbackIds: ['missing'] })],
      }),
    )

    expect(feedbackIssues.some((issue) => /indicador inexistente/i.test(issue))).toBe(true)
    expect(decisionIssues.some((issue) => /feedback inexistente/i.test(issue))).toBe(true)
  })

  it('rejeita valores fora do intervalo da unidade', () => {
    const issues = collectIntegrityIssues(
      buildWorkspace({
        metrics: [buildMetric({ unit: 'percent' })],
        observations: [buildObservation({ value: 150 })],
      }),
    )

    expect(issues.some((issue) => /entre 0 e 100/i.test(issue))).toBe(true)
  })

  it('rejeita referências duplicadas dentro do mesmo registro', () => {
    const metric = buildMetric()
    const feedback = buildFeedback({ metricIds: [metric.id, metric.id] })
    const decision = buildDecision({
      metricIds: [metric.id, metric.id],
      feedbackIds: [feedback.id, feedback.id],
    })

    const issues = collectIntegrityIssues(
      buildWorkspace({
        metrics: [metric],
        feedbacks: [feedback],
        decisions: [decision],
      }),
    )

    expect(issues.some((issue) => /Feedback.*duplicados/i.test(issue))).toBe(true)
    expect(issues.some((issue) => /Decisão.*indicadores.*duplicados/i.test(issue))).toBe(
      true,
    )
    expect(issues.some((issue) => /Decisão.*feedbacks.*duplicados/i.test(issue))).toBe(
      true,
    )
  })

  it('rejeita registros marcados como simulados', () => {
    const result = parseBackupValue(
      envelope(
        buildWorkspace({
          metrics: [buildMetric({ simulated: true })],
        }),
      ),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/simulad/i)
    expect(
      result.issues.some((issue) => /dataset demonstrativo/i.test(issue)),
    ).toBe(true)
  })

  it('não devolve workspace quando a validação falha', () => {
    const result = parseBackupValue(
      envelope({ metrics: 'não é lista', observations: [], feedbacks: [], decisions: [] }),
    )

    expect(result.ok).toBe(false)
    expect('workspace' in result).toBe(false)
  })
})

describe('parseBackup — compatibilidade', () => {
  it('aceita savedAt como data quando exportedAt não existe', () => {
    const result = parseBackupValue({
      schemaVersion: SCHEMA_VERSION,
      savedAt: '2026-03-05T08:00:00.000Z',
      data: buildWorkspace(),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.exportedAt).toBe('2026-03-05T08:00:00.000Z')
  })

  it('aceita data ausente sem inventar valor', () => {
    const result = parseBackupValue({
      schemaVersion: SCHEMA_VERSION,
      data: buildWorkspace(),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.exportedAt).toBeNull()
  })
})
