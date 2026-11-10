import { useEffect, useState, useSyncExternalStore, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Notice } from '@/components/ui/notice'
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
      title="Importar backup"
      description="Selecione um arquivo JSON exportado pelo Product Decision Lab. A importação substitui todo o workspace deste navegador."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={phase !== 'ready' && phase !== 'failed'}
          >
            {phase === 'importing' ? 'Importando…' : 'Substituir workspace'}
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
          label="Arquivo de backup (JSON)"
          required
          hint="Até 5 MB. O conteúdo é validado antes de qualquer substituição."
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
          <p className="text-xs text-muted-foreground" role="status">Lendo {fileName}…</p>
        ) : fileName ? (
          <p className="text-xs text-muted-foreground">Arquivo selecionado: {fileName}</p>
        ) : null}

        {summary ? (
          <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-4">
            <p className="text-sm font-medium text-foreground">Resumo do backup</p>
            <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <li>{summary.metrics} indicadores</li>
              <li>{summary.observations} observações</li>
              <li>{summary.feedbacks} feedbacks</li>
              <li>{summary.decisions} decisões</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Data do backup:{' '}
              {summary.exportedAt
                ? formatDateTime(summary.exportedAt)
                : 'não informada'}
            </p>
          </div>
        ) : null}

        <Notice tone="info">
          A importação substituirá os dados atuais deste navegador. Não há mesclagem de
          backups nesta etapa.
        </Notice>

        {hasCurrentData ? (
          <fieldset disabled={busy}>
            <ExportBackupButton
              label="Exportar dados atuais antes de importar"
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
