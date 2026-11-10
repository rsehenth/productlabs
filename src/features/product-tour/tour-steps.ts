import type { RouteId } from '@/lib/routing'
import { t } from '@/lib/i18n'

/**
 * Roteiro do tour "Como funciona". Fonte única de textos, rotas e alvos.
 * Ao mudar o escopo do produto, revise este arquivo e docs/PRODUCT-GUIDED-TOUR.md na mesma entrega.
 */

export type TourBlockId = 'A' | 'B' | 'C' | 'D' | 'E'

export const TOUR_BLOCK_LABELS: Record<TourBlockId, string> = {
  A: 'Conhecendo o Product Decision Lab',
  B: 'Product Analytics',
  C: 'Feedback Discovery',
  D: 'Decision Workspace',
  E: 'Interactive Case e armazenamento',
}

export interface TourStep {
  id: string
  block: TourBlockId
  /** Módulo exibido no painel. */
  module: string
  route: RouteId
  /** Valor de `data-tour-id` no elemento real. Ausente ou não encontrado: só explicação. */
  targetId?: string
  title: string
  body: readonly string[]
  items?: readonly string[]
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'a1-objetivo',
    block: 'A',
    module: 'Product Decision Lab',
    route: 'overview',
    title: 'Para que serve o Product Decision Lab',
    body: [
      'É um laboratório para praticar decisões de produto com base em evidências: você registra indicadores e relatos de usuários, formula hipóteses, compara alternativas e documenta a decisão.',
      'Este tour mostra como usar cada módulo. Ele só explica: não cria, altera nem exclui registros.',
    ],
  },
  {
    id: 'a2-fluxo',
    block: 'A',
    module: 'Product Decision Lab',
    route: 'overview',
    targetId: 'app-nav',
    title: 'O fluxo e a navegação',
    body: [
      'O caminho típico é: métricas → feedbacks → hipóteses → alternativas → decisões. Cada módulo cuida de uma parte dele.',
      'Use o menu para alternar entre Overview, Feedbacks, Decisions e Interactive Case. Em telas pequenas, o menu abre pelo botão no cabeçalho.',
    ],
  },
  {
    id: 'a3-workspace-demo',
    block: 'A',
    module: 'Product Decision Lab',
    route: 'overview',
    targetId: 'demo-preview',
    title: 'Seu Workspace e o cenário demonstrativo',
    body: [
      'O Workspace contém os registros que você cria e fica salvo neste navegador. Já os dados demonstrativos (a prévia da Overview e o Interactive Case) são fictícios, ficam separados e não entram no seu Workspace.',
      'A prévia demonstrativa aparece na Overview enquanto você não tiver indicadores.',
    ],
  },
  {
    id: 'b1-indicadores',
    block: 'B',
    module: 'Product Analytics',
    route: 'overview',
    targetId: 'metric-new',
    title: 'Criar e editar indicadores',
    body: [
      'Um indicador tem nome, unidade (percentual, contagem, moeda, horas ou pontuação) e direção desejada: aumentar ou diminuir.',
      'A direção define o que é favorável. Para uma taxa de cancelamento, por exemplo, diminuir é bom. Edite um indicador a partir do seu detalhe.',
    ],
  },
  {
    id: 'b2-observacoes',
    block: 'B',
    module: 'Product Analytics',
    route: 'overview',
    targetId: 'metric-list',
    title: 'Observações, gráficos e variação',
    body: [
      'Abra um indicador para registrar observações mensais. Com elas, o detalhe mostra o gráfico histórico e a variação absoluta e relativa em relação ao período anterior.',
      'Essas telas aparecem depois que você cadastra o primeiro indicador.',
    ],
  },
  {
    id: 'b3-classificacao',
    block: 'B',
    module: 'Product Analytics',
    route: 'overview',
    title: 'Classificação, vínculos e exclusão',
    body: [
      'A variação é classificada como favorável ou desfavorável conforme a direção desejada. O aplicativo não diagnostica causas: isso é trabalho seu, com apoio de feedbacks.',
      'O detalhe do indicador lista os feedbacks e as decisões vinculados. Excluir um indicador pede confirmação e é bloqueado enquanto houver vínculos.',
    ],
  },
  {
    id: 'c1-registrar',
    block: 'C',
    module: 'Feedback Discovery',
    route: 'feedbacks',
    targetId: 'feedback-new',
    title: 'Registrar feedbacks',
    body: [
      'Registre o relato do usuário com conteúdo, fonte (entrevista, ticket de suporte, survey, avaliação do app, comunidade ou outra), categoria e data.',
      'Você também pode associar o feedback a indicadores, manualmente.',
    ],
  },
  {
    id: 'c2-filtros',
    block: 'C',
    module: 'Feedback Discovery',
    route: 'feedbacks',
    targetId: 'feedback-filters',
    title: 'Pesquisar e filtrar',
    body: [
      'Com feedbacks cadastrados, a pesquisa textual e os filtros por categoria, fonte e indicador ajudam a encontrar padrões.',
      'Cada feedback pode ser editado ou excluído. Excluir pede confirmação.',
    ],
  },
  {
    id: 'c3-evidencia',
    block: 'C',
    module: 'Feedback Discovery',
    route: 'feedbacks',
    title: 'Feedbacks como evidência',
    body: [
      'Relatos dão contexto qualitativo a uma variação nas métricas e sustentam hipóteses nas decisões.',
      'Associar um feedback a um indicador não comprova causalidade: é um indício que você escolheu relacionar.',
    ],
  },
  {
    id: 'd1-problema',
    block: 'D',
    module: 'Decision Workspace',
    route: 'decisions',
    targetId: 'decision-new',
    title: 'Problema, hipótese e alternativas',
    body: [
      'Um registro de decisão começa pelo problema investigado, seguido da hipótese de produto e das alternativas consideradas.',
      'Escreva a hipótese como algo a ser testado, não como certeza.',
    ],
  },
  {
    id: 'd2-decisao',
    block: 'D',
    module: 'Decision Workspace',
    route: 'decisions',
    title: 'Decisão, critérios e evidências',
    body: [
      'Registre a decisão tomada, os critérios de sucesso e os próximos passos.',
      'Vincule os indicadores e feedbacks que sustentam a decisão. Excluir uma decisão não exclui esses registros; só remove o vínculo.',
    ],
  },
  {
    id: 'd3-status',
    block: 'D',
    module: 'Decision Workspace',
    route: 'decisions',
    targetId: 'decision-filters',
    title: 'Status e exportação',
    body: [
      'Cada registro tem um dos cinco status:',
      'Validated é um status que você define manualmente. O aplicativo não faz validação estatística. No detalhe de uma decisão, é possível editá-la, excluí-la ou exportá-la em Markdown.',
    ],
    items: [
      'Draft (rascunho)',
      'Investigating (em investigação)',
      'Decided (decidida)',
      'Validated (validada)',
      'Abandoned (abandonada)',
    ],
  },
  {
    id: 'e1-caso',
    block: 'E',
    module: 'Interactive Product Case',
    route: 'interactive-case',
    targetId: 'case-progress',
    title: 'O caso do ProfResolve',
    body: [
      'É um cenário fictício, inspirado no ProfResolve, com três fases: Investigar os indicadores, Analisar feedbacks e selecionar evidências, e Decidir, formulando uma hipótese e avaliando alternativas até ver a síntese final.',
      'A síntese exige hipótese, ao menos uma evidência e uma alternativa escolhida.',
    ],
  },
  {
    id: 'e2-isolamento',
    block: 'E',
    module: 'Interactive Product Case',
    route: 'interactive-case',
    title: 'Um cenário isolado',
    body: [
      'O caso roda só em memória: não cria dados no seu Workspace e o progresso se perde ao sair da página.',
      'Não há inteligência artificial nem avaliação automática de acertos. A síntese apenas organiza o que você escolheu.',
    ],
  },
  {
    id: 'e3-armazenamento',
    block: 'E',
    module: 'Armazenamento e backup',
    route: 'overview',
    targetId: 'local-data',
    title: 'Armazenamento, backup e por onde começar',
    body: [
      'Seus dados ficam apenas neste navegador, sem sincronização entre dispositivos. Limpar os dados do site pode apagá-los, e não há recuperação automática.',
      'Exporte um backup JSON manualmente. Importar um backup substitui todo o Workspace atual.',
      'Para começar, crie um indicador na Overview ou experimente o Interactive Case. Você pode rever este tour quando quiser em "Como funciona".',
    ],
  },
]

/** Índice do primeiro passo do bloco seguinte, ou null se o passo atual está no último bloco. */
export function nextBlockStart(index: number): number | null {
  const current = TOUR_STEPS[index]?.block
  const next = TOUR_STEPS.findIndex((step, i) => i > index && step.block !== current)
  return next === -1 ? null : next
}

export function clampStep(index: number): number {
  return Math.min(Math.max(0, Math.trunc(index) || 0), TOUR_STEPS.length - 1)
}

export function progressLabel(index: number): string {
  return t('{current} de {total}', { current: clampStep(index) + 1, total: TOUR_STEPS.length })
}
