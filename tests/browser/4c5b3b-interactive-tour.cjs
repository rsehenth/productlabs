/**
 * Regressão funcional 4C.5b.3b — Interactive Product Case e tour "Como funciona".
 * Uso: PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5b3b-interactive-tour.cjs
 * Dados exclusivamente fictícios, contextos isolados, build de produção em vite preview.
 */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const KEY = 'product-decision-lab:workspace'
const ROUTE_TITLES = {
  overview: 'Product Overview',
  feedbacks: 'Feedback Discovery',
  decisions: 'Decision Workspace',
  'interactive-case': 'ProfResolve — Growth & Monetization',
}

const STEPS = [
  { progress: '1 de 15', title: 'Para que serve o Product Decision Lab', module: 'Product Decision Lab', route: 'overview', target: null },
  { progress: '2 de 15', title: 'O fluxo e a navegação', module: 'Product Decision Lab', route: 'overview', target: 'app-nav' },
  { progress: '3 de 15', title: 'Seu Workspace e o cenário demonstrativo', module: 'Product Decision Lab', route: 'overview', target: 'demo-preview' },
  { progress: '4 de 15', title: 'Criar e editar indicadores', module: 'Product Analytics', route: 'overview', target: 'metric-new' },
  { progress: '5 de 15', title: 'Observações, gráficos e variação', module: 'Product Analytics', route: 'overview', target: 'metric-list' },
  { progress: '6 de 15', title: 'Classificação, vínculos e exclusão', module: 'Product Analytics', route: 'overview', target: null },
  { progress: '7 de 15', title: 'Registrar feedbacks', module: 'Feedback Discovery', route: 'feedbacks', target: 'feedback-new' },
  { progress: '8 de 15', title: 'Pesquisar e filtrar', module: 'Feedback Discovery', route: 'feedbacks', target: 'feedback-filters' },
  { progress: '9 de 15', title: 'Feedbacks como evidência', module: 'Feedback Discovery', route: 'feedbacks', target: null },
  { progress: '10 de 15', title: 'Problema, hipótese e alternativas', module: 'Decision Workspace', route: 'decisions', target: 'decision-new' },
  { progress: '11 de 15', title: 'Decisão, critérios e evidências', module: 'Decision Workspace', route: 'decisions', target: null },
  { progress: '12 de 15', title: 'Status e exportação', module: 'Decision Workspace', route: 'decisions', target: 'decision-filters' },
  { progress: '13 de 15', title: 'O caso do ProfResolve', module: 'Interactive Product Case', route: 'interactive-case', target: 'case-progress' },
  { progress: '14 de 15', title: 'Um cenário isolado', module: 'Interactive Product Case', route: 'interactive-case', target: null },
  { progress: '15 de 15', title: 'Armazenamento, backup e por onde começar', module: 'Armazenamento e backup', route: 'overview', target: 'local-data' },
]

const HIGHLIGHT_SELECTOR = 'div[aria-hidden="true"][class*="outline-primary"]'
const SUMMARY = 'section[aria-labelledby="case-decision-summary-title"]'
const FEEDBACK_SECTION = 'section[aria-labelledby="case-feedback-title"]'

