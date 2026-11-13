/**
 * Performance real 4C.5d.2 — carregamento, renderização e experiência de uso.
 *
 * Uso:
 *   PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5d2-performance.cjs
 *
 * Variáveis opcionais: PDL_BASE_URL (padrão http://127.0.0.1:4731),
 * PDL_RESULTS (JSON; padrão docs/evidence-4c5d2/results.json),
 * PDL_REPETITIONS (padrão 3), PDL_ONLY (lista de cenários separados por vírgula),
 * PDL_THROTTLE (0 desativa a amostragem com limitação de CPU/rede; padrão 1).
 *
 * PDL_SELF_CHECK=1 valida, sem navegador nem servidor, os helpers de coleta de
 * recursos (documento + /assets/ + /fonts/ da mesma origem) e a agregação de
 * stats (precisão de CLS em 3 casas; medianas temporais em 1 casa) e sai.
 *
 * Requisitos do ambiente: build de produção servido em loopback via `vite preview`.
 * Nenhum dado real; fixtures fictícias semeadas por addInitScript em contextos
 * isolados. Cold cache = contexto novo do Playwright (cache HTTP vazio);
 * warm cache = mesmo documento/contexto com recursos já carregados.
 * Falhas de aplicação (pageerror/console) e falhas de medição (API indisponível)
 * são registradas separadamente.
 */
const { test, describe, after } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
// Playwright só é carregado para executar a suíte; o self-check roda sem ele.
const pw = process.env.PDL_SELF_CHECK === '1' ? null : require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const KEY = 'product-decision-lab:workspace'
const RESULTS =
  process.env.PDL_RESULTS || path.join('docs', 'evidence-4c5d2', 'results.json')
const REPETITIONS = Math.max(1, Number(process.env.PDL_REPETITIONS || 3))
const ONLY = (process.env.PDL_ONLY || '').split(',').map((item) => item.trim()).filter(Boolean)
const WITH_THROTTLE = process.env.PDL_THROTTLE !== '0'
const ISO = '2026-09-01T10:00:00.000Z'
const VIEWPORT = { width: 1280, height: 800 }

/* Parâmetros do perfil "Fast 3G" do DevTools (registrados exatamente). */
const THROTTLE_NET = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
}
const THROTTLE_CPU = 4

const report = { meta: {}, scenarios: {}, interactions: {}, limitations: [] }
const scenario = (id) =>
  ONLY.length === 0 || ONLY.includes(id)

/* ------------------------------------------------------------------ */
/* Fixtures fictícias                                                  */
/* ------------------------------------------------------------------ */

const WORDS = 'cadastro lento onboarding professor turma relatorio pagamento confuso suporte assinatura'.split(' ')
const CATEGORIES = ['bug', 'usability', 'performance', 'feature-request', 'pricing', 'other']
const SOURCES = ['interview', 'support-ticket', 'survey', 'app-review', 'community', 'other']
const STATUSES = ['draft', 'investigating', 'decided', 'validated', 'abandoned']

function smallDataset() {
  const metrics = [
    {
      id: 'perf-metric-long',
      name: 'Conversão Free → Premium',
      description: WORDS.concat(WORDS).join(' ').slice(0, 480),
      unit: 'percent',
      desiredDirection: 'increase',
      createdAt: ISO,
    },
    {
      id: 'perf-metric-churn',
      name: 'Churn mensal',
      description: 'Cancelamentos no mês.',
      unit: 'percent',
      desiredDirection: 'decrease',
      createdAt: ISO,
    },
  ]
  const observations = []
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(Date.UTC(2026, 8 - index, 1))
    const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    observations.push({
      id: `perf-obs-${index}`,
      metricId: index % 2 === 0 ? 'perf-metric-long' : 'perf-metric-churn',
      period,
      value: 12 + index,
      createdAt: ISO,
    })
  }
  const feedbacks = [
    {
      id: 'perf-feedback-1',
      content: 'Relato fictício sobre onboarding confuso.',
      category: 'usability',
      source: 'interview',
      receivedAt: '2026-06-10T10:00:00.000Z',
      metricIds: ['perf-metric-long'],
    },
    {
      id: 'perf-feedback-2',
      content: 'Relato fictício sobre preço.',
      category: 'pricing',
      source: 'survey',
      receivedAt: '2026-07-11T10:00:00.000Z',
      metricIds: [],
    },
  ]
  const decisions = [
    {
      id: 'perf-decision-1',
      title: 'Simplificar o onboarding',
      problem: 'Queda de ativação após o cadastro.',
      hypothesis: 'Menos etapas aumentam a ativação.',
      metricIds: ['perf-metric-long'],
      feedbackIds: ['perf-feedback-1'],
      alternatives: ['Reduzir etapas', 'Tutorial guiado'],
      decision: 'Reduzir etapas.',
      successCriteria: ['Ativação acima de 40%'],
      nextSteps: ['Medir em duas semanas'],
      status: 'decided',
      createdAt: ISO,
      updatedAt: ISO,
    },
  ]
  return { metrics, observations, feedbacks, decisions }
}

function monthPeriods(count, startYear = 2024, startMonthIndex = 8) {
  const periods = []
  for (let index = 0; index < count; index += 1) {
    const monthIndex = startMonthIndex + index
    const year = startYear + Math.floor(monthIndex / 12)
    const month = String((monthIndex % 12) + 1).padStart(2, '0')
    periods.push(`${year}-${month}`)
  }
  return periods
}

/** Volume maior, dentro dos limites suportados: payload bem abaixo da cota de 5 MB. */
function largeDataset() {
  const metrics = Array.from({ length: 60 }, (_, index) => ({
    id: `perf-metric-${index}`,
    name: `Indicador de performance ${index + 1}`,
    description: `Descrição fictícia do indicador ${index + 1} para teste de volume do workspace.`,
    unit: index % 2 === 0 ? 'percent' : 'count',
    desiredDirection: index % 2 === 0 ? 'increase' : 'decrease',
    createdAt: ISO,
  }))
  const periods = monthPeriods(24)
  const observations = []
  for (let metric = 0; metric < 60; metric += 1) {
    for (let step = 0; step < 24; step += 1) {
      observations.push({
        id: `perf-obs-${metric}-${step}`,
        metricId: `perf-metric-${metric}`,
        period: periods[step],
        value: 10 + ((metric * 7 + step * 3) % 40) + 0.5,
        createdAt: ISO,
      })
    }
  }
  const feedbacks = Array.from({ length: 200 }, (_, index) => ({
    id: `perf-feedback-${index}`,
    content: `Relato fictício ${index}: ${
      index % 5 === 0 ? 'onboarding ' : ''
    }${WORDS[index % WORDS.length]} — experiência registrada no ciclo ${index % 12 + 1}.`,
    category: CATEGORIES[index % CATEGORIES.length],
    source: SOURCES[index % SOURCES.length],
    receivedAt: new Date(Date.UTC(2026, index % 9, (index % 27) + 1, 10)).toISOString(),
    metricIds: index % 3 === 0 ? [`perf-metric-${index % 60}`] : [],
  }))
  const decisions = Array.from({ length: 60 }, (_, index) => ({
    id: `perf-decision-${index}`,
    title: `${index % 4 === 0 ? 'Onboarding ' : 'Melhoria '}${index + 1}`,
    problem: 'Problema fictício de volume para teste de listagem.',
    hypothesis: 'Hipótese fictícia de volume.',
    decision: '',
    metricIds: [`perf-metric-${index}`],
    feedbackIds: index % 3 === 0 ? [`perf-feedback-${index}`] : [],
    alternatives: ['Alternativa A', 'Alternativa B'],
    successCriteria: ['Critério fictício'],
    nextSteps: ['Passo fictício'],
    status: STATUSES[index % STATUSES.length],
    createdAt: ISO,
    updatedAt: ISO,
  }))
  return { metrics, observations, feedbacks, decisions }
}

