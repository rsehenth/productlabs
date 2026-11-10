import { useContext, type Ref } from 'react'
import { CircleHelp, HardDrive, Menu } from 'lucide-react'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { BrandMark } from '@/components/layout/brand-mark'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import { WorkspaceContext } from '@/hooks/use-workspace'
import { locale, t as translate } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  title: string
  onOpenNav: () => void
  /** Botão do menu móvel: recebe o foco de volta quando a gaveta fecha. */
  menuButtonRef?: Ref<HTMLButtonElement>
  onStartTour: () => void
  /** Botão "Como funciona": recebe o foco de volta quando o tour termina. */
  tourButtonRef?: Ref<HTMLButtonElement>
}

function savedLabel(savedAt: string | null): string {
  const date = savedAt ? new Date(savedAt) : null
  if (!date || Number.isNaN(date.getTime())) return translate('Salvo neste navegador')
  return translate('Salvo às {time}', {
    time: date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }),
  })
}

type StorageTone = 'ok' | 'warn' | 'error'

function storageIndicator(
  workspace: React.ContextType<typeof WorkspaceContext>,
): { label: string; tone: StorageTone } {
  if (!workspace) return { label: translate('Armazenamento local'), tone: 'ok' }
  if (workspace.stale) return { label: translate('Dados desatualizados'), tone: 'warn' }
  switch (workspace.status) {
    case 'ok':
      return { label: savedLabel(workspace.savedAt), tone: 'ok' }
    case 'empty':
      return { label: translate('Workspace vazio'), tone: 'ok' }
    case 'unavailable':
      return { label: translate('Sem armazenamento'), tone: 'warn' }
    default:
      return { label: translate('Dados bloqueados'), tone: 'error' }
  }
}

const TONE_CLASS: Record<StorageTone, string> = {
  ok: 'text-muted-foreground',
  warn: 'text-simulated',
  error: 'text-destructive',
}

export function AppHeader({ title, onOpenNav, menuButtonRef, onStartTour, tourButtonRef }: AppHeaderProps) {
  const { t } = useLanguage()
  const { label, tone } = storageIndicator(useContext(WorkspaceContext))

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <Button
        ref={menuButtonRef}
        variant="ghost"
        size="icon"
        className="-ml-2 size-11 md:hidden"
        onClick={onOpenNav}
        aria-label={t('Abrir navegação')}
      >
        <Menu aria-hidden="true" />
      </Button>
      <BrandMark className="hidden size-7 sm:block md:hidden" />

      <p className="flex min-w-0 items-center gap-2 text-sm">
        <span className="hidden text-muted-foreground sm:inline">Product Decision Lab</span>
        <span className="hidden text-border sm:inline" aria-hidden="true">
          /
        </span>
        <span className="truncate font-medium text-foreground">{title}</span>
      </p>

      <p
        className={cn(
          'ml-auto flex shrink-0 items-center gap-1.5 font-mono text-xs',
          TONE_CLASS[tone],
        )}
      >
        <HardDrive className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </p>

      <LanguageToggle />

      <Button
        ref={tourButtonRef}
        variant="outline"
        size="sm"
        className="h-11 shrink-0 px-3 sm:h-9"
        onClick={onStartTour}
        aria-haspopup="dialog"
      >
        <CircleHelp aria-hidden="true" />
        {t('Como funciona')}
      </Button>
    </header>
  )
}