function instrument(page) {
  const events = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] }
  page.on('console', (message) => {
    if (message.type() === 'error') events.consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => events.pageErrors.push(String(error)))
  page.on('requestfailed', (request) => {
    if (!/favicon/.test(request.url())) {
      events.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`)
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon/.test(response.url())) {
      events.httpErrors.push(`${response.status()} ${response.url()}`)
    }
  })
  return events
}

function assertClean(label, events) {
  assert.deepEqual(events.pageErrors, [], `${label}: pageerror`)
  assert.deepEqual(events.consoleErrors, [], `${label}: console errors`)
  assert.deepEqual(events.failedRequests, [], `${label}: failed requests`)
  assert.deepEqual(events.httpErrors, [], `${label}: HTTP >= 400`)
}

const raw = (page) => page.evaluate((key) => localStorage.getItem(key), KEY)
const stored = async (page) => JSON.parse((await raw(page)) || 'null')
const go = (page, route) => page.goto(`${ORIGIN}/#/${route}`)
const dialog = (page) => page.getByRole('dialog')
const button = (scope, name) => scope.getByRole('button', { name, exact: true })
const textButton = (scope, name) => scope.locator('button').filter({ hasText: new RegExp(`^${name}$`) })
const hash = (page) => page.evaluate(() => location.hash)
const spaNavigate = (page, route) => page.evaluate((value) => { location.hash = `#/${value}` }, route)

async function openApp(page) {
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
}

async function createMetric(page, name) {
  await button(page, 'Novo indicador').click()
  const dlg = dialog(page)
  await dlg.locator('#metric-name').fill(name)
  await button(dlg, 'Criar indicador').click()
  await dlg.getByRole('heading', { name, exact: true }).waitFor()
  await textButton(dlg, 'Fechar').click()
  await dlg.waitFor({ state: 'hidden' })
}

async function createFeedback(page, content) {
  await go(page, 'feedbacks')
  await button(page, 'Novo feedback').click()
  await page.locator('#feedback-content').fill(content)
  await button(dialog(page), 'Criar feedback').click()
  await dialog(page).waitFor({ state: 'hidden' })
}

async function createDecision(page, title) {
  await go(page, 'decisions')
  await button(page, 'Nova decisão').click()
  await page.locator('#decision-title').fill(title)
  await page.locator('#decision-problem').fill('Problema fictício de regressão funcional.')
  await button(page, 'Salvar decisão').click()
  await page.waitForFunction(() => location.hash.includes('record='))
  await page.getByRole('heading', { name: title, exact: true }).waitFor()
}

async function seedWorkspace(page) {
  await openApp(page)
  await createMetric(page, 'Indicador QA Tour')
  await createFeedback(page, 'Feedback QA do tour preenchido')
  await createDecision(page, 'Decisão QA do tour preenchido')
  await openApp(page)
}

function assertIntegrity(workspace, label) {
  for (const collection of ['metrics', 'observations', 'feedbacks', 'decisions']) {
    const ids = workspace[collection].map((record) => record.id)
    assert.equal(new Set(ids).size, ids.length, `${label}: IDs duplicados em ${collection}`)
  }
  const metricIds = new Set(workspace.metrics.map((record) => record.id))
  const feedbackIds = new Set(workspace.feedbacks.map((record) => record.id))
  for (const observation of workspace.observations) {
    assert.ok(metricIds.has(observation.metricId), `${label}: observação órfã`)
  }
  for (const feedback of workspace.feedbacks) {
    for (const id of feedback.metricIds) assert.ok(metricIds.has(id), `${label}: feedback referencia ${id}`)
  }
  for (const decision of workspace.decisions) {
    for (const id of decision.metricIds) assert.ok(metricIds.has(id), `${label}: decisão referencia ${id}`)
    for (const id of decision.feedbackIds) assert.ok(feedbackIds.has(id), `${label}: decisão referencia ${id}`)
  }
}

async function openTour(page) {
  await page.getByRole('button', { name: 'Como funciona' }).click()
  await dialog(page).waitFor()
  await dialog(page).locator('h2').waitFor()
}

/** Abre o tour confirmando o aviso de rascunho quando ele aparece. */
async function startTour(page) {
  await openTour(page)
  if ((await dialog(page).locator('h2').innerText()) === 'Iniciar o tour?') {
    await button(dialog(page), 'Iniciar tour').click()
  }
}

async function panelState(page) {
  return page.evaluate((selectors) => {
    const panel = document.querySelector('[role="dialog"]')
    if (!panel) return null
    const rect = panel.getBoundingClientRect()
    const outline = document.querySelector(selectors.highlight)
    const moduleLine = [...panel.querySelectorAll('p')].find((item) => item.querySelector('svg'))
    const outlineRect = outline?.getBoundingClientRect()
    return {
      title: panel.querySelector('h2')?.textContent?.trim(),
      progress: panel.querySelector('p.font-mono')?.textContent?.trim(),
      module: moduleLine?.textContent?.trim(),
      buttons: [...panel.querySelectorAll('button')].map((item) => ({
        text: item.textContent.trim(),
        disabled: item.disabled,
      })),
      outline: outlineRect
        ? { top: outlineRect.top, left: outlineRect.left, width: outlineRect.width, height: outlineRect.height }
        : null,
      panel: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      activeInPanel: panel.contains(document.activeElement),
      activeTag: document.activeElement.tagName,
      inert: document.getElementById('root').inert,
      status: panel.querySelector('[role="status"]')?.textContent?.trim() ?? null,
    }
  }, { highlight: HIGHLIGHT_SELECTOR })
}

async function outlineMatches(page, targetId) {
  return page.evaluate((value) => {
    const target = document.querySelector(`[data-tour-id="${value}"]`)
    const outline = document.querySelector('div[aria-hidden="true"][class*="outline-primary"]')
    if (!target || !outline) return null
    const a = target.getBoundingClientRect()
    const b = outline.getBoundingClientRect()
    return {
      dx: Math.abs(a.left - b.left),
      dy: Math.abs(a.top - b.top),
      dw: Math.abs(a.width - b.width),
      dh: Math.abs(a.height - b.height),
      targetWidth: a.width,
      targetHeight: a.height,
    }
  }, targetId)
}

async function waitHighlight(page, present, timeout = 6000) {
  if (present) {
    await page.waitForFunction(
      (selector) => Boolean(document.querySelector(selector)),
      HIGHLIGHT_SELECTOR,
      { timeout },
    )
  } else {
    await page.waitForTimeout(800)
    assert.equal(await page.locator(HIGHLIGHT_SELECTOR).count(), 0, 'destaque inesperado')
  }
}

function runBrowser(name, fn, options = {}) {
  test(name, async () => {
    const browser = await chromium.launch()
    try {
      const context = await browser.newContext({ viewport: options.viewport ?? { width: 1280, height: 800 } })
      context.setDefaultTimeout(10000)
      const page = await context.newPage()
      const events = instrument(page)
      await fn(page, context, events)
      assertClean(name, events)
    } finally {
      await browser.close()
    }
  })
}

/* ------------------------------------------------------------------ */
/* Interactive Product Case                                            */
/* ------------------------------------------------------------------ */

runBrowser('4C5B3B-01 Interactive Case: abertura, contexto simulado, indicador inicial e gráfico', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()

  assert.equal(await page.locator('h1').innerText(), ROUTE_TITLES['interactive-case'], 'título do caso')
  assert.equal(await page.getByText('Cenário simulado', { exact: true }).count(), 1, 'badge de cenário simulado')
  assert.equal(
    await page.getByText(
      'Cenário simulado: os indicadores apresentados não representam dados reais de produção do ProfResolve.',
      { exact: true },
    ).count(),
    1,
    'aviso de simulação',
  )
  assert.equal(await page.getByText('Pergunta principal', { exact: true }).count(), 1)
  await page.getByText(/A conversão de usuários gratuitos para Premium apresentou uma queda/).waitFor()

  for (const phase of ['Investigar', 'Analisar', 'Decidir']) {
    assert.equal(await page.getByText(phase, { exact: true }).count() >= 1, true, `fase ${phase}`)
  }

  const cards = await page.locator('section[aria-labelledby="case-metrics-title"] > div.grid > div').allInnerTexts()
  assert.equal(cards.length, 3, 'três indicadores simulados')
  assert.match(cards[0].replace(/\n+/g, ' '), /Conversão de usuários gratuitos para Premium.*5,2%.*3,4%.*Desfavorável.*-1,8 p\.p\./)
  assert.match(cards[1].replace(/\n+/g, ' '), /Conclusão do onboarding gratuito.*60%.*43%.*Desfavorável.*-17 p\.p\./)
  assert.match(cards[2].replace(/\n+/g, ' '), /Visitas à página de planos Premium.*3\.200.*4\.200.*Favorável.*\+1\.000/)

  const selectedButtons = await page.locator('[aria-pressed="true"]').allInnerTexts()
  assert.deepEqual(selectedButtons, ['Conversão de usuários gratuitos para Premium'], 'indicador inicialmente selecionado')

  assert.equal(await page.locator('figure svg').count(), 1, 'gráfico renderizado')
  assert.match(
    await page.locator('figure figcaption').innerText(),
    /Conversão de usuários gratuitos para Premium: queda de 5,2% em jun\/2026 para 3,4% em set\/2026, ao longo de 4 períodos\. Períodos observados: jun\/2026: 5,2%; jul\/2026: 4,8%; ago\/2026: 4,1%; set\/2026: 3,4%\./,
  )
  assert.equal(
    await page.getByText(/Indicadores simulados de jun\/2026 a set\/2026\. As variações comparam a primeira e a última observação de cada série\./).count(),
    1,
    'descrição dos períodos',
  )
  console.log('PASS 4C5B3B-01')
})

runBrowser('4C5B3B-02 Interactive Case: alternância de indicadores atualiza seleção, gráfico e interpretação', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  const curve = page.locator('.recharts-line-curve')
  const conversionCurve = await curve.getAttribute('d')

  await page.getByRole('button', { name: 'Conclusão do onboarding gratuito', exact: true }).click()
  assert.deepEqual(await page.locator('[aria-pressed="true"]').allInnerTexts(), ['Conclusão do onboarding gratuito'])
  await page.locator('section[aria-labelledby="case-investigation-title"] p')
    .filter({ hasText: 'Conclusão do onboarding gratuito: queda de 60% em jun/2026 para 43% em set/2026' })
    .first()
    .waitFor()
  assert.equal(await page.getByText('Variação no intervalo:').count(), 1)
  assert.match(await page.locator('section[aria-labelledby="case-investigation-title"]').innerText(), /-17 p\.p\./)
  assert.match(await page.locator('figure figcaption').innerText(), /set\/2026: 43%/)

  await page.getByRole('button', { name: 'Visitas à página de planos Premium', exact: true }).click()
  assert.deepEqual(await page.locator('[aria-pressed="true"]').allInnerTexts(), ['Visitas à página de planos Premium'])
  await page.locator('section[aria-labelledby="case-investigation-title"] p')
    .filter({ hasText: 'Visitas à página de planos Premium: aumento de 3.200 em jun/2026 para 4.200 em set/2026' })
    .first()
    .waitFor()
  assert.match(await page.locator('section[aria-labelledby="case-investigation-title"]').innerText(), /\+1\.000/)
  assert.match(await page.locator('figure figcaption').innerText(), /set\/2026: 4\.200/)
  const visitsCurve = await curve.getAttribute('d')
  assert.notEqual(visitsCurve, conversionCurve, 'gráfico não mudou entre séries com sentidos opostos')
  assert.equal(await page.getByText('Variação no intervalo:').count(), 1, 'apenas uma variação exibida')

  const counts = {}
  for (const [metric, expected] of [
    ['Conversão de usuários gratuitos para Premium', 'Exibindo 8 de 8 feedback(s).'],
    ['Conclusão do onboarding gratuito', 'Exibindo 3 de 8 feedback(s).'],
    ['Visitas à página de planos Premium', 'Exibindo 3 de 8 feedback(s).'],
  ]) {
    await page.getByRole('button', { name: metric, exact: true }).click()
    await page.locator('#case-feedback-filter').selectOption('related')
    counts[metric] = await page.getByText(/Exibindo \d+ de \d+ feedback/).innerText()
    assert.equal(counts[metric], expected, `filtro relacionado a ${metric}`)
    await page.locator('#case-feedback-filter').selectOption('all')
  }
  assert.equal(await page.getByText('Exibindo 8 de 8 feedback(s).', { exact: true }).count(), 1, 'filtro volta a todos')

  await page.getByRole('button', { name: 'Conversão de usuários gratuitos para Premium', exact: true }).click()
  await page.locator('section[aria-labelledby="case-investigation-title"] p')
    .filter({ hasText: 'Conversão de usuários gratuitos para Premium: queda de 5,2% em jun/2026 para 3,4%' })
    .first()
    .waitFor()
  assert.match(await page.locator('figure figcaption').innerText(), /jun\/2026: 5,2%; jul\/2026: 4,8%; ago\/2026: 4,1%; set\/2026: 3,4%/)
  console.log('PASS 4C5B3B-02')
})

runBrowser('4C5B3B-03 Interactive Case: feedbacks, fonte/categoria, seleção de evidências e preservação', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()

  const section = page.locator(FEEDBACK_SECTION)
  assert.equal(await page.locator('input[type=checkbox][id^="case-evidence-"]').count(), 8, 'oito relatos disponíveis')
  assert.equal(await section.getByText('Dado simulado', { exact: true }).count(), 8, 'marcação de dado simulado')
  for (const [label, expected] of [['Usabilidade', 3], ['Preço', 2], ['Desempenho', 1], ['Survey', 2], ['Entrevista', 2], ['Ticket de suporte', 1], ['Comunidade', 2], ['Avaliação do app', 1]]) {
    assert.equal(await section.getByText(label, { exact: true }).count(), expected, `rótulo ${label}`)
  }
  assert.match(
    await section.innerText(),
    /Feedbacks ajudam a formular hipóteses, mas não comprovam, isoladamente, a causa de uma variação nos indicadores\./,
  )

  await page.locator('#case-evidence-case-feedback-onboarding-turma').check()
  await page.locator('#case-evidence-case-feedback-plan-comparison').check()
  const summary = page.locator('section[aria-labelledby="case-evidence-title"]')
  assert.match(await summary.innerText(), /2 evidências selecionadas/)
  assert.equal(await page.getByRole('button', { name: 'Limpar seleção', exact: true }).count(), 1)

  await page.getByRole('button', { name: 'Visitas à página de planos Premium', exact: true }).click()
  assert.equal(await page.locator('#case-evidence-case-feedback-onboarding-turma').isChecked(), true, 'evidência perdida ao trocar de indicador')
  assert.equal(await page.locator('#case-evidence-case-feedback-plan-comparison').isChecked(), true)
  assert.match(await summary.innerText(), /2 evidências selecionadas/)

  await page.getByRole('button', { name: /^Remover evidência:/ }).first().click()
  assert.match(await summary.innerText(), /1 evidência selecionada/)
  assert.match(
    await page.locator('section[aria-labelledby="case-investigation-title"]').innerText(),
    /Os indicadores podem apresentar tendências simultâneas sem que isso comprove relação causal\./,
  )
  assert.equal(await page.getByText('Evidência selecionada', { exact: true }).count(), 1, 'rótulo do checkbox atualizado')

  await page.getByRole('button', { name: 'Limpar seleção', exact: true }).click()
  await page.getByText(/Você ainda não selecionou evidências\./).waitFor()
  console.log('PASS 4C5B3B-03')
})

runBrowser('4C5B3B-04 Interactive Case: hipótese — registro, edição, obrigatoriedade e ausência de classificação', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()

  const field = page.locator('#case-hypothesis')
  assert.equal(await field.inputValue(), '', 'hipótese inicia vazia')
  assert.equal(await field.getAttribute('maxlength'), '1000')
  assert.equal(await field.getAttribute('required'), null, 'campo não usa required nativo')
  assert.equal(await page.getByText('0 de 1000 caracteres.', { exact: true }).count(), 1, 'contador de caracteres')

  await field.fill('curta')
  assert.equal(await page.getByText('5 de 1000 caracteres.', { exact: true }).count(), 1)
  assert.equal(await page.locator(SUMMARY).count(), 0, 'síntese visível antes do acionamento')
  await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).click()
  await page.getByText('Ainda faltam requisitos para visualizar a síntese.').waitFor()
  let missing = await page.locator(`${SUMMARY} li`).allInnerTexts()
  assert.deepEqual(missing, [
    'Escreva uma hipótese para continuar.',
    'Selecione pelo menos uma evidência.',
    'Escolha uma alternativa de decisão.',
  ])
  assert.equal(await page.getByText('Seus dados preenchidos foram mantidos.', { exact: true }).count(), 1)

  await field.fill('A queda de conversão pode estar ligada à ativação incompleta.')
  missing = await page.locator(`${SUMMARY} li`).allInnerTexts()
  assert.equal(missing.includes('Escreva uma hipótese para continuar.'), false, 'mensagem de hipótese não desapareceu')
  assert.equal(await field.inputValue(), 'A queda de conversão pode estar ligada à ativação incompleta.')
  assert.equal(await page.getByText('Sua hipótese (não verificada)', { exact: true }).count(), 0, 'síntese exibida sem evidência e alternativa')

  await page.locator('#case-evidence-case-feedback-activation-value').check()
  await page.locator('#case-decision-option-case-option-clarify-plans').check()
  await page.getByText('Sua hipótese (não verificada)', { exact: true }).waitFor()
  assert.match(await page.locator(SUMMARY).innerText(), /A queda de conversão pode estar ligada à ativação incompleta\./)
  assert.equal(await page.getByText('Acerto', { exact: true }).count(), 0, 'classificação automática de acerto')
  assert.equal(await page.getByText('Correta', { exact: true }).count(), 0, 'classificação automática de correção')
  console.log('PASS 4C5B3B-04')
})

