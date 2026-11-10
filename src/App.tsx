import { lazy, Suspense, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { useLanguage } from '@/hooks/use-language'
import { useRoute, type RouteId } from '@/lib/routing'

const DecisionsPage = lazy(() =>
  import('@/features/decisions/decisions-page').then((module) => ({ default: module.DecisionsPage })),
)
const FeedbacksPage = lazy(() =>
  import('@/features/feedbacks/feedbacks-page').then((module) => ({ default: module.FeedbacksPage })),
)
const InteractiveCasePage = lazy(() =>
  import('@/features/interactive-case/interactive-case-page').then((module) => ({ default: module.InteractiveCasePage })),
)
const OverviewPage = lazy(() =>
  import('@/features/overview/overview-page').then((module) => ({ default: module.OverviewPage })),
)

function RouteView({ route }: { route: RouteId }) {
  switch (route) {
    case 'feedbacks':
      return <FeedbacksPage />
    case 'decisions':
      return <DecisionsPage />
    case 'interactive-case':
      return <InteractiveCasePage />
    case 'overview':
      return <OverviewPage />
  }
}

export default function App() {
  const { t } = useLanguage()
  const { route } = useRoute()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  return (
    <AppShell route={route}>
      <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">{t('Carregando página…')}</p>}>
        <RouteView route={route} />
      </Suspense>
    </AppShell>
  )
}
