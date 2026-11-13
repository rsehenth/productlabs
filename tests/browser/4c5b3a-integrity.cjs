/**
 * Regressão de integridade 4C.5b.3a — backup, restauração e concorrência entre abas.
 * Uso: PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5b3a-integrity.cjs
 * Dados exclusivamente fictícios, contextos isolados, build de produção em vite preview.
 */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const KEY = 'product-decision-lab:workspace'
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pdl-4c5b3a-'))
const ISO = '2026-09-01T10:00:00.000Z'

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

async function openMetric(page, name) {
  await button(page, `Abrir indicador ${name}`).click()
  await dialog(page).getByRole('heading', { name, exact: true }).waitFor()
}

async function addObservation(page, period, value) {
  const dlg = dialog(page)
  await button(dlg, 'Adicionar observação').click()
  await dlg.locator('#observation-period').fill(period)
  await dlg.locator('#observation-value').fill(value)
  await button(dlg, 'Salvar observação').click()
  await dlg.getByRole('heading', { name: 'Nova observação' }).waitFor({ state: 'hidden' })
}

async function closeMetricDetail(page) {
  await textButton(dialog(page), 'Fechar').click()
  await dialog(page).waitFor({ state: 'hidden' })
}

async function createFeedback(page, content, metricNames = []) {
  await button(page, 'Novo feedback').click()
  const dlg = dialog(page)
  await dlg.locator('#feedback-content').fill(content)
  for (const name of metricNames) {
    await dlg.locator('label', { hasText: name }).locator('input[type=checkbox]').check()
  }
  await button(dlg, 'Criar feedback').click()
  await dlg.waitFor({ state: 'hidden' })
}

async function createDecision(page, { title, problem, hypothesis, decision, status = 'decided', metricNames = [], feedbackTexts = [] }) {
  await go(page, 'decisions')
  await button(page, 'Nova decisão').click()
  await page.locator('#decision-title').fill(title)
  await page.locator('#decision-problem').fill(problem)
  await page.locator('#decision-status').selectOption(status)
  if (hypothesis) await page.locator('#decision-hypothesis').fill(hypothesis)
  if (decision) await page.locator('#decision-text').fill(decision)
  for (const name of metricNames) {
    await page.locator('fieldset label', { hasText: name }).locator('input[type=checkbox]').check()
  }
  for (const text of feedbackTexts) {
    await page.locator('fieldset label', { hasText: text }).locator('input[type=checkbox]').check()
  }
  await button(page, 'Salvar decisão').click()
  await page.waitForFunction(() => location.hash.includes('record='))
  await page.getByRole('heading', { name: title, exact: true }).waitFor()
}

async function seedWorkspace(page) {
  await openApp(page)
  await createMetric(page, 'Indicador QA Receita')
  await openMetric(page, 'Indicador QA Receita')
  await addObservation(page, '2026-08', '10')
  await addObservation(page, '2026-09', '12')
  await closeMetricDetail(page)

  await createMetric(page, 'Indicador QA Ativação')
  await openMetric(page, 'Indicador QA Ativação')
  await addObservation(page, '2026-09', '55')
  await closeMetricDetail(page)

  await go(page, 'feedbacks')
  await createFeedback(page, 'Feedback QA cadastro lento', ['Indicador QA Receita'])
  await createFeedback(page, 'Feedback QA dúvida no plano', ['Indicador QA Ativação'])

  await createDecision(page, {
    title: 'Decisão QA priorizar cadastro',
    problem: 'Problema QA: cadastro lento relatado por usuários.',
    hypothesis: 'Hipótese QA: simplificar o cadastro reduz o abandono.',
    decision: 'Decisão QA: priorizar a simplificação do cadastro.',
    metricNames: ['Indicador QA Receita', 'Indicador QA Ativação'],
    feedbackTexts: ['Feedback QA cadastro lento', 'Feedback QA dúvida no plano'],
  })
  await openApp(page)
}