runBrowser('4C5B3B-05 Interactive Case: alternativas — seleção, troca, dependências e preservação', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()

  const radios = page.locator('input[name="case-decision-option"]')
  assert.equal(await radios.count(), 3, 'três alternativas')
  assert.equal(await page.locator('input[name="case-decision-option"]:checked').count(), 0, 'alternativa pré-selecionada')
  assert.match(
    await page.locator('section[aria-labelledby="case-decision-options-title"]').innerText(),
    /As três alternativas são hipotéticas e não indicam qual delas é superior\./,
  )

  await page.locator('#case-evidence-case-feedback-onboarding-turma').check()
  await page.locator('#case-evidence-case-feedback-plan-comparison').check()
  await page.locator('#case-decision-option-case-option-improve-onboarding').check()
  const options = page.locator('section[aria-labelledby="case-decision-options-title"]')
  assert.equal(await options.getByText('Selecionada', { exact: true }).count(), 1, 'marcação da alternativa escolhida')
  assert.match(await options.innerText(), /Evidências selecionadas relacionadas a esta alternativa[\s\S]*Tentei configurar minha primeira turma/)
  assert.match(await options.innerText(), /Outras evidências selecionadas[\s\S]*A página de planos lista os recursos/)

  await page.locator('#case-decision-option-case-option-clarify-plans').check()
  assert.equal(await page.locator('#case-decision-option-case-option-improve-onboarding').isChecked(), false, 'alternativa antiga permaneceu marcada')
  assert.match(await options.innerText(), /Evidências selecionadas relacionadas a esta alternativa[\s\S]*A página de planos lista os recursos/)
  assert.match(await options.innerText(), /Outras evidências selecionadas[\s\S]*Tentei configurar minha primeira turma/)

  await page.locator('#case-hypothesis').fill('Hipótese fictícia mantida durante a troca de alternativa.')
  assert.equal(await page.locator('#case-decision-option-case-option-clarify-plans').isChecked(), true, 'alternativa perdida após editar hipótese')
  assert.equal(await page.locator('#case-evidence-case-feedback-onboarding-turma').isChecked(), true, 'evidência perdida após trocar alternativa')
  console.log('PASS 4C5B3B-05')
})