const SMALL = smallDataset()
const LARGE = largeDataset()
const SMALL_FEEDBACK_SEARCH = SMALL.feedbacks.filter((f) => f.content.toLowerCase().includes('onboarding')).length
const LARGE_FEEDBACK_SEARCH = LARGE.feedbacks.filter((f) => f.content.toLowerCase().includes('onboarding')).length
const LARGE_FEEDBACK_CATEGORY = LARGE.feedbacks.filter((f) => f.category === 'bug').length
const LARGE_DECISION_SEARCH = LARGE.decisions.filter((d) => d.title.toLowerCase().includes('onboarding')).length

/* ------------------------------------------------------------------ */
/* Instrumentação no navegador                                         */
/* ------------------------------------------------------------------ */

const INSTRUMENT = `
(() => {
  const store = { lcp: null, lcpElement: '', cls: 0, fcp: null, longTasks: [], eventTimings: [] }
  window.__pdl = {
    store,
    resetInteraction() { store.longTasks.length = 0; store.eventTimings.length = 0 },
    mark() { return performance.now() },
    paintSince(t0) {
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - t0))))
    },
    isCollectedResource: (${collectedResource}),
  }
  const safe = (options, handler) => {
    try { new PerformanceObserver((list) => handler(list.getEntries())).observe(options) }
    catch { /* observador indisponível */ }
  }
  safe({ type: 'largest-contentful-paint', buffered: true }, (entries) => {
    const last = entries[entries.length - 1]
    if (!last) return
    store.lcp = last.startTime
    store.lcpElement = last.element ? last.element.tagName.toLowerCase() : ''
  })
  safe({ type: 'layout-shift', buffered: true }, (entries) => {
    for (const entry of entries) if (!entry.hadRecentInput) store.cls += entry.value
  })
  safe({ type: 'paint', buffered: true }, (entries) => {
    for (const entry of entries) if (entry.name === 'first-contentful-paint') store.fcp = entry.startTime
  })
  safe({ type: 'longtask', buffered: true }, (entries) => {
    for (const entry of entries) store.longTasks.push({ start: Math.round(entry.startTime), duration: Math.round(entry.duration) })
  })
  safe({ type: 'event', buffered: true, durationThreshold: 16 }, (entries) => {
    for (const entry of entries) store.eventTimings.push({ name: entry.name, duration: Math.round(entry.duration) })
  })
})()
`

const SEED = (payload) => {
  try {
    localStorage.setItem(payload.key, payload.value)
  } catch {
    /* contexto sem storage */
  }
}

/* ------------------------------------------------------------------ */
/* Helpers do Node                                                     */
/* ------------------------------------------------------------------ */

const roundTo = (value, digits) =>
  typeof value === 'number' ? Math.round(value * 10 ** digits) / 10 ** digits : value
const round1 = (value) => roundTo(value, 1)

// Métricas temporais (ms) agregam com 1 casa; métricas adimensionais como CLS
// exigem mais precisão e recebem digits=3 no ponto de uso.
function stats(values, digits = 1) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  return {
    n: values.length,
    median: roundTo(median, digits),
    min: roundTo(sorted[0], digits),
    max: roundTo(sorted[sorted.length - 1], digits),
    values: values.map((value) => roundTo(value, digits)),
    outliers: values.filter((value) => value > median * 2).map((value) => roundTo(value, digits)),
  }
}

function bytesSummary(resources, docTransfer = 0, docEncoded = 0, docDecoded = 0) {
  let transferred = 0
  let cachedDecoded = 0
  let encoded = docEncoded || 0
  let decoded = docDecoded || 0
  for (const entry of resources) {
    encoded += entry.encoded
    decoded += entry.decoded
    if (entry.transfer > 0) transferred += entry.transfer
    else if (entry.decoded > 0) cachedDecoded += entry.decoded
  }
  return {
    transferBytes: Math.round(transferred + (docTransfer || 0)),
    cachedDecodedBytes: Math.round(cachedDecoded),
    encodedBytes: Math.round(encoded),
    decodedBytes: Math.round(decoded),
  }
}

