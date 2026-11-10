import { cn } from '@/lib/utils'

/** Três evidências convergindo em uma decisão: a ideia do produto em um glifo. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
      <g
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M8.5 9.5h4.5c2.2 0 3 1.5 4 3.2M8.5 22.5h4.5c2.2 0 3-1.5 4-3.2M8.5 16h8" />
      </g>
      <rect x="18.5" y="13" width="5.5" height="6" rx="1.4" fill="var(--color-primary-foreground)" />
    </svg>
  )
}
