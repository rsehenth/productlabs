import { useEffect, useState, useSyncExternalStore, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Notice } from '@/components/ui/notice'
import { useLanguage } from '@/hooks/use-language'
import { useWorkspace } from '@/hooks/use-workspace'
import type { BackupSummary } from '@/lib/backup'
import { createBackupSelection } from '@/lib/backup-selection'
import { formatDateTime } from '@/lib/dates'
import { ExportBackupButton } from '@/features/overview/export-backup-button'

interface ImportBackupDialogProps {
  onClose: () => void
  onImported: (summary: BackupSummary) => void
}

export function ImportBackupDialog({ onClose, onImported }: ImportBackupDialogProps) {
  const { t } = useLanguage()
  const { workspace, replaceWorkspace } = useWorkspace()
  const [selection] = useState(() => createBackupSelection(replaceWorkspace))
  const { phase, fileName, summary, error, issues } = useSyncExternalStore(
    selection.subscribe,
    selection.getState,
  )
  const [exportNote, setExportNote] = useState<string | null>(null)
  const busy = phase === 'importing' || phase === 'imported'

  useEffect(() => () => selection.invalidate(), [selection])

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void selection.select(file)
  }

  async function handleConfirm() {
    const imported = await selection.confirm()
    if (imported) onImported(imported)
  }

  const hasCurrentData =
    workspace.metrics.length +
      workspace.observations.length +
      workspace.feedbacks.length +
      workspace.decisions.length >
    0

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
      title={t('Importar backup')}
      description={t(
        'Selecione um arquivo JSON exportado pelo Product Decision Lab. A importação substitui todo o workspace deste navegador.',
      )}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t('Cancelar')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={phase !== 'ready' && phase !== 'failed'}
          >
            {phase === 'importing' ? t('Importando…') : t('Substituir workspace')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <Notice tone="error">
            <p>{error}</p>
            {issues.length > 0 ? (
              <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </Notice>
        ) : null}

        <Field
          id="backup-file"
          label={t('Arquivo de backup (JSON)')}
          required
          hint={t('Até 5 MB. O conteúdo é validado antes de qualquer substituição.')}
        >
          <input
            id="backup-file"
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            disabled={busy}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
        </Field>

        {phase === 'reading' ? (
          <p className="text-xs text-muted-foreground" role="status">{t('Lendo {file}…', { file: fileName ?? '' })}</p>
        ) : fileName ? (
          <p className="text-xs text-muted-foreground">{t('Arquivo selecionado: {file}', { file: fileName })}</p>
        ) : null}

        {summary ? (
          <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-4">
            <p className="text-sm font-medium text-foreground">{t('Resumo do backup')}</p>
            <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <li>{t('{count} indicadores', { count: summary.metrics })}</li>
              <li>{t('{count} observações', { count: summary.observations })}</li>
              <li>{t('{count} feedbacks', { count: summary.feedbacks })}</li>
              <li>{t('{count} decisões', { count: summary.decisions })}</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              {t('Data do backup: {date}', {
                date: summary.exportedAt
                  ? formatDateTime(summary.exportedAt)
                  : t('não informada'),
              })}
            </p>
          </div>
        ) : null}

        <Notice tone="info">
          {t(
            'A importação substituirá os dados atuais deste navegador. Não há mesclagem de backups nesta etapa.',
          )}
        </Notice>

        {hasCurrentData ? (
          <fieldset disabled={busy}>
            <ExportBackupButton
              label={t('Exportar dados atuais antes de importar')}
              onReview={onClose}
              onExported={(message) => setExportNote(message)}
            />
          </fieldset>
        ) : null}

        {exportNote ? <Notice tone="info">{exportNote}</Notice> : null}
      </div>
    </Dialog>
  )
}
