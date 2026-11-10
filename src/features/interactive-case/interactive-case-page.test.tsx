import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PROFRESOLVE_GROWTH_CONVERSION_CASE } from '@/data/interactive-case/profresolve-growth-conversion-demo'
import { CaseEvidenceSummary } from '@/features/interactive-case/case-evidence-summary'
import { CaseFeedbackAnalysis } from '@/features/interactive-case/case-feedback-analysis'
import { CaseFeedbackCard } from '@/features/interactive-case/case-feedback-card'
import {
  buildCaseFeedbackViews,
  filterCaseFeedbackViews,
  selectCaseEvidence,
  type CaseFeedbackFilter,
} from '@/features/interactive-case/case-feedback-view'
import { CaseInvestigation } from '@/features/interactive-case/case-investigation'
import {
  buildCaseMetricViews,
  selectCaseMetricView,
} from '@/features/interactive-case/case-metric-view'
import { InteractiveCasePage } from '@/features/interactive-case/interactive-case-page'
import { ROUTE_IDS, parseLocation } from '@/lib/routing'

const views = buildCaseMetricViews(PROFRESOLVE_GROWTH_CONVERSION_CASE.metrics)
const feedbackViews = buildCaseFeedbackViews(
  PROFRESOLVE_GROWTH_CONVERSION_CASE.feedbacks,
  PROFRESOLVE_GROWTH_CONVERSION_CASE.metrics,
)
const CONVERSION_ID = 'case-metric-free-to-premium-conversion'
const ONBOARDING_ID = 'case-metric-onboarding-completion'
const VISITS_ID = 'case-metric-premium-page-visits'
const PLAN_FEEDBACK_ID = 'case-feedback-plan-comparison'
const ONBOARDING_FEEDBACK_ID = 'case-feedback-onboarding-turma'

function renderPage() {
  return renderToStaticMarkup(<InteractiveCasePage />)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('página do Interactive Case', () => {
  it('exibe o cenário ProfResolve e o aviso permanente de simulação', () => {
    const html = renderPage()

    expect(html).toContain('ProfResolve')
    expect(html).toContain('Growth &amp; Monetization')
    expect(html).toContain('Interactive Product Case')
    expect(html).toContain('Pergunta principal')
    expect(html).toContain(
      'Cenário simulado: os indicadores apresentados não representam dados reais de produção do ProfResolve.',
    )
    expect(html).toContain(
      'Explore os indicadores de um cenário demonstrativo inspirado no ProfResolve',
    )
  })

  it('mostra os três indicadores com valores iniciais e finais', () => {
    const html = renderPage()

    expect(html).toContain('Conversão de usuários gratuitos para Premium')
    expect(html).toContain('Conclusão do onboarding gratuito')
    expect(html).toContain('Visitas à página de planos Premium')

    expect(html).toContain('5,2%')
    expect(html).toContain('3,4%')
    expect(html).toContain('60%')
    expect(html).toContain('43%')
    expect(html).toContain('3.200')
    expect(html).toContain('4.200')
  })

  it('exibe as variações absolutas corretas', () => {
    const html = renderPage()

    expect(html).toContain('-1,8 p.p.')
    expect(html).toContain('-17 p.p.')
    expect(html).toContain('+1.000')
  })

  it('exibe os quatro períodos simulados', () => {
    const html = renderPage()

    expect(html).toContain('jun/2026')
    expect(html).toContain('jul/2026')
    expect(html).toContain('ago/2026')
    expect(html).toContain('set/2026')
  })

  it('apresenta as três etapas disponíveis', () => {
    const html = renderPage()

    expect(html).toContain('Investigar')
    expect(html).toContain('Analisar')
    expect(html).toContain('Decidir')
    expect(html).toContain('Disponível')
    expect(html).not.toContain('(em breve)')
    expect(html).not.toContain('aria-current="step"')
  })

  it('mantém o dataset simulado imutável após renderizar', () => {
    const snapshot = JSON.stringify(PROFRESOLVE_GROWTH_CONVERSION_CASE)

    renderPage()

    expect(JSON.stringify(PROFRESOLVE_GROWTH_CONVERSION_CASE)).toBe(snapshot)
    expect(Object.isFrozen(PROFRESOLVE_GROWTH_CONVERSION_CASE)).toBe(true)
  })

  it('não grava nem remove dados do LocalStorage ao renderizar', () => {
    const getItem = vi.fn(() => null)
    const setItem = vi.fn()
    const removeItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem, setItem, removeItem })

    renderPage()

    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
  })
})

