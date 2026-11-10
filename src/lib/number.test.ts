import { describe, expect, it } from 'vitest'
import {
  formatEditableNumber,
  metricValueError,
  parseLocaleNumber,
} from '@/lib/number'

describe('parseLocaleNumber', () => {
  it.each([
    ['4,5', 4.5],
    ['4.5', 4.5],
    ['0,5', 0.5],
    ['1234', 1234],
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['1.234', 1234],
    ['1,234', 1.234],
    ['1.234.567', 1234567],
    ['-3,5', -3.5],
    ['R$ 1.234,50', 1234.5],
    ['4,5%', 4.5],
    ['2 h', 2],
  ])('interpreta %s como %s', (input, expected) => {
    expect(parseLocaleNumber(input)).toBe(expected)
  })

  it.each(['', '   ', 'abc', '4,5,6', '1..2', 'R$', '--1'])(
    'rejeita entrada inválida %s',
    (input) => {
      expect(parseLocaleNumber(input)).toBeNull()
    },
  )
})

describe('formatEditableNumber', () => {
  it('usa vírgula decimal sem alterar o valor', () => {
    expect(formatEditableNumber(4.5)).toBe('4,5')
    expect(formatEditableNumber(-3.25)).toBe('-3,25')
  })
})

describe('metricValueError', () => {
  it('rejeita percentuais fora do intervalo', () => {
    expect(metricValueError(-1, 'percent')).toBeDefined()
    expect(metricValueError(101, 'percent')).toBeDefined()
    expect(metricValueError(100, 'percent')).toBeUndefined()
  })

  it('rejeita valores não finitos', () => {
    expect(metricValueError(Number.NaN, 'count')).toBeDefined()
    expect(metricValueError(Number.POSITIVE_INFINITY, 'count')).toBeDefined()
  })

  it('rejeita contagens e horas negativas', () => {
    expect(metricValueError(-1, 'count')).toBeDefined()
    expect(metricValueError(-1, 'hours')).toBeDefined()
  })

  it('permite moeda negativa e pontuação decimal', () => {
    expect(metricValueError(-100, 'currency')).toBeUndefined()
    expect(metricValueError(8.5, 'score')).toBeUndefined()
  })

  it('limita valores absurdamente grandes', () => {
    expect(metricValueError(2_000_000_000_000, 'count')).toBeDefined()
  })
})
