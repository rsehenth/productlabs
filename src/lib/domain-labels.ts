import type {
  DecisionStatus,
  FeedbackCategory,
  FeedbackSource,
  MetricDirection,
  MetricUnit,
} from '@/types/domain'

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Defeito',
  usability: 'Usabilidade',
  performance: 'Desempenho',
  'feature-request': 'Pedido de funcionalidade',
  pricing: 'Preço',
  other: 'Outro',
}

export const FEEDBACK_SOURCE_LABELS: Record<FeedbackSource, string> = {
  interview: 'Entrevista',
  'support-ticket': 'Ticket de suporte',
  survey: 'Survey',
  'app-review': 'Avaliação do app',
  community: 'Comunidade',
  other: 'Outro',
}

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  draft: 'Rascunho',
  investigating: 'Em investigação',
  decided: 'Decidida',
  validated: 'Validada',
  abandoned: 'Abandonada',
}

export const METRIC_UNIT_LABELS: Record<MetricUnit, string> = {
  percent: 'Percentual',
  count: 'Contagem',
  currency: 'Moeda',
  hours: 'Horas',
  score: 'Pontuação',
}

export const METRIC_DIRECTION_LABELS: Record<MetricDirection, string> = {
  increase: 'Aumentar',
  decrease: 'Diminuir',
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatPeriod(period: string): string {
  const [year, month] = period.split('-')
  const label = month ? MONTHS[Number(month) - 1] : undefined
  return label && year ? `${label}/${year}` : period
}

/** Versão curta usada em eixos de gráfico: apenas o mês. */
export function formatPeriodShort(period: string): string {
  const month = period.slice(5, 7)
  return MONTHS[Number(month) - 1] ?? period
}

const NUMBER = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const SIGNED = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

export function formatMetricValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case 'percent':
      return `${NUMBER.format(value)}%`
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    case 'hours':
      return `${NUMBER.format(value)} h`
    case 'count':
      return NUMBER.format(value)
    case 'score':
      return NUMBER.format(value)
  }
}

/** Variação absoluta: pontos percentuais para taxas, unidade do indicador nos demais casos. */
export function formatAbsoluteVariation(delta: number, unit: MetricUnit): string {
  if (unit === 'percent') {
    return `${SIGNED.format(delta)} p.p.`
  }
  const formatted = formatMetricValue(delta, unit)
  return delta > 0 ? `+${formatted}` : formatted
}

export function formatRelativeVariation(value: number | null): string {
  if (value === null) return 'Variação relativa indisponível.'
  return `${SIGNED.format(value)}%`
}
