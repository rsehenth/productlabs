import { CircleCheck, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type NoticeTone = 'success' | 'error' | 'info' | 'warning'

interface NoticeProps {
  tone: NoticeTone
  children: ReactNode
  onDismiss?: () => void
  tabIndex?: -1
}

const TONES = {
  success: {
    icon: CircleCheck,
    className: 'border-success/30 bg-success/10 text-success',
  },
  error: {
    icon: CircleAlert,
    className: 'border-destructive/30 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive',
  },
  info: {
    icon: Info,
    className: 'border-border bg-muted text-foreground [&_svg]:text-primary',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-field bg-muted text-foreground',
  },
} as const

export function Notice({ tone, children, onDismiss, tabIndex }: NoticeProps) {
  const { icon: Icon, className } = TONES[tone]
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      tabIndex={tabIndex}
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1 text-sm leading-relaxed">{children}</div>
      {onDismiss ? (
        <Button variant="ghost" size="icon" aria-label="Dispensar aviso" onClick={onDismiss}>
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