function instrumentEvents(page) {
  const events = { consoleErrors: [], pageErrors: [], failed: [], http: [] }
  page.on('console', (message) => {
    if (message.type() === 'error') events.consoleErrors.push(message.text().slice(0, 300))
  })
  page.on('pageerror', (error) => events.pageErrors.push(String(error).slice(0, 300)))
  page.on('requestfailed', (request) => {
    if (!/favicon/.test(request.url())) events.failed.push(`${request.url()} ${request.failure()?.errorText}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon/.test(response.url())) {
      events.http.push(`${response.status()} ${response.url()}`)
    }
  })
  return events
}

async function newPage(browser, { dataset = null, cpuThrottle = 0, netThrottle = false } = {}) {
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'pt-BR' })
  context.setDefaultTimeout(15000)
  await context.addInitScript(INSTRUMENT)
  if (dataset) {
    await context.addInitScript(SEED, {
      key: KEY,
      value: JSON.stringify({ schemaVersion: 1, savedAt: ISO, data: dataset }),
    })
  }
  const page = await context.newPage()
  const events = instrumentEvents(page)
  const requests = []
  page.on('response', (response) => {
    const url = response.url()
    if (!url.startsWith(ORIGIN)) return
    requests.push({
      file: url.split('/').pop() || url,
      status: response.status(),
      encoding: response.headers()['content-encoding'] || null,
      type: response.headers()['content-type'] || null,
    })
  })
  let cdp = null
  if (cpuThrottle || netThrottle) {
    cdp = await context.newCDPSession(page)
    if (cpuThrottle) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle })
    if (netThrottle) await cdp.send('Network.emulateNetworkConditions', THROTTLE_NET)
  }
  return { context, page, events, requests, cdp }
}

/** Recursos contabilizados: o próprio documento e bundles/fontes locais (/assets/, /fonts/) da mesma origem. */
function collectedResource(entry) {
  if (entry.name === location.href) return true
  try {
    const url = new URL(entry.name)
    return url.origin === location.origin && (url.pathname.includes('/assets/') || url.pathname.includes('/fonts/'))
  } catch {
    return false
  }
}

async function navMetrics(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const resources = performance
      .getEntriesByType('resource')
      .filter((entry) => window.__pdl.isCollectedResource(entry))
      .map((entry) => ({
        name: entry.name.split('/').pop().split('?')[0],
        initiator: entry.initiatorType,
        transfer: entry.transferSize,
        encoded: entry.encodedBodySize,
        decoded: entry.decodedBodySize,
        duration: Math.round(entry.duration),
      }))
    const store = window.__pdl.store
    return {
      ttfb: nav ? Math.round(nav.responseStart) : null,
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      docTransfer: nav ? nav.transferSize : null,
      docEncoded: nav ? nav.encodedBodySize : null,
      docDecoded: nav ? nav.decodedBodySize : null,
      fcp: store.fcp === null ? null : Math.round(store.fcp),
      lcp: store.lcp === null ? null : Math.round(store.lcp),
      lcpElement: store.lcpElement,
      cls: Math.round(store.cls * 1000) / 1000,
      longTasks: store.longTasks.slice(),
      eventTimings: store.eventTimings.slice(),
      resources,
    }
  })
}

function runSummary(run) {
  const longs = run.longTasks || []
  const events = run.eventTimings || []
  return {
    valid: run.valid !== false,
    ttfb: run.ttfb,
    fcp: run.fcp,
    lcp: run.lcp,
    cls: run.cls,
    dcl: run.dcl,
    load: run.load,
    bytes: run.bytes,
    assetCount: (run.assets || []).length,
    assets: run.assets,
    longestTask: longs.length ? Math.max(...longs.map((task) => task.duration)) : 0,
    longTaskCount: longs.length,
    slowestEvent: events.length ? Math.max(...events.map((item) => item.duration)) : 0,
    extra: run.extra || {},
    errors: run.errors,
  }
}

/** Executa uma interação e mede execução, atualização de DOM e pintura observável. */
async function timedAction(page, trigger, waitPredicate, arg = null) {
  await page.evaluate(() => {
    window.__pdl.resetInteraction()
    window.__pdl.t0 = performance.now()
  })
  const wallStart = Date.now()
  await trigger()
  await page.waitForFunction(waitPredicate, arg)
  const paintMs = await page.evaluate(() => window.__pdl.paintSince(window.__pdl.t0))
  const wallMs = Date.now() - wallStart
  const collected = await page.evaluate(() => {
    const store = window.__pdl.store
    const longTasks = store.longTasks.splice(0)
    const eventTimings = store.eventTimings.splice(0)
    return { longTasks, eventTimings }
  })
  return {
    wallMs: round1(wallMs),
    paintMs: round1(paintMs),
    longTaskCount: collected.longTasks.length,
    longestTask: collected.longTasks.length ? Math.max(...collected.longTasks.map((task) => task.duration)) : 0,
    eventCount: collected.eventTimings.length,
    slowestEvent: collected.eventTimings.length
      ? Math.max(...collected.eventTimings.map((item) => item.duration))
      : 0,
  }
}

function assertClean(label, events) {
  const problems = [
    ...events.pageErrors.map((text) => `pageerror: ${text}`),
    ...events.consoleErrors.map((text) => `console: ${text}`),
    ...events.failed.map((text) => `requestfailed: ${text}`),
    ...events.http.map((text) => `http: ${text}`),
  ]
  if (problems.length) throw new Error(`${label}: ${problems.join(' | ')}`)
}

const ROUTE_TITLES = {
  overview: 'Product Overview',
  feedbacks: 'Feedback Discovery',
  decisions: 'Decision Workspace',
  'interactive-case': 'ProfResolve — Growth & Monetization',
}
const h1 = (page, route) =>
  page.getByRole('heading', { level: 1, name: ROUTE_TITLES[route], exact: true })
const dialog = (page) => page.locator('[role="dialog"]').last()
const button = (scope, name) => scope.getByRole('button', { name, exact: true })
const assetNames = (requests) => [...new Set(requests.map((request) => request.file))]

async function loadRoute(measure, route, extraWait) {
  const { page } = measure
  await page.goto(`${ORIGIN}/#/${route}`)
  await h1(page, route).waitFor()
  if (extraWait) await extraWait()
}

/* ------------------------------------------------------------------ */
/* Suíte                                                               */
/* ------------------------------------------------------------------ */

let browser = null
let environment = null

test('ambiente e servidor', { }, async () => {
  const probe = new URL(ORIGIN)
  const reachable = await new Promise((resolve) => {
    const socket = require('node:net').connect(Number(probe.port) || 80, probe.hostname)
    socket.setTimeout(5000)
    socket.once('connect', () => { socket.destroy(); resolve(true) })
    socket.once('timeout', () => { socket.destroy(); resolve(false) })
    socket.once('error', () => resolve(false))
  })
  if (!reachable) throw new Error(`servidor inacessível em ${ORIGIN} — inicie "vite preview --host 127.0.0.1"`)

  browser = await pw.chromium.launch()
  const version = browser.version()
  const measure = await newPage(browser)
  try {
    await measure.page.goto(`${ORIGIN}/`)
    const env = await measure.page.evaluate(() => ({
      ua: navigator.userAgent,
      secure: window.isSecureContext,
      languages: navigator.languages,
      deviceMemory: navigator.deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency,
    }))
    let playwrightVersion = null
    try {
      playwrightVersion = require(path.join(process.env.PLAYWRIGHT_MODULE || 'playwright', 'package.json')).version
    } catch { /* versão indisponível */ }
    const jsResponse = measure.requests.find((request) => request.file.startsWith('index-') && request.file.endsWith('.js'))
    environment = {
      origin: ORIGIN,
      date: new Date().toISOString(),
      os: `${os.type()} ${os.release()} (${os.platform()})`,
      cpu: os.cpus()[0]?.model || null,
      cpuCount: os.cpus().length,
      node: process.version,
      playwright: playwrightVersion,
      chromium: version,
      userAgent: env.ua,
      viewport: VIEWPORT,
      locale: 'pt-BR',
      isSecureContext: env.secure,
      hardwareConcurrency: env.hardwareConcurrency,
      cacheCondition: 'cold = contexto novo do Playwright (cache HTTP vazio); warm = mesmo documento/contexto',
      networkCondition: 'loopback local, sem limitação (exceto na amostragem throttled)',
      cpuThrottling: WITH_THROTTLE ? `${THROTTLE_CPU}x na amostragem separada` : 'não executada',
      throttleNetwork: WITH_THROTTLE
        ? `latency=${THROTTLE_NET.latency}ms download=${THROTTLE_NET.downloadThroughput}B/s upload=${THROTTLE_NET.uploadThroughput}B/s (perfil Fast 3G do DevTools)`
        : null,
      serverCompression: jsResponse?.encoding || 'nenhum (resposta sem content-encoding)',
      serverCompressionNote:
        'Sem compressão HTTP, transferSize tende a igualar decodedBodySize; os valores gzip do build são estimativas de tamanho, não transferência observada.',
    }
    report.meta.environment = environment
    report.meta.repetitions = REPETITIONS
    report.meta.fixtures = {
      empty: 'sem seed (workspace vazio)',
      small: { metrics: SMALL.metrics.length, observations: SMALL.observations.length, feedbacks: SMALL.feedbacks.length, decisions: SMALL.decisions.length },
      large: { metrics: LARGE.metrics.length, observations: LARGE.observations.length, feedbacks: LARGE.feedbacks.length, decisions: LARGE.decisions.length },
    }
  } finally {
    await measure.context.close()
  }
})

test('fixtures válidas: contagens exibidas e payload íntegro', async () => {
  const measure = await newPage(browser, { dataset: LARGE })
  try {
    const { page } = measure
    await loadRoute(measure, 'overview')
    await page.getByText('Indicador de performance 1').first().waitFor()
    const counts = await page.evaluate(() => {
      const dl = document.querySelector('main dl')
      const values = dl ? [...dl.querySelectorAll('dd')].map((dd) => dd.textContent?.trim()) : []
      return { indicators: values[0], observations: values[1], feedbacks: values[2], decisions: values[3] }
    })
    const expected = {
      indicators: String(LARGE.metrics.length),
      observations: String(LARGE.observations.length),
      feedbacks: String(LARGE.feedbacks.length),
      decisions: String(LARGE.decisions.length),
    }
    if (JSON.stringify(counts) !== JSON.stringify(expected)) {
      throw new Error(`contagens divergentes: ${JSON.stringify(counts)} != ${JSON.stringify(expected)}`)
    }
    const payload = await page.evaluate((key) => localStorage.getItem(key), KEY)
    const parsed = JSON.parse(payload)
    if (parsed.data.observations.length !== LARGE.observations.length) throw new Error('payload corrompido')
    report.fixtures = {
      largeDisplayedCounts: counts,
      payloadBytes: payload.length,
      withinBackupLimit: payload.length < 5 * 1024 * 1024,
      note: 'fixture semeada por addInitScript em contexto isolado; workspace real não foi tocado',
    }
  } finally {
    await measure.context.close()
  }
})

if (scenario('A')) {
  describe('A — Overview com workspace vazio', () => {
    test('carregamento a frio (repetições)', async () => {
      const runs = []
      for (let index = 0; index < REPETITIONS; index += 1) {
        const measure = await newPage(browser)
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'overview')
          await measure.page.locator('[data-tour-id="demo-preview"] svg.recharts-surface').waitFor()
          await measure.page.waitForTimeout(250)
          const metrics = await navMetrics(measure.page)
          assertClean(`A execução ${index + 1}`, measure.events)
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: {
                wallToInteractiveMs: round1(Date.now() - settleStart),
                lineChartRequested: measure.requests.some((request) => request.file.startsWith('LineChart')),
                demoChartRendered: true,
              },
            }),
          )
        } catch (error) {
          runs.push({ valid: false, error: String(error.message).slice(0, 250) })
          throw error
        } finally {
          await measure.context.close()
        }
      }
      report.scenarios['A-overview-vazio'] = {
        description: 'Abertura direta da Overview com workspace vazio (inclui prévia demonstrativa e Recharts)',
        runs,
        ttfb: stats(runs.map((run) => run.ttfb)),
        fcp: stats(runs.map((run) => run.fcp)),
        lcp: stats(runs.map((run) => run.lcp)),
        cls: stats(runs.map((run) => run.cls), 3),
        dcl: stats(runs.map((run) => run.dcl)),
        load: stats(runs.map((run) => run.load)),
        transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
        wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
      }
    })
  })
}

