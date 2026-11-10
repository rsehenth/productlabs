import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useContext, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { StaleNotice } from '@/components/layout/stale-notice'
import { StorageAlert } from '@/components/layout/storage-alert'
import { useLanguage } from '@/hooks/use-language'
import { WorkspaceContext } from '@/hooks/use-workspace'
import { cn } from '@/lib/utils'

// Sem Dialog.Trigger o Radix não sabe o disparador, e os diálogos são montados já abertos
// (autoFocus interno move o foco antes de qualquer callback): rastreia o último foco fora
// de diálogos. Com o diálogo modal aberto, o foco externo não muda.
let lastOutsideFocus: HTMLElement | null = null
if (typeof document !== 'undefined') {
  document.addEventListener('focusin', (event) => {
    if (event.target instanceof HTMLElement && !event.target.closest('[role="dialog"]')) {
      lastOutsideFocus = event.target
    }
  })
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const { t } = useLanguage()
  const workspace = useContext(WorkspaceContext)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <DialogPrimitive.Content
          data-workspace-dialog
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const opener = lastOutsideFocus
            const usable = opener?.isConnected && !(opener as HTMLButtonElement).disabled
            // Disparador removido (ex.: registro excluído) ou ausente (URL): foca o <main>.
            ;(usable ? opener : document.querySelector<HTMLElement>('main'))?.focus()
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
            <div className="min-w-0 space-y-1 wrap-anywhere">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label={t('Fechar')} className="shrink-0 max-sm:size-11">
                <X aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <StaleNotice />
            {workspace ? <StorageAlert status={workspace.status} /> : null}
            {children}
          </div>
          {footer ? (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 p-4 max-sm:[&>button]:min-h-11">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