function assertIntegrity(workspace, label) {
  const collections = ['metrics', 'observations', 'feedbacks', 'decisions']
  for (const collection of collections) {
    const ids = workspace[collection].map((record) => record.id)
    assert.equal(new Set(ids).size, ids.length, `${label}: IDs duplicados em ${collection}`)
  }
  const metricIds = new Set(workspace.metrics.map((record) => record.id))
  const feedbackIds = new Set(workspace.feedbacks.map((record) => record.id))
  for (const observation of workspace.observations) {
    assert.ok(metricIds.has(observation.metricId), `${label}: observação órfã ${observation.id}`)
  }
  for (const feedback of workspace.feedbacks) {
    assert.equal(new Set(feedback.metricIds).size, feedback.metricIds.length, `${label}: feedback duplicado ${feedback.id}`)
    for (const id of feedback.metricIds) assert.ok(metricIds.has(id), `${label}: feedback ${feedback.id} referencia ${id}`)
  }
  for (const decision of workspace.decisions) {
    assert.equal(new Set(decision.metricIds).size, decision.metricIds.length, `${label}: decisão métrica duplicada ${decision.id}`)
    assert.equal(new Set(decision.feedbackIds).size, decision.feedbackIds.length, `${label}: decisão feedback duplicado ${decision.id}`)
    for (const id of decision.metricIds) assert.ok(metricIds.has(id), `${label}: decisão ${decision.id} referencia métrica ${id}`)
    for (const id of decision.feedbackIds) assert.ok(feedbackIds.has(id), `${label}: decisão ${decision.id} referencia feedback ${id}`)
  }
}

async function exportBackup(page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    button(page, 'Exportar backup').click(),
  ])
  const file = path.join(TMP, `export-${Date.now()}.json`)
  await download.saveAs(file)
  return { download, file }
}

function metric(id, name, extra = {}) {
  return {
    id,
    name,
    description: '',
    unit: 'percent',
    desiredDirection: 'increase',
    createdAt: ISO,
    ...extra,
  }
}

function observation(id, metricId, period, value) {
  return { id, metricId, period, value, createdAt: ISO }
}

function feedback(id, content, metricIds = []) {
  return {
    id,
    content,
    category: 'usability',
    source: 'interview',
    receivedAt: ISO,
    metricIds,
  }
}

function decision(id, decisionStep, extra = {}) {
  return {
    id,
    title: `Decisão QA ${id}`,
    problem: 'Problema QA fictício.',
    hypothesis: 'Hipótese QA fictícia.',
    decision: decisionStep,
    status: 'decided',
    metricIds: [],
    feedbackIds: [],
    alternatives: [],
    successCriteria: [],
    nextSteps: [],
    createdAt: ISO,
    updatedAt: ISO,
    ...extra,
  }
}

function envelope(data, schemaVersion = 1) {
  return { schemaVersion, exportedAt: ISO, data }
}

function writeFixture(name, value) {
  const file = path.join(TMP, name)
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value))
  return file
}

async function runBrowser(name, fn) {
  test(name, async () => {
    const browser = await chromium.launch()
    try {
      const context = await browser.newContext()
      context.setDefaultTimeout(8000)
      await fn(context)
    } finally {
      await browser.close()
    }
  })
}

runBrowser('4C5B3A-01 exportação de backup preserva registros e não altera o Workspace', async (context) => {
  const page = await context.newPage()
  const events = instrument(page)
  await seedWorkspace(page)
  const before = await stored(page)
  const beforeRaw = await raw(page)
  assert.equal(before.data.metrics.length, 2)
  assert.equal(before.data.observations.length, 3)
  assert.equal(before.data.feedbacks.length, 2)
  assert.equal(before.data.decisions.length, 1)

  const { download, file } = await exportBackup(page)
  assert.match(download.suggestedFilename(), /^product-decision-lab-backup-\d{4}-\d{2}-\d{2}\.json$/)
  assert.equal(path.extname(download.suggestedFilename()), '.json')
  assert.ok(fs.statSync(file).size > 0, 'arquivo de download vazio')
  await page.getByText('Backup JSON exportado.', { exact: true }).waitFor()

  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.equal(parsed.schemaVersion, 1, 'versão do schema exportado')
  assert.ok(!Number.isNaN(Date.parse(parsed.exportedAt)), 'exportedAt válido')
  assert.equal(parsed.exportedAt.slice(0, 10), new Date().toISOString().slice(0, 10))
  assert.deepEqual(parsed.data, before.data, 'conteúdo exportado difere do persistido')
  assertIntegrity(parsed.data, '4C5B3A-01')
  const exportedDecision = parsed.data.decisions[0]
  assert.deepEqual(
    new Set(exportedDecision.metricIds),
    new Set(before.data.metrics.map((record) => record.id)),
    'associações de indicadores',
  )
  assert.deepEqual(
    new Set(exportedDecision.feedbackIds),
    new Set(before.data.feedbacks.map((record) => record.id)),
    'associações de feedbacks',
  )
  assert.equal(await raw(page), beforeRaw, 'exportação alterou o armazenamento')

  assertClean('4C5B3A-01', events)
  console.log('PASS 4C5B3A-01: exportação íntegra e sem escrita')
  fs.writeFileSync(path.join(TMP, 'valid-export.json'), JSON.stringify(parsed))
  console.log(`FIXTURE valid-export.json -> ${path.join(TMP, 'valid-export.json')}`)
})

