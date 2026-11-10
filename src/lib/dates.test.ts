import { describe, expect, it } from 'vitest'
import {
  dateInputToIso,
  formatDate,
  formatPeriodLong,
  isValidIsoMonth,
  isoToDateInput,
} from '@/lib/dates'

describe('conversão de datas', () => {
  it('converte data de formulário sem deslocar o dia', () => {
    expect(dateInputToIso('2026-10-10')).toBe('2026-10-10T12:00:00.000Z')
    expect(isoToDateInput('2026-10-10T12:00:00.000Z')).toBe('2026-10-10')
    expect(formatDate('2026-10-10T12:00:00.000Z')).toBe('10/10/2026')
  })

  it('rejeita datas impossíveis ou em formato errado', () => {
    expect(dateInputToIso('2026-02-30')).toBeNull()
    expect(dateInputToIso('2026-13-01')).toBeNull()
    expect(dateInputToIso('10/10/2026')).toBeNull()
    expect(dateInputToIso('')).toBeNull()
  })

  it('formata períodos mensais em português', () => {
    expect(formatPeriodLong('2026-10')).toBe('outubro de 2026')
    expect(formatPeriodLong('2026-01')).toBe('janeiro de 2026')
    expect(formatPeriodLong('inválido')).toBe('inválido')
  })

  it('valida o formato AAAA-MM', () => {
    expect(isValidIsoMonth('2026-10')).toBe(true)
    expect(isValidIsoMonth('2026-13')).toBe(false)
    expect(isValidIsoMonth('2026-1')).toBe(false)
  })
})
