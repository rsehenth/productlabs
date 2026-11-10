import { useContext } from 'react'
import { HardDrive } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { NAV_LIST } from '@/components/layout/navigation'
import { WorkspaceContext } from '@/hooks/use-workspace'
import { cn } from '@/lib/utils'
import { routeHref, type RouteId } from '@/lib/routing'

interface SidebarNavProps {
  route: RouteId
  onNavigate?: () => void
  /** Trilho de ícones abaixo de `lg`: os rótulos continuam no nome acessível. */
  collapsible?: boolean
}

/**
 * Navegação em forma de pipeline: a linha liga as quatro áreas na ordem em que o trabalho
 * costuma andar (indicadores, feedbacks, decisões, caso) e fica acesa até a página atual.
 */
export function SidebarNav({ route, onNavigate, collapsible = false }: SidebarNavProps) {
  const activeIndex = NAV_LIST.findIndex((item) => item.id === route)

  return (
    <nav aria-label="Navegação principal">
      <ul className="flex flex-col">
        {NAV_LIST.map((item, index) => {
          const active = index === activeIndex
          const reached = index < activeIndex
          const last = index === NAV_LIST.length - 1
          return (
            <li key={item.id} className="relative">
              {last ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    // Do fim deste nó (centro + 16px) ao começo do próximo; as linhas têm 56px.
                    'absolute top-[calc(50%+16px)] h-[calc(100%-32px)] w-px',
                    collapsible ? 'left-1/2 lg:left-6' : 'left-6',
                    reached ? 'bg-primary/60' : 'bg-sidebar-border',
                  )}
                />
              )}
              <a
                href={routeHref(item.id)}
                onClick={onNavigate}
                title={collapsible ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex h-14 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-sidebar-accent',
                  collapsible && 'max-lg:justify-center max-lg:px-0',
                )}
              >
                <span
                  className={cn(
                    'relative grid size-8 shrink-0 place-items-center rounded-full border transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : reached
                        ? 'border-primary/50 bg-sidebar text-primary'
                        : 'border-sidebar-border bg-sidebar text-muted-foreground group-hover:border-muted-foreground group-hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <span className={cn('flex min-w-0 flex-col', collapsible && 'max-lg:sr-only')}>
                  <span
                    className={cn(
                      'text-sm leading-5',
                      active
                        ? 'font-semibold text-foreground'
                        : 'font-medium text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="truncate text-xs leading-4 text-muted-foreground/80">
                    {item.description}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function SidebarBrand({ collapsible = false }: { collapsible?: boolean }) {
  return (
    <a
      href={routeHref('overview')}
      className="flex items-center gap-3 rounded-lg"
      aria-label="Product Decision Lab — ir para o Overview"
    >
      <BrandMark />
      <span className={cn('flex flex-col leading-none', collapsible && 'max-lg:hidden')}>
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          Decision Lab
        </span>
        <span className="mt-1.5 text-[11px] text-muted-foreground">Evidência → decisão</span>
      </span>
    </a>
  )
}

/** Leitura do workspace com os números reais; sem provider, mostra traços. */
export function SidebarFooter() {
  const workspace = useContext(WorkspaceContext)?.workspace
  const counts = [
    { label: 'Métricas', value: workspace?.metrics.length },
    { label: 'Feedbacks', value: workspace?.feedbacks.length },
    { label: 'Decisões', value: workspace?.decisions.length },
  ]

  return (
    <div className="rounded-lg border border-sidebar-border">
      <dl className="grid grid-cols-3 divide-x divide-sidebar-border">
        {counts.map(({ label, value }) => (
          <div key={label} className="px-3 py-2.5">
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-mono text-lg leading-none text-foreground tabular-nums">
              {value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
      <p className="flex items-start gap-2 border-t border-sidebar-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <HardDrive className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Workspace local: os registros ficam só neste navegador.
      </p>
    </div>
  )
}

export function Sidebar({ route }: { route: RouteId }) {
  return (
    <aside className="sticky top-0 hidden h-svh w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex lg:w-64">
      <div className="flex h-16 items-center px-4 max-lg:justify-center max-lg:px-0">
        <SidebarBrand collapsible />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pt-4 max-lg:px-2">
        <SidebarNav route={route} collapsible />
      </div>
      <div className="p-3 max-lg:hidden">
        <SidebarFooter />
      </div>
    </aside>
  )
}