runBrowser('4C5B3A-02 importação válida: resumo, cancelamento, confirmação e reload', async (context) => {
  const page = await context.newPage()
  const events = instrument(page)
  await seedWorkspace(page)
  const source = await stored(page)
  const { file } = await exportBackup(page)
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'))

  const fresh = await context.browser().newContext()
  fresh.setDefaultTimeout(8000)
  const target = await fresh.newPage()
  const targetEvents = instrument(target)
  await openApp(target)
  await createMetric(target, 'Indicador Existente QA')
  const existing = await stored(target)
  assert.equal(existing.data.metrics.length, 1)

  await go(target, 'overview')
  await button(target, 'Importar backup').click()
  await target.locator('#backup-file').setInputFiles(file)
  await target.getByText('Resumo do backup', { exact: true }).waitFor()
  const dlg = dialog(target)
  await dlg.getByText('2 indicadores', { exact: true }).waitFor()
  await dlg.getByText('3 observações', { exact: true }).waitFor()
  await dlg.getByText('2 feedbacks', { exact: true }).waitFor()
  await dlg.getByText('1 decisões', { exact: true }).waitFor()
  await button(dlg, 'Cancelar').click()
  await dlg.waitFor({ state: 'hidden' })
  assert.deepEqual((await stored(target)).data, existing.data, 'cancelamento alterou os dados')

  await button(target, 'Importar backup').click()
  await target.locator('#backup-file').setInputFiles(file)
  await target.getByText('Resumo do backup', { exact: true }).waitFor()
  await button(dialog(target), 'Substituir workspace').click()
  await dialog(target).waitFor({ state: 'hidden' })
  await target.getByText(/Backup importado: 2 indicadores, 3 observações, 2 feedbacks e 1 decisões\./).waitFor()

  const imported = await stored(target)
  assert.deepEqual(imported.data, backup.data, 'importado difere do arquivo')
  assertIntegrity(imported.data, '4C5B3A-02')
  assert.deepEqual(imported.data, source.data, 'importado difere da origem')

  await target.reload()
  await target.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  const afterReload = await stored(target)
  assert.deepEqual(afterReload.data, backup.data, 'reload perdeu dados')
  assert.ok(await target.getByText('Indicador QA Receita', { exact: true }).count() > 0)
  assert.ok(await target.getByText('Indicador QA Ativação', { exact: true }).count() > 0)

  await fresh.close()
  assertClean('4C5B3A-02 origem', events)
  assertClean('4C5B3A-02 destino', targetEvents)
  console.log('PASS 4C5B3A-02: importação válida, cancelamento seguro e persistência')
})