if (scenario('B')) {
  describe('B — Overview com workspace preenchido', () => {
    test('carregamento a frio, gráfico do indicador a frio e a quente', async () => {
      const runs = []
      const chartOpens = []
      for (let index = 0; index < REPETITIONS; index += 1) {
        const measure = await newPage(browser, { dataset: SMALL })
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'overview')
          await measure.page.getByText('Conversão Free → Premium').first().waitFor()
          await measure.page.waitForTimeout(200)
          const metrics = await navMetrics(measure.page)
          assertClean(`B carregamento ${index + 1}`, measure.events)
          const lineChartBeforeOpen = measure.requests.filter((request) => request.file.startsWith('LineChart')).length
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: {
                wallToInteractiveMs: round1(Date.now() - settleStart),
                lineChartRequestedOnLoad: lineChartBeforeOpen > 0,
                demoPreviewRendered: await measure.page.locator('[data-tour-id="demo-preview"]').count() > 0,
              },
            }),
          )

          const openCold = await timedAction(
            measure.page,
            () => button(measure.page, 'Abrir indicador Conversão Free → Premium').click(),
            () => {
              const dlg = document.querySelector('[role="dialog"]')
              return Boolean(dlg && dlg.querySelector('svg.recharts-surface'))
            },
          )
          const lineChartAfterOpen = measure.requests.filter((request) => request.file.startsWith('LineChart')).length
          openCold.lineChartChunkFetched = lineChartAfterOpen > lineChartBeforeOpen
          await measure.page.keyboard.press('Escape')
          await dialog(measure.page).waitFor({ state: 'detached' })

          const openWarm = await timedAction(
            measure.page,
            () => button(measure.page, 'Abrir indicador Conversão Free → Premium').click(),
            () => {
              const dlg = document.querySelector('[role="dialog"]')
              return Boolean(dlg && dlg.querySelector('svg.recharts-surface'))
            },
          )
          const lineChartAfterWarm = measure.requests.filter((request) => request.file.startsWith('LineChart')).length
          openWarm.lineChartChunkFetched = lineChartAfterWarm > lineChartAfterOpen
          chartOpens.push({ cold: openCold, warm: openWarm })
          await measure.page.keyboard.press('Escape')
          await dialog(measure.page).waitFor({ state: 'detached' })
        } catch (error) {
          runs.push({ valid: false, error: String(error.message).slice(0, 250) })
          throw error
        } finally {
          await measure.context.close()
        }
      }
      report.scenarios['B-overview-preenchido'] = {
        description: 'Abertura direta da Overview com 2 indicadores; abertura de gráfico do indicador a frio e a quente',
        runs,
        ttfb: stats(runs.map((run) => run.ttfb)),
        fcp: stats(runs.map((run) => run.fcp)),
        lcp: stats(runs.map((run) => run.lcp)),
        transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
        wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
        chartOpenCold: {
          paint: stats(chartOpens.map((open) => open.cold.paintMs)),
          wall: stats(chartOpens.map((open) => open.cold.wallMs)),
          slowestEvent: stats(chartOpens.map((open) => open.cold.slowestEvent)),
          longTaskCount: stats(chartOpens.map((open) => open.cold.longTaskCount)),
          lineChartChunkFetched: chartOpens.map((open) => open.cold.lineChartChunkFetched),
        },
        chartOpenWarm: {
          paint: stats(chartOpens.map((open) => open.warm.paintMs)),
          wall: stats(chartOpens.map((open) => open.warm.wallMs)),
          slowestEvent: stats(chartOpens.map((open) => open.warm.slowestEvent)),
          longTaskCount: stats(chartOpens.map((open) => open.warm.longTaskCount)),
          lineChartChunkFetched: chartOpens.map((open) => open.warm.lineChartChunkFetched),
        },
      }
    })
  })
}

