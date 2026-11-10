import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  badge?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-border pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="min-w-0 max-w-full break-words font-display text-4xl leading-[0.95] font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">
            {title}
          </h1>
          {badge}
        </div>
        <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
