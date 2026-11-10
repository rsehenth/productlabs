import {
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  MessageSquareQuote,
  type LucideIcon,
} from 'lucide-react'
import type { RouteId } from '@/lib/routing'
import { ROUTE_IDS } from '@/lib/routing'

export interface NavItem {
  id: RouteId
  label: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: Record<RouteId, NavItem> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    description: 'Indicadores e observações',
    icon: LayoutDashboard,
  },
  feedbacks: {
    id: 'feedbacks',
    label: 'Feedbacks',
    description: 'Voz do usuário',
    icon: MessageSquareQuote,
  },
  decisions: {
    id: 'decisions',
    label: 'Decisions',
    description: 'Hipóteses e decisões',
    icon: GitBranch,
  },
  'interactive-case': {
    id: 'interactive-case',
    label: 'Interactive Case',
    description: 'Estudo de caso guiado',
    icon: FlaskConical,
  },
}

export const NAV_LIST: NavItem[] = ROUTE_IDS.map((id) => NAV_ITEMS[id])
