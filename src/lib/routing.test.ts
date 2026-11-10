import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ROUTE,
  isRouteId,
  locationHref,
  parseLocation,
  routeFromHash,
  routeHref,
} from '@/lib/routing'

describe('parseLocation', () => {
  it('lê rota padrão quando o hash está vazio', () => {
    expect(parseLocation('')).toEqual({ route: DEFAULT_ROUTE, params: {} })
  })

  it('lê rota e parâmetros de consulta', () => {
    expect(parseLocation('#/overview?metric=metric-1')).toEqual({
      route: 'overview',
      params: { metric: 'metric-1' },
    })
    expect(parseLocation('#/decisions?record=decision-1')).toEqual({
      route: 'decisions',
      params: { record: 'decision-1' },
    })
  })

  it('aceita barra final e hash sem barra', () => {
    expect(parseLocation('#feedbacks/').route).toBe('feedbacks')
    expect(parseLocation('#/interactive-case').route).toBe('interactive-case')
  })

  it('cai na rota padrão para rota desconhecida', () => {
    expect(parseLocation('#/unknown?x=1')).toEqual({
      route: DEFAULT_ROUTE,
      params: { x: '1' },
    })
  })

  it('ignora parâmetros vazios', () => {
    expect(parseLocation('#/overview?metric=&other=2').params).toEqual({ other: '2' })
  })
})

describe('locationHref', () => {
  it('monta hash compatível com a navegação existente', () => {
    expect(locationHref('overview')).toBe('#/overview')
    expect(locationHref('decisions', { record: 'decision-1' })).toBe(
      '#/decisions?record=decision-1',
    )
  })

  it('escapa parâmetros', () => {
    expect(locationHref('overview', { metric: 'a b' })).toBe('#/overview?metric=a+b')
  })

  it('routeHref permanece compatível', () => {
    expect(routeHref('feedbacks')).toBe('#/feedbacks')
  })
})

describe('routeFromHash / isRouteId', () => {
  it('extrai a rota ignorando consulta', () => {
    expect(routeFromHash('#/overview?metric=x')).toBe('overview')
    expect(routeFromHash('#/decisions?record=y')).toBe('decisions')
  })

  it('valida identificadores de rota', () => {
    expect(isRouteId('overview')).toBe(true)
    expect(isRouteId('unknown')).toBe(false)
  })
})