runBrowser('4C5B3B-06 Interactive Case: síntese final, correspondência de dados e comportamento de foco', async (page) => {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()

  await page.getByRole('button', { name: 'Conclusão do onboarding gratuito', exact: true }).click()
  await page.locator('#case-evidence-case-feedback-onboarding-turma').check()
  await page.locator('#case-hypothesis').fill('A queda pode estar ligada ao onboarding confuso.')
  await page.locator('#case-decision-option-case-option-improve-onboarding').check()
  await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).click()
  const section = page.locator(SUMMARY)
  await page.getByText('Sua decisão de produto', { exact: true }).waitFor()

  const text = await section.innerText()
  assert.match(text, /A conversão simulada de usuários gratuitos para o Premium caiu de 5,2% para 3,4% ao longo de quatro períodos, enquanto as visitas à página de planos aumentaram\. A causa não está estabelecida\./)
  assert.match(text, /INDICADOR EM ANÁLISE[\s\S]*Conclusão do onboarding gratuito/)
  assert.match(text, /EVIDÊNCIAS ESCOLHIDAS \(RELATOS FICTÍCIOS\)[\s\S]*Tentei configurar minha primeira turma/)
  assert.match(text, /SUA HIPÓTESE \(NÃO VERIFICADA\)[\s\S]*A queda pode estar ligada ao onboarding confuso\./)
  assert.match(text, /DIREÇÃO ESCOLHIDA[\s\S]*Reduzir o esforço de ativação até a primeira turma configurada[\s\S]*Simplificar o onboarding/)
  assert.match(text, /BENEFÍCIOS POTENCIAIS[\s\S]*Ataca diretamente os relatos de abandono/)
  assert.match(text, /RISCOS E LIMITAÇÕES[\s\S]*Pode melhorar a ativação sem aumentar a conversão paga\./)
  assert.match(text, /INFORMAÇÕES QUE AINDA SERIAM NECESSÁRIAS[\s\S]*Dados de abandono por etapa do onboarding\./)
  assert.match(text, /Esta é uma síntese do seu raciocínio dentro do cenário demonstrativo\./)
  assert.match(text, /Escolher uma direção não significa comprovar sua efetividade\./)
  assert.equal(await section.count(), 1, 'seções de síntese duplicadas')
  assert.equal(
    text.split('Tentei configurar minha primeira turma').length - 1,
    1,
    'evidência repetida dentro da síntese',
  )

  // Descoberta da síntese: com o conteúdo disponível, o foco vai para o título da seção.
  const focus = await page.evaluate(() => ({
    tag: document.activeElement.tagName,
    text: document.activeElement.textContent.trim(),
    id: document.activeElement.id,
    inSummary: Boolean(document.querySelector('section[aria-labelledby="case-decision-summary-title"]')?.contains(document.activeElement)),
  }))
  assert.equal(focus.inSummary, true, 'foco não foi movido para a síntese')
  assert.equal(focus.tag, 'H2')
  assert.equal(focus.id, 'case-decision-summary-title')
  assert.equal(focus.text, 'Sua decisão de produto')
  assert.equal(
    await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).getAttribute('aria-controls'),
    'case-decision-summary',
  )
  console.log(`PASS 4C5B3B-06: foco movido para "${focus.text}" ao exibir a síntese`)

  await page.locator('#case-decision-option-case-option-clarify-plans').check()
  const updated = await section.innerText()
  assert.match(updated, /DIREÇÃO ESCOLHIDA[\s\S]*Esclarecer a proposta e a comparação dos planos/)
  assert.equal(updated.includes('Reduzir o esforço de ativação até a primeira turma configurada'), false, 'síntese não acompanhou a troca de alternativa')
  assert.equal(await section.count(), 1, 'síntese duplicada após a troca')

  await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).click()
  assert.equal(await page.locator(SUMMARY).count(), 1, 'nova solicitação duplicou a síntese')
  const refocus = await page.evaluate(() => ({
    id: document.activeElement.id,
    text: document.activeElement.textContent.trim(),
  }))
  assert.equal(refocus.id, 'case-decision-summary-title', 'nova solicitação não reposicionou o foco no título')
  assert.equal(refocus.text, 'Sua decisão de produto')
  console.log('PASS 4C5B3B-06')
})