if (scenario('C')) {
  describe('C — Feedback Discovery', () => {
    test('carregamento direto a frio (repetições)', async () => {
      const runs = []
      for (let index = 0; index < REPETITIONS; index += 1) {
        const measure = await newPage(browser, { dataset: SMALL })
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'feedbacks')
          await measure.page.getByText('Relato fictício sobre onboarding confuso.').waitFor()
          await measure.page.waitForTimeout(150)
          const metrics = await navMetrics(measure.page)
          assertClean(`C execução ${index + 1}`, measure.events)
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: { wallToInteractiveMs: round1(Date.now() - settleStart) },
            }),
          )
        } catch (error) {
          runs.push({ valid: false, error: String(error.message).slice(0, 250) })
          throw error
        } finally {
          await measure.context.close()
        }
      }
      report.scenarios['C-feedbacks'] = {
        description: 'Abertura direta de #/feedbacks com 2 feedbacks',
        runs,
        ttfb: stats(runs.map((run) => run.ttfb)),
        fcp: stats(runs.map((run) => run.fcp)),
        lcp: stats(runs.map((run) => run.lcp)),
        transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
        wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
      }
    })
  })
}

if (scenario('D')) {
  describe('D — Decision Workspace', () => {
    test('carregamento direto e abertura de detalhe', async () => {
      const runs = []
      const detailOpens = []
      for (let index = 0; index < REPETITIONS; index += 1) {
        const measure = await newPage(browser, { dataset: SMALL })
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'decisions')
          await measure.page.getByText('Simplificar o onboarding').first().waitFor()
          await measure.page.waitForTimeout(150)
          const metrics = await navMetrics(measure.page)
          assertClean(`D carregamento ${index + 1}`, measure.events)
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: { wallToInteractiveMs: round1(Date.now() - settleStart) },
            }),
          )
          const open = await timedAction(
            measure.page,
            () => measure.page.getByRole('button', { name: 'Abrir registro: Simplificar o onboarding' }).click(),
            () => Boolean([...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === 'Voltar')),
          )
          detailOpens.push(open)
          await button(measure.page, 'Voltar').click()
          await measure.page.getByRole('button', { name: 'Abrir registro: Simplificar o onboarding' }).waitFor()
        } catch (error) {
          runs.push({ valid: false, error: String(error.message).slice(0, 250) })
          throw error
        } finally {
          await measure.context.close()
        }
      }
      report.scenarios['D-decisions'] = {
        description: 'Abertura direta de #/decisions e abertura de detalhe do registro',
        runs,
        ttfb: stats(runs.map((run) => run.ttfb)),
        fcp: stats(runs.map((run) => run.fcp)),
        lcp: stats(runs.map((run) => run.lcp)),
        transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
        wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
        detailOpen: {
          paint: stats(detailOpens.map((open) => open.paintMs)),
          wall: stats(detailOpens.map((open) => open.wallMs)),
          slowestEvent: stats(detailOpens.map((open) => open.slowestEvent)),
          longTaskCount: stats(detailOpens.map((open) => open.longTaskCount)),
        },
      }
    })
  })
}

if (scenario('E')) {
  describe('E — Interactive Product Case', () => {
    test('carregamento direto com gráfico inicial', async () => {
      const runs = []
      for (let index = 0; index < REPETITIONS; index += 1) {
        const measure = await newPage(browser)
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'interactive-case')
          await measure.page.locator('figure svg.recharts-surface').first().waitFor()
          await measure.page.waitForTimeout(250)
          const metrics = await navMetrics(measure.page)
          assertClean(`E execução ${index + 1}`, measure.events)
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: {
                wallToInteractiveMs: round1(Date.now() - settleStart),
                lineChartRequestedOnLoad: measure.requests.some((request) => request.file.startsWith('LineChart')),
                datasetFetches: metrics.resources.filter((entry) => entry.initiator === 'fetch' || entry.initiator === 'xmlhttprequest').length,
              },
            }),
          )
        } catch (error) {
          runs.push({ valid: false, error: String(error.message).slice(0, 250) })
          throw error
        } finally {
          await measure.context.close()
        }
      }
      report.scenarios['E-interactive-case'] = {
        description: 'Abertura direta de #/interactive-case (dataset simulado embutido no chunk, gráfico inicial Recharts)',
        runs,
        ttfb: stats(runs.map((run) => run.ttfb)),
        fcp: stats(runs.map((run) => run.fcp)),
        lcp: stats(runs.map((run) => run.lcp)),
        transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
        wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
        lineChartRequestedOnLoad: runs.map((run) => run.extra?.lineChartRequestedOnLoad),
        datasetFetches: stats(runs.map((run) => run.extra?.datasetFetches)),
      }
    })
  })
}

