import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useWorkspace } from '@/hooks/use-workspace'
import {
  backupFileName,
  findIncompatibleDecisions,
  serializeBackup,
} from '@/lib/backup'
import { DECISION_STATUS_LABELS } from '@/lib/domain-labels'
import { downloadTextFile } from '@/lib/download'
import { useRoute } from '@/lib/routing'

export const EXPORT_OK_MESSAGE = 'Backup JSON exportado.'
export const EXPORT_LEGACY_MESSAGE =
  'Cópia JSON exportada. Este arquivo contém decisões incompatíveis e ainda não é restaurável pelo fluxo normal. Regularize os registros indicados e gere um novo backup.'

interface ExportBackupButtonProps {
  label: string
  /** compatible=false: o arquivo é só uma cópia dos dados, não um backup restaurável. */
  onExported: (message: string, compatible: boolean) => void
  onReview?: () => void
}

export function ExportBackupButton({ label, onExported, onReview }: ExportBackupButtonProps) {
  const { workspace } = useWorkspace()
  const { navigate } = useRoute()
  const [warning, setWarning] = useState(false)
  // Calculado a cada render a partir do Workspace atual, nunca armazenado.
  const incompatible = findIncompatibleDecisions(workspace)

  function download() {
    downloadTextFile(
      serializeBackup(workspace),
      backupFileName(),
      'application/json;charset=utf-8',
    )
    const compatible = incompatible.length === 0
    onExported(compatible ? EXPORT_OK_MESSAGE : EXPORT_LEGACY_MESSAGE, compatible)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => (incompatible.length > 0 ? setWarning(true) : download())}
      >
        {label}
      </Button>
      {warning ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setWarning(false)
          }}
          title="Atenção: este backup contém decisões que precisam ser regularizadas"
          description="Encontramos decisões que não atendem aos requisitos atuais de seus respectivos status. Você ainda pode baixar uma cópia dos seus dados, mas este arquivo não poderá ser restaurado normalmente nesta versão até que as inconsistências sejam corrigidas."
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setWarning(false)
                  onReview?.()
                  navigate('decisions')
                }}
              >
                Revisar decisões
              </Button>
              <Button
                onClick={() => {
                  setWarning(false)
                  download()
                }}
              >
                Baixar cópia mesmo assim
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {incompatible.length} decisão(ões) incompatível(is)
            </p>
            <ul className="max-h-60 space-y-2 overflow-y-auto">
              {incompatible.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-border/70 bg-background/40 p-3 text-sm text-muted-foreground"
                >
                  <p>
                    <span className="font-medium text-foreground">Decisão:</span> {d.title}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status:</span>{' '}
                    {DECISION_STATUS_LABELS[d.status]}
                  </p>
                  {d.pendencies.map((pendency) => (
                    <p key={pendency}>
                      <span className="font-medium text-foreground">Pendência:</span> {pendency}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      ) : null}
    </>
  )
}