runBrowser('4C5B3B-07 Isolamento: Workspace vazio não recebe dados e o caso não persiste estado', async (page) => {
  await openApp(page)
  assert.equal(await raw(page), null, 'Workspace inicial não está vazio')

  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Visitas à página de planos Premium', exact: true }).click()
  await page.locator('#case-evidence-case-feedback-plan-comparison').check()
  await page.locator('#case-hypothesis').fill('Hipótese fictícia do teste de isolamento.')
  await page.locator('#case-decision-option-case-option-clarify-plans').check()
  await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).click()
  await page.getByText('Sua decisão de produto', { exact: true }).waitFor()
  assert.equal(await raw(page), null, 'caso gravou no LocalStorage')

  await spaNavigate(page, 'feedbacks')
  await page.getByRole('heading', { name: 'Feedback Discovery', exact: true }).waitFor()
  assert.equal(await raw(page), null, 'navegação para outro módulo gravou dados')
  await spaNavigate(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  assert.equal(await page.locator('#case-hypothesis').inputValue(), '', 'estado em memória sobreviveu à desmontagem')
  assert.equal(await page.locator('input[type=checkbox][id^="case-evidence-"]:checked').count(), 0, 'evidência sobreviveu à desmontagem')
  assert.equal(await page.locator(SUMMARY).count(), 0, 'síntese sobreviveu à desmontagem')
  assert.equal(await page.locator('[aria-pressed="true"]').allInnerTexts().then((all) => all[0]), 'Conversão de usuários gratuitos para Premium', 'indicador não voltou ao inicial')

  await page.reload()
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  assert.equal(await raw(page), null, 'reload gravou dados')
  assert.equal(await page.locator('#case-hypothesis').inputValue(), '')
  console.log('PASS 4C5B3B-07')
})

runBrowser('4C5B3B-08 Isolamento: Workspace preenchido permanece idêntico após o percurso do caso', async (page) => {
  await seedWorkspace(page)
  const before = await raw(page)
  const snapshot = await stored(page)
  assert.equal(snapshot.data.metrics.length, 1)
  assert.equal(snapshot.data.feedbacks.length, 1)
  assert.equal(snapshot.data.decisions.length, 1)

  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Conclusão do onboarding gratuito', exact: true }).click()
  await page.locator('#case-evidence-case-feedback-import-students').check()
  await page.locator('#case-hypothesis').fill('Hipótese fictícia sobre onboarding no workspace preenchido.')
  await page.locator('#case-decision-option-case-option-improve-onboarding').check()
  await page.getByRole('button', { name: 'Ver síntese da minha decisão', exact: true }).click()
  await page.getByText('Sua decisão de produto', { exact: true }).waitFor()

  assert.equal(await raw(page), before, 'caso alterou o Workspace preenchido')
  await spaNavigate(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  assert.equal(await raw(page), before, 'Workspace mudou após sair do caso')
  const after = await stored(page)
  assert.deepEqual(after.data, snapshot.data, 'registros divergentes após o caso')
  assertIntegrity(after.data, '4C5B3B-08')
  assert.equal(await page.getByText('Indicador QA Tour', { exact: true }).count() > 0, true, 'registro do Workspace não está visível')
  console.log('PASS 4C5B3B-08')
})

/* ------------------------------------------------------------------ */
/* Tour "Como funciona"                                                */
/* ------------------------------------------------------------------ */

runBrowser('4C5B3B-09 Tour: acionamento no cabeçalho, sem abertura automática e reinício', async (page, context) => {
  await openApp(page)
  await page.waitForTimeout(700)
  assert.equal(await dialog(page).count(), 0, 'tour abriu sozinho ao carregar')

  const trigger = page.getByRole('button', { name: 'Como funciona', exact: true })
  assert.equal(await trigger.isVisible(), true, 'botão do cabeçalho oculto no desktop')
  await openTour(page)
  let state = await panelState(page)
  assert.equal(state.progress, '1 de 15')
  assert.equal(state.title, STEPS[0].title)
  assert.equal(state.buttons.find((item) => item.text === 'Anterior').disabled, true, 'Anterior habilitado na etapa 1')

  await page.keyboard.press('Escape')
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await dialog(page).count(), 0)
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Como funciona', 'foco não voltou ao acionador')

  await openTour(page)
  state = await panelState(page)
  assert.equal(state.progress, '1 de 15', 'tour não reiniciou na etapa 1')
  await button(dialog(page), 'Sair do tour').click()
  await dialog(page).waitFor({ state: 'hidden' })

  const mobile = await context.browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  mobile.setDefaultTimeout(10000)
  const mobilePage = await mobile.newPage()
  const mobileEvents = instrument(mobilePage)
  await openApp(mobilePage)
  await mobilePage.waitForTimeout(500)
  assert.equal(await mobilePage.getByRole('dialog').count(), 0, 'tour abriu sozinho no mobile')
  const mobileTrigger = mobilePage.getByRole('button', { name: 'Como funciona', exact: true })
  assert.equal(await mobileTrigger.isVisible(), true, 'botão do cabeçalho oculto no mobile')
  const box = await mobileTrigger.boundingBox()
  assert.ok(box.height >= 44, `altura do botão no mobile: ${box.height}`)
  await openTour(mobilePage)
  const mobileState = await panelState(mobilePage)
  assert.equal(mobileState.progress, '1 de 15')
  assert.ok(mobileState.panel.left >= 0 && mobileState.panel.right <= 390, 'painel fora da viewport no mobile')
  await mobilePage.keyboard.press('Escape')
  await mobilePage.getByRole('dialog').waitFor({ state: 'hidden' })
  assertClean('4C5B3B-09 mobile', mobileEvents)
  await mobile.close()
  console.log('PASS 4C5B3B-09')
})

