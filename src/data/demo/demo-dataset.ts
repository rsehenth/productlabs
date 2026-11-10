/**
 * Dataset demonstrativo — 100% fictício.
 *
 * Produto imaginário: "Ledgerly", um app de contabilidade para escritórios
 * pequenos. Nenhum número, feedback ou decisão aqui representa histórico real
 * do ProfResolve ou de qualquer produto existente: os dados existem apenas para
 * exercitar os modelos nesta etapa.
 *
 * Este arquivo nunca é gravado no LocalStorage; o workspace do usuário começa
 * vazio e é mantido separado.
 */
import type {
  DecisionRecord,
  MetricObservation,
  ProductMetric,
  UserFeedback,
} from '@/types/domain'
import type { WorkspaceState } from '@/types/workspace'
import { formatMetricValue } from '@/lib/domain-labels'

export const DEMO_PRODUCT_NAME = 'Ledgerly (fictício)'

export const DEMO_DATASET_NOTICE =
  'Dataset simulado, criado para exercitar os modelos nesta etapa. Não representa dados reais do ProfResolve nem de qualquer produto.'

export const DEMO_METRICS: ProductMetric[] = [
  {
    id: 'demo-metric-activation',
    name: 'Ativação no primeiro dia',
    description: 'Contas novas que concluem a primeira ação de valor nas primeiras 24 horas.',
    unit: 'percent',
    desiredDirection: 'increase',
    createdAt: '2026-05-04T12:00:00.000Z',
    simulated: true,
  },
  {
    id: 'demo-metric-time-to-value',
    name: 'Tempo até o primeiro valor',
    description: 'Tempo médio, em horas, entre o cadastro e a primeira conciliação concluída.',
    unit: 'hours',
    desiredDirection: 'decrease',
    createdAt: '2026-05-04T12:00:00.000Z',
    simulated: true,
  },
  {
    id: 'demo-metric-onboarding-tickets',
    name: 'Tickets de onboarding por 100 contas',
    description: 'Tickets abertos durante a configuração inicial, normalizados por 100 contas novas.',
    unit: 'count',
    desiredDirection: 'decrease',
    createdAt: '2026-05-04T12:00:00.000Z',
    simulated: true,
  },
  {
    id: 'demo-metric-retention-w4',
    name: 'Retenção na quarta semana',
    description: 'Contas novas que permanecem ativas na quarta semana após o cadastro.',
    unit: 'percent',
    desiredDirection: 'increase',
    createdAt: '2026-05-04T12:00:00.000Z',
    simulated: true,
  },
]

interface DemoSeries {
  metricId: string
  points: [period: string, value: number][]
}

const SERIES: DemoSeries[] = [
  {
    metricId: 'demo-metric-activation',
    points: [
      ['2026-05', 64],
      ['2026-06', 61],
      ['2026-07', 59],
      ['2026-08', 56],
      ['2026-09', 52],
      ['2026-10', 49],
    ],
  },
  {
    metricId: 'demo-metric-time-to-value',
    points: [
      ['2026-05', 2.8],
      ['2026-06', 3.1],
      ['2026-07', 3.4],
      ['2026-08', 3.9],
      ['2026-09', 4.4],
      ['2026-10', 4.8],
    ],
  },
  {
    metricId: 'demo-metric-onboarding-tickets',
    points: [
      ['2026-05', 6.1],
      ['2026-06', 6.4],
      ['2026-07', 7.2],
      ['2026-08', 8.5],
      ['2026-09', 9.9],
      ['2026-10', 11.2],
    ],
  },
  {
    metricId: 'demo-metric-retention-w4',
    points: [
      ['2026-05', 43],
      ['2026-06', 42],
      ['2026-07', 41],
      ['2026-08', 39],
      ['2026-09', 38],
      ['2026-10', 36],
    ],
  },
]

export const DEMO_OBSERVATIONS: MetricObservation[] = SERIES.flatMap((series) =>
  series.points.map(([period, value]) => ({
    id: `demo-obs-${series.metricId}-${period}`,
    metricId: series.metricId,
    period,
    value,
    createdAt: '2026-11-02T09:00:00.000Z',
    simulated: true,
  })),
)

export const DEMO_FEEDBACKS: UserFeedback[] = [
  {
    id: 'demo-feedback-import-manual',
    content:
      'Levei três dias para importar o plano de contas do meu cliente. Tive que lançar tudo à mão porque o importador não reconheceu o arquivo do meu sistema antigo.',
    category: 'usability',
    source: 'interview',
    receivedAt: '2026-09-18T14:00:00.000Z',
    metricIds: ['demo-metric-time-to-value', 'demo-metric-activation'],
    simulated: true,
  },
  {
    id: 'demo-feedback-wizard-crash',
    content:
      'O assistente de configuração travou na etapa 3 e perdi o que já tinha preenchido. Abri um ticket e até hoje não consegui concluir a configuração.',
    category: 'bug',
    source: 'support-ticket',
    receivedAt: '2026-09-29T10:30:00.000Z',
    metricIds: ['demo-metric-onboarding-tickets', 'demo-metric-activation'],
    simulated: true,
  },
  {
    id: 'demo-feedback-invite-team',
    content:
      'Não encontrei onde convidar o restante do meu time. Terminei a configuração sozinha e usei a conta apenas uma vez naquela semana.',
    category: 'usability',
    source: 'survey',
    receivedAt: '2026-10-02T17:15:00.000Z',
    metricIds: ['demo-metric-activation', 'demo-metric-retention-w4'],
    simulated: true,
  },
  {
    id: 'demo-feedback-first-sync',
    content:
      'A primeira sincronização demora mais de dez minutos e não mostra progresso. Fico sem saber se travou, então abro um ticket para confirmar.',
    category: 'performance',
    source: 'app-review',
    receivedAt: '2026-10-09T08:45:00.000Z',
    metricIds: ['demo-metric-time-to-value', 'demo-metric-onboarding-tickets'],
    simulated: true,
  },
  {
    id: 'demo-feedback-templates',
    content:
      'Precisamos de um modelo pronto por segmento. Hoje cada cliente novo exige a mesma configuração manual, o que atrasa a entrega do escritório.',
    category: 'feature-request',
    source: 'community',
    receivedAt: '2026-10-15T13:20:00.000Z',
    metricIds: ['demo-metric-activation'],
    simulated: true,
  },
]