if (scenario('F')) {
  describe('F — Tour "Como funciona"', () => {
    test('sem carregamento prematuro, abertura e navegação pelas 15 etapas', async () => {
      const measure = await newPage(browser, { dataset: SMALL })
      try {
        const { page } = measure
        await loadRoute(measure, 'decisions')
        await measure.page.getByText('Simplificar o onboarding').first().waitFor()
        const beforeTour = assetNames(measure.requests)
        if (beforeTour.some((file) => file.startsWith('product-tour'))) {
          throw new Error('chunk do tour foi solicitado antes do clique no botão')
        }

        const panelWait = () =>
          Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))
        const stepPredicate = (expected) =>
          [...document.querySelectorAll('[role="dialog"][aria-modal="true"] *')].some(
            (node) => node.textContent?.trim() === expected,
          )

        const panelOpen = await timedAction(page, () => button(page, 'Como funciona').click(), panelWait)
        const confirmStart = await page
          .getByRole('button', { name: 'Iniciar tour', exact: true })
          .count()
        let startStep = null
        if (confirmStart) {
          startStep = await timedAction(
            page,
            () => page.getByRole('button', { name: 'Iniciar tour', exact: true }).click(),
            stepPredicate,
            '1 de 15',
          )
        } else {
          await page.getByText('1 de 15', { exact: true }).waitFor()
        }
        const afterTour = assetNames(measure.requests)
        panelOpen.tourChunkFetched = afterTour.some((file) => file.startsWith('product-tour'))

        const stepTimes = []
        for (let step = 2; step <= 15; step += 1) {
          const expected = `${step} de 15`
          const time = await timedAction(
            page,
            () => button(dialog(page), 'Próximo').click(),
            stepPredicate,
            expected,
          )
          stepTimes.push(time)
        }
        await button(dialog(page), 'Concluir').click()
        await page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: 'detached' })
        assertClean('F tour', measure.events)

        report.scenarios['F-tour'] = {
          description: 'Tour aberto a partir de #/decisions com workspace preenchido; 15 etapas navegadas',
          panelOpen,
          startConfirm: startStep,
          tourChunkFetchedOnOpen: panelOpen.tourChunkFetched,
          tourChunkAbsentBeforeOpen: !beforeTour.some((file) => file.startsWith('product-tour')),
          stepAdvance: {
            paint: stats(stepTimes.map((time) => time.paintMs)),
            wall: stats(stepTimes.map((time) => time.wallMs)),
            slowestEvent: stats(stepTimes.map((time) => time.slowestEvent)),
            longTaskCount: stats(stepTimes.map((time) => time.longTaskCount)),
            steps: stepTimes,
          },
        }
      } finally {
        await measure.context.close()
      }
    })
  })
}

if (scenario('N')) {
  describe('N — Navegação vs carregamento direto', () => {
    test('direto a frio, navegação SPA, reload a quente e retorno', async () => {
      const direct = await newPage(browser, { dataset: SMALL })
      try {
        const settleStart = Date.now()
        await loadRoute(direct, 'feedbacks')
        await direct.page.getByText('Relato fictício sobre onboarding confuso.').waitFor()
        await direct.page.waitForTimeout(150)
        const directMetrics = await navMetrics(direct.page)
        assertClean('N direto', direct.events)
        report.scenarios['N-navegacao'] = report.scenarios['N-navegacao'] || {}
        report.scenarios['N-navegacao'].directCold = {
          wallToInteractiveMs: round1(Date.now() - settleStart),
          bytes: bytesSummary(directMetrics.resources),
          assets: assetNames(direct.requests),
          lcp: directMetrics.lcp,
        }
      } finally {
        await direct.context.close()
      }

      const journey = await newPage(browser, { dataset: SMALL })
      try {
        const { page } = journey
        await loadRoute(journey, 'overview')
        await page.getByText('Conversão Free → Premium').first().waitFor()

        const mark = await page.evaluate(() => performance.now())
        const navStart = Date.now()
        await page.locator('nav[aria-label="Navegação principal"]').getByRole('link', { name: /Feedbacks/ }).click()
        await h1(page, 'feedbacks').waitFor()
        await page.getByText('Relato fictício sobre onboarding confuso.').waitFor()
        const navWall = round1(Date.now() - navStart)
        const spaFetches = await page.evaluate((from) => {
          return performance
            .getEntriesByType('resource')
            .filter((entry) => entry.startTime >= from)
            .map((entry) => ({
              name: entry.name.split('/').pop().split('?')[0],
              transfer: entry.transferSize,
              decoded: entry.decodedBodySize,
              duration: Math.round(entry.duration),
            }))
        }, mark)
        report.scenarios['N-navegacao'].spaNavigation = {
          wallMs: navWall,
          fetchedAfterClick: spaFetches,
          transferredBytes: spaFetches.reduce((total, entry) => total + entry.transfer, 0),
          note: 'apenas recursos realmente buscados após o clique; shared chunks já carregados não aparecem',
        }

        await page.waitForTimeout(150)
        await page.reload()
        await h1(page, 'feedbacks').waitFor()
        await page.getByText('Relato fictício sobre onboarding confuso.').waitFor()
        await page.waitForTimeout(150)
        const reloadMetrics = await navMetrics(page)
        const reloadBytes = bytesSummary(reloadMetrics.resources, reloadMetrics.docTransfer, reloadMetrics.docEncoded, reloadMetrics.docDecoded)
        report.scenarios['N-navegacao'].reloadWarm = {
          bytes: reloadBytes,
          assets: reloadMetrics.resources.map((entry) => entry.name),
          transferredBytes: reloadBytes.transferBytes,
          ttfb: reloadMetrics.ttfb,
          note: 'reload a quente: todos os assets já em cache HTTP do contexto',
        }

        const markBack = await page.evaluate(() => performance.now())
        await page.goBack()
        await h1(page, 'overview').waitFor()
        await page.getByText('Conversão Free → Premium').first().waitFor()
        const backFetches = await page.evaluate(
          (from) =>
            performance
              .getEntriesByType('resource')
              .filter((entry) => entry.startTime >= from)
              .map((entry) => ({ name: entry.name.split('/').pop().split('?')[0], transfer: entry.transferSize })),
          markBack,
        )
        report.scenarios['N-navegacao'].backWarm = {
          fetchedAfterBack: backFetches,
          note: 'retorno por histórico em SPA: apenas recursos realmente buscados após o retorno (esperado: nenhum)',
        }
        assertClean('N jornada', journey.events)
      } finally {
        await journey.context.close()
      }
    })
  })
}

