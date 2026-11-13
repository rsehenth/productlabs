/**
 * Compatibilidade entre motores de navegador 4C.5d.1 — Chromium, Firefox e WebKit.
 *
 * Uso:
 *   PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5d1-compatibility.cjs
 *
 * Variáveis opcionais: PDL_BASE_URL (padrão http://127.0.0.1:4731), PDL_RESULTS (JSON),
 * PDL_ONLY (chromium|firefox|webkit), PDL_DEBUG.
 *
 * Não instala nem baixa navegadores: cada motor só roda se o binário do Playwright já
 * existir no cache local. Motor ausente gera BLOCKED na matriz inteira, nunca PASS.
 * Dados exclusivamente fictícios, contextos isolados, build de produção em vite preview
 * restrito a 127.0.0.1.
 */
const assert = require('node:assert/strict')
const { test, describe, before, after } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const KEY = 'product-decision-lab:workspace'
const RESULTS = process.env.PDL_RESULTS || path.join(os.tmpdir(), 'pdl-4c5d1-results.json')
const ONLY = process.env.PDL_ONLY || ''
const ISO = '2026-09-01T10:00:00.000Z'

/** Linhas da matriz principal; todo motor recebe um status para cada uma. */
const MATRIX = [
  'rotas',
  'reload-historico',
  'chunks-dinamicos',
  'graficos',
  'dialogos',
  'tour',
  'persistencia',
  'web-locks',
  'foco-teclado',
  'responsividade',
  'console-rede',
]

const ENGINES = ['chromium', 'firefox', 'webkit'].filter((name) => !ONLY || name === ONLY)

const results = []
function record(engine, id, status, detail = '') {
  results.push({ engine, id, status, detail })
  console.log(`${status} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`)
}
function dump() {
  const classification = {}
  for (const engine of ENGINES) {
    const rows = results.filter((row) => row.engine === engine)
    if (!rows.length) continue
    if (rows.every((row) => row.status === 'BLOCKED')) classification[engine] = 'BLOCKED'
    else if (rows.some((row) => row.status === 'FAIL')) classification[engine] = 'FAIL'
    else if (rows.some((row) => row.status === 'PASS WITH LIMITATIONS')) classification[engine] = 'PASS WITH LIMITATIONS'
    else classification[engine] = 'PASS'
  }
  fs.writeFileSync(RESULTS, JSON.stringify({ origin: ORIGIN, classification, results }, null, 2))
}
process.on('exit', dump)

/* ------------------------------------------------------------------ */
/* Disponibilidade dos motores                                        */
/* ------------------------------------------------------------------ */

function resolveEngine(name) {
  let executablePath = null
  try {
    executablePath = pw[name].executablePath()
  } catch (error) {
    return { name, available: false, reason: `executablePath falhou: ${String(error.message).split('\n')[0]}` }
  }
  if (!executablePath || !fs.existsSync(executablePath)) {
    return { name, available: false, reason: `binário ausente: ${executablePath}` }
  }
  return { name, available: true, executablePath }
}

const engines = ENGINES.map(resolveEngine)

/* ------------------------------------------------------------------ */
/* Helpers (mesmo formato dos scripts 4C.5b/4C.5c)                    */
/* ------------------------------------------------------------------ */

