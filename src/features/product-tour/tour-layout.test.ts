import { describe, expect, it } from 'vitest'
import { isUsableBox, placePanel } from '@/features/product-tour/tour-layout'

const viewport = { width: 1000, height: 800 }
const panel = { width: 400, height: 300 }

describe('placePanel', () => {
  it('sem alvo, usa o canto inferior direito', () => {
    expect(placePanel(null, panel, viewport)).toEqual({ top: 484, left: 584 })
  })

  it('desvia de um alvo que o canto padrão cobriria', () => {
    const target = { top: 600, left: 700, width: 200, height: 100 }
    expect(placePanel(target, panel, viewport)).toEqual({ top: 484, left: 16 })
  })

  it('mantém o painel dentro da viewport mesmo em telas pequenas', () => {
    const small = { width: 320, height: 500 }
    const position = placePanel(null, { width: 288, height: 700 }, small)
    expect(position.top).toBeGreaterThanOrEqual(16)
    expect(position.left).toBeGreaterThanOrEqual(16)
  })

  it('com alvo que cobre tudo, escolhe a menor sobreposição sem falhar', () => {
    const everything = { top: 0, left: 0, width: 1000, height: 800 }
    expect(placePanel(everything, panel, viewport)).toEqual({ top: 484, left: 584 })
  })
})

describe('isUsableBox', () => {
  it('rejeita alvos ocultos', () => {
    expect(isUsableBox({ top: 0, left: 0, width: 0, height: 0 })).toBe(false)
    expect(isUsableBox({ top: 0, left: 0, width: 10, height: 10 })).toBe(true)
  })
})