describe('investigação interativa', () => {
  it('seleciona o primeiro indicador por padrão e permite alternar', () => {
    const html = renderPage()
    const pressed = html.match(/aria-pressed="true"/g) ?? []
    const available = html.match(/aria-pressed="false"/g) ?? []

    expect(html).toContain('aria-label="Selecionar indicador"')
    expect(pressed).toHaveLength(1)
    expect(available).toHaveLength(2)
    expect(html).toContain('Conversão de usuários gratuitos para Premium: queda')

    const conversion = selectCaseMetricView(views, CONVERSION_ID)
    const visits = selectCaseMetricView(views, VISITS_ID)
    if (!conversion || !visits) throw new Error('Indicadores esperados ausentes')

    const conversionHtml = renderToStaticMarkup(
      <CaseInvestigation views={views} selected={conversion} onSelect={() => {}} />,
    )
    const visitsHtml = renderToStaticMarkup(
      <CaseInvestigation views={views} selected={visits} onSelect={() => {}} />,
    )

    expect(conversionHtml).toContain(' queda de ')
    expect(visitsHtml).toContain('Visitas à página de planos Premium: aumento')

    const selectedInVisits = visitsHtml.match(/aria-pressed="true"/g) ?? []
    expect(selectedInVisits).toHaveLength(1)
  })

  it('exibe resumo de tendência sem conclusão causal', () => {
    const html = renderPage()

    expect(html).toContain('quatro períodos simulados')
    expect(html).toContain('sem que isso comprove')
    expect(html.toLowerCase()).not.toContain('causou')
    expect(html.toLowerCase()).not.toContain('provocou')
  })
})

describe('navegação existente', () => {
  it('preserva as rotas do aplicativo', () => {
    expect(ROUTE_IDS).toEqual(['overview', 'feedbacks', 'decisions', 'interactive-case'])
    expect(parseLocation('#/interactive-case').route).toBe('interactive-case')
    expect(parseLocation('#/overview').route).toBe('overview')
  })
})

interface AnalysisOptions {
  filter?: CaseFeedbackFilter
  metricId?: string | null
  selectedIds?: readonly string[]
}

function renderAnalysis({
  filter = 'all',
  metricId = CONVERSION_ID,
  selectedIds = [],
}: AnalysisOptions = {}) {
  return renderToStaticMarkup(
    <CaseFeedbackAnalysis
      views={feedbackViews}
      selectedMetricId={metricId}
      filter={filter}
      onFilterChange={() => {}}
      selectedIds={selectedIds}
      onToggleEvidence={() => {}}
    />,
  )
}

function renderSummary(ids: readonly string[]) {
  return renderToStaticMarkup(
    <CaseEvidenceSummary
      selected={selectCaseEvidence(feedbackViews, ids)}
      onRemove={() => {}}
      onClear={() => {}}
    />,
  )
}

function renderCard(feedbackId: string, selected: boolean) {
  const view = feedbackViews.find((item) => item.id === feedbackId)
  if (!view) throw new Error(`Feedback ausente: ${feedbackId}`)
  return renderToStaticMarkup(
    <CaseFeedbackCard
      view={view}
      selected={selected}
      highlightedMetricId={CONVERSION_ID}
      onToggle={() => {}}
    />,
  )
}

function countCards(html: string): number {
  return (html.match(/type="checkbox"/g) ?? []).length
}

function countOccurrences(html: string, needle: string): number {
  return html.split(needle).length - 1
}

