import type {
  DecisionStatus,
  FeedbackCategory,
  FeedbackSource,
  MetricDirection,
  MetricUnit,
} from '@/types/domain'
import { getLanguage, localizedRecord, locale, t } from '@/lib/i18n'

export const FEEDBACK_CATEGORY_LABELS = localizedRecord<FeedbackCategory>(
  {
    bug: 'Defeito',
    usability: 'Usabilidade',
    performance: 'Desempenho',
    'feature-request': 'Pedido de funcionalidade',
    pricing: 'Preço',
    other: 'Outro',
  },
  {
    bug: 'Bug',
    usability: 'Usability',
    performance: 'Performance',
    'feature-request': 'Feature request',
    pricing: 'Pricing',
    other: 'Other',
  },
)

export const FEEDBACK_SOURCE_LABELS = localizedRecord<FeedbackSource>(
  {
    interview: 'Entrevista',
    'support-ticket': 'Ticket de suporte',
    survey: 'Survey',
    'app-review': 'Avaliação do app',
    community: 'Comunidade',
    other: 'Outro',
  },
  {
    interview: 'Interview',
    'support-ticket': 'Support ticket',
    survey: 'Survey',
    'app-review': 'App review',
    community: 'Community',
    other: 'Other',
  },
)

export const DECISION_STATUS_LABELS = localizedRecord<DecisionStatus>(
  {
    draft: 'Rascunho',
    investigating: 'Em investigação',
    decided: 'Decidida',
    validated: 'Validada',
    abandoned: 'Abandonada',
  },
  {
    draft: 'Draft',
    investigating: 'Investigating',
    decided: 'Decided',
    validated: 'Validated',
    abandoned: 'Abandoned',
  },
)

export const METRIC_UNIT_LABELS = localizedRecord<MetricUnit>(
  {
    percent: 'Percentual',
    count: 'Contagem',
    currency: 'Moeda',
    hours: 'Horas',
    score: 'Pontuação',
  },
  {
    percent: 'Percentage',
    count: 'Count',
    currency: 'Currency',
    hours: 'Hours',
    score: 'Score',
  },
)

export const METRIC_DIRECTION_LABELS = localizedRecord<MetricDirection>(
  { increase: 'Aumentar', decrease: 'Diminuir' },
  { increase: 'Increase', decrease: 'Decrease' },
)

const MONTHS_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function months(): string[] {
  return getLanguage() === 'pt' ? MONTHS_PT : MONTHS_EN
}

export function formatPeriod(period: string): string {
  const [year, month] = period.split('-')
  const label = month ? months()[Number(month) - 1] : undefined
  return label && year ? `${label}/${year}` : period
}

/** Versão curta usada em eixos de gráfico: apenas o mês. */
export function formatPeriodShort(period: string): string {
  const month = period.slice(5, 7)
  return months()[Number(month) - 1] ?? period
}

function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  return new Intl.NumberFormat(locale(), options)
}

export function formatMetricValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case 'percent':
      return `${numberFormat({ maximumFractionDigits: 2 }).format(value)}%`
    case 'currency':
      return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'BRL' }).format(value)
    case 'hours':
      return `${numberFormat({ maximumFractionDigits: 2 }).format(value)} h`
    case 'count':
      return numberFormat({ maximumFractionDigits: 2 }).format(value)
    case 'score':
      return numberFormat({ maximumFractionDigits: 2 }).format(value)
  }
}

/** Variação absoluta: pontos percentuais para taxas, unidade do indicador nos demais casos. */
export function formatAbsoluteVariation(delta: number, unit: MetricUnit): string {
  const signed = numberFormat({ maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format
  if (unit === 'percent') {
    return `${signed(delta)} ${t('p.p.')}`
  }
  const formatted = formatMetricValue(delta, unit)
  return delta > 0 ? `+${formatted}` : formatted
}

export function formatRelativeVariation(value: number | null): string {
  if (value === null) return t('Variação relativa indisponível.')
  return `${numberFormat({ maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(value)}%`
}
