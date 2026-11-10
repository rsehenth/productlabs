import type { MetricUnit } from '@/types/domain'
import { getLanguage, t } from '@/lib/i18n'

export const MAX_ABSOLUTE_VALUE = 1_000_000_000_000

/**
 * Aceita entrada brasileira e internacional sem confundir `4,5` com `45`.
 * Quando há vírgula e ponto, o último separador é o decimal.
 */
export function parseLocaleNumber(raw: string): number | null {
  let text = raw.trim().replace(/\s+/g, '')
  if (!text) return null
  text = text.replace(/^R\$/i, '').replace(/%$/, '').replace(/h$/i, '')
  if (!/^[+-]?[\d.,]+$/.test(text)) return null

  const negative = text.startsWith('-')
  const body = text.replace(/^[+-]/, '')
  if (/[,.]{2}/.test(body)) return null
  const hasComma = body.includes(',')
  const hasDot = body.includes('.')

  let normalized: string
  if (hasComma && hasDot) {
    normalized =
      body.lastIndexOf(',') > body.lastIndexOf('.')
        ? body.replace(/\./g, '').replace(',', '.')
        : body.replace(/,/g, '')
  } else if (hasComma) {
    const parts = body.split(',')
    if (parts.length > 2) return null
    const decimal = parts.pop() ?? ''
    normalized = `${parts.join('')}.${decimal}`
  } else if (hasDot) {
    const parts = body.split('.')
    if (parts.length === 2) {
      const integer = parts[0] ?? ''
      const decimal = parts[1] ?? ''
      const looksLikeThousands = decimal.length === 3 && integer.length > 0 && integer !== '0'
      normalized = looksLikeThousands ? `${integer}${decimal}` : `${integer}.${decimal}`
    } else {
      const last = parts.pop() ?? ''
      const rest = parts.join('')
      normalized = last.length === 3 ? `${rest}${last}` : `${rest}.${last}`
    }
  } else {
    normalized = body
  }

  if (normalized.startsWith('.')) normalized = `0${normalized}`
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null

  const value = Number(`${negative ? '-' : ''}${normalized}`)
  return Number.isFinite(value) ? value : null
}

export function formatEditableNumber(value: number): string {
  return getLanguage() === 'pt' ? String(value).replace('.', ',') : String(value)
}

export function metricValueError(value: number, unit: MetricUnit): string | undefined {
  if (!Number.isFinite(value)) return t('Informe um número válido.')
  if (Math.abs(value) > MAX_ABSOLUTE_VALUE) return t('Valor fora do intervalo suportado.')
  switch (unit) {
    case 'percent':
      if (value < 0 || value > 100) return t('Percentuais devem ficar entre 0 e 100.')
      return undefined
    case 'count':
      if (value < 0) return t('Contagens não podem ser negativas.')
      return undefined
    case 'hours':
      if (value < 0) return t('Horas não podem ser negativas.')
      return undefined
    case 'currency':
      return undefined
    case 'score':
      return undefined
  }
}
