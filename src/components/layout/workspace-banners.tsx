import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Notice } from '@/components/ui/notice'
import { StaleNotice } from '@/components/layout/stale-notice'
import { StorageAlert } from '@/components/layout/storage-alert'
import { useWorkspace } from '@/hooks/use-workspace'
import { downloadTextFile } from '@/lib/download'

export function WorkspaceBanners() {
  const { status, saveError, clearSaveError, readRaw, discardStoredData } = useWorkspace()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const blocked = status === 'invalid' || status === 'unsupported-version'

  function exportRaw() {
    const raw = readRaw()
    if (!raw) {
      setActionError('Não há conteúdo bruto disponível para exportar.')
      return
    }
    downloadTextFile(
      raw,
      `product-decision-lab-raw-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8',
    )
  }

  async function handleDiscard() {
    const result = await discardStoredData()
    if (!result.ok) {
      if (!result.conflict) setActionError(result.error)
      return
    }
    setConfirmDiscard(false)
    setActionError(null)
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <Notice tone="error" onDismiss={() => setActionError(null)}>
          {actionError}
        </Notice>
      ) : null}

      <div data-workspace-page-notice className="empty:hidden">
        <StaleNotice />
      </div>

      <StorageAlert status={status}>
        {blocked ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={exportRaw}>
              Exportar conteúdo bruto
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDiscard(true)}
            >
              Descartar dados e iniciar vazio
            </Button>
          </div>
        ) : null}
      </StorageAlert>

      {saveError ? (
        <Notice tone="error" onDismiss={clearSaveError}>
          {saveError}
        </Notice>
      ) : null}

      {confirmDiscard ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmDiscard(false)
          }}
          title="Descartar dados locais inválidos"
          description="Isto remove o envelope salvo neste navegador. Exporte o conteúdo bruto antes se quiser analisá-lo. A ação não pode ser desfeita."
          confirmLabel="Descartar dados"
          onConfirm={handleDiscard}
        />
      ) : null}
    </div>
  )
}