export const DEMO_DECISIONS: DecisionRecord[] = [
  {
    id: 'demo-decision-onboarding-templates',
    title: 'Templates de configuração por segmento',
    problem:
      'A ativação no primeiro dia caiu de 64% em maio para 49% em outubro, enquanto o tempo até o primeiro valor subiu de 2,8 h para 4,8 h e os tickets de onboarding por 100 contas passaram de 6,1 para 11,2.',
    hypothesis:
      'Se oferecermos templates de configuração por segmento no início do onboarding, então a ativação no primeiro dia volta a 58% ou mais e o tempo até o primeiro valor cai para 3,5 h ou menos em dois ciclos de medição.',
    metricIds: [
      'demo-metric-activation',
      'demo-metric-time-to-value',
      'demo-metric-onboarding-tickets',
    ],
    feedbackIds: [
      'demo-feedback-templates',
      'demo-feedback-import-manual',
      'demo-feedback-wizard-crash',
    ],
    alternatives: [
      'Manter o fluxo atual e reforçar o suporte durante o onboarding.',
      'Corrigir apenas o travamento da etapa 3 do assistente.',
      'Criar templates por segmento e permitir ajustes depois da primeira configuração.',
    ],
    decision:
      'Investigar a hipótese com um template piloto para dois segmentos, comparando com o fluxo atual antes de investir no redesenho completo do assistente.',
    successCriteria: [
      'Ativação no primeiro dia em 58% ou mais até o fim de dezembro.',
      'Tempo até o primeiro valor em 3,5 h ou menos.',
      'Tickets de onboarding por 100 contas abaixo de 8.',
    ],
    nextSteps: [
      'Selecionar dois segmentos com maior volume de contas novas.',
      'Configurar o piloto com 20% do tráfego de onboarding.',
      'Reavaliar as observações mensais após dois ciclos.',
    ],
    status: 'investigating',
    createdAt: '2026-10-20T09:00:00.000Z',
    updatedAt: '2026-10-28T16:40:00.000Z',
    simulated: true,
  },
  {
    id: 'demo-decision-wizard-redesign',
    title: 'Redesenho do assistente de configuração',
    problem:
      'Os tickets de onboarding crescem mês a mês (de 6,1 para 11,2 por 100 contas) e dois dos cinco feedbacks registrados citam diretamente o assistente de configuração.',
    hypothesis:
      'Se dividirmos a etapa 3 em passos menores com salvamento automático, então os tickets de onboarding ficam em 8 ou menos por 100 contas sem reduzir a ativação.',
    metricIds: ['demo-metric-onboarding-tickets', 'demo-metric-activation'],
    feedbackIds: ['demo-feedback-wizard-crash', 'demo-feedback-import-manual'],
    alternatives: [
      'Corrigir apenas o defeito de travamento relatado no ticket.',
      'Redesenhar o assistente com passos menores e salvamento automático.',
      'Substituir o assistente por uma importação assistida.',
    ],
    decision:
      'Aguardar o resultado do piloto de templates antes de escolher entre redesenhar o assistente ou substituí-lo por importação assistida.',
    successCriteria: [
      'Tickets de onboarding em 8 ou menos por 100 contas.',
      'Ativação no primeiro dia sem queda em relação ao patamar atual.',
    ],
    nextSteps: [
      'Mapear os pontos de abandono da etapa 3.',
      'Comparar o custo do redesenho com o da importação assistida.',
    ],
    status: 'draft',
    createdAt: '2026-10-22T11:10:00.000Z',
    updatedAt: '2026-10-22T11:10:00.000Z',
    simulated: true,
  },
]

export const DEMO_DATASET: WorkspaceState = {
  metrics: DEMO_METRICS,
  observations: DEMO_OBSERVATIONS,
  feedbacks: DEMO_FEEDBACKS,
  decisions: DEMO_DECISIONS,
}

export function demoObservationsFor(metricId: string): MetricObservation[] {
  return DEMO_OBSERVATIONS.filter((observation) => observation.metricId === metricId).sort(
    (a, b) => a.period.localeCompare(b.period),
  )
}

export function findDemoMetric(metricId: string): ProductMetric | undefined {
  return DEMO_METRICS.find((metric) => metric.id === metricId)
}

export interface DemoChartPoint {
  period: string
  value: number
}

export function demoChartSeries(metricId: string): DemoChartPoint[] {
  if (!findDemoMetric(metricId)) return []
  return demoObservationsFor(metricId).map((observation) => ({
    period: observation.period,
    value: observation.value,
  }))
}

export function formatDemoValue(metricId: string, value: number): string {
  const metric = findDemoMetric(metricId)
  return metric ? formatMetricValue(value, metric.unit) : String(value)
}