describe('seção de análise de feedbacks', () => {
  it('apresenta título, descrição e aviso de simulação', () => {
    const html = renderPage()

    expect(html).toContain('02 — Analisar a voz dos usuários')
    expect(html).toContain(
      'Explore os feedbacks disponíveis e identifique quais relatos podem ajudar a formular hipóteses sobre o problema.',
    )
    expect(html).toContain(
      'Todos os comentários apresentados neste cenário são fictícios e foram criados exclusivamente para demonstração.',
    )
    expect(html).toContain(
      'Feedbacks ajudam a formular hipóteses, mas não comprovam, isoladamente, a causa de uma variação nos indicadores.',
    )
  })

  it('carrega e exibe os oito feedbacks do cenário', () => {
    const html = renderPage()

    expect(countCards(html)).toBe(8)
    expect(html).toContain('Exibindo 8 de 8 feedback(s).')

    const fragments = [
      'Saí sem entender se o Premium resolve meu problema de correção',
      'O preço é por professor',
      'Descobri que existia um plano Premium',
      'Tentei configurar minha primeira turma',
      'A importação da lista de alunos demorou',
      'Uso o plano gratuito com duas turmas',
      'Na minha escola, a compra precisa passar pela coordenação',
      'Consegui entrar, mas não encontrei um modelo de atividade',
    ]
    for (const fragment of fragments) {
      expect(html).toContain(fragment)
    }
  })

  it('exibe as categorias do dataset', () => {
    const html = renderPage()

    expect(html).toContain('Usabilidade')
    expect(html).toContain('Preço')
    expect(html).toContain('Desempenho')
    expect(html).toContain('Outro')
  })

  it('exibe as fontes demonstrativas do dataset', () => {
    const html = renderPage()

    expect(html).toContain('Survey')
    expect(html).toContain('Avaliação do app')
    expect(html).toContain('Entrevista')
    expect(html).toContain('Ticket de suporte')
    expect(html).toContain('Comunidade')
  })

  it('identifica cada comentário como dado simulado', () => {
    const html = renderPage()

    expect(countOccurrences(html, 'Dado simulado')).toBe(8)
  })

  it('exibe os indicadores relacionados em cada card', () => {
    const html = renderAnalysis({ filter: 'related', metricId: CONVERSION_ID })

    expect(countCards(html)).toBe(8)
    expect(countOccurrences(html, 'Indicadores relacionados')).toBe(8)
    expect(countOccurrences(html, 'Conversão de usuários gratuitos para Premium')).toBe(8)
  })
})

describe('filtro por indicador selecionado', () => {
  it('visualiza todos os feedbacks no filtro padrão', () => {
    const html = renderAnalysis({ filter: 'all', metricId: CONVERSION_ID })

    expect(countCards(html)).toBe(8)
    expect(html).toContain('Exibindo 8 de 8 feedback(s).')
    expect(html).toContain('Todos os feedbacks')
    expect(html).toContain('Relacionados ao indicador selecionado')
  })

  it('filtra pelos feedbacks relacionados ao indicador de conversão', () => {
    const html = renderAnalysis({ filter: 'related', metricId: CONVERSION_ID })

    expect(countCards(html)).toBe(8)
    expect(html).toContain('Exibindo 8 de 8 feedback(s).')
    expect(html).toContain('Uso o plano gratuito com duas turmas')
    expect(html).toContain('Na minha escola, a compra precisa passar pela coordenação')
  })

  it('filtra pelos feedbacks relacionados ao onboarding', () => {
    const html = renderAnalysis({ filter: 'related', metricId: ONBOARDING_ID })

    expect(countCards(html)).toBe(3)
    expect(html).toContain('Exibindo 3 de 8 feedback(s).')
    expect(html).toContain('Tentei configurar minha primeira turma')
    expect(html).toContain('A importação da lista de alunos demorou')
    expect(html).toContain('Consegui entrar, mas não encontrei um modelo de atividade')
    expect(html).not.toContain('Descobri que existia um plano Premium')
  })

  it('filtra pelos feedbacks relacionados às visitas da página de planos', () => {
    const html = renderAnalysis({ filter: 'related', metricId: VISITS_ID })

    expect(countCards(html)).toBe(3)
    expect(html).toContain('Exibindo 3 de 8 feedback(s).')
    expect(html).toContain('Saí sem entender se o Premium resolve')
    expect(html).toContain('O preço é por professor')
    expect(html).toContain('Descobri que existia um plano Premium')
    expect(html).not.toContain('Tentei configurar minha primeira turma')
  })
})

describe('estado de seleção das evidências', () => {
  it('apresenta o controle de seleção em cada card', () => {
    const html = renderCard(PLAN_FEEDBACK_ID, false)

    expect(html).toContain('Selecionar evidência')
    expect(html).not.toContain('Evidência selecionada')
    expect(html).not.toContain('checked=""')
  })

  it('apresenta estado visual e textual ao selecionar uma evidência', () => {
    const html = renderCard(PLAN_FEEDBACK_ID, true)

    expect(html).toContain('Evidência selecionada')
    expect(html).toContain('checked=""')
    expect(html).toContain('border-primary/50')
  })

  it('mantém múltiplas evidências selecionadas', () => {
    const selectedIds = [PLAN_FEEDBACK_ID, ONBOARDING_FEEDBACK_ID]
    const html = renderAnalysis({ filter: 'all', selectedIds })

    expect(countOccurrences(html, 'Evidência selecionada')).toBe(2)
    expect(countOccurrences(html, 'Selecionar evidência')).toBe(6)
  })
})