function instrument(page) {
  const events = { consoleErrors: [], pageErrors: [], failed: [], http: [] }
  page.on('console', (message) => {
    if (message.type() === 'error') events.consoleErrors.push(message.text().slice(0, 300))
  })
  page.on('pageerror', (error) => events.pageErrors.push(String(error).slice(0, 300)))
  page.on('requestfailed', (request) => {
    if (!/favicon/.test(request.url())) events.failed.push(`${request.url()} ${request.failure()?.errorText}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon/.test(response.url())) events.http.push(`${response.status()} ${response.url()}`)
  })
  return events
}

function assertClean(label, events) {
  assert.deepEqual(events.pageErrors, [], `${label}: pageerror`)
  assert.deepEqual(events.consoleErrors, [], `${label}: console errors`)
  assert.deepEqual(events.failed, [], `${label}: requests com falha`)
  assert.deepEqual(events.http, [], `${label}: HTTP >= 400`)
}

const go = (page, route) => page.goto(`${ORIGIN}/#/${route}`)
const dialog = (page) => page.locator('[role="dialog"]').last()
const button = (scope, name) => scope.getByRole('button', { name, exact: true })
const activeText = (page) => page.evaluate(() => (document.activeElement?.textContent || '').trim())
const raw = (page) => page.evaluate((key) => localStorage.getItem(key), KEY)
const stored = async (page) => JSON.parse((await raw(page)) || 'null')

const WORDS = 'cadastro lento onboarding professor turma relatorio pagamento confuso suporte assinatura'.split(' ')
const words = (n, seed = 0) => Array.from({ length: n }, (_, index) => WORDS[(index + seed) % WORDS.length]).join(' ')

function seedWorkspace() {
  const months = []
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(Date.UTC(2026, 8 - index, 1))
    months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  const metrics = [
    {
      id: 'compat-metric-long',
      name: 'Conversão Free → Premium',
      description: words(80).slice(0, 480),
      unit: 'percent',
      desiredDirection: 'increase',
      createdAt: ISO,
    },
    { id: 'compat-metric-churn', name: 'Churn mensal', description: 'Cancelamentos no mês.', unit: 'percent', desiredDirection: 'decrease', createdAt: ISO },
  ]
  const observations = months.map((period, index) => ({
    id: `compat-obs-${index}`,
    metricId: index % 2 === 0 ? 'compat-metric-long' : 'compat-metric-churn',
    period,
    value: 12 + index,
    createdAt: ISO,
  }))
  const feedbacks = [
    { id: 'compat-feedback-1', content: 'Relato fictício sobre onboarding confuso.', category: 'usability', source: 'interview', receivedAt: '2026-06-10T10:00:00.000Z', metricIds: ['compat-metric-long'] },
    { id: 'compat-feedback-2', content: 'Relato fictício sobre preço.', category: 'pricing', source: 'survey', receivedAt: '2026-07-11T10:00:00.000Z', metricIds: [] },
  ]
  const decisions = [
    {
      id: 'compat-decision-1',
      title: 'Simplificar o onboarding',
      problem: 'Queda de ativação após o cadastro.',
      hypothesis: 'Menos etapas aumentam a ativação.',
      metricIds: ['compat-metric-long'],
      feedbackIds: ['compat-feedback-1'],
      alternatives: ['Reduzir etapas', 'Tutorial guiado'],
      decision: 'Reduzir etapas.',
      successCriteria: ['Ativação acima de 40%'],
      nextSteps: ['Medir em duas semanas'],
      status: 'decided',
      createdAt: ISO,
      updatedAt: ISO,
    },
  ]
  return { schemaVersion: 1, savedAt: ISO, data: { metrics, observations, feedbacks, decisions } }
}

async function newPage(browser, { seeded = false, viewport, noLocks = false, mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: viewport || { width: 1280, height: 800 },
    locale: 'pt-BR',
    isMobile: mobile,
    hasTouch: mobile,
  })
  context.setDefaultTimeout(15000)
  if (seeded) {
    await context.addInitScript(
      ({ key, value }) => {
        try {
          if (!localStorage.getItem(key)) localStorage.setItem(key, value)
        } catch {
          /* contexto sem storage */
        }
      },
      { key: KEY, value: JSON.stringify(seedWorkspace()) },
    )
  }
  if (noLocks) {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'locks', { get: () => undefined, configurable: true })
    })
  }
  const page = await context.newPage()
  return { context, page, events: instrument(page) }
}

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  assert.equal(overflow.doc, false, `${label}: overflow horizontal (${overflow.scrollWidth} > ${overflow.clientWidth})`)
}

const ROUTE_TITLES = {
  overview: 'Product Overview',
  feedbacks: 'Feedback Discovery',
  decisions: 'Decision Workspace',
  'interactive-case': 'ProfResolve — Growth & Monetization',
}

const h1 = (page, route) =>
  page.getByRole('heading', { level: 1, name: ROUTE_TITLES[route], exact: true })

async function openRoute(page, route) {
  await go(page, route)
  await h1(page, route).waitFor()
  await page.waitForFunction(() => (document.querySelector('main')?.innerText || '').length > 200)
}

async function openOverview(page) {
  await openRoute(page, 'overview')
}

async function createMetric(page, name) {
  await button(page, 'Novo indicador').click()
  const dlg = dialog(page)
  await dlg.locator('#metric-name').fill(name)
  await button(dlg, 'Criar indicador').click()
  await dialog(page).getByRole('heading', { name, exact: true }).waitFor()
}

const tourPanel = (page) => page.locator('[role="dialog"][aria-modal="true"]')

async function startTour(page) {
  await button(page, 'Como funciona').click()
  const panel = tourPanel(page)
  await panel.waitFor()
  if (await panel.getByRole('button', { name: 'Iniciar tour', exact: true }).count()) {
    await panel.getByRole('button', { name: 'Iniciar tour', exact: true }).click()
  }
  await page.getByText('1 de 15', { exact: true }).waitFor()
  return panel
}

/* ------------------------------------------------------------------ */
/* Suítes por motor                                                   */
/* ------------------------------------------------------------------ */