runBrowser('4C5B3A-03 importações inválidas não alteram dados preexistentes', async (context) => {
  const page = await context.newPage()
  const events = instrument(page)
  await openApp(page)
  await createMetric(page, 'Indicador Preservado QA')
  const before = await raw(page)
  assert.ok(before)

  const valid = metric('metric-preserved', 'Indicador Preservado QA')
  const fixtures = [
    ['malformado.json', '{ "schemaVersion": 1, ', 'O arquivo não contém JSON válido.'],
    ['estrutura.json', envelope({ metrics: 'não é lista', observations: [], feedbacks: [], decisions: [] }), 'A estrutura do backup é inválida.'],
    ['versao-futura.json', envelope({ metrics: [], observations: [], feedbacks: [], decisions: [] }, 2), 'Backup criado por uma versão mais nova da aplicação.'],
    ['ids-duplicados.json', envelope({ metrics: [valid, { ...valid }], observations: [], feedbacks: [], decisions: [] }), 'O backup contém inconsistências e não foi importado.'],
    ['referencia-inexistente.json', envelope({ metrics: [valid], observations: [observation('obs-orfa', 'metric-inexistente', '2026-09', 1)], feedbacks: [], decisions: [] }), 'O backup contém inconsistências e não foi importado.'],
    ['decisao-incompativel.json', envelope({ metrics: [], observations: [], feedbacks: [], decisions: [decision('dec-incompat', '', { status: 'validated', hypothesis: '' })] }), 'O backup contém uma decisão incompatível com as regras do Workspace.'],
    ['registros-simulados.json', envelope({ metrics: [metric('metric-sim', 'Simulado QA', { simulated: true })], observations: [], feedbacks: [], decisions: [] }), 'O backup contém registros simulados e não foi importado.'],
  ].map(([name, value, expected]) => ({ file: writeFixture(name, value), expected, name }))

  const big = envelope({ metrics: [{ ...valid, description: 'x'.repeat(5 * 1024 * 1024 + 2048) }], observations: [], feedbacks: [], decisions: [] })
  fixtures.push({ file: writeFixture('acima-5mib.json', big), expected: 'O arquivo excede o limite de 5 MB.', name: 'acima-5mib.json' })
  assert.ok(fs.statSync(fixtures.at(-1).file).size > 5 * 1024 * 1024)

  await go(page, 'overview')
  await button(page, 'Importar backup').click()
  const dlg = dialog(page)
  for (const fixture of fixtures) {
    await page.locator('#backup-file').setInputFiles(fixture.file)
    await dlg.getByText(fixture.expected, { exact: false }).first().waitFor()
    assert.equal(await button(dlg, 'Substituir workspace').isDisabled(), true, `${fixture.name}: confirmação habilitada`)
    assert.equal(await raw(page), before, `${fixture.name}: armazenamento alterado`)
    console.log(`PASS fixture recusada: ${fixture.name}`)
  }
  await button(dlg, 'Cancelar').click()
  await dlg.waitFor({ state: 'hidden' })
  assert.equal(await raw(page), before, 'armazenamento alterado após fechar')
  assert.equal((await stored(page)).data.metrics.length, 1)

  assertClean('4C5B3A-03', events)
  console.log('PASS 4C5B3A-03: 8 invalidações recusadas sem escrita')
})

runBrowser('4C5B3A-04 seleção assíncrona: leitura antiga descartada e confirmação protegida', async (context) => {
  const page = await context.newPage()
  await page.addInitScript(() => {
    window.__gates = {}
    window.__resolvers = {}
    window.__primeGate = (name) => {
      window.__gates[name] = new Promise((resolve) => {
        window.__resolvers[name] = resolve
      })
    }
    window.__releaseGate = (name) => window.__resolvers[name] && window.__resolvers[name]()
    const original = File.prototype.text
    File.prototype.text = function () {
      const gate = window.__gates[this.name]
      return gate ? gate.then(() => original.call(this)) : original.call(this)
    }
  })
  const events = instrument(page)

  const fileA = writeFixture('gate-A.json', envelope({ metrics: [metric('gate-a1', 'Gate A1'), metric('gate-a2', 'Gate A2')], observations: [], feedbacks: [], decisions: [] }))
  const fileB = writeFixture('gate-B.json', envelope({ metrics: [metric('gate-b1', 'Gate B1')], observations: [], feedbacks: [], decisions: [] }))

  await openApp(page)
  await button(page, 'Importar backup').click()
  const dlg = dialog(page)
  await page.evaluate(() => window.__primeGate('gate-A.json'))
  await page.locator('#backup-file').setInputFiles(fileA)
  await dlg.getByText('Lendo gate-A.json…', { exact: true }).waitFor()
  assert.equal(await button(dlg, 'Substituir workspace').isDisabled(), true, 'confirmação habilitada durante leitura')

  await page.locator('#backup-file').setInputFiles(fileB)
  await dlg.getByText('1 indicadores', { exact: true }).waitFor()
  assert.equal(await dlg.getByText('Arquivo selecionado: gate-B.json', { exact: true }).count(), 1)
  await page.evaluate(() => window.__releaseGate('gate-A.json'))
  await page.waitForTimeout(400)
  assert.equal(await dlg.getByText('1 indicadores', { exact: true }).count(), 1, 'resumo da leitura antiga aplicado')
  assert.equal(await dlg.getByText('Arquivo selecionado: gate-B.json', { exact: true }).count(), 1, 'nome da seleção vigente mudou')

  await page.evaluate(() => {
    window.__lockHeld = new Promise((resolve) => {
      navigator.locks.request('product-decision-lab:workspace-write', () => new Promise((release) => {
        window.__releaseLock = release
        resolve()
      }))
    })
  })
  await page.evaluate(() => window.__lockHeld)
  await button(dlg, 'Substituir workspace').click()
  await dlg.getByText('Importando…', { exact: true }).waitFor()
  assert.equal(await page.locator('#backup-file').isDisabled(), true, 'seleção trocável durante importação')
  assert.equal(await button(dlg, 'Importando…').isDisabled(), true)
  await page.evaluate(() => window.__releaseLock())
  await dlg.waitFor({ state: 'hidden' })

  const imported = await stored(page)
  assert.deepEqual(imported.data.metrics.map((record) => record.id), ['gate-b1'])
  assertIntegrity(imported.data, '4C5B3A-04')
  assertClean('4C5B3A-04', events)
  console.log('PASS 4C5B3A-04: seleção fora de ordem e confirmação única')
})