describe('resumo das evidências', () => {
  it('apresenta mensagem quando nada foi selecionado', () => {
    const html = renderPage()

    expect(html).toContain('Evidências selecionadas')
    expect(html).toContain(
      'Você ainda não selecionou evidências. Analise os feedbacks e escolha os relatos que considera relevantes para a investigação.',
    )
    expect(html).not.toContain('Limpar seleção')
  })

  it('lista uma evidência com contagem, conteúdo e remoção', () => {
    const html = renderSummary([PLAN_FEEDBACK_ID])

    expect(html).toContain('1 evidência selecionada')
    expect(html).toContain('Saí sem entender se o Premium resolve meu problema de correção.')
    expect(html).toContain('Remover evidência:')
    expect(html).toContain('Limpar seleção')
  })

  it('conta múltiplas evidências e lista as categorias presentes', () => {
    const html = renderSummary([PLAN_FEEDBACK_ID, 'case-feedback-import-students'])

    expect(html).toContain('2 evidências selecionadas')
    expect(html).toContain('Usabilidade')
    expect(html).toContain('Desempenho')
    expect(countOccurrences(html, 'Remover evidência:')).toBe(2)
  })

  it('mantém evidências ocultas pelo filtro no resumo', () => {
    const selectedIds = [PLAN_FEEDBACK_ID, ONBOARDING_FEEDBACK_ID]
    const analysis = renderAnalysis({
      filter: 'related',
      metricId: ONBOARDING_ID,
      selectedIds,
    })
    const summary = renderSummary(selectedIds)

    expect(countCards(analysis)).toBe(3)
    expect(analysis).not.toContain('Saí sem entender se o Premium resolve')
    expect(countOccurrences(analysis, 'Evidência selecionada')).toBe(1)

    expect(summary).toContain('2 evidências selecionadas')
    expect(summary).toContain('Saí sem entender se o Premium resolve')
    expect(summary).toContain('Tentei configurar minha primeira turma')
  })

  it('preserva a seleção ao trocar o indicador', () => {
    const selectedIds = filterCaseFeedbackViews(
      feedbackViews,
      'related',
      VISITS_ID,
    ).map((view) => view.id)

    const conversionSummary = renderSummary(selectedIds)
    const onboardingAnalysis = renderAnalysis({
      filter: 'related',
      metricId: ONBOARDING_ID,
      selectedIds,
    })

    expect(conversionSummary).toContain('3 evidências selecionadas')
    expect(conversionSummary).toContain('Descobri que existia um plano Premium')
    expect(countCards(onboardingAnalysis)).toBe(3)
    expect(onboardingAnalysis).not.toContain('Descobri que existia um plano Premium')
  })
})

describe('integridade da interpretação', () => {
  it('não apresenta conclusões automáticas nem avaliação da seleção', () => {
    const html = renderPage()
    const lower = html.toLowerCase()

    expect(lower).not.toContain('problema identificado')
    expect(lower).not.toContain('causa encontrada')
    expect(lower).not.toContain('comprova a queda')
    expect(lower).not.toContain('resposta correta')
  })

  it('distingue observação, evidência qualitativa e hipótese', () => {
    const html = renderPage()

    expect(html).toContain('Observação:')
    expect(html).toContain('Evidência qualitativa:')
    expect(html).toContain('Hipótese:')
  })
})

describe('progresso do Interactive Case', () => {
  it('mostra as três fases disponíveis', () => {
    const html = renderPage()

    expect(html).toContain('Investigar')
    expect(html).toContain('Analisar')
    expect(html).toContain('Decidir')
    expect(countOccurrences(html, 'Disponível')).toBe(3)
    expect(countOccurrences(html, '(em breve)')).toBe(0)
  })

  it('não simula um wizard com uma etapa ativa', () => {
    const html = renderPage()

    expect(html).toContain('Etapas disponíveis no Interactive Case')
    expect(html).not.toContain('aria-current="step"')
    expect(html.toLowerCase()).not.toContain('etapa concluída')
  })
})
