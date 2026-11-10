import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { RefObject } from 'react'
import { SidebarBrand, SidebarFooter, SidebarNav } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import type { RouteId } from '@/lib/routing'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: RouteId
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function MobileNav({ open, onOpenChange, route, returnFocusRef }: MobileNavProps) {
  const { t } = useLanguage()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            // Sem Dialog.Trigger, o Radix não sabe para onde devolver o foco.
            event.preventDefault()
            returnFocusRef?.current?.focus()
          }}
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
          <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-4">
            <Dialog.Title className="sr-only">{t('Navegação principal')}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {t('Alterne entre as áreas do Product Decision Lab.')}
            </Dialog.Description>
            <SidebarBrand />
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label={t('Fechar navegação')}>
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarNav route={route} onNavigate={() => onOpenChange(false)} />
          </div>
          <div className="p-3">
            <SidebarFooter />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
