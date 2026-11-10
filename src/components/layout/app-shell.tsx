import { lazy, Suspense, useRef, useState, type ReactNode } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { NAV_ITEMS } from '@/components/layout/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { WorkspaceBanners } from '@/components/layout/workspace-banners'
import { useLanguage } from '@/hooks/use-language'
import type { RouteId } from '@/lib/routing'

const ProductTour = lazy(() =>
  import('@/features/product-tour/product-tour').then((module) => ({ default: module.ProductTour })),
)

interface AppShellProps {
  route: RouteId
  children: ReactNode
}

export function AppShell({ route, children }: AppShellProps) {
  const { t } = useLanguage()
  const [navOpen, setNavOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const tourButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar route={route} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          title={NAV_ITEMS[route].label}
          onOpenNav={() => setNavOpen(true)}
          menuButtonRef={menuButtonRef}
          onStartTour={() => setTourOpen(true)}
          tourButtonRef={tourButtonRef}
        />
        <main tabIndex={-1} className="flex-1 outline-none px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-6xl space-y-10">
            <WorkspaceBanners />
            {children}
          </div>
        </main>
        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-10">
          <p className="mx-auto w-full max-w-6xl">
            {t('Product Decision Lab · workspace local, sem backend ou integrações externas')}
          </p>
        </footer>
      </div>
      <MobileNav
        open={navOpen}
        onOpenChange={setNavOpen}
        route={route}
        returnFocusRef={menuButtonRef}
      />
      {tourOpen ? (
        <Suspense fallback={null}>
          <ProductTour onClose={() => setTourOpen(false)} returnFocusRef={tourButtonRef} />
        </Suspense>
      ) : null}
    </div>
  )
}
