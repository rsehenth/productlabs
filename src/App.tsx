import { useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { DecisionsPage } from '@/features/decisions/decisions-page'
import { FeedbacksPage } from '@/features/feedbacks/feedbacks-page'
import { InteractiveCasePage } from '@/features/interactive-case/interactive-case-page'
import { OverviewPage } from '@/features/overview/overview-page'
import { useRoute, type RouteId } from '@/lib/routing'

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
  const { route } = useRoute()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  return (
    <AppShell route={route}>
      <RouteView route={route} />
    </AppShell>
  )
}
