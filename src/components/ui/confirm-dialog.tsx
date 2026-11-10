import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useLanguage } from '@/hooks/use-language'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  details?: string[]
  blocked?: boolean
  pending?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  details,
  blocked = false,
  pending = false,
}: ConfirmDialogProps) {
  const { t } = useLanguage()
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next)
      }}
      title={title}
      description={description}
      footer={
        blocked ? (
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('Fechar')}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {t('Cancelar')}
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={pending}>
              {pending ? t('Excluindo…') : confirmLabel}
            </Button>
          </>
        )
      }
    >
      {details && details.length > 0 ? (
        <ul className="space-y-1.5 rounded-lg border border-border/70 bg-background/40 p-3">
          {details.map((detail) => (
            <li key={detail} className="text-sm leading-relaxed text-muted-foreground">
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </Dialog>
  )
}
