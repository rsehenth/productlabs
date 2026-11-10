import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PROFRESOLVE_GROWTH_CONVERSION_CASE } from '@/data/interactive-case/profresolve-growth-conversion-demo'
import {
  buildCaseDecisionOptionViews,
  buildCaseDecisionSummary,
  caseDecisionMissingRequirements,
  caseDecisionRequirementMessages,
  CASE_DECISION_REQUIREMENT_MESSAGES,
  isCaseHypothesisValid,
  selectCaseDecisionOption,
  splitCaseEvidenceByOption,
} from '@/features/interactive-case/case-decision-view'
import { CaseDecisionOptions } from '@/features/interactive-case/case-decision-options'
import { CaseDecisionSummary } from '@/features/interactive-case/case-decision-summary'
import {
  buildCaseFeedbackViews,
  selectCaseEvidence,
} from '@/features/interactive-case/case-feedback-view'
import { CaseHypothesisEditor } from '@/features/interactive-case/case-hypothesis-editor'
import { InteractiveCasePage } from '@/features/interactive-case/interactive-case-page'

const SCENARIO = PROFRESOLVE_GROWTH_CONVERSION_CASE
const OPTION_VIEWS = buildCaseDecisionOptionViews(
  SCENARIO.decisionOptions,
  SCENARIO.metrics,
  SCENARIO.feedbacks,
)
const FEEDBACK_VIEWS = buildCaseFeedbackViews(SCENARIO.feedbacks, SCENARIO.metrics)

const CLARIFY_OPTION_ID = 'case-option-clarify-plans'
const ONBOARDING_OPTION_ID = 'case-option-improve-onboarding'
const SCHOOL_OPTION_ID = 'case-option-flexible-school-access'

const PLAN_FEEDBACK_ID = 'case-feedback-plan-comparison'
const ONBOARDING_FEEDBACK_ID = 'case-feedback-onboarding-turma'

const VALID_HYPOTHESIS =
  'A queda na conversão pode estar ligada à dificuldade de entender o valor do Premium.'
const OTHER_HYPOTHESIS =
  'O abandono no onboarding pode explicar a queda de conversão no período.'

function renderOptions(selectedId: string | null, evidenceIds: readonly string[] = []) {
  return renderToStaticMarkup(
    <CaseDecisionOptions
      options={OPTION_VIEWS}
      selectedId={selectedId}
      selectedEvidence={selectCaseEvidence(FEEDBACK_VIEWS, evidenceIds)}
      onSelect={() => {}}
    />,
  )
}

interface SummaryOptions {
  hypothesis?: string
  optionId?: string | null
  evidenceIds?: readonly string[]
  metricName?: string | null
}

function buildSummary({
  hypothesis = VALID_HYPOTHESIS,
  optionId = CLARIFY_OPTION_ID,
  evidenceIds = [PLAN_FEEDBACK_ID],
  metricName = 'Conversão de usuários gratuitos para Premium',
}: SummaryOptions = {}) {
  return buildCaseDecisionSummary({
    problem: SCENARIO.problem,
    metricName,
    selectedEvidence: selectCaseEvidence(FEEDBACK_VIEWS, evidenceIds),
    hypothesis,
    option: selectCaseDecisionOption(OPTION_VIEWS, optionId),
  })
}

function renderSummary(summary: ReturnType<typeof buildSummary>, missingMessages: string[] = []) {
  return renderToStaticMarkup(
    <CaseDecisionSummary summary={summary} missingMessages={missingMessages} />,
  )
}

