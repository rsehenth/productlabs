/**
 * Cenário demonstrativo do Interactive Product Case.
 *
 * O ProfResolve aparece apenas como contexto de produto. Todos os indicadores,
 * feedbacks e alternativas foram simulados para este exercício: não representam
 * resultados, entrevistas, experimentos ou decisões reais do produto.
 *
 * O cenário é estático e imutável. Ele não é gravado no Workspace nem no
 * LocalStorage e não passa pelas operações de importação/backup.
 */
import type { CaseScenario } from '@/types/interactive-case'

export const PROFRESOLVE_CASE_ID = 'profresolve-growth-conversion-demo'

export const CASE_SIMULATION_NOTICE =
  'Cenário demonstrativo: todos os indicadores, feedbacks e alternativas são simulados e não representam resultados, entrevistas, experimentos ou decisões reais do ProfResolve.'

function simulatedOrigin(note: string) {
  return { kind: 'simulated', note } as const
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const nested of Object.values(value as unknown as Record<string, unknown>)) {
    deepFreeze(nested)
  }
  return value
}

export const PROFRESOLVE_GROWTH_CONVERSION_CASE = deepFreeze<CaseScenario>({
  id: PROFRESOLVE_CASE_ID,
  title: 'ProfResolve — Growth & Monetization',
  description:
    'Estudo de caso demonstrativo sobre uma queda simulada na conversão de usuários gratuitos para o plano Premium.',
  context:
    'O ProfResolve é um SaaS educacional voltado a professores. Neste exercício, ele aparece apenas como contexto de produto: os indicadores, feedbacks e alternativas foram criados para demonstrar uma investigação de Product Management.',
  productName: 'ProfResolve',
  problem:
    'A conversão simulada de usuários gratuitos para o Premium caiu de 5,2% para 3,4% ao longo de quatro períodos, enquanto as visitas à página de planos aumentaram. A causa não está estabelecida.',
  objective:
    'Permitir que o visitante analise indicadores, consulte feedbacks e avalie alternativas antes de decidir qual investigação aprofundar.',
  mainQuestion:
    'A conversão de usuários gratuitos para Premium apresentou uma queda. Como um Product Manager deveria investigar o problema antes de decidir?',
  type: 'demonstrative-case-study',
  origin: simulatedOrigin(CASE_SIMULATION_NOTICE),
  metrics: [
    {
      id: 'case-metric-free-to-premium-conversion',
      name: 'Conversão de usuários gratuitos para Premium',
      unit: 'percent',
      description:
        'Percentual de usuários gratuitos elegíveis que passam para o plano Premium no período.',
      desiredDirection: 'increase',
      observations: [
        {
          id: 'case-observation-conversion-2026-06',
          period: '2026-06',
          value: 5.2,
          numerator: 260,
          denominator: 5000,
        },
        {
          id: 'case-observation-conversion-2026-07',
          period: '2026-07',
          value: 4.8,
          numerator: 252,
          denominator: 5250,
        },
        {
          id: 'case-observation-conversion-2026-08',
          period: '2026-08',
          value: 4.1,
          numerator: 237,
          denominator: 5780,
        },
        {
          id: 'case-observation-conversion-2026-09',
          period: '2026-09',
          value: 3.4,
          numerator: 221,
          denominator: 6500,
        },
      ],
      origin: simulatedOrigin(
        'Indicador, numeradores e denominadores criados para o exercício; não representam dados reais do ProfResolve.',
      ),
    },
    {
      id: 'case-metric-onboarding-completion',
      name: 'Conclusão do onboarding gratuito',
      unit: 'percent',
      description:
        'Percentual de professores que concluem a configuração da primeira turma durante o onboarding.',
      desiredDirection: 'increase',
      observations: [
        {
          id: 'case-observation-onboarding-2026-06',
          period: '2026-06',
          value: 60,
          numerator: 720,
          denominator: 1200,
        },
        {
          id: 'case-observation-onboarding-2026-07',
          period: '2026-07',
          value: 56,
          numerator: 700,
          denominator: 1250,
        },
        {
          id: 'case-observation-onboarding-2026-08',
          period: '2026-08',
          value: 48,
          numerator: 672,
          denominator: 1400,
        },
        {
          id: 'case-observation-onboarding-2026-09',
          period: '2026-09',
          value: 43,
          numerator: 688,
          denominator: 1600,
        },
      ],
      origin: simulatedOrigin(
        'Indicador, numeradores e denominadores criados para o exercício; não representam dados reais do ProfResolve.',
      ),
    },
    {
      id: 'case-metric-premium-page-visits',
      name: 'Visitas à página de planos Premium',
      unit: 'count',
      description: 'Número de visitas à página de planos Premium no período.',
      desiredDirection: 'increase',
      observations: [
        { id: 'case-observation-visits-2026-06', period: '2026-06', value: 3200 },
        { id: 'case-observation-visits-2026-07', period: '2026-07', value: 3410 },
        { id: 'case-observation-visits-2026-08', period: '2026-08', value: 3750 },
        { id: 'case-observation-visits-2026-09', period: '2026-09', value: 4200 },
      ],
      origin: simulatedOrigin(
        'Indicador e valores criados para o exercício; não representam dados reais do ProfResolve.',
      ),
    },
  ],
  feedbacks: [
    {
      id: 'case-feedback-plan-comparison',
      content:
        'A página de planos lista os recursos do Premium ao lado do gratuito, mas não explica o que muda na rotina do professor. Saí sem entender se o Premium resolve meu problema de correção.',
      category: 'usability',
      source: 'survey',
      metricIds: ['case-metric-free-to-premium-conversion', 'case-metric-premium-page-visits'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma entrevista real.'),
    },
    {
      id: 'case-feedback-price-per-teacher',
      content:
        'O preço é por professor, mas a página não deixa claro se coordenadores e estagiários também contam. Preferi continuar no gratuito até entender o custo real.',
      category: 'pricing',
      source: 'app-review',
      metricIds: ['case-metric-free-to-premium-conversion', 'case-metric-premium-page-visits'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma avaliação real.'),
    },
    {
      id: 'case-feedback-support-discovery',
      content:
        'Descobri que existia um plano Premium porque perguntei ao suporte. Dentro do produto, nunca vi um convite para conhecer os recursos pagos.',
      category: 'other',
      source: 'interview',
      metricIds: ['case-metric-free-to-premium-conversion', 'case-metric-premium-page-visits'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma entrevista real.'),
    },
    {
      id: 'case-feedback-onboarding-turma',
      content:
        'Tentei configurar minha primeira turma, mas o onboarding pediu informações da escola que eu não tinha em mãos. Deixei para depois e não voltei.',
      category: 'usability',
      source: 'support-ticket',
      metricIds: ['case-metric-onboarding-completion', 'case-metric-free-to-premium-conversion'],
      origin: simulatedOrigin('Relato criado para o exercício; não é um ticket real.'),
    },
    {
      id: 'case-feedback-import-students',
      content:
        'A importação da lista de alunos demorou e alguns nomes vieram sem turma. Refiz tudo à mão antes de conseguir usar o produto.',
      category: 'performance',
      source: 'community',
      metricIds: ['case-metric-onboarding-completion', 'case-metric-free-to-premium-conversion'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma mensagem real.'),
    },
    {
      id: 'case-feedback-free-limits',
      content:
        'Uso o plano gratuito com duas turmas e ele atende. Não sinto necessidade de pagar porque nunca cheguei no limite de alunos.',
      category: 'other',
      source: 'interview',
      metricIds: ['case-metric-free-to-premium-conversion'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma entrevista real.'),
    },
    {
      id: 'case-feedback-school-purchase',
      content:
        'Na minha escola, a compra precisa passar pela coordenação e pelo setor financeiro. O processo de virar Premium no cartão pessoal não funciona para mim.',
      category: 'pricing',
      source: 'community',
      metricIds: ['case-metric-free-to-premium-conversion'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma mensagem real.'),
    },
    {
      id: 'case-feedback-activation-value',
      content:
        'Consegui entrar, mas não encontrei um modelo de atividade para começar. Passei a primeira semana explorando e ainda não tinha usado nada que justificasse o Premium.',
      category: 'usability',
      source: 'survey',
      metricIds: ['case-metric-onboarding-completion', 'case-metric-free-to-premium-conversion'],
      origin: simulatedOrigin('Relato criado para o exercício; não é uma resposta real.'),
    },
  ],
  decisionOptions: [
    {
      id: 'case-option-clarify-plans',
      title: 'Esclarecer a proposta e a comparação dos planos',
      description:
        'Reescrever a página de planos para explicar, na rotina do professor, o que muda com o Premium, como o preço por professor funciona e quais limites do plano gratuito deixam de ser suficientes.',
      benefits: [
        'Pode reduzir mal-entendidos sobre preço e escopo sem alterar o modelo de cobrança.',
        'É uma mudança de menor esforço técnico e pode ser medida na própria página de planos.',
        'Aproveita o aumento simulado de visitas à página de planos como oportunidade de comunicação.',
      ],
      risks: [
        'Pode não resolver a conversão se a barreira principal for ativação ou valor percebido.',
        'Não altera os limites do plano gratuito nem o processo de compra escolar.',
        'Mensagens mais claras podem aumentar o interesse sem gerar conversão.',
      ],
      metricIds: [
        'case-metric-free-to-premium-conversion',
        'case-metric-premium-page-visits',
      ],
      feedbackIds: [
        'case-feedback-plan-comparison',
        'case-feedback-price-per-teacher',
        'case-feedback-support-discovery',
      ],
      additionalInformation: [
        'Entrevistas com professores que visitaram a página de planos e não assinaram.',
        'Dados de interação na página de planos por segmento de usuário.',
        'Critérios que os professores usam para comparar os planos.',
      ],
    },
    {
      id: 'case-option-improve-onboarding',
      title: 'Reduzir o esforço de ativação até a primeira turma configurada',
      description:
        'Simplificar o onboarding, adiar dados que podem ser preenchidos depois e garantir que o professor chegue a uma primeira turma funcional antes de explorar recursos avançados.',
      benefits: [
        'Ataca diretamente os relatos de abandono durante a configuração inicial.',
        'Pode aumentar a parcela de usuários que experimenta o valor do produto.',
        'Cria uma base mais sólida para que a comunicação do Premium faça sentido.',
      ],
      risks: [
        'Pode exigir mais esforço de produto e engenharia do que a revisão da comunicação.',
        'Pode melhorar a ativação sem aumentar a conversão paga.',
        'Não endereça a percepção de preço nem a compra institucional.',
      ],
      metricIds: [
        'case-metric-onboarding-completion',
        'case-metric-free-to-premium-conversion',
      ],
      feedbackIds: [
        'case-feedback-onboarding-turma',
        'case-feedback-import-students',
        'case-feedback-activation-value',
      ],
      additionalInformation: [
        'Dados de abandono por etapa do onboarding.',
        'Entrevistas com professores que iniciaram e não concluíram a configuração.',
        'Definição do momento em que o professor percebe o primeiro valor.',
      ],
    },
    {
      id: 'case-option-flexible-school-access',
      title: 'Testar um modelo de acesso mais flexível para escolas',
      description:
        'Investigar planos por escola ou por coordenação, com um processo de compra adequado a instituições, em vez de manter apenas a assinatura individual por professor.',
      benefits: [
        'Endereça relatos sobre compra institucional e necessidade de nota fiscal.',
        'Pode destravar o uso em escolas em que o professor não decide a compra.',
        'Pode reduzir a percepção de que o plano gratuito já é suficiente.',
      ],
      risks: [
        'Muda o empacotamento e a cobrança, com impacto potencial na receita.',
        'Aumenta a complexidade operacional, financeira e de suporte.',
        'A demanda por esse modelo ainda não foi medida.',
      ],
      metricIds: ['case-metric-free-to-premium-conversion'],
      feedbackIds: [
        'case-feedback-free-limits',
        'case-feedback-school-purchase',
        'case-feedback-price-per-teacher',
      ],
      additionalInformation: [
        'Mapear como escolas decidem e pagam por ferramentas educacionais.',
        'Pesquisa de disposição a pagar por segmento.',
        'Comparar uso e conversão de professores individuais e vinculados a escolas.',
      ],
    },
  ],
})