runBrowser('4C5B3B-10 Tour: teclado, foco inicial, ciclo de Tab, Escape e retorno de foco', async (page) => {
  await openApp(page)
  const trigger = page.getByRole('button', { name: 'Como funciona', exact: true })

  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('dialog').locator('h2').waitFor()
  let state = await panelState(page)
  assert.equal(state.activeTag, 'H2', 'foco inicial não está no título')
  assert.equal(state.inert, true, '#root não ficou inerte')
  const described = await page.evaluate(() => {
    const panel = document.querySelector('[role="dialog"]')
    const labelledby = panel.getAttribute('aria-labelledby')
    const describedby = panel.getAttribute('aria-describedby')
    return {
      modal: panel.getAttribute('aria-modal'),
      labelled: Boolean(labelledby && document.getElementById(labelledby)?.textContent.trim()),
      described: Boolean(describedby && document.getElementById(describedby)?.textContent.trim()),
      names: [...panel.querySelectorAll('button')].every((item) => (item.getAttribute('aria-label') || item.textContent).trim().length > 0),
    }
  })
  assert.equal(described.modal, 'true')
  assert.equal(described.labelled, true, 'diálogo sem nome acessível')
  assert.equal(described.described, true, 'diálogo sem descrição acessível')
  assert.equal(described.names, true, 'botão sem rótulo acessível')

  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Sair do tour', 'Shift+Tab do título não foi ao último botão')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Próximo', 'Tab do último botão não voltou ao primeiro habilitado')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Pular bloco')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Sair do tour')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Próximo', 'Tab não circulou dentro do painel')
  state = await panelState(page)
  assert.equal(state.activeInPanel, true, 'foco escapou do painel')
  assert.equal(state.inert, true)

  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(await page.evaluate(() => document.getElementById('root').inert), false, '#root permaneceu inerte')
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Como funciona', 'foco não retornou ao acionador')

  await trigger.press(' ')
  await page.getByRole('dialog').locator('h2').waitFor()
  assert.equal((await panelState(page)).progress, '1 de 15', 'abertura por Space falhou')
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  console.log('PASS 4C5B3B-10')
})

runBrowser('4C5B3B-11 Tour: 15 etapas — ordem, blocos, títulos, módulos, rotas, progresso e controles', async (page) => {
  await openApp(page)
  await openTour(page)
  const titles = []
  const targeted = new Set()
  const presentInEmptyWorkspace = new Set([2, 3, 4, 7, 10, 13, 15])

  for (const [index, step] of STEPS.entries()) {
    if (index > 0) {
      await button(dialog(page), 'Próximo').click()
    }
    const present = presentInEmptyWorkspace.has(index + 1)
    await waitHighlight(page, present)
    const state = await panelState(page)
    assert.equal(state.progress, step.progress, `progresso da etapa ${index + 1}`)
    assert.equal(state.title, step.title, `título da etapa ${index + 1}`)
    assert.equal(state.module, step.module, `módulo da etapa ${index + 1}`)
    assert.equal(await hash(page), `#/${step.route}`, `rota da etapa ${index + 1}`)
    await page.locator('h1').filter({ hasText: ROUTE_TITLES[step.route] }).waitFor()
    assert.equal(state.buttons.filter((item) => item.text === 'Anterior').length, 1, `Anterior ausente na etapa ${index + 1}`)
    const primary = index === STEPS.length - 1 ? 'Concluir' : 'Próximo'
    assert.equal(state.buttons.filter((item) => item.text === primary).length, 1, `${primary} ausente na etapa ${index + 1}`)
    assert.equal(state.buttons.filter((item) => item.text === 'Sair do tour').length, 1, `Sair ausente na etapa ${index + 1}`)
    assert.equal(state.buttons.filter((item) => item.text === 'Anterior')[0].disabled, index === 0, `estado de Anterior na etapa ${index + 1}`)
    assert.equal(state.activeInPanel, true, `foco fora do painel na etapa ${index + 1}`)
    assert.equal(state.horizontalOverflow, false, `overflow horizontal na etapa ${index + 1}`)
    assert.equal(state.status, index === 0 ? null : `Etapa ${step.progress}: ${step.title}`, `região de status na etapa ${index + 1}`)
    if (present) {
      const match = await outlineMatches(page, step.target)
      assert.ok(match, `destaque de ${step.target} ausente`)
      assert.ok(match.dx <= 1 && match.dy <= 1 && match.dw <= 1 && match.dh <= 1, `contorno não corresponde a ${step.target}`)
      targeted.add(step.target)
    }
    titles.push(state.title)
  }

  assert.equal(new Set(titles).size, 15, 'títulos duplicados no roteiro')
  assert.equal(targeted.size, 7, `alvos distintos destacados no Workspace vazio: ${[...targeted].join(', ')}`)
  assert.equal(await page.getByRole('button', { name: 'Pular bloco' }).count(), 0, 'Pular bloco visível na última etapa')
  await button(dialog(page), 'Concluir').click()
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await hash(page), '#/overview', 'rota de origem não restaurada ao concluir')
  console.log('PASS 4C5B3B-11')
})

runBrowser('4C5B3B-12 Tour: Pular bloco avança ao primeiro passo do bloco seguinte', async (page) => {
  await openApp(page)
  await openTour(page)
  const panel = dialog(page)

  await button(panel, 'Pular bloco').click()
  let state = await panelState(page)
  assert.equal(state.progress, '4 de 15', 'Pular bloco da etapa 1')
  assert.equal(state.title, STEPS[3].title)
  assert.equal(await panel.count(), 1, 'Pular bloco encerrou o tour')

  await button(panel, 'Pular bloco').click()
  state = await panelState(page)
  assert.equal(state.progress, '7 de 15', 'Pular bloco do último passo do bloco B')
  assert.equal(state.title, STEPS[6].title)

  await button(panel, 'Pular bloco').click()
  state = await panelState(page)
  assert.equal(state.progress, '10 de 15', 'Pular bloco do bloco C')

  await button(panel, 'Pular bloco').click()
  state = await panelState(page)
  assert.equal(state.progress, '13 de 15', 'Pular bloco do bloco D')
  assert.equal(state.buttons.some((item) => item.text === 'Pular bloco'), false, 'Pular bloco visível no bloco E')
  assert.equal(state.buttons.some((item) => item.text === 'Sair do tour'), true, 'Sair do tour ausente no bloco E')

  await button(panel, 'Anterior').click()
  state = await panelState(page)
  assert.equal(state.progress, '12 de 15', 'Anterior não voltou uma etapa')
  await button(panel, 'Sair do tour').click()
  await panel.waitFor({ state: 'hidden' })
  console.log('PASS 4C5B3B-12')
})