function countOccurrences(html: string, needle: string): number {
  return html.split(needle).length - 1
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('alternativas de decisão do cenário', () => {
  it('carrega exatamente as três alternativas do dataset', () => {
    expect(OPTION_VIEWS).toHaveLength(3)
    expect(OPTION_VIEWS.map((option) => option.id)).toEqual([
      CLARIFY_OPTION_ID,
      ONBOARDING_OPTION_ID,
      SCHOOL_OPTION_ID,
    ])
    expect(OPTION_VIEWS.map((option) => option.id)).toEqual(
      SCENARIO.decisionOptions.map((option) => option.id),
    )
  })

  it('preserva os títulos e as descrições originais', () => {
    for (const option of SCENARIO.decisionOptions) {
      const view = OPTION_VIEWS.find((item) => item.id === option.id)
      expect(view?.title).toBe(option.title)
      expect(view?.description).toBe(option.description)
    }

    const html = renderOptions(null)

    for (const option of SCENARIO.decisionOptions) {
      expect(html).toContain(option.title)
      expect(html).toContain(option.description)
    }
  })

  it('exibe todos os benefícios potenciais do dataset', () => {
    const html = renderOptions(null)

    expect(countOccurrences(html, 'Benefícios potenciais')).toBe(3)
    for (const option of SCENARIO.decisionOptions) {
      for (const benefit of option.benefits) {
        expect(html).toContain(benefit)
      }
    }
  })

  it('exibe todos os riscos do dataset', () => {
    const html = renderOptions(null)

    expect(countOccurrences(html, 'Riscos')).toBe(3)
    for (const option of SCENARIO.decisionOptions) {
      for (const risk of option.risks) {
        expect(html).toContain(risk)
      }
    }
  })

  it('exibe as informações adicionais necessárias do dataset', () => {
    const html = renderOptions(null)

    expect(countOccurrences(html, 'Informações adicionais necessárias')).toBe(3)
    for (const option of SCENARIO.decisionOptions) {
      for (const information of option.additionalInformation) {
        expect(html).toContain(information)
      }
    }
  })

  it('resolve indicadores e feedbacks relacionados por ID', () => {
    const clarify = OPTION_VIEWS.find((option) => option.id === CLARIFY_OPTION_ID)
    expect(clarify?.metrics.map((metric) => metric.id)).toEqual([
      'case-metric-free-to-premium-conversion',
      'case-metric-premium-page-visits',
    ])
    expect(clarify?.feedbacks.map((feedback) => feedback.id)).toEqual([
      'case-feedback-plan-comparison',
      'case-feedback-price-per-teacher',
      'case-feedback-support-discovery',
    ])
  })
})

describe('seleção de alternativa', () => {
  it('seleciona uma alternativa e destaca o estado atual', () => {
    const html = renderOptions(ONBOARDING_OPTION_ID)

    expect(countOccurrences(html, 'type="radio"')).toBe(3)
    expect(countOccurrences(html, 'name="case-decision-option"')).toBe(3)
    expect(countOccurrences(html, 'checked=""')).toBe(1)
    expect(countOccurrences(html, 'Selecionada')).toBe(1)
    expect(html).toContain('Selecionar alternativa: Reduzir o esforço de ativação')
  })

  it('permite trocar a alternativa escolhida', () => {
    expect(selectCaseDecisionOption(OPTION_VIEWS, CLARIFY_OPTION_ID)?.id).toBe(CLARIFY_OPTION_ID)
    expect(selectCaseDecisionOption(OPTION_VIEWS, SCHOOL_OPTION_ID)?.id).toBe(SCHOOL_OPTION_ID)
    expect(selectCaseDecisionOption(OPTION_VIEWS, null)).toBeNull()
    expect(selectCaseDecisionOption(OPTION_VIEWS, 'case-option-inexistente')).toBeNull()

    const switched = renderOptions(SCHOOL_OPTION_ID)
    expect(countOccurrences(switched, 'checked=""')).toBe(1)
    expect(switched).toContain('Selecionar alternativa: Testar um modelo de acesso mais flexível')
  })

  it('mantém seleção única por meio de um grupo de radios', () => {
    const html = renderOptions(null)

    expect(countOccurrences(html, 'type="radio"')).toBe(3)
    expect(countOccurrences(html, 'checked=""')).toBe(0)
    expect(countOccurrences(html, 'Selecionada')).toBe(0)
    expect(html).toContain('Selecione uma alternativa para ver como as evidências escolhidas')
  })
})

describe('validação da hipótese', () => {
  it('rejeita hipótese vazia', () => {
    expect(isCaseHypothesisValid('')).toBe(false)
    expect(caseDecisionMissingRequirements('', 1, CLARIFY_OPTION_ID)).toEqual(['hypothesis'])
  })

  it('rejeita hipótese composta apenas por espaços', () => {
    expect(isCaseHypothesisValid('        ')).toBe(false)
    expect(caseDecisionMissingRequirements('               ', 1, CLARIFY_OPTION_ID)).toEqual([
      'hypothesis',
    ])
  })

  it('aceita hipótese suficientemente descritiva', () => {
    expect(isCaseHypothesisValid(VALID_HYPOTHESIS)).toBe(true)
    expect(isCaseHypothesisValid('x'.repeat(14))).toBe(false)
    expect(isCaseHypothesisValid('x'.repeat(15))).toBe(true)
    expect(isCaseHypothesisValid('x'.repeat(1000))).toBe(true)
    expect(isCaseHypothesisValid('x'.repeat(1001))).toBe(false)
  })

  it('exibe campo editável, orientação e limite de caracteres', () => {
    const html = renderToStaticMarkup(
      <CaseHypothesisEditor value={VALID_HYPOTHESIS} onChange={() => {}} />,
    )

    expect(html).toContain('03 — Formular uma hipótese e decidir')
    expect(html).toContain('Sua hipótese de produto')
    expect(html).toContain(
      'Uma hipótese é uma explicação que ainda precisa ser validada. Não é necessário encontrar uma resposta definitiva.',
    )
    expect(html).toContain(VALID_HYPOTHESIS)
    expect(html.toLowerCase()).toContain('maxlength="1000"')
  })
})

describe('requisitos da síntese', () => {
  it('informa a falta de evidências', () => {
    expect(caseDecisionMissingRequirements(VALID_HYPOTHESIS, 0, CLARIFY_OPTION_ID)).toEqual([
      'evidence',
    ])
    expect(caseDecisionRequirementMessages(['evidence'])).toEqual([
      CASE_DECISION_REQUIREMENT_MESSAGES.evidence,
    ])
  })

  it('informa a falta de hipótese mesmo com evidências selecionadas', () => {
    expect(caseDecisionMissingRequirements('', 2, CLARIFY_OPTION_ID)).toEqual(['hypothesis'])
  })

  it('informa a falta de alternativa mesmo com hipótese e evidências', () => {
    expect(caseDecisionMissingRequirements(VALID_HYPOTHESIS, 1, null)).toEqual(['option'])
  })

  it('lista todos os requisitos pendentes na ordem esperada', () => {
    expect(caseDecisionMissingRequirements('', 0, null)).toEqual([
      'hypothesis',
      'evidence',
      'option',
    ])

    const html = renderSummary(
      null,
      caseDecisionRequirementMessages(['hypothesis', 'evidence', 'option']),
    )

    expect(html).toContain('Ainda faltam requisitos para visualizar a síntese.')
    expect(html).toContain('Escreva uma hipótese para continuar.')
    expect(html).toContain('Selecione pelo menos uma evidência.')
    expect(html).toContain('Escolha uma alternativa de decisão.')
    expect(html).toContain('Seus dados preenchidos foram mantidos.')
  })

  it('produz a síntese apenas quando todos os requisitos são atendidos', () => {
    expect(buildSummary()).not.toBeNull()
    expect(buildSummary({ hypothesis: '' })).toBeNull()
    expect(buildSummary({ evidenceIds: [] })).toBeNull()
    expect(buildSummary({ optionId: null })).toBeNull()
  })
})

describe('relação entre alternativa e evidências', () => {
  it('identifica as evidências relacionadas à alternativa escolhida', () => {
    const selected = selectCaseEvidence(FEEDBACK_VIEWS, [
      PLAN_FEEDBACK_ID,
      ONBOARDING_FEEDBACK_ID,
    ])
    const option = selectCaseDecisionOption(OPTION_VIEWS, CLARIFY_OPTION_ID)
    const split = splitCaseEvidenceByOption(selected, option)

    expect(split.related.map((view) => view.id)).toEqual([PLAN_FEEDBACK_ID])
    expect(split.other.map((view) => view.id)).toEqual([ONBOARDING_FEEDBACK_ID])
  })

  it('separa visualmente evidências relacionadas e não relacionadas', () => {
    const html = renderOptions(CLARIFY_OPTION_ID, [PLAN_FEEDBACK_ID, ONBOARDING_FEEDBACK_ID])

    expect(countOccurrences(html, 'Evidências selecionadas relacionadas a esta alternativa')).toBe(1)
    expect(countOccurrences(html, 'Outras evidências selecionadas')).toBe(1)
    expect(html).toContain('Esta separação é apenas informativa')
  })

  it('mostra a mensagem de vazio quando não há evidências selecionadas', () => {
    const html = renderOptions(CLARIFY_OPTION_ID)

    expect(html).toContain('Nenhuma das evidências selecionadas está relacionada a esta alternativa')
    expect(html).toContain('Nenhuma outra evidência selecionada.')
  })
})

describe('síntese da decisão', () => {
  it('apresenta todos os blocos exigidos', () => {
    const summary = buildSummary({ evidenceIds: [PLAN_FEEDBACK_ID] })
    const html = renderSummary(summary)

    expect(html).toContain('Sua decisão de produto')
    expect(html).toContain('Problema investigado')
    expect(html).toContain(SCENARIO.problem)
    expect(html).toContain('Indicador em análise')
    expect(html).toContain('Conversão de usuários gratuitos para Premium')
    expect(html).toContain('Evidências escolhidas')
    expect(html).toContain('Saí sem entender se o Premium resolve meu problema de correção.')
    expect(html).toContain('Sua hipótese')
    expect(html).toContain(VALID_HYPOTHESIS)
    expect(html).toContain('Direção escolhida')
    expect(html).toContain(SCENARIO.decisionOptions[0]?.title ?? '')
    expect(html).toContain('Benefícios potenciais')
    expect(html).toContain('Riscos e limitações')
    expect(html).toContain('Informações que ainda seriam necessárias')
    expect(html).toContain('Uma decisão de produto envolve benefícios, riscos, restrições')
    expect(html).toContain('Próximo raciocínio')
    expect(html).toContain(
      'A próxima etapa de uma investigação real seria validar a hipótese, definir critérios de sucesso e acompanhar os resultados após uma intervenção.',
    )
  })

  it('não apresenta resultados, previsões ou avaliação da decisão', () => {
    const html = renderSummary(buildSummary()).toLowerCase()

    expect(html).not.toContain('resultado comprovado')
    expect(html).not.toContain('resultado obtido')
    expect(html).not.toContain('aumentou a conversão')
    expect(html).not.toContain('probabilidade de sucesso')
    expect(html).not.toContain('melhor alternativa')
    expect(html).not.toContain('decisão correta')
    expect(html).not.toContain('você escolheu a melhor')
  })

  it('acompanha alterações de hipótese, alternativa e evidências', () => {
    const first = buildSummary({ hypothesis: VALID_HYPOTHESIS, optionId: CLARIFY_OPTION_ID })
    const second = buildSummary({
      hypothesis: OTHER_HYPOTHESIS,
      optionId: ONBOARDING_OPTION_ID,
      evidenceIds: [ONBOARDING_FEEDBACK_ID],
    })

    expect(first?.hypothesis).toBe(VALID_HYPOTHESIS)
    expect(first?.option.id).toBe(CLARIFY_OPTION_ID)
    expect(second?.hypothesis).toBe(OTHER_HYPOTHESIS)
    expect(second?.option.id).toBe(ONBOARDING_OPTION_ID)
    expect(second?.evidence.map((view) => view.id)).toEqual([ONBOARDING_FEEDBACK_ID])
    expect(buildSummary({ evidenceIds: [] })).toBeNull()
  })

  it('normaliza apenas os espaços externos da hipótese', () => {
    const summary = buildSummary({ hypothesis: `   ${VALID_HYPOTHESIS}   ` })

    expect(summary?.hypothesis).toBe(VALID_HYPOTHESIS)
  })
})

describe('integridade do Interactive Case após a etapa de decisão', () => {
  it('não atribui pontuação nem ranking às alternativas', () => {
    const html = renderOptions(CLARIFY_OPTION_ID).toLowerCase()

    expect(html).not.toContain('pontua')
    expect(html).not.toContain('score')
    expect(html).not.toContain('ranking')
    expect(html).not.toContain('peso')
  })

  it('não avalia automaticamente a escolha na página completa', () => {
    const html = renderToStaticMarkup(<InteractiveCasePage />).toLowerCase()

    expect(html).not.toContain('resposta correta')
    expect(html).not.toContain('decisão correta')
    expect(html).not.toContain('melhor alternativa')
    expect(html).not.toContain('probabilidade de sucesso')
    expect(html).not.toContain('a decisão real')
  })

  it('mantém o dataset imutável e sem alterações após a renderização', () => {
    const snapshot = JSON.stringify(SCENARIO)

    renderOptions(CLARIFY_OPTION_ID, [PLAN_FEEDBACK_ID])
    renderToStaticMarkup(<InteractiveCasePage />)

    expect(JSON.stringify(SCENARIO)).toBe(snapshot)
    expect(Object.isFrozen(SCENARIO)).toBe(true)
    expect(Object.isFrozen(SCENARIO.decisionOptions)).toBe(true)
  })

  it('não grava nem remove dados do LocalStorage', () => {
    const getItem = vi.fn(() => null)
    const setItem = vi.fn()
    const removeItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem, setItem, removeItem })

    renderToStaticMarkup(<InteractiveCasePage />)

    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
  })

  it('preserva a investigação e a análise de feedbacks anteriores', () => {
    const html = renderToStaticMarkup(<InteractiveCasePage />)

    expect(html).toContain('aria-label="Selecionar indicador"')
    expect(countOccurrences(html, 'aria-pressed="true"')).toBe(1)
    expect(countOccurrences(html, 'aria-pressed="false"')).toBe(2)
    expect(countOccurrences(html, 'type="checkbox"')).toBe(8)
    expect(html).toContain('02 — Analisar a voz dos usuários')
    expect(html).toContain('Evidências selecionadas')
    expect(html).toContain('Você ainda não selecionou evidências.')
  })
})