for (const engine of engines) {
  if (!engine.available) {
    describe(`${engine.name} (indisponível)`, () => {
      test(`matriz ${engine.name}`, () => {
        record(engine.name, 'versao', 'BLOCKED', engine.reason)
        for (const id of MATRIX) record(engine.name, id, 'BLOCKED', engine.reason)
      })
    })
    continue
  }

  describe(engine.name, () => {
    let browser = null
    /** `engine`: binário não inicia (BLOCKED). `origin`: aplicação/servidor fora do ar (FAIL). */
    let blocker = null

    before(async () => {
      try {
        const probe = new URL(ORIGIN)
        const reachable = await new Promise((resolve) => {
          const socket = require('node:net').connect(Number(probe.port) || 80, probe.hostname)
          socket.setTimeout(5000)
          socket.once('connect', () => {
            socket.destroy()
            resolve(true)
          })
          socket.once('timeout', () => {
            socket.destroy()
            resolve(false)
          })
          socket.once('error', () => resolve(false))
        })
        if (!reachable) {
          blocker = { kind: 'origin', reason: `servidor inacessível em ${ORIGIN}` }
          record(engine.name, 'versao', 'FAIL', blocker.reason)
          return
        }

        browser = await pw[engine.name].launch({ executablePath: engine.executablePath })
        const version = browser.version()
        const tab = await browser.newPage()
        await tab.goto(`${ORIGIN}/`)
        const env = await tab.evaluate(() => ({
          ua: navigator.userAgent,
          secure: window.isSecureContext,
          locks: typeof navigator.locks,
        }))
        record(engine.name, 'versao', 'INFO', `${version} · ${env.ua} · isSecureContext=${env.secure} · navigator.locks=${env.locks}`)
        await tab.close()
      } catch (error) {
        blocker = { kind: 'engine', reason: `falha ao iniciar: ${String(error.message).split('\n')[0].slice(0, 200)}` }
        record(engine.name, 'versao', 'BLOCKED', blocker.reason)
      }
    })

    after(async () => {
      if (browser) await browser.close()
    })

    const guard = (id) => {
      if (blocker) {
        record(engine.name, id, blocker.kind === 'engine' ? 'BLOCKED' : 'FAIL', blocker.reason)
        return true
      }
      return false
    }

    /* 1. Rotas, títulos e conteúdo ----------------------------------- */
    test('rotas: quatro rotas diretas com título e conteúdo principal', async () => {
      if (guard('rotas')) return
      const { context, page, events } = await newPage(browser)
      try {
        for (const route of Object.keys(ROUTE_TITLES)) await openRoute(page, route)
        assertClean('rotas diretas', events)
        record(engine.name, 'rotas', 'PASS', '4/4 rotas com h1 e conteúdo principal')
      } catch (error) {
        record(engine.name, 'rotas', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 2. Reload, navegação principal e histórico --------------------- */
    test('reload e histórico: reload por rota, links, voltar e avançar', async () => {
      if (guard('reload-historico')) return
      const reloadRun = await newPage(browser)
      try {
        for (const route of Object.keys(ROUTE_TITLES)) {
          await openRoute(reloadRun.page, route)
          await reloadRun.page.reload()
          await h1(reloadRun.page, route).waitFor()
          assert.equal(await reloadRun.page.evaluate(() => location.hash), `#/${route}`, `${route}: reload perdeu a rota`)
        }
        assertClean('reload', reloadRun.events)
      } catch (error) {
        record(engine.name, 'reload-historico', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await reloadRun.context.close()
      }

      const { context, page, events } = await newPage(browser)
      try {
        await openOverview(page)
        const nav = page.locator('nav[aria-label="Navegação principal"]')
        await nav.getByRole('link', { name: /Feedbacks/ }).click()
        await h1(page, 'feedbacks').waitFor()
        await nav.getByRole('link', { name: /Decisions/ }).click()
        await h1(page, 'decisions').waitFor()

        await page.goBack()
        await h1(page, 'feedbacks').waitFor()
        await page.goBack()
        await h1(page, 'overview').waitFor()
        await page.goForward()
        await h1(page, 'feedbacks').waitFor()

        assertClean('histórico', events)
        record(engine.name, 'reload-historico', 'PASS', '4 reloads preservaram a rota; links + voltar/avançar coerentes')
      } catch (error) {
        record(engine.name, 'reload-historico', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 3. Chunks dinâmicos e estado Suspense -------------------------- */
    test('chunks: carregamento dinâmico por rota e fallback Suspense', async () => {
      if (guard('chunks-dinamicos')) return
      const { context, page, events } = await newPage(browser, { seeded: true })
      const chunks = new Set()
      page.on('response', (response) => {
        const name = response.url().split('/').pop() || ''
        if (response.url().includes('/assets/') && name.endsWith('.js')) {
          chunks.add(name.replace(/-[A-Za-z0-9_-]{8}\.js$/, ''))
        }
      })
      try {
        for (const route of Object.keys(ROUTE_TITLES)) await openRoute(page, route)
        await button(page, 'Como funciona').click()
        await tourPanel(page).waitFor()
        await page.keyboard.press('Escape')
        await tourPanel(page).waitFor({ state: 'detached' })

        const expected = ['overview-page', 'feedbacks-page', 'decisions-page', 'interactive-case-page', 'product-tour']
        const missing = expected.filter((name) => !chunks.has(name))
        assert.deepEqual(missing, [], `chunks não carregados: ${missing.join(', ')}`)
        assertClean('chunks', events)

        // Fallback Suspense de forma determinística: segura o chunk da Overview.
        const slow = await newPage(browser)
        try {
          let release
          const gate = new Promise((resolve) => {
            release = resolve
          })
          let held = false
          await slow.page.route(/\/assets\/overview-page-[^/]*\.js/, async (route) => {
            held = true
            await gate
            await route.continue()
          })
          await slow.page.goto(`${ORIGIN}/#/overview`, { waitUntil: 'domcontentloaded' })
          await slow.page.getByRole('status').filter({ hasText: 'Carregando página' }).waitFor()
          assert.equal(held, true, 'chunk da Overview não foi interceptado')
          release()
          await h1(slow.page, 'overview').waitFor()
          assertClean('fallback Suspense', slow.events)
        } finally {
          await slow.context.close()
        }

        record(engine.name, 'chunks-dinamicos', 'PASS', `${chunks.size} chunks; estado Suspense observado`)
      } catch (error) {
        record(engine.name, 'chunks-dinamicos', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 4. Gráficos Recharts ------------------------------------------- */
    test('gráficos: demonstrativo, indicador com observações e caso', async () => {
      if (guard('graficos')) return
      const notes = []

      const compact = await newPage(browser, { viewport: { width: 320, height: 568 }, mobile: true })
      try {
        await openOverview(compact.page)
        const demo = compact.page.locator('[data-tour-id="demo-preview"]')
        await demo.locator('svg.recharts-surface').waitFor()
        const stats = await compact.page.evaluate(() => {
          const root = document.querySelector('[data-tour-id="demo-preview"]')
          const box = root?.getBoundingClientRect()
          return {
            paths: root?.querySelectorAll('svg.recharts-surface path').length || 0,
            width: box ? Math.round(box.width) : 0,
            vw: document.documentElement.clientWidth,
            summary: [...(root?.querySelectorAll('p') || [])].some((p) => /Série simulada/.test(p.textContent || '')),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          }
        })
        assert.ok(stats.paths > 0, 'gráfico demonstrativo sem traço SVG')
        assert.equal(stats.summary, true, 'gráfico demonstrativo sem resumo textual dos valores')
        assert.ok(stats.width <= stats.vw, `gráfico demonstrativo excede a viewport em 320 (${stats.width}px)`)
        assert.equal(stats.overflow, false, 'overflow horizontal com o gráfico demonstrativo em 320')
        assertClean('gráfico demonstrativo', compact.events)
        notes.push(`demonstrativo em 320x568 (${stats.paths} paths)`)
      } finally {
        await compact.context.close()
      }

      const seeded = await newPage(browser, { seeded: true })
      try {
        await openOverview(seeded.page)
        await button(seeded.page, 'Abrir indicador Conversão Free → Premium').click()
        const dlg = dialog(seeded.page)
        await dlg.locator('figure svg.recharts-surface').waitFor()
        const chart = await seeded.page.evaluate(() => {
          const figure = document.querySelector('[role="dialog"] figure')
          const svg = figure?.querySelector('svg.recharts-surface')
          return {
            circles: svg ? svg.querySelectorAll('circle').length : 0,
            caption: figure?.querySelector('figcaption')?.textContent?.trim() || '',
            hiddenCanvas: Boolean(figure?.querySelector('[aria-hidden="true"]')),
            box: figure ? figure.getBoundingClientRect().width : 0,
            container: figure?.parentElement?.getBoundingClientRect().width || 0,
          }
        })
        assert.ok(chart.circles >= 6, `gráfico do indicador sem pontos suficientes (${chart.circles})`)
        assert.ok(chart.caption.length > 20, 'gráfico do indicador sem descrição acessível')
        assert.match(chart.caption, /observaç/, 'descrição acessível não descreve as observações')
        assert.equal(chart.hiddenCanvas, true, 'gráfico não oculto do leitor de tela (duplicaria a legenda)')
        assert.ok(chart.box <= chart.container + 2, 'gráfico do indicador excede o contêiner')
        await seeded.page.keyboard.press('Escape')
        await dlg.waitFor({ state: 'detached' })
        assertClean('gráfico do indicador', seeded.events)
        notes.push(`indicador (${chart.circles} pontos, legenda sr-only)`)
      } finally {
        await seeded.context.close()
      }

      const casePage = await newPage(browser)
      try {
        await openRoute(casePage.page, 'interactive-case')
        const group = casePage.page.getByRole('group', { name: 'Selecionar indicador' })
        const first = group.getByRole('button').first()
        const label = (await first.textContent())?.trim()
        await first.click()
        await casePage.page.locator('figure svg.recharts-surface').waitFor()
        const chart = await casePage.page.evaluate(() => {
          const figure = document.querySelector('figure')
          const svg = figure?.querySelector('svg.recharts-surface')
          return {
            circles: svg ? svg.querySelectorAll('circle').length : 0,
            caption: figure?.querySelector('figcaption')?.textContent?.trim() || '',
            legend: [...(figure?.querySelectorAll('span') || [])].map((span) => (span.textContent || '').trim()),
          }
        })
        assert.ok(chart.circles >= 4, 'gráfico inicial do caso sem pontos')
        assert.ok(chart.caption.length > 20, 'gráfico do caso sem descrição acessível')
        assert.ok(chart.legend.includes('Primeira observação'), 'legenda "Primeira observação" ausente')
        assert.ok(chart.legend.includes('Última observação'), 'legenda "Última observação" ausente')
        assertClean('gráfico do caso', casePage.events)
        notes.push(`caso (${label}, ${chart.circles} pontos, legenda visível)`)
        record(engine.name, 'graficos', 'PASS', notes.join(' | '))
      } catch (error) {
        record(engine.name, 'graficos', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await casePage.context.close()
      }
    })

    /* 5. Diálogos e viewports compactas ------------------------------ */
    test('diálogos: foco contido, Escape, descrição longa e viewports compactas', async () => {
      if (guard('dialogos')) return
      const notes = []
      const { context, page, events } = await newPage(browser, { seeded: true })
      try {
        await openOverview(page)
        await button(page, 'Novo indicador').focus()
        await page.keyboard.press('Enter')
        const dlg = dialog(page)
        await dlg.waitFor()
        assert.equal(
          await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement))),
          true,
          'foco não entrou no diálogo',
        )
        const trail = []
        for (let step = 0; step < 8; step += 1) {
          await page.keyboard.press('Tab')
          trail.push(await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement))))
        }
        assert.deepEqual([...new Set(trail)], [true], 'Tab escapou do diálogo')
        await page.keyboard.press('Escape')
        await dlg.waitFor({ state: 'detached' })
        assert.match(await activeText(page), /Novo indicador/, 'foco não retornou ao disparador')
        assertClean('diálogo do indicador', events)
        notes.push('foco contido e Escape devolvendo foco')

        await button(page, 'Abrir indicador Conversão Free → Premium').click()
        const detail = dialog(page)
        await detail.waitFor()
        const long = await page.evaluate(() => {
          const dlg = document.querySelector('[role="dialog"]')
          const paragraphs = [...dlg.querySelectorAll('p')].map((p) => (p.textContent || '').trim())
          let node = dlg.querySelector('h2')?.parentElement
          let scrollable = false
          while (node && node !== dlg) {
            const style = getComputedStyle(node)
            if (['auto', 'scroll'].includes(style.overflowY)) scrollable = true
            node = node.parentElement
          }
          return {
            longest: Math.max(...paragraphs.map((text) => text.length)),
            scrollable,
            overflowX: dlg.scrollWidth > dlg.clientWidth + 1,
          }
        })
        assert.ok(long.longest > 200, `descrição longa não renderizada (${long.longest} caracteres)`)
        assert.equal(long.overflowX, false, 'diálogo de detalhe com overflow horizontal')
        assert.equal(long.scrollable, true, 'descrição longa sem região rolável prevista')
        await page.keyboard.press('Escape')
        await detail.waitFor({ state: 'detached' })
        notes.push(`descrição longa (${long.longest} caracteres) no cabeçalho rolável`)
      } finally {
        await context.close()
      }

      for (const viewport of [
        { name: '1280x800', width: 1280, height: 800 },
        { name: '390x844', width: 390, height: 844, mobile: true },
        { name: '320x568', width: 320, height: 568, mobile: true },
        { name: '320x256', width: 320, height: 256 },
      ]) {
        const room = await newPage(browser, {
          seeded: true,
          viewport: { width: viewport.width, height: viewport.height },
          mobile: Boolean(viewport.mobile),
        })
        try {
          await openOverview(room.page)
          await button(room.page, 'Abrir indicador Conversão Free → Premium').click()
          const dlg = dialog(room.page)
          await dlg.waitFor()
          const fit = await room.page.evaluate(() => {
            const dlg = document.querySelector('[role="dialog"]')
            const rect = dlg.getBoundingClientRect()
            const close = dlg.querySelector('button[aria-label="Fechar"]')?.getBoundingClientRect()
            return {
              top: rect.top,
              left: rect.left,
              right: rect.right,
              bottom: rect.bottom,
              vw: window.innerWidth,
              vh: window.innerHeight,
              closeVisible: close ? close.top >= 0 && close.bottom <= window.innerHeight && close.right <= window.innerWidth : false,
              overflowX: dlg.scrollWidth > dlg.clientWidth + 1,
            }
          })
          assert.ok(fit.top >= -1 && fit.left >= -1, `${viewport.name}: diálogo fora da viewport (top ${fit.top})`)
          assert.ok(fit.right <= fit.vw + 1 && fit.bottom <= fit.vh + 1, `${viewport.name}: diálogo excede a viewport`)
          assert.equal(fit.overflowX, false, `${viewport.name}: overflow horizontal no diálogo`)
          assert.equal(fit.closeVisible, true, `${viewport.name}: botão Fechar fora da viewport`)

          const footer = dlg.getByRole('button', { name: 'Fechar', exact: true }).last()
          await footer.scrollIntoViewIfNeeded()
          const footerBox = await footer.boundingBox()
          assert.ok(
            footerBox && footerBox.y >= 0 && footerBox.y + footerBox.height <= viewport.height + 1,
            `${viewport.name}: rodapé do diálogo inalcançável`,
          )
          await expectNoHorizontalOverflow(room.page, `diálogo ${viewport.name}`)
          assertClean(`diálogo ${viewport.name}`, room.events)
          notes.push(`${viewport.name} ok`)
        } catch (error) {
          record(engine.name, 'dialogos', 'FAIL', `${viewport.name}: ${String(error.message).split('\n')[0].slice(0, 200)}`)
          throw error
        } finally {
          await room.context.close()
        }
      }
      record(engine.name, 'dialogos', 'PASS', notes.join(' | '))
    })

    /* 6. Tour guiado ------------------------------------------------- */
    test('tour: 15 etapas, inert, teclado, Pular bloco, Escape e foco', async () => {
      if (guard('tour')) return
      const { context, page, events } = await newPage(browser, { seeded: true })
      try {
        await openRoute(page, 'decisions')
        await button(page, 'Como funciona').focus()
        await page.keyboard.press('Enter')
        const panel = tourPanel(page)
        await panel.waitFor()
        assert.equal(await page.evaluate(() => document.getElementById('root').inert), true, '#root não inerte com o tour aberto')
        assert.equal(
          await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement))),
          true,
          'foco inicial fora do painel do tour',
        )

        if (await panel.getByRole('button', { name: 'Iniciar tour', exact: true }).count()) {
          await panel.getByRole('button', { name: 'Iniciar tour', exact: true }).click()
        }
        await page.getByText('1 de 15', { exact: true }).waitFor()

        const stages = []
        for (let step = 1; step <= 15; step += 1) {
          await page.getByText(`${step} de 15`, { exact: true }).waitFor()
          stages.push(
            await page.evaluate(() => {
              const panel = document.querySelector('[role="dialog"][aria-modal="true"]')
              const rect = panel?.getBoundingClientRect()
              return {
                focusInside: panel ? panel.contains(document.activeElement) : false,
                within: rect
                  ? rect.top >= -1 && rect.left >= -1 && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1
                  : false,
                overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
              }
            }),
          )
          if (step < 15) await button(panel, 'Próximo').click()
        }
        assert.deepEqual(stages.filter((stage) => !stage.focusInside), [], 'foco saiu do painel durante o tour')
        assert.deepEqual(stages.filter((stage) => !stage.within), [], 'painel do tour fora da viewport')
        assert.deepEqual(stages.filter((stage) => stage.overflow), [], 'overflow horizontal durante o tour')

        await button(panel, 'Concluir').click()
        await panel.waitFor({ state: 'detached' })
        assert.equal(await page.evaluate(() => document.getElementById('root').inert), false, '#root permaneceu inerte')
        assert.equal(await page.evaluate(() => location.hash), '#/decisions', 'Concluir não restaurou a rota de origem')
        assert.match(await activeText(page), /Como funciona/, 'foco não retornou ao botão do tour')

        await startTour(page)
        assert.equal(await button(panel, 'Anterior').isDisabled(), true, 'Anterior habilitado na etapa 1')
        await button(panel, 'Pular bloco').click()
        await page.getByText('4 de 15', { exact: true }).waitFor()
        await button(panel, 'Pular bloco').click()
        await page.getByText('7 de 15', { exact: true }).waitFor()
        await button(panel, 'Anterior').click()
        await page.getByText('6 de 15', { exact: true }).waitFor()
        await page.keyboard.press('Escape')
        await panel.waitFor({ state: 'detached' })
        assert.equal(await page.evaluate(() => location.hash), '#/decisions', 'Escape não restaurou a rota')
        assert.match(await activeText(page), /Como funciona/, 'Escape não devolveu o foco')

        const after = await stored(page)
        assert.equal(after.data.metrics.length, 2, 'tour alterou os indicadores')
        assert.equal(after.data.feedbacks.length, 2, 'tour alterou os feedbacks')
        assertClean('tour', events)
        record(engine.name, 'tour', 'PASS', '15/15 etapas; inert, teclado, Pular bloco, Escape, foco e rota restaurados; Workspace intacto')
      } catch (error) {
        record(engine.name, 'tour', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 7. Persistência local ------------------------------------------ */
    test('persistência: leitura, escrita e recarga na mesma origem', async () => {
      if (guard('persistencia')) return
      const { context, page, events } = await newPage(browser, { seeded: true })
      try {
        await openOverview(page)
        const before = await stored(page)
        assert.equal(before.data.metrics.length, 2, 'dados semeados ausentes')
        await page.getByText('Conversão Free → Premium').first().waitFor()

        await page.reload()
        await page.getByText('Conversão Free → Premium').first().waitFor()
        const reloaded = await stored(page)
        assert.equal(reloaded.data.metrics.length, 2, 'reload perdeu os indicadores')
        assert.equal(reloaded.data.observations.length, before.data.observations.length, 'reload perdeu observações')

        await createMetric(page, 'Indicador de compatibilidade')
        await page.reload()
        await page.getByText('Indicador de compatibilidade').first().waitFor()
        const after = await stored(page)
        assert.equal(
          after.data.metrics.some((metric) => metric.name === 'Indicador de compatibilidade'),
          true,
          'escrita não persistiu após reload',
        )

        const origin = await page.evaluate(() => ({ origin: location.origin, keys: Object.keys(localStorage) }))
        assert.ok(origin.keys.includes(KEY), 'chave do Workspace ausente no localStorage')
        assertClean('persistência', events)
        record(engine.name, 'persistencia', 'PASS', `leitura e escrita em ${origin.origin}; reload preservou os dados`)
      } catch (error) {
        record(engine.name, 'persistencia', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 8. Web Locks medidos no ambiente ------------------------------- */
    test('web-locks: disponibilidade medida, gravação e conflito entre abas', async () => {
      if (guard('web-locks')) return
      const { context, page, events } = await newPage(browser, { seeded: true })
      try {
        await openOverview(page)
        const env = await page.evaluate(() => ({
          secure: window.isSecureContext,
          locks: typeof navigator.locks,
          request: typeof navigator.locks?.request,
        }))
        const detail = `isSecureContext=${env.secure} navigator.locks=${env.locks}`

        if (env.locks !== 'object' || env.request !== 'function') {
          const before = await raw(page)
          await button(page, 'Novo indicador').click()
          const dlg = dialog(page)
          await dlg.locator('#metric-name').fill('Sem locks')
          await button(dlg, 'Criar indicador').click()
          await dlg.getByText(/Web Locks API/).waitFor()
          assert.equal(await page.getByText('Indicador criado.').count(), 0, 'mensagem de sucesso sem gravação')
          assert.equal(await raw(page), before, 'storage alterado sem Web Locks')
          record(engine.name, 'web-locks', 'PASS WITH LIMITATIONS', `${detail}; gravação recusada com explicação, sem gravar`)
          return
        }

        await createMetric(page, 'Indicador Web Locks')
        await page.keyboard.press('Escape')
        await page.reload()
        await page.getByText('Indicador Web Locks').first().waitFor()
        assert.equal(
          (await stored(page)).data.metrics.some((metric) => metric.name === 'Indicador Web Locks'),
          true,
          'gravação sob lock não persistiu',
        )

        const tabB = await context.newPage()
        const eventsB = instrument(tabB)
        await openOverview(tabB)
        await button(page, 'Novo indicador').click()
        const dlgA = dialog(page)
        await dlgA.locator('#metric-name').fill('Criado na aba A')
        await button(dlgA, 'Criar indicador').click()
        await dialog(page).getByRole('heading', { name: 'Criado na aba A', exact: true }).waitFor()
        await page.keyboard.press('Escape')

        const beforeB = await raw(tabB)
        await button(tabB, 'Novo indicador').click()
        const dlgB = dialog(tabB)
        await dlgB.locator('#metric-name').fill('Tentativa da aba B')
        await button(dlgB, 'Criar indicador').click()
        await dlgB.getByText(/Outra aba alterou os dados/).waitFor()
        assert.equal(await tabB.getByText('Indicador criado.').count(), 0, 'aba desatualizada anunciou sucesso')
        assert.equal(await raw(tabB), beforeB, 'aba desatualizada alterou o storage')

        await dlgB.locator('[data-workspace-refresh]').click()
        await button(dlgB, 'Criar indicador').click()
        await dialog(tabB).getByRole('heading', { name: 'Tentativa da aba B', exact: true }).waitFor()
        const names = (await stored(tabB)).data.metrics.map((metric) => metric.name)
        assert.ok(names.includes('Criado na aba A'), 'registro da aba A ausente após recuperação')
        assert.ok(names.includes('Tentativa da aba B'), 'registro da aba B ausente após atualizar e salvar')

        assertClean('aba A', events)
        assertClean('aba B', eventsB)
        record(engine.name, 'web-locks', 'PASS', `${detail}; gravação persistiu; conflito entre abas recusado e recuperado`)
      } catch (error) {
        record(engine.name, 'web-locks', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 9. Sem Web Locks (contexto simulado) --------------------------- */
    test('web-locks ausentes: gravação recusada sem perda nem falso sucesso', async () => {
      if (guard('web-locks')) return
      const { context, page, events } = await newPage(browser, { seeded: true, noLocks: true })
      try {
        await openOverview(page)
        assert.equal(await page.evaluate(() => typeof navigator.locks), 'undefined', 'init script não removeu navigator.locks')
        const before = await raw(page)
        await page.getByText('Conversão Free → Premium').first().waitFor()

        await button(page, 'Novo indicador').click()
        const dlg = dialog(page)
        await dlg.locator('#metric-name').fill('Sem Web Locks')
        await button(dlg, 'Criar indicador').click()
        await dlg.getByText(/Web Locks API/).waitFor()
        assert.equal(await page.getByText('Indicador criado.').count(), 0, 'falso sucesso sem Web Locks')
        assert.equal(await raw(page), before, 'storage alterado sem Web Locks')
        await page.keyboard.press('Escape')

        await page.reload()
        await page.getByText('Conversão Free → Premium').first().waitFor()
        assert.equal((await stored(page)).data.metrics.length, 2, 'dados corrompidos após recusa')
        assertClean('sem Web Locks', events)
        // Cenário simulado: valida o contrato de recusa, não uma limitação do motor.
        record(engine.name, 'web-locks-ausente', 'PASS', 'contexto simulado sem a API: leitura ok, gravação recusada, storage íntegro')
      } catch (error) {
        record(engine.name, 'web-locks-ausente', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 10. Foco e teclado fora dos diálogos --------------------------- */
    test('foco e teclado: link por Enter, aria-current, inert do tour e retorno de foco', async () => {
      if (guard('foco-teclado')) return
      const { context, page, events } = await newPage(browser)
      try {
        await openOverview(page)
        const nav = page.locator('nav[aria-label="Navegação principal"]')
        const link = nav.getByRole('link', { name: /Interactive Case/ })
        await link.focus()
        await page.keyboard.press('Enter')
        await h1(page, 'interactive-case').waitFor()
        assert.equal(await page.evaluate(() => location.hash), '#/interactive-case', 'Enter no link não navegou')
        assert.equal(
          await nav.getByRole('link', { name: /Interactive Case/ }).getAttribute('aria-current'),
          'page',
          'rota atual não marcada com aria-current',
        )

        await button(page, 'Como funciona').click()
        const panel = tourPanel(page)
        await panel.waitFor()
        assert.equal(await page.evaluate(() => document.getElementById('root').inert), true, '#root não inerte')
        assert.equal(
          await page.evaluate(() => Boolean(document.querySelector('header')?.closest('[inert]'))),
          true,
          'conteúdo externo não ficou inerte',
        )
        await page.keyboard.press('Escape')
        await panel.waitFor({ state: 'detached' })
        assert.equal(await page.evaluate(() => document.getElementById('root').inert), false, 'inert não revertido')
        assert.match(await activeText(page), /Como funciona/, 'foco não retornou ao disparador')
        assertClean('foco e teclado', events)
        record(engine.name, 'foco-teclado', 'PASS', 'link por teclado, aria-current, inert e retorno de foco')
      } catch (error) {
        record(engine.name, 'foco-teclado', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 11. Console e rede em uma jornada completa ---------------------- */
    test('console e rede: jornada completa sem erro de execução', async () => {
      if (guard('console-rede')) return
      const { context, page, events } = await newPage(browser, { seeded: true })
      try {
        for (const route of Object.keys(ROUTE_TITLES)) await openRoute(page, route)

        await openOverview(page)
        await button(page, 'Abrir indicador Conversão Free → Premium').click()
        await dialog(page).waitFor()
        await page.keyboard.press('Escape')
        await dialog(page).waitFor({ state: 'detached' })

        await openRoute(page, 'feedbacks')
        await button(page, 'Novo feedback').click()
        await dialog(page).waitFor()
        await page.keyboard.press('Escape')
        await dialog(page).waitFor({ state: 'detached' })

        await openRoute(page, 'decisions')
        const panel = await startTour(page)
        await page.keyboard.press('Escape')
        await panel.waitFor({ state: 'detached' })

        assertClean('jornada completa', events)
        record(engine.name, 'console-rede', 'PASS', '4 rotas, 2 diálogos e tour sem console error, pageerror, request falho ou HTTP >= 400')
      } catch (error) {
        record(engine.name, 'console-rede', 'FAIL', String(error.message).split('\n')[0].slice(0, 250))
        throw error
      } finally {
        await context.close()
      }
    })

    /* 12. Amostragem responsiva -------------------------------------- */
    test('responsividade: amostra de 4 viewports nas 4 rotas', async () => {
      if (guard('responsividade')) return
      const notes = []
      for (const viewport of [
        { name: '1280x800', width: 1280, height: 800 },
        { name: '390x844', width: 390, height: 844, mobile: true },
        { name: '320x568', width: 320, height: 568, mobile: true },
        { name: '320x256', width: 320, height: 256 },
      ]) {
        const { context, page, events } = await newPage(browser, {
          seeded: true,
          viewport: { width: viewport.width, height: viewport.height },
          mobile: Boolean(viewport.mobile),
        })
        try {
          for (const route of Object.keys(ROUTE_TITLES)) {
            await openRoute(page, route)
            await expectNoHorizontalOverflow(page, `${viewport.name}/${route}`)
          }
          assertClean(`responsividade ${viewport.name}`, events)
          notes.push(viewport.name)
        } catch (error) {
          record(engine.name, 'responsividade', 'FAIL', `${viewport.name}: ${String(error.message).split('\n')[0].slice(0, 200)}`)
          throw error
        } finally {
          await context.close()
        }
      }
      record(engine.name, 'responsividade', 'PASS', `4 rotas × 4 viewports sem overflow horizontal (${notes.join(', ')})`)
    })
  })
}

/* ------------------------------------------------------------------ */
/* Resumo                                                             */
/* ------------------------------------------------------------------ */

test('resumo da matriz', () => {
  const versions = results.filter((row) => row.id === 'versao')
  console.log('--- motores ---')
  for (const row of versions) console.log(`${row.engine}: ${row.status} · ${row.detail}`)
  console.log(`--- resultados detalhados em ${RESULTS} ---`)
  for (const engine of ENGINES) {
    const rows = results.filter((row) => row.engine === engine && row.id !== 'versao')
    if (!rows.length) continue
    const blocked = rows.filter((row) => row.status === 'BLOCKED').length
    const failed = rows.filter((row) => row.status === 'FAIL').length
    console.log(`${engine}: ${rows.length} verificações · ${blocked} BLOCKED · ${failed} FAIL`)
  }
})