runBrowser('4C5B3B-13 Tour: encerramento por Sair, Escape e Concluir restaura rota, parâmetro e foco', async (page) => {
  await openApp(page)
  const trigger = page.getByRole('button', { name: 'Como funciona', exact: true })
  const cases = []

  await openTour(page)
  await button(dialog(page), 'Próximo').click()
  await button(dialog(page), 'Próximo').click()
  await button(dialog(page), 'Sair do tour').click()
  await dialog(page).waitFor({ state: 'hidden' })
  cases.push(['Sair', await hash(page), await page.evaluate(() => document.activeElement.textContent.trim())])

  await openTour(page)
  await button(dialog(page), 'Próximo').click()
  await page.keyboard.press('Escape')
  await dialog(page).waitFor({ state: 'hidden' })
  cases.push(['Escape', await hash(page), await page.evaluate(() => document.activeElement.textContent.trim())])

  await openTour(page)
  for (let index = 0; index < 4; index += 1) await button(dialog(page), 'Pular bloco').click()
  await button(dialog(page), 'Próximo').click()
  await button(dialog(page), 'Próximo').click()
  assert.equal((await panelState(page)).progress, '15 de 15')
  await button(dialog(page), 'Concluir').click()
  await dialog(page).waitFor({ state: 'hidden' })
  cases.push(['Concluir', await hash(page), await page.evaluate(() => document.activeElement.textContent.trim())])

  for (const [label, location, focus] of cases) {
    assert.equal(location, '#/overview', `${label}: rota de origem não restaurada`)
    assert.equal(focus, 'Como funciona', `${label}: foco não retornou ao acionador`)
  }
  assert.equal(await page.locator('[role="dialog"]').count(), 0, 'diálogo do tour permaneceu aberto')

  await createDecision(page, 'Decisão QA parâmetro do tour')
  const detailHash = await hash(page)
  assert.match(detailHash, /^#\/decisions\?record=/)
  await page.getByRole('button', { name: 'Como funciona', exact: true }).click()
  await page.getByRole('dialog').locator('h2').waitFor()
  await button(dialog(page), 'Próximo').click()
  assert.equal(await hash(page), '#/overview', 'navegação do tour não ocorreu')
  await page.keyboard.press('Escape')
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await hash(page), detailHash, 'parâmetro de detalhe não restaurado')
  await page.getByRole('heading', { name: 'Decisão QA parâmetro do tour', exact: true }).waitFor()
  console.log('PASS 4C5B3B-13')
})

runBrowser('4C5B3B-14 Tour: navegação entre os quatro módulos a partir de cada origem', async (page) => {
  const origins = ['overview', 'feedbacks', 'decisions', 'interactive-case']
  const expected = [
    [null, 'overview'],
    ['Pular bloco', 'overview'],
    ['Pular bloco', 'feedbacks'],
    ['Pular bloco', 'decisions'],
    ['Pular bloco', 'interactive-case'],
  ]

  for (const origin of origins) {
    await go(page, origin)
    await page.locator('h1').filter({ hasText: ROUTE_TITLES[origin] }).waitFor()
    const startHash = await hash(page)
    await startTour(page)
    for (const [control, route] of expected) {
      if (control) await button(dialog(page), control).click()
      await page.waitForFunction((value) => location.hash === value, `#/${route}`)
      await page.locator('h1').filter({ hasText: ROUTE_TITLES[route] }).waitFor()
      assert.equal((await panelState(page)).inert, true, `${origin}: app não ficou inerte`)
    }
    await button(dialog(page), 'Próximo').click()
    await button(dialog(page), 'Próximo').click()
    assert.equal((await panelState(page)).progress, '15 de 15', `${origin}: não chegou à última etapa`)
    await button(dialog(page), 'Concluir').click()
    await dialog(page).waitFor({ state: 'hidden' })
    assert.equal(await hash(page), startHash, `${origin}: origem não restaurada`)
    await page.locator('h1').filter({ hasText: ROUTE_TITLES[origin] }).waitFor()
  }
  console.log('PASS 4C5B3B-14')
})

runBrowser('4C5B3B-15 Tour: destaques corretos, alvos ausentes e alvo oculto no mobile', async (page, context) => {
  await openApp(page)
  await openTour(page)
  const panel = dialog(page)

  const visibleTargets = new Set([2, 3, 4, 7, 10, 13, 15])
  for (const [index, step] of STEPS.entries()) {
    if (index > 0) await button(panel, 'Próximo').click()
    if (visibleTargets.has(index + 1)) {
      await waitHighlight(page, true)
      const match = await outlineMatches(page, step.target)
      assert.ok(match && match.dx <= 1 && match.dy <= 1, `alvo incorreto na etapa ${index + 1}`)
    } else {
      await waitHighlight(page, false)
    }
  }
  await button(panel, 'Concluir').click()
  await panel.waitFor({ state: 'hidden' })

  const mobile = await context.browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  mobile.setDefaultTimeout(10000)
  const mobilePage = await mobile.newPage()
  const mobileEvents = instrument(mobilePage)
  await openApp(mobilePage)
  await openTour(mobilePage)
  const mobilePanel = mobilePage.getByRole('dialog')

  await waitHighlight(mobilePage, false)
  await button(mobilePanel, 'Próximo').click()
  await mobilePage.waitForTimeout(1500)
  assert.equal(await mobilePage.locator(HIGHLIGHT_SELECTOR).count(), 0, 'menu lateral destacado no mobile (alvo oculto)')
  const mobileState = await panelState(mobilePage)
  assert.match(mobileState.title, /O fluxo e a navegação/)
  await button(mobilePanel, 'Próximo').click()
  await mobilePage.waitForTimeout(1200)
  assert.equal(await mobilePage.locator(HIGHLIGHT_SELECTOR).count(), 1, 'prévia demonstrativa sem destaque no mobile')
  const bigOutline = (await panelState(mobilePage)).outline
  assert.ok(bigOutline.height > 844, 'contorno grande: comportamento registrado')
  assert.ok(bigOutline.top >= 0, 'contorno iniciou fora da viewport')
  await mobilePage.keyboard.press('Escape')
  await mobilePanel.waitFor({ state: 'hidden' })
  assertClean('4C5B3B-15 mobile', mobileEvents)
  await mobile.close()
  console.log('PASS 4C5B3B-15')
})

runBrowser('4C5B3B-16 Tour: Workspace preenchido — destaques condicionais e ausência da prévia', async (page) => {
  await seedWorkspace(page)
  await openTour(page)
  const panel = dialog(page)
  const results = []
  const expectedPresent = new Set([2, 4, 5, 7, 8, 10, 12, 13, 15])

  for (const [index, step] of STEPS.entries()) {
    if (index > 0) await button(panel, 'Próximo').click()
    const present = expectedPresent.has(index + 1)
    await waitHighlight(page, present)
    results.push({ index: index + 1, present, target: step.target })
  }

  for (const result of results) {
    assert.equal(result.present, expectedPresent.has(result.index), `etapa ${result.index} (${result.target ?? 'sem alvo'}): destaque ${result.present ? 'presente' : 'ausente'}`)
  }
  assert.equal(results.find((item) => item.index === 3).present, false, 'prévia demonstrativa destacada com Workspace preenchido')
  await button(panel, 'Concluir').click()
  await panel.waitFor({ state: 'hidden' })
  console.log('PASS 4C5B3B-16')
})

