export interface Box {
  top: number
  left: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

const GAP = 12

function overlapArea(a: Box, b: Box): number {
  const x = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left)
  const y = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top)
  return x > 0 && y > 0 ? x * y : 0
}

/**
 * Posição fixa do painel dentro da viewport. Tenta quatro cantos, do mais usual ao menos,
 * e fica com o primeiro que não cobre o alvo; se todos cobrem, o de menor sobreposição.
 */
export function placePanel(target: Box | null, panel: Size, viewport: Size, margin = 16): { top: number; left: number } {
  const maxLeft = Math.max(margin, viewport.width - panel.width - margin)
  const maxTop = Math.max(margin, viewport.height - panel.height - margin)
  const candidates = [
    { top: maxTop, left: maxLeft },
    { top: maxTop, left: margin },
    { top: margin, left: maxLeft },
    { top: margin, left: margin },
  ]
  if (!target) return candidates[0]!

  const padded: Box = {
    top: target.top - GAP,
    left: target.left - GAP,
    width: target.width + GAP * 2,
    height: target.height + GAP * 2,
  }
  let best = candidates[0]!
  let bestOverlap = Infinity
  for (const candidate of candidates) {
    const overlap = overlapArea({ ...candidate, ...panel }, padded)
    if (overlap === 0) return candidate
    if (overlap < bestOverlap) {
      best = candidate
      bestOverlap = overlap
    }
  }
  return best
}

/** Alvo oculto (display:none, largura zero) não deve ser destacado. */
export function isUsableBox(box: Box): boolean {
  return box.width > 0 && box.height > 0
}