runBrowser('4C5B3A-05 concorrência entre abas: aviso, gravação desatualizada e recuperação', async (context) => {
  const pageA = await context.newPage()
  const pageB = await context.newPage()
  const eventsA = instrument(pageA)
  const eventsB = instrument(pageB)

  await openApp(pageA)
  await createMetric(pageA, 'Indicador Aba A')

  await openApp(pageB)
  assert.equal(await pageB.getByText('Indicador Aba A', { exact: true }).count() > 0, true)

  await createMetric(pageA, 'Indicador Aba A2')
  await pageB.getByText('Workspace desatualizado', { exact: true }).waitFor()

  await button(pageB, 'Novo indicador').click()
  const dlg = dialog(pageB)
  await dlg.locator('#metric-name').fill('Indicador Aba B conflito')
  await button(dlg, 'Criar indicador').click()
  await dlg.getByText(/Tentativas de gravação recusadas não salvam alterações/).waitFor()
  await pageB.waitForTimeout(500)
  assert.equal(await dlg.isVisible(), true, 'formulário fechou após conflito')
  assert.equal(await dlg.locator('#metric-name').inputValue(), 'Indicador Aba B conflito')
  assert.ok(await dlg.getByText('Workspace desatualizado', { exact: true }).count() > 0)
  let snapshot = await stored(pageB)
  assert.equal(snapshot.data.metrics.some((record) => record.name === 'Indicador Aba B conflito'), false)
  assert.deepEqual(snapshot.data.metrics.map((record) => record.name).sort(), ['Indicador Aba A', 'Indicador Aba A2'])

  await dlg.locator('[data-workspace-refresh]').click()
  await dlg.getByText('Workspace desatualizado', { exact: true }).waitFor({ state: 'hidden' })
  assert.equal(await dlg.locator('#metric-name').inputValue(), 'Indicador Aba B conflito', 'texto digitado perdido ao atualizar')

  await button(dlg, 'Criar indicador').click()
  await dlg.getByRole('heading', { name: 'Indicador Aba B conflito', exact: true }).waitFor()
  snapshot = await stored(pageA)
  assert.deepEqual(
    snapshot.data.metrics.map((record) => record.name).sort(),
    ['Indicador Aba A', 'Indicador Aba A2', 'Indicador Aba B conflito'],
  )
  assertIntegrity(snapshot.data, '4C5B3A-05')

  await pageB.reload()
  await pageB.getByRole('heading', { name: 'Indicador Aba B conflito', exact: true }).waitFor()
  await pageA.getByText('Workspace desatualizado', { exact: true }).waitFor()
  assertClean('4C5B3A-05 A', eventsA)
  assertClean('4C5B3A-05 B', eventsB)
  console.log('PASS 4C5B3A-05: conflito detectado, recusado e recuperado sem perda')
})

runBrowser('4C5B3A-06 falha de setItem: sem sucesso falso e sem escrita', async (context) => {
  const page = await context.newPage()
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'product-decision-lab:workspace') {
        throw new DOMException('Quota fictícia', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  })
  const events = instrument(page)
  await openApp(page)
  await button(page, 'Novo indicador').click()
  const dlg = dialog(page)
  await dlg.locator('#metric-name').fill('Indicador Falha QA')
  await button(dlg, 'Criar indicador').click()
  await dlg.getByText(/Não foi possível gravar no armazenamento local \(cota ou permissão\)\./).waitFor()
  assert.equal(await page.getByText('Indicador criado.', { exact: true }).count(), 0, 'sucesso falso exibido')
  assert.equal(await raw(page), null, 'workspace gravado apesar da falha')
  assert.equal(await dlg.locator('#metric-name').inputValue(), 'Indicador Falha QA')
  assertClean('4C5B3A-06', events)
  console.log('PASS 4C5B3A-06: falha de gravação tratada sem sucesso falso')
})

