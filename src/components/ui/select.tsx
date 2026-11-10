import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'h-9 w-full rounded-lg border border-field bg-background/60 px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
