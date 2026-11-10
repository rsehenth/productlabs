import { getLanguage, locale } from '@/lib/i18n'

export const ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const MONTHS_LONG_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const MONTHS_LONG_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function monthsLong(): string[] {
  return getLanguage() === 'pt' ? MONTHS_LONG_PT : MONTHS_LONG_EN
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function isValidIsoMonth(value: string): boolean {
  return ISO_MONTH_PATTERN.test(value)
}

/** Converte `YYYY-MM-DD` em ISO com horário fixo ao meio-dia UTC, sem deslocar o dia. */
export function dateInputToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date.toISOString()
}

export function isoToDateInput(value: string): string {
  return value.slice(0, 10)
}

export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  return getLanguage() === 'pt'
    ? `${match[3]}/${match[2]}/${match[1]}`
    : `${match[2]}/${match[3]}/${match[1]}`
}

export function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatPeriodLong(period: string): string {
  if (!isValidIsoMonth(period)) return period
  const year = period.slice(0, 4)
  const month = Number(period.slice(5, 7))
  const label = monthsLong()[month - 1] ?? period
  return getLanguage() === 'pt' ? `${label} de ${year}` : `${label} ${year}`
}

export function formatDateLong(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const month = Number(match[2])
  const label = monthsLong()[month - 1] ?? ''
  return getLanguage() === 'pt'
    ? `${Number(match[3])} de ${label} de ${match[1]}`
    : `${label} ${Number(match[3])}, ${match[1]}`
}