if (scenario('I')) {
  describe('I — Interações direcionadas', () => {
    test('busca, filtros, formulários, caso e tour (jornada única com ciclos repetidos)', async () => {
      const measure = await newPage(browser, { dataset: SMALL })
      try {
        const { page } = measure
        const results = {}

        await loadRoute(measure, 'feedbacks')
        await page.getByText('Relato fictício sobre onboarding confuso.').waitFor()

        const searchRuns = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          searchRuns.push(
            await timedAction(
              page,
              () => page.locator('#feedback-search').fill('onboarding'),
              () => document.body.innerText.includes(`Exibindo 1 de 2`),
            ),
          )
          await timedAction(
            page,
            () => page.locator('#feedback-search').fill(''),
            () => document.body.innerText.includes('Exibindo 2 de 2'),
          )
        }
        results.feedbackSearch = { cycles: searchRuns, paint: stats(searchRuns.map((run) => run.paintMs)) }

        const categoryRun = await timedAction(
          page,
          () => page.locator('#feedback-filter-category').selectOption('usability'),
          () => document.body.innerText.includes('Exibindo 1 de 2'),
        )
        await timedAction(
          page,
          () => page.locator('#feedback-filter-category').selectOption('all'),
          () => document.body.innerText.includes('Exibindo 2 de 2'),
        )
        results.feedbackCategoryFilter = categoryRun

        const formRun = await timedAction(
          page,
          () => button(page, 'Novo feedback').click(),
          () => Boolean(document.querySelector('[role="dialog"]')),
        )
        results.feedbackFormOpen = formRun
        await page.keyboard.press('Escape')
        await dialog(page).waitFor({ state: 'detached' })

        await loadRoute(measure, 'decisions')
        await page.getByText('Simplificar o onboarding').first().waitFor()
        const decisionRuns = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          decisionRuns.push(
            await timedAction(
              page,
              () => page.locator('#decision-search').fill('onboarding'),
              () => document.body.innerText.includes('Exibindo 1 de 1'),
            ),
          )
          await timedAction(
            page,
            () => page.locator('#decision-search').fill(''),
            () => document.body.innerText.includes('Exibindo 1 de 1'),
          )
        }
        results.decisionSearch = { cycles: decisionRuns, paint: stats(decisionRuns.map((run) => run.paintMs)) }

        await loadRoute(measure, 'interactive-case')
        await page.locator('figure svg.recharts-surface').first().waitFor()
        const group = page.getByRole('group', { name: 'Selecionar indicador' })
        const secondName = (await group.getByRole('button').nth(1).textContent())?.trim()
        const firstName = (await group.getByRole('button').first().textContent())?.trim()
        const metricRuns = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          metricRuns.push(
            await timedAction(
              page,
              () => group.getByRole('button').nth(1).click(),
              (name) => {
                const pressed = [
                  ...document.querySelectorAll('[aria-label="Selecionar indicador"] button[aria-pressed="true"]'),
                ].map((node) => node.textContent?.trim())
                return pressed.includes(name)
              },
              secondName,
            ),
          )
          await timedAction(
            page,
            () => group.getByRole('button').first().click(),
            (name) => {
              const pressed = [
                ...document.querySelectorAll('[aria-label="Selecionar indicador"] button[aria-pressed="true"]'),
              ].map((node) => node.textContent?.trim())
              return pressed.includes(name)
            },
            firstName,
          )
        }
        results.caseMetricSwitch = { cycles: metricRuns, paint: stats(metricRuns.map((run) => run.paintMs)) }

        const evidenceSelects = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          evidenceSelects.push(
            await timedAction(
              page,
              () => page.locator('input[id^="case-evidence-"]').nth(cycle).click(),
              (expected) => document.querySelectorAll('input[id^="case-evidence-"]:checked').length === expected,
              cycle + 1,
            ),
          )
        }
        results.caseEvidenceSelect = { cycles: evidenceSelects, paint: stats(evidenceSelects.map((run) => run.paintMs)) }

        const hypothesisRun = await timedAction(
          page,
          () => page.getByLabel('Sua hipótese de produto').fill('Hipótese fictícia para medir a geração da síntese.'),
          () => Boolean(document.querySelector('textarea') && document.querySelector('textarea').value.length > 0),
        )
        results.caseHypothesisFill = hypothesisRun

        const optionRun = await timedAction(
          page,
          () => page.locator('input[name="case-decision-option"]').first().click(),
          () => Boolean(document.querySelector('input[name="case-decision-option"]:checked')),
        )
        results.caseOptionSelect = optionRun

        const summaryRun = await timedAction(
          page,
          () => button(page, 'Ver síntese da minha decisão').click(),
          () => Boolean(document.querySelector('#case-decision-summary')),
        )
        results.caseSummaryGenerate = summaryRun

        assertClean('interações', measure.events)
        report.interactions = {
          dataset: 'small',
          methodology:
            'wallMs inclui overhead do protocolo Playwright; paintMs = double-rAF após atualização do DOM a partir de t0 no próprio documento; slowestEvent = maior duração reportada pela Event Timing API durante a interação (não é INP de campo)',
          ...results,
        }
      } finally {
        await measure.context.close()
      }
    })
  })
}

if (scenario('R')) {
  describe('R — Renderização React com volume maior', () => {
    test('overview com 60 indicadores, busca com 200 feedbacks e 60 decisões', async () => {
      const measure = await newPage(browser, { dataset: LARGE })
      try {
        const { page } = measure
        const settleStart = Date.now()
        await loadRoute(measure, 'overview')
        await page.getByText('Indicador de performance 1').first().waitFor()
        await page.waitForTimeout(300)
        const metrics = await navMetrics(page)
        assertClean('R overview grande', measure.events)

        const open = await timedAction(
          page,
          () =>
            page
              .getByRole('button', { name: 'Abrir indicador Indicador de performance 1', exact: true })
              .click(),
          () => {
            const dlg = document.querySelector('[role="dialog"]')
            return Boolean(dlg && dlg.querySelector('svg.recharts-surface'))
          },
        )
        await page.keyboard.press('Escape')
        await dialog(page).waitFor({ state: 'detached' })

        await loadRoute(measure, 'feedbacks')
        await page.getByText('Relato fictício 0').waitFor()
        const shownSearch = `Exibindo ${LARGE_FEEDBACK_SEARCH} de ${LARGE.feedbacks.length}`
        const shownAll = `Exibindo ${LARGE.feedbacks.length} de ${LARGE.feedbacks.length}`
        const shownCategory = `Exibindo ${LARGE_FEEDBACK_CATEGORY} de ${LARGE.feedbacks.length}`
        const textIncludes = (expected) => document.body.innerText.includes(expected)
        const feedbackRuns = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          feedbackRuns.push(
            await timedAction(
              page,
              () => page.locator('#feedback-search').fill('onboarding'),
              textIncludes,
              shownSearch,
            ),
          )
          await timedAction(page, () => page.locator('#feedback-search').fill(''), textIncludes, shownAll)
        }
        const categoryRun = await timedAction(
          page,
          () => page.locator('#feedback-filter-category').selectOption('bug'),
          textIncludes,
          shownCategory,
        )
        await timedAction(
          page,
          () => page.locator('#feedback-filter-category').selectOption('all'),
          textIncludes,
          shownAll,
        )

        await loadRoute(measure, 'decisions')
        await page.getByText('Melhoria 2', { exact: false }).first().waitFor()
        const shownDecisionSearch = `Exibindo ${LARGE_DECISION_SEARCH} de ${LARGE.decisions.length}`
        const shownDecisionAll = `Exibindo ${LARGE.decisions.length} de ${LARGE.decisions.length}`
        const decisionRuns = []
        for (let cycle = 0; cycle < 3; cycle += 1) {
          decisionRuns.push(
            await timedAction(
              page,
              () => page.locator('#decision-search').fill('onboarding'),
              textIncludes,
              shownDecisionSearch,
            ),
          )
          await timedAction(
            page,
            () => page.locator('#decision-search').fill(''),
            textIncludes,
            shownDecisionAll,
          )
        }

        report.scenarios['R-renderizacao-grande'] = {
          description: `Workspace grande: ${LARGE.metrics.length} indicadores, ${LARGE.observations.length} observações, ${LARGE.feedbacks.length} feedbacks, ${LARGE.decisions.length} decisões`,
          overviewLoad: {
            wallToInteractiveMs: round1(Date.now() - settleStart),
            fcp: metrics.fcp,
            lcp: metrics.lcp,
            lcpElement: metrics.lcpElement,
            cls: metrics.cls,
            longestTask: metrics.longTasks.length ? Math.max(...metrics.longTasks.map((task) => task.duration)) : 0,
            longTaskCount: metrics.longTasks.length,
            bytes: bytesSummary(metrics.resources),
          },
          detailOpenLarge: open,
          feedbackSearchLarge: { paint: stats(feedbackRuns.map((run) => run.paintMs)), wall: stats(feedbackRuns.map((run) => run.wallMs)), slowestEvent: stats(feedbackRuns.map((run) => run.slowestEvent)) },
          feedbackCategoryFilterLarge: categoryRun,
          decisionSearchLarge: { paint: stats(decisionRuns.map((run) => run.paintMs)), wall: stats(decisionRuns.map((run) => run.wallMs)), slowestEvent: stats(decisionRuns.map((run) => run.slowestEvent)) },
          note: 'React Profiler indisponível em build de produção; evidência empírica via Event Timing, long tasks e tempo até pintura',
        }
      } finally {
        await measure.context.close()
      }
    })
  })
}