runBrowser('4C5B3A-07 ausência de Web Locks: gravação recusada, leitura/exportação mantidas', async (context) => {
  const page = await context.newPage()
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'locks', { configurable: true, get: () => undefined })
  })
  const events = instrument(page)
  await openApp(page)
  assert.equal(await page.evaluate(() => navigator.locks === undefined), true, 'Web Locks ainda disponível')
  await button(page, 'Novo indicador').click()
  const dlg = dialog(page)
  await dlg.locator('#metric-name').fill('Indicador Sem Lock QA')
  await button(dlg, 'Criar indicador').click()
  await dlg.getByText(/não oferece a Web Locks API/).waitFor()
  assert.equal(await page.getByText('Indicador criado.', { exact: true }).count(), 0)
  assert.equal(await raw(page), null)
  assert.equal(await dlg.locator('#metric-name').inputValue(), 'Indicador Sem Lock QA')

  await button(dlg, 'Cancelar').click()
  await dlg.waitFor({ state: 'hidden' })
  const { file, download } = await exportBackup(page)
  assert.match(download.suggestedFilename(), /^product-decision-lab-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.equal(exported.data.metrics.length, 0)
  assertClean('4C5B3A-07', events)
  console.log('PASS 4C5B3A-07: sem Web Locks nada é gravado; exportação permanece')
})

runBrowser('4C5B3A-08 concorrência simultânea: uma gravação vence, a outra é recusada', async (context) => {
  const pageA = await context.newPage()
  const pageB = await context.newPage()
  const eventsA = instrument(pageA)
  const eventsB = instrument(pageB)
  await openApp(pageA)
  await openApp(pageB)

  await button(pageA, 'Novo indicador').click()
  await button(pageB, 'Novo indicador').click()
  const dlgA = dialog(pageA)
  const dlgB = dialog(pageB)
  await dlgA.locator('#metric-name').fill('Indicador Simultâneo A')
  await dlgB.locator('#metric-name').fill('Indicador Simultâneo B')
  await Promise.all([
    button(dlgA, 'Criar indicador').click(),
    button(dlgB, 'Criar indicador').click(),
  ])
  await pageA.waitForTimeout(1000)

  let snapshot = await stored(pageA)
  const names = snapshot.data.metrics.map((record) => record.name)
  assert.equal(names.length, 1, `esperava exatamente uma gravação, obtido ${JSON.stringify(names)}`)
  assert.ok(names[0] === 'Indicador Simultâneo A' || names[0] === 'Indicador Simultâneo B')
  const loser = names[0] === 'Indicador Simultâneo A' ? pageB : pageA
  const loserDialog = dialog(loser)
  await loserDialog.getByText(/Tentativas de gravação recusadas não salvam alterações/).waitFor()
  assert.equal(await button(loserDialog, 'Criar indicador').isVisible(), true, 'formulário do perdedor fechou')
  assert.equal(
    await loserDialog.locator('#metric-name').inputValue(),
    names[0] === 'Indicador Simultâneo A' ? 'Indicador Simultâneo B' : 'Indicador Simultâneo A',
    'rascunho do perdedor perdido',
  )
  assertIntegrity(snapshot.data, '4C5B3A-08')
  assertClean('4C5B3A-08 A', eventsA)
  assertClean('4C5B3A-08 B', eventsB)
  console.log(`PASS 4C5B3A-08: vencedora ${names[0]}, perdedora recebeu conflito`)
})

test('4C5B3A-09 resumo da execução', async () => {
  const fixtureFile = path.join(TMP, 'valid-export.json')
  if (fs.existsSync(fixtureFile)) {
    const parsed = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'))
    assertIntegrity(parsed.data, '4C5B3A-09')
    console.log(`Evidência: backup exportado com ${parsed.data.metrics.length} indicadores, ${parsed.data.observations.length} observações, ${parsed.data.feedbacks.length} feedbacks e ${parsed.data.decisions.length} decisões.`)
  }
  console.log(`Diretório de evidências temporário: ${TMP}`)
})
