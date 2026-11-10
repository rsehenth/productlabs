import { describe, expect, it } from 'vitest'
import { buildDecisionMarkdown, decisionFileName } from '@/lib/markdown'
import {
  buildDecision,
  buildFeedback,
  buildMetric,
  buildObservation,
  buildWorkspace,
} from '@/test/fixtures'

function scenario() {
  const metric = buildMetric()
  const feedback = buildFeedback({
    metricIds: [metric.id],
    content: 'A página de planos não deixa claro o que muda no Premium.',
  })
  const decision = buildDecision({
    metricIds: [metric.id],
    feedbackIds: [feedback.id],
    status: 'decided',
    alternatives: ['Manter o fluxo atual', 'Reorganizar a página de planos'],
    successCriteria: ['Compreensão acima de 80%', 'Conversão acima de 4,5%'],
    nextSteps: ['Revisar a apresentação', 'Validar com usuários'],
  })
  const workspace = buildWorkspace({
    metrics: [metric],
    observations: [
      buildObservation({ id: 'a', period: '2026-09', value: 4.5 }),
      buildObservation({ id: 'b', period: '2026-10', value: 3.8 }),
    ],
    feedbacks: [feedback],
    decisions: [decision],
  })
  return { metric, feedback, decision, workspace }
}

describe('buildDecisionMarkdown', () => {
  it('gera documento estruturado com todos os campos', () => {
    const { decision, workspace, metric, feedback } = scenario()
    const markdown = buildDecisionMarkdown(decision, workspace)

    expect(markdown).toContain('# Product Decision Record')
    expect(markdown).toContain('## Título')
    expect(markdown).toContain(decision.title)
    expect(markdown).toContain('## Status\nDecidida')
    expect(markdown).toContain('## Problema')
    expect(markdown).toContain(decision.problem)
    expect(markdown).toContain(metric.name)
    expect(markdown).toContain('Último valor: 3,8%')
    expect(markdown).toContain('Período: outubro de 2026')
    expect(markdown).toContain(feedback.content)
    expect(markdown).toContain('Categoria: Usabilidade')
    expect(markdown).toContain('Fonte: Entrevista')
    expect(markdown).toContain('Data: 03/02/2026')
    expect(markdown).toContain('## Hipótese')
    expect(markdown).toContain('1. Manter o fluxo atual')
    expect(markdown).toContain('2. Reorganizar a página de planos')
    expect(markdown).toContain('- Compreensão acima de 80%')
    expect(markdown).toContain('- Revisar a apresentação')
    expect(markdown).toContain('## Metadados')
    expect(markdown).toContain('Gerado pelo Product Decision Lab.')
    expect(markdown).toContain('não é um resultado validado automaticamente')
  })

  it('não afirma validação automática ao status Validada', () => {
    const { decision, workspace } = scenario()
    const markdown = buildDecisionMarkdown(
      { ...decision, status: 'validated' },
      workspace,
    )

    expect(markdown).toContain('## Status\nValidada')
    expect(markdown).toContain('não é um resultado validado automaticamente')
  })

  it('trata campos opcionais vazios sem inventar conteúdo', () => {
    const { workspace } = scenario()
    const markdown = buildDecisionMarkdown(
      buildDecision({
        status: 'draft',
        hypothesis: '',
        decision: '',
        alternatives: [],
        successCriteria: [],
        nextSteps: [],
        metricIds: [],
        feedbackIds: [],
      }),
      workspace,
    )

    expect(markdown).toContain('Não registrada.')
    expect(markdown).toContain('Nenhuma alternativa registrada.')
    expect(markdown).toContain('Nenhum critério registrado.')
    expect(markdown).toContain('Nenhum próximo passo registrado.')
    expect(markdown).toContain('Nenhum indicador relacionado.')
    expect(markdown).toContain('Nenhum feedback relacionado.')
  })

  it('omite referências inexistentes em vez de imprimir lixo', () => {
    const { decision, workspace } = scenario()
    const markdown = buildDecisionMarkdown(
      { ...decision, metricIds: ['missing'], feedbackIds: ['missing'] },
      workspace,
    )

    expect(markdown).not.toContain('undefined')
    expect(markdown).not.toContain('missing')
    expect(markdown).toContain('Nenhum indicador relacionado.')
  })

  it('preserva acentos e quebras de linha do conteúdo', () => {
    const { decision, workspace } = scenario()
    const markdown = buildDecisionMarkdown(
      { ...decision, problem: 'Primeira linha\nSegunda linha com ação.' },
      workspace,
    )

    expect(markdown).toContain('Primeira linha\nSegunda linha com ação.')
    expect(markdown).toContain('ação')
    expect(markdown).toContain('Hipótese')
  })
})

describe('decisionFileName', () => {
  it('gera nome seguro a partir do título', () => {
    expect(decisionFileName(buildDecision())).toBe(
      'melhorar-compreensao-dos-planos-premium.md',
    )
  })

  it('usa fallback quando o título não gera slug', () => {
    expect(decisionFileName(buildDecision({ title: '!!!' }))).toBe('decision-record.md')
  })
})