if (WITH_THROTTLE && scenario('T')) {
  describe('T — Amostragem com limitação de CPU e rede', () => {
    test('overview vazio e interactive case sob CPU 4x + Fast 3G', async () => {
      const runs = []
      for (let index = 0; index < Math.min(REPETITIONS, 3); index += 1) {
        const measure = await newPage(browser, { cpuThrottle: THROTTLE_CPU, netThrottle: true })
        try {
          const settleStart = Date.now()
          await loadRoute(measure, 'overview')
          await measure.page.locator('[data-tour-id="demo-preview"] svg.recharts-surface').waitFor()
          await measure.page.waitForTimeout(250)
          const metrics = await navMetrics(measure.page)
          assertClean(`T overview ${index + 1}`, measure.events)
          runs.push(
            runSummary({
              ...metrics,
              bytes: bytesSummary(metrics.resources, metrics.docTransfer, metrics.docEncoded, metrics.docDecoded),
              assets: assetNames(measure.requests),
              errors: { ...measure.events },
              extra: { wallToInteractiveMs: round1(Date.now() - settleStart) },
            }),
          )
        } finally {
          await measure.context.close()
        }
      }

      const caseMeasure = await newPage(browser, { cpuThrottle: THROTTLE_CPU, netThrottle: true })
      try {
        const settleStart = Date.now()
        await loadRoute(caseMeasure, 'interactive-case')
        await caseMeasure.page.locator('figure svg.recharts-surface').first().waitFor()
        await caseMeasure.page.waitForTimeout(250)
        const metrics = await navMetrics(caseMeasure.page)
        assertClean('T caso', caseMeasure.events)
        report.scenarios['T-throttled'] = {
          description: 'CPU 4x + Fast 3G (latency=150ms, down≈1,6Mbps, up≈750kbps) — perfil separado, não comparável com condições normais',
          overviewRuns: runs,
          overview: {
            ttfb: stats(runs.map((run) => run.ttfb)),
            fcp: stats(runs.map((run) => run.fcp)),
            lcp: stats(runs.map((run) => run.lcp)),
            transferBytes: stats(runs.map((run) => run.bytes?.transferBytes)),
            wallToInteractive: stats(runs.map((run) => run.extra?.wallToInteractiveMs)),
          },
          interactiveCase: {
            wallToInteractiveMs: round1(Date.now() - settleStart),
            fcp: metrics.fcp,
            lcp: metrics.lcp,
            transferBytes: bytesSummary(metrics.resources).transferBytes,
            resourceDurations: metrics.resources
              .filter((entry) => entry.duration > 100)
              .map((entry) => ({ name: entry.name, duration: entry.duration })),
          },
        }
      } finally {
        await caseMeasure.context.close()
      }
    })
  })
}

/* ------------------------------------------------------------------ */
/* Saída                                                               */
/* ------------------------------------------------------------------ */

if (process.env.PDL_SELF_CHECK === '1') {
  const assert = require('node:assert/strict')
  globalThis.location = { href: 'http://127.0.0.1:4731/', origin: 'http://127.0.0.1:4731' }

  // Coleta: documento e recursos locais entram; recursos externos, não.
  assert.equal(collectedResource({ name: 'http://127.0.0.1:4731/' }), true)
  assert.equal(collectedResource({ name: 'http://127.0.0.1:4731/assets/index-CDxyzbez.js' }), true)
  assert.equal(collectedResource({ name: 'http://127.0.0.1:4731/fonts/bricolage-grotesque.woff2' }), true)
  assert.equal(collectedResource({ name: 'https://cdn.example.com/assets/app.js' }), false)
  assert.equal(collectedResource({ name: 'https://cdn.example.com/fonts/font.woff2' }), false)
  assert.equal(collectedResource({ name: 'http://127.0.0.1:4731/sem-bundle' }), false)

  // Agregação: CLS preserva precisão; medianas temporais e de bytes seguem corretas.
  assert.equal(stats([0.041, 0.041, 0.041], 3).median, 0.041)
  assert.deepEqual(stats([0.041, 0.041, 0.041], 3).values, [0.041, 0.041, 0.041])
  assert.equal(stats([0.041, 0.015], 3).median, 0.028)
  assert.equal(stats([96, 120, 128]).median, 120)
  assert.equal(stats([100, 201]).median, 150.5)
  assert.equal(stats([159347, 150539, 156166]).median, 156166)
  assert.equal(stats([]), null)

  console.log('PDL_SELF_CHECK ok: coleta de recursos e agregação de stats validadas')
  process.exit(0)
}

function dump() {
  const dir = path.dirname(RESULTS)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(RESULTS, JSON.stringify(report, null, 2))
}

after(async () => {
  if (browser) await browser.close()
  dump()
})

process.on('SIGINT', () => {
  dump()
  process.exit(130)
})

test('resumo', async () => {
  dump()
  console.log('--- 4C.5d.2 performance ---')
  for (const [id, data] of Object.entries(report.scenarios)) {
    const parts = []
    if (data.lcp) parts.push(`LCP mediana ${data.lcp.median}ms`)
    if (data.transferBytes) parts.push(`transferência mediana ${Math.round(data.transferBytes.median / 1024)}kB`)
    if (data.wallToInteractive) parts.push(`interativa em ~${data.wallToInteractive.median}ms (wall)`)
    console.log(`${id}: ${parts.join(' · ') || 'sem agregados'}`)
  }
  console.log(`resultados completos em ${RESULTS}`)
})