runBrowser('4C5B3B-17 Tour: nenhuma gravação no Workspace (vazio e preenchido)', async (page) => {
  await openApp(page)
  assert.equal(await raw(page), null, 'Workspace inicial não está vazio')
  await openTour(page)
  for (let index = 0; index < 4; index += 1) await button(dialog(page), 'Pular bloco').click()
  await button(dialog(page), 'Próximo').click()
  await button(dialog(page), 'Próximo').click()
  await button(dialog(page), 'Concluir').click()
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await raw(page), null, 'tour gravou em Workspace vazio')

  await seedWorkspace(page)
  const before = await raw(page)
  const snapshot = await stored(page)
  await openTour(page)
  for (let index = 0; index < 14; index += 1) {
    await button(dialog(page), 'Próximo').click()
  }
  await button(dialog(page), 'Concluir').click()
  await dialog(page).waitFor({ state: 'hidden' })
  const after = await raw(page)
  assert.equal(after, before, 'tour alterou o LocalStorage preenchido')
  assert.deepEqual((await stored(page)).data, snapshot.data, 'dados do Workspace divergentes após o tour')
  assertIntegrity(snapshot.data, '4C5B3B-17')
  console.log('PASS 4C5B3B-17')
})

runBrowser('4C5B3B-18 Tour: proteção de rascunhos — decisão, situação e heurística', async (page) => {
  await go(page, 'decisions')
  await button(page, 'Nova decisão').click()
  await page.locator('#decision-title').fill('Rascunho QA não salvo')
  await page.locator('#decision-problem').fill('Problema QA em edição')
  const before = await raw(page)

  await openTour(page)
  const panel = dialog(page)
  assert.equal(await panel.getByRole('heading').innerText(), 'Iniciar o tour?', 'confirmação não exibida com formulário em edição')
  assert.equal(await panel.getByRole('button', { name: 'Cancelar', exact: true }).count(), 1)
  assert.equal(await panel.getByRole('button', { name: 'Iniciar tour', exact: true }).count(), 1)

  await button(panel, 'Cancelar').click()
  await panel.waitFor({ state: 'hidden' })
  assert.equal(await hash(page), '#/decisions', 'Cancelar alterou a rota')
  assert.equal(await page.locator('#decision-title').inputValue(), 'Rascunho QA não salvo', 'Cancelar descartou o rascunho')
  assert.equal(await page.locator('#decision-problem').inputValue(), 'Problema QA em edição')
  assert.equal(await raw(page), before, 'Cancelar gravou no Workspace')

  await openTour(page)
  await button(dialog(page), 'Iniciar tour').click()
  await page.waitForTimeout(500)
  assert.equal((await panelState(page)).progress, '1 de 15', 'Iniciar tour não abriu a primeira etapa')
  assert.equal(await page.locator('#decision-form').count(), 0, 'formulário permaneceu após iniciar o tour')
  assert.equal(await raw(page), before, 'início do tour gravou no Workspace')
  await page.keyboard.press('Escape')
  await dialog(page).waitFor({ state: 'hidden' })

  // Segundo cenário: textarea de página no Interactive Case.
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  await openTour(page)
  assert.equal(await dialog(page).getByRole('heading').innerText(), 'Iniciar o tour?', 'falso positivo: confirmação sem rascunho no Interactive Case')
  await button(dialog(page), 'Cancelar').click()
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await page.locator('#case-hypothesis').inputValue(), '', 'Cancelar alterou o campo vazio')

  await page.locator('#case-hypothesis').fill('Hipótese fictícia não confirmada')
  await openTour(page)
  assert.equal(await dialog(page).getByRole('heading').innerText(), 'Iniciar o tour?', 'confirmação não exibida com textarea preenchido')
  await button(dialog(page), 'Cancelar').click()
  await dialog(page).waitFor({ state: 'hidden' })
  assert.equal(await hash(page), '#/interactive-case')
  assert.equal(await page.locator('#case-hypothesis').inputValue(), 'Hipótese fictícia não confirmada', 'Cancelar descartou o texto do caso')
  assert.equal(await raw(page), before, 'cenário do caso gravou no Workspace')

  // Diálogo Radix (portal fora de main): o acionador fica inacessível — heurística não é atingível por esse caminho.
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  await button(page, 'Novo indicador').click()
  await page.locator('#metric-name').fill('Rascunho QA em diálogo')
  assert.equal(await page.evaluate(() => Boolean(document.querySelector('main form, main textarea'))), false)
  assert.equal(await page.getByRole('button', { name: 'Como funciona', exact: true }).count(), 0, 'acionador acessível com diálogo modal aberto')
  console.log('REGISTRO 4C5B3B-18: falso negativo do formulário em portal é inatingível — o diálogo modal bloqueia o acionador')
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })

  // Falso positivo: uma página sem rascunho real pode conter textarea de leitura? Não há; registra-se a ausência.
  await go(page, 'feedbacks')
  await button(page, 'Novo feedback').click()
  await page.locator('#feedback-content').fill('Rascunho QA de feedback')
  assert.equal(await page.getByRole('button', { name: 'Como funciona', exact: true }).count(), 0, 'falso positivo: acionador acessível com diálogo de feedback')
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  console.log('PASS 4C5B3B-18')
})

runBrowser('4C5B3B-19 Tour: painel dentro da viewport, legibilidade e fechamento no mobile', async (page, context) => {
  const mobile = await context.browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  mobile.setDefaultTimeout(10000)
  const mobilePage = await mobile.newPage()
  const events = instrument(mobilePage)
  await openApp(mobilePage)
  await openTour(mobilePage)
  const panel = mobilePage.getByRole('dialog')

  for (let index = 0; index < 15; index += 1) {
    const state = await panelState(mobilePage)
    assert.equal(state.horizontalOverflow, false, `overflow horizontal na etapa ${index + 1}`)
    assert.ok(state.panel.top >= 0, `painel acima da viewport na etapa ${index + 1}`)
    assert.ok(state.panel.bottom <= 844 + 1, `painel abaixo da viewport na etapa ${index + 1}`)
    assert.ok(state.panel.left >= 0 && state.panel.right <= 391, `painel fora da lateral na etapa ${index + 1}`)
    assert.equal(state.activeInPanel, true, `foco fora do painel na etapa ${index + 1}`)
    const fontSize = await mobilePage.evaluate(() => {
      const panel = document.querySelector('[role="dialog"]')
      const id = panel.getAttribute('aria-describedby')
      const body = id ? document.getElementById(id) : null
      return Number.parseFloat(getComputedStyle(body ?? panel).fontSize)
    })
    assert.ok(fontSize >= 13, `texto pequeno na etapa ${index + 1}: ${fontSize}px`)
    await button(panel, index === 14 ? 'Concluir' : 'Próximo').click()
  }
  await panel.waitFor({ state: 'hidden' })
  assert.equal(await mobilePage.evaluate(() => document.activeElement.textContent.trim()), 'Como funciona', 'foco não retornou no mobile')
  assertClean('4C5B3B-19 mobile', events)
  await mobile.close()
  console.log('PASS 4C5B3B-19')
})

test('4C5B3B-20 resumo da execução', () => {
  console.log('Cobertura de instrumentação: console, pageerror, requestfailed e HTTP >= 400 em todos os contextos, desde a primeira navegação.')
  console.log('Limitações: Chromium only; sem leitor de tela, zoom 200%, contraste medido, Firefox ou WebKit.')
})
