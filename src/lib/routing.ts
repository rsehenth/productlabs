import { useCallback, useEffect, useState } from 'react'

export const ROUTE_IDS = ['overview', 'feedbacks', 'decisions', 'interactive-case'] as const

export type RouteId = (typeof ROUTE_IDS)[number]

export const DEFAULT_ROUTE: RouteId = 'overview'

export type RouteParams = Record<string, string>

export interface RouteLocation {
  route: RouteId
  params: RouteParams
}

export function isRouteId(value: string): value is RouteId {
  return (ROUTE_IDS as readonly string[]).includes(value)
}

export function parseLocation(hash: string): RouteLocation {
  const raw = hash.replace(/^#/, '')
  const [pathPart = '', query = ''] = raw.split('?')
  const candidate = pathPart.replace(/^\/+/, '').replace(/\/+$/, '')

  const params: RouteParams = {}
  new URLSearchParams(query).forEach((value, key) => {
    const trimmed = value.trim()
    if (trimmed) params[key] = trimmed
  })

  return { route: isRouteId(candidate) ? candidate : DEFAULT_ROUTE, params }
}

export function locationHref(route: RouteId, params: RouteParams = {}): string {
  const entries = Object.entries(params).filter(([, value]) => value.trim() !== '')
  const query = new URLSearchParams(entries).toString()
  return `#/${route}${query ? `?${query}` : ''}`
}

export function routeFromHash(hash: string): RouteId {
  return parseLocation(hash).route
}

export function routeHref(route: RouteId): string {
  return locationHref(route)
}

export function useRoute() {
  const [location, setLocation] = useState<RouteLocation>(() =>
    parseLocation(window.location.hash),
  )

  useEffect(() => {
    const syncRoute = () => setLocation(parseLocation(window.location.hash))
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const navigate = useCallback((next: RouteId, params?: RouteParams) => {
    const href = locationHref(next, params)
    if (window.location.hash !== href) window.location.hash = href
  }, [])

  return { route: location.route, params: location.params, navigate }
}
