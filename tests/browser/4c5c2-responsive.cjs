/**
 * Validação de responsividade 4C.5c.2 — overflow, reflow, diálogos, tour e fluxo do caso
 * em seis viewports. Somente leitura de layout; não altera regras de negócio.
 *
 * Uso:
 *   PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5c2-responsive.cjs
 *
 * Variáveis opcionais: PDL_BASE_URL (padrão http://127.0.0.1:4731), PDL_SHOTS_DIR (screenshots),
 * PDL_RESULTS (JSON com todas as verificações), PDL_ONLY (nome do perfil, ex.: "mobile").
 *
 * Mecanismo: viewport emulado do Chromium (Playwright). Tablet e mobile usam também
 * isMobile + hasTouch + deviceScaleFactor. Não é dispositivo físico nem zoom do navegador.
 * Dados exclusivamente fictícios, semeados em localStorage de contextos isolados.
 */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const KEY = 'product-decision-lab:workspace'
const SHOTS = process.env.PDL_SHOTS_DIR || path.join(os.tmpdir(), 'pdl-4c5c2-shots')
const RESULTS = process.env.PDL_RESULTS || path.join(os.tmpdir(), 'pdl-4c5c2-results.json')
const ONLY = process.env.PDL_ONLY || ''
fs.mkdirSync(SHOTS, { recursive: true })

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080, dpr: 1, mobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, dpr: 1, mobile: false },
  { name: 'desktop-1280', width: 1280, height: 800, dpr: 1, mobile: false },
  { name: 'tablet-768', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, dpr: 3, mobile: true },
  { name: 'mobile-320', width: 320, height: 568, dpr: 2, mobile: true },
].filter((vp) => !ONLY || vp.name.includes(ONLY))

const TOUR_VIEWPORTS = VIEWPORTS

/* ------------------------------------------------------------------ */
/* Registro de resultados                                              */
/* ------------------------------------------------------------------ */

const results = []
function record(vp, id, status, detail = '') {
  results.push({ viewport: vp.name, id, status, detail })
  const mark = status === 'PASS' ? 'PASS' : status
  console.log(`${mark} [${vp.name}] ${id}${detail ? ` — ${detail}` : ''}`)
}
process.on('exit', () => fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2)))

function errText(error) {
  if (process.env.PDL_DEBUG) console.error('ERR', error.message)
  const line = String(error.stack || '').match(/4c5c2-responsive\.cjs:(\d+)/)
  return `${String(error.message).split('\n')[0].slice(0, 200)}${line ? ` (script:${line[1]})` : ''}`
}

async function check(vp, id, fn) {
  try {
    const detail = await fn()
    if (detail && detail.fail) record(vp, id, 'FAIL', detail.fail)
    else record(vp, id, 'PASS', detail && detail.info ? detail.info : '')
  } catch (error) {
    record(vp, id, 'FAIL', String(error.message || error).split('\n')[0].slice(0, 300))
  }
}

/* ------------------------------------------------------------------ */
/* Dados fictícios                                                     */
/* ------------------------------------------------------------------ */

const ISO = '2026-09-01T10:00:00.000Z'
const words = 'cadastro lento onboarding professor turma relatório pagamento confuso suporte assinatura'.split(' ')
const prose = (n, seed = 0) =>
  Array.from({ length: n }, (_, i) => words[(i * 7 + seed) % words.length]).join(' ')
const cut = (text, max) => text.slice(0, max)

function buildWorkspace() {
  const months = []
  for (let i = 23; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(2026, 9 - i, 1))
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  const metrics = [
    {
      id: 'metric-qa-1',
      name: cut('Taxa de conversão do onboarding gratuito para o plano pago de professores independentes e escolas parceiras', 120),
      description: cut(prose(120), 500),
      unit: 'percent',
      desiredDirection: 'increase',
      createdAt: ISO,
    },
    {
      id: 'metric-qa-2',
      name: cut('IndicadorSemEspacos'.repeat(10), 120),
      description: cut('Descricao'.repeat(60), 500),
      unit: 'count',
      desiredDirection: 'increase',
      createdAt: ISO,
    },
    { id: 'metric-qa-3', name: 'Churn mensal', description: 'Cancelamentos no mês.', unit: 'percent', desiredDirection: 'decrease', createdAt: ISO },
    { id: 'metric-qa-4', name: 'Receita recorrente mensal', description: '', unit: 'currency', desiredDirection: 'increase', createdAt: ISO },
    { id: 'metric-qa-5', name: 'Indicador sem vínculos', description: 'Sem feedbacks nem decisões.', unit: 'score', desiredDirection: 'increase', createdAt: ISO },
  ]
  const observations = [
    ...months.map((period, i) => ({ id: `obs-1-${i}`, metricId: 'metric-qa-1', period, value: 18 + ((i * 3) % 11) - i * 0.2, createdAt: ISO })),
    ...months.slice(-3).map((period, i) => ({ id: `obs-2-${i}`, metricId: 'metric-qa-2', period, value: 1200 + i * 130, createdAt: ISO })),
    ...months.slice(-2).map((period, i) => ({ id: `obs-5-${i}`, metricId: 'metric-qa-5', period, value: 7 + i, createdAt: ISO })),
    ...months.slice(-12).map((period, i) => ({ id: `obs-3-${i}`, metricId: 'metric-qa-3', period, value: 4 + (i % 4) * 0.6, createdAt: ISO })),
  ]
  const cats = ['bug', 'usability', 'performance', 'feature-request', 'pricing', 'other']
  const srcs = ['interview', 'support-ticket', 'survey', 'app-review', 'community', 'other']
  const feedbacks = Array.from({ length: 9 }, (_, i) => ({
    id: `feedback-qa-${i + 1}`,
    content:
      i === 0 ? cut(prose(400), 2000) : i === 1 ? `Relato com token enorme ${'ABCDEFGHIJ'.repeat(30)} fim.` : `Feedback QA ${i + 1}: ${prose(14, i)}.`,
    category: cats[i % cats.length],
    source: srcs[(i * 2) % srcs.length],
    receivedAt: `2026-0${(i % 9) + 1}-1${i % 9}T10:00:00.000Z`,
    metricIds: i % 3 === 0 ? ['metric-qa-1', 'metric-qa-2', 'metric-qa-3'] : i % 3 === 1 ? ['metric-qa-1'] : [],
  }))
  const statuses = ['draft', 'investigating', 'decided', 'validated', 'abandoned', 'decided', 'draft']
  const list = (n, label) => Array.from({ length: n }, (_, i) => cut(`${label} ${i + 1}: ${prose(40, i)}`, 300))
  const decisions = Array.from({ length: 7 }, (_, i) => {
    const big = i === 0
    return {
      id: `decision-qa-${i + 1}`,
      title: big ? cut(`Decisão longa: ${prose(40)}`, 160) : i === 1 ? cut('TituloSemEspacos'.repeat(12), 160) : `Decisão QA ${i + 1}`,
      problem: big ? cut(prose(400), 2000) : `Problema QA ${i + 1}: ${prose(20, i)}.`,
      hypothesis: big ? cut(prose(400, 3), 2000) : `Hipótese QA ${i + 1}.`,
      metricIds: big ? ['metric-qa-1', 'metric-qa-2', 'metric-qa-3', 'metric-qa-4'] : ['metric-qa-1'],
      feedbackIds: big ? feedbacks.slice(0, 8).map((f) => f.id) : ['feedback-qa-2'],
      alternatives: big ? list(20, 'Alternativa') : ['Alternativa A', 'Alternativa B'],
      decision: big ? cut(prose(400, 5), 2000) : `Decisão tomada ${i + 1}.`,
      successCriteria: big ? list(20, 'Critério') : ['Critério único'],
      nextSteps: big ? list(20, 'Próximo passo') : ['Passo único'],
      status: statuses[i],
      createdAt: ISO,
      updatedAt: ISO,
    }
  })
  return { schemaVersion: 1, savedAt: ISO, data: { metrics, observations, feedbacks, decisions } }
}

/* ------------------------------------------------------------------ */
/* Contextos e instrumentação                                          */
/* ------------------------------------------------------------------ */

async function newContext(browser, vp, { seeded, size } = {}) {
  const width = size ? size.width : vp.width
  const height = size ? size.height : vp.height
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    locale: 'pt-BR',
  })
  context.setDefaultTimeout(12000)
  if (seeded) {
    await context.addInitScript(
      ({ key, value }) => {
        try {
          if (!localStorage.getItem(key)) localStorage.setItem(key, value)
        } catch {
          // ignora
        }
      },
      { key: KEY, value: JSON.stringify(buildWorkspace()) },
    )
  }
  const page = await context.newPage()
  const events = { consoleErrors: [], pageErrors: [], failed: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error') events.consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => events.pageErrors.push(String(e)))
  page.on('requestfailed', (r) => {
    if (!/favicon/.test(r.url())) events.failed.push(r.url())
  })
  page.on('response', (r) => {
    if (r.status() >= 400 && !/favicon/.test(r.url())) events.http.push(`${r.status()} ${r.url()}`)
  })
  return { context, page, events }
}

function reportEvents(vp, label, events) {
  const bad = [...events.pageErrors, ...events.consoleErrors, ...events.failed, ...events.http]
  record(vp, `console-rede ${label}`, bad.length ? 'FAIL' : 'PASS', bad.slice(0, 3).join(' | '))
}

const go = (page, route) => page.goto(`${ORIGIN}/#/${route}`)
const dlg = (page) => page.locator('[role="dialog"]').last()
const btn = (scope, name) => scope.getByRole('button', { name, exact: true })

async function shot(page, vp, name) {
  try {
    await page.screenshot({ path: path.join(SHOTS, `${vp.name}__${name}.jpg`), type: 'jpeg', quality: 72 })
  } catch {
    // captura é evidência auxiliar
  }
}

/* ------------------------------------------------------------------ */
/* Auditorias executadas na página                                     */
/* ------------------------------------------------------------------ */

function layoutAuditInPage() {
  const root = document.documentElement
  const vw = root.clientWidth
  const out = {
    vw,
    vh: window.innerHeight,
    scrollW: root.scrollWidth,
    docOverflowX: root.scrollWidth > vw + 1,
    offenders: [],
    clipped: [],
    overlaps: [],
    small: 0,
  }
  const desc = (el) => {
    const label = el.getAttribute('aria-label')
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${label ? `[${label.slice(0, 40)}]` : ''} "${text}"`
  }
  const shown = (el) => {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  const skip = (el) =>
    el.closest('svg') !== null && el.tagName.toLowerCase() !== 'svg' ||
    el.closest('[aria-hidden="true"]') !== null ||
    el.classList.contains('sr-only') ||
    el.closest('.sr-only') !== null
  const containedByClip = (el) => {
    for (let n = el.parentElement; n && n !== root; n = n.parentElement) {
      if (getComputedStyle(n).overflowX !== 'visible') {
        const r = n.getBoundingClientRect()
        if (r.left >= -1 && r.right <= vw + 1) return true
      }
    }
    return false
  }
  const all = [...document.body.querySelectorAll('*')].filter((el) => shown(el) && !skip(el))
  const off = new Set()
  for (const el of all) {
    const r = el.getBoundingClientRect()
    if ((r.right > vw + 1 || r.left < -1) && !containedByClip(el)) off.add(el)
  }
  for (const el of off) {
    if (el.parentElement && off.has(el.parentElement)) continue
    const r = el.getBoundingClientRect()
    out.offenders.push(`${desc(el)} L${Math.round(r.left)} R${Math.round(r.right)}`)
  }
  for (const el of all) {
    const cs = getComputedStyle(el)
    if (el.tagName.toLowerCase() === 'svg' || el.matches('input, textarea, select')) continue
    const clipX = /hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis'
    const clipY =
      /hidden|clip/.test(cs.overflowY) &&
      el.scrollHeight > el.clientHeight + 1 &&
      !cs.webkitLineClamp?.match(/^[1-9]/) &&
      cs.webkitLineClamp !== '' &&
      !(cs.display === '-webkit-box')
    // Caixas de 1px são o padrão visualmente oculto (sr-only), inclusive responsivo (max-lg:sr-only).
    if ((clipX || clipY) && el.clientWidth > 1 && el.clientHeight > 1 && !el.closest('.recharts-wrapper') && !el.matches('[data-radix-focus-guard]')) {
      out.clipped.push(`${desc(el)} ${clipX ? `x${el.scrollWidth}>${el.clientWidth}` : `y${el.scrollHeight}>${el.clientHeight}`}`)
    }
  }
  const inter = all.filter(
    (el) =>
      el.matches('button, a[href], input:not([type=hidden]), select, textarea, [role=button]') &&
      Number(getComputedStyle(el).opacity) > 0.01 &&
      el.getBoundingClientRect().width > 2,
  )
  // Retângulo efetivamente visível: recorta pelos ancestrais com overflow (rolagem/clip).
  const visibleRect = (el) => {
    const r = el.getBoundingClientRect()
    let left = r.left
    let top = r.top
    let right = r.right
    let bottom = r.bottom
    for (let n = el.parentElement; n && n !== root; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const nr = n.getBoundingClientRect()
        left = Math.max(left, nr.left)
        top = Math.max(top, nr.top)
        right = Math.min(right, nr.right)
        bottom = Math.min(bottom, nr.bottom)
      }
    }
    return { left, top, right, bottom }
  }
  for (const el of inter) {
    const r = el.getBoundingClientRect()
    if (r.width < 24 || r.height < 24) out.small += 1
  }
  for (let i = 0; i < inter.length; i += 1) {
    for (let j = i + 1; j < inter.length; j += 1) {
      const a = inter[i]
      const b = inter[j]
      if (a.contains(b) || b.contains(a)) continue
      if (a.closest('header') !== b.closest('header')) continue
      const ra = visibleRect(a)
      const rb = visibleRect(b)
      const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
      const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
      if (x > 4 && y > 4) out.overlaps.push(`${desc(a)} × ${desc(b)}`)
    }
  }
  return out
}

/** Controles de um diálogo: cada um deve ser alcançável por rolagem dentro do próprio diálogo. */
function dialogAuditInPage(selectorIndex) {
  const dialogs = [...document.querySelectorAll('[role="dialog"]')]
  const d = dialogs[selectorIndex < 0 ? dialogs.length + selectorIndex : selectorIndex]
  if (!d) return { missing: true }
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const r = d.getBoundingClientRect()
  const out = {
    rect: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) },
    vw,
    vh,
    inViewport: r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1,
    docOverflowX: document.documentElement.scrollWidth > vw + 1,
    scrollRegions: [],
    unreachable: [],
    innerOverflowX: [],
    controls: 0,
  }
  const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} "${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}"`
  for (const el of d.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      out.scrollRegions.push(`${el.tagName.toLowerCase()} ${el.scrollHeight}/${el.clientHeight}`)
    }
    if (el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(cs.overflowX)) {
      out.innerOverflowX.push(`${desc(el)} ${el.scrollWidth}/${el.clientWidth}`)
    }
  }
  const controls = [...d.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea')].filter((el) => {
    const cs = getComputedStyle(el)
    const b = el.getBoundingClientRect()
    return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01 && b.width > 2 && b.height > 2
  })
  out.controls = controls.length
  for (const el of controls) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const b = el.getBoundingClientRect()
    const dr = d.getBoundingClientRect()
    const ok = b.left >= dr.left - 1 && b.right <= dr.right + 1 && b.top >= dr.top - 1 && b.bottom <= dr.bottom + 1 && b.left >= -1 && b.right <= vw + 1 && b.top >= -1 && b.bottom <= vh + 1
    if (!ok) out.unreachable.push(desc(el))
  }
  for (const el of [d, ...d.querySelectorAll('*')]) {
    el.scrollTop = 0
    el.scrollLeft = 0
  }
  // Região de rolagem do corpo (entre cabeçalho e rodapé): precisa ter altura útil.
  const body = [...d.querySelectorAll('*')].find((el) => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.classList.contains('flex-1'))
  out.bodyHeight = body ? Math.round(body.clientHeight) : null
  out.dialogOverflowHidden = d.scrollHeight > d.clientHeight + 1
  return out
}

async function auditLayout(page, vp, id, { allowOverlap = false } = {}) {
  await check(vp, id, async () => {
    const a = await page.evaluate(layoutAuditInPage)
    const problems = []
    if (a.docOverflowX) problems.push(`overflow horizontal do documento (${a.scrollW} > ${a.vw})`)
    if (a.offenders.length) problems.push(`fora da viewport: ${a.offenders.slice(0, 3).join('; ')}`)
    if (!allowOverlap && a.overlaps.length) problems.push(`controles sobrepostos: ${a.overlaps.slice(0, 2).join('; ')}`)
    if (a.clipped.length) problems.push(`texto cortado: ${a.clipped.slice(0, 3).join('; ')}`)
    return problems.length ? { fail: problems.join(' | ') } : { info: `controles <24px: ${a.small}` }
  })
}

async function auditDialog(page, vp, id, index = -1) {
  await check(vp, id, async () => {
    const a = await page.evaluate(dialogAuditInPage, index)
    if (a.missing) return { fail: 'diálogo ausente' }
    const problems = []
    if (!a.inViewport) problems.push(`diálogo fora da viewport ${JSON.stringify(a.rect)} em ${a.vw}x${a.vh}`)
    if (a.docOverflowX) problems.push('overflow horizontal do documento')
    if (a.unreachable.length) problems.push(`controles inalcançáveis: ${a.unreachable.slice(0, 3).join('; ')}`)
    if (a.innerOverflowX.length) problems.push(`rolagem horizontal interna: ${a.innerOverflowX.slice(0, 2).join('; ')}`)
    if (a.bodyHeight !== null && a.bodyHeight < 44) problems.push(`corpo do diálogo com ${a.bodyHeight}px de altura útil`)
    return problems.length
      ? { fail: problems.join(' | ') }
      : { info: `corpo ${a.bodyHeight}px; ${a.controls} controles; rolagem vertical interna: ${a.scrollRegions.length ? a.scrollRegions[0] : 'não precisa'}` }
  })
}

/** Rola o controle ao centro e confirma, por hit-testing, que nada o cobre. */
async function usable(page, vp, id, locator) {
  await check(vp, id, async () => {
    await locator.first().waitFor({ state: 'visible' })
    const hit = await locator.first().evaluate((el) => {
      el.scrollIntoView({ block: 'center', inline: 'center' })
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      const top = document.elementFromPoint(x, y)
      return {
        inside: r.left >= -1 && r.right <= document.documentElement.clientWidth + 1 && r.top >= -1 && r.bottom <= window.innerHeight + 1,
        reachable: !!top && (el.contains(top) || top.contains(el)),
        w: Math.round(r.width),
        h: Math.round(r.height),
      }
    })
    if (!hit.inside) return { fail: `fora da viewport (${hit.w}x${hit.h})` }
    if (!hit.reachable) return { fail: 'coberto por outro elemento' }
    return { info: `${hit.w}x${hit.h}` }
  })
}

async function chartContained(page, vp, id) {
  await check(vp, id, async () => {
    await page.locator('.recharts-surface').first().waitFor({ state: 'attached', timeout: 15000 })
    const bad = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const res = []
      for (const svg of document.querySelectorAll('.recharts-surface')) {
        const r = svg.getBoundingClientRect()
        if (r.width === 0) continue
        const host = svg.closest('figure, section, [class*="rounded-"]')
        const hr = host ? host.getBoundingClientRect() : null
        if (r.right > vw + 1 || r.left < -1) res.push('gráfico fora da viewport')
        if (hr && (r.right > hr.right + 1 || r.left < hr.left - 1)) res.push('gráfico extrapola o contêiner')
        if (r.width < 120) res.push(`gráfico estreito demais (${Math.round(r.width)}px)`)
      }
      return res
    })
    return bad.length ? { fail: bad[0] } : {}
  })
}

/* ------------------------------------------------------------------ */
/* Cenários por módulo                                                 */
/* ------------------------------------------------------------------ */

async function overviewEmpty(browser, vp) {
  const { context, page, events } = await newContext(browser, vp)
  try {
    await go(page, 'overview')
    await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
    await page.locator('.recharts-surface').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {})
    await auditLayout(page, vp, 'overview-vazia: layout')
    await shot(page, vp, 'overview-vazia')
    await usable(page, vp, 'overview-vazia: Novo indicador', btn(page, 'Novo indicador'))
    await usable(page, vp, 'overview-vazia: Criar indicador', btn(page, 'Criar indicador'))
    await usable(page, vp, 'overview-vazia: Exportar backup', btn(page, 'Exportar backup'))
    await usable(page, vp, 'overview-vazia: Importar backup', btn(page, 'Importar backup'))
    await chartContained(page, vp, 'overview-vazia: gráfico demonstrativo contido')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await auditLayout(page, vp, 'overview-vazia: layout após rolar ao fim')
    await shot(page, vp, 'overview-vazia-fim')

    await btn(page, 'Novo indicador').click()
    await dlg(page).waitFor()
    await dlg(page).locator('#metric-name').fill('Nome extremamente longo '.repeat(8))
    await dlg(page).locator('#metric-description').fill('Descrição extensa. '.repeat(40))
    await auditDialog(page, vp, 'dialogo indicador (novo, campos longos)')
    await shot(page, vp, 'dialogo-indicador-novo')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' })

    await btn(page, 'Importar backup').click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'dialogo importar backup')
    await shot(page, vp, 'dialogo-importar')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' })
  } catch (error) {
    record(vp, 'overview-vazia: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'overview-vazia', events)
    await context.close()
  }
}

async function overviewSeeded(browser, vp) {
  const { context, page, events } = await newContext(browser, vp, { seeded: true })
  try {
    await go(page, 'overview')
    await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
    await page.locator('button[aria-label^="Abrir indicador"]').first().waitFor()
    await auditLayout(page, vp, 'overview-preenchida: layout')
    await shot(page, vp, 'overview-preenchida')
    await usable(page, vp, 'overview-preenchida: abrir indicador longo', page.locator('button[aria-label^="Abrir indicador"]').first())

    await page.locator('button[aria-label^="Abrir indicador"]').first().click()
    await dlg(page).waitFor()
    await chartContained(page, vp, 'detalhe do indicador: gráfico contido')
    await auditDialog(page, vp, 'dialogo detalhe do indicador (24 observações)')
    await shot(page, vp, 'dialogo-detalhe-indicador')

    await btn(dlg(page), 'Adicionar observação').click()
    await dlg(page).locator('#observation-period').waitFor()
    await auditDialog(page, vp, 'dialogo observação (formulário)')
    await shot(page, vp, 'dialogo-observacao')
    await page.keyboard.press('Escape')
    await dlg(page).locator('#observation-period').waitFor({ state: 'detached' }).catch(() => {})

    // Se o Escape do formulário de observação fechou o detalhe, reabre.
    if (!(await dlg(page).getByText('Histórico de observações').count())) {
      await page.locator('button[aria-label^="Abrir indicador"]').first().click()
      await dlg(page).getByText('Histórico de observações').waitFor()
    }
    const delObs = dlg(page).locator('button[aria-label^="Excluir observação"]').first()
    await delObs.waitFor({ state: 'attached' })
    await delObs.scrollIntoViewIfNeeded()
    await delObs.click()
    await dlg(page).getByRole('group', { name: 'Confirmar exclusão da observação' }).waitFor()
    await auditDialog(page, vp, 'dialogo detalhe com confirmação de exclusão de observação')
    await shot(page, vp, 'confirmacao-observacao')
    await btn(dlg(page), 'Cancelar').first().click()

    // Indicador com vínculos: não há botão de excluir; o aviso explica o bloqueio.
    await auditDialog(page, vp, 'dialogo detalhe com aviso de exclusão bloqueada (indicador vinculado)')

    await btn(dlg(page), 'Editar indicador').scrollIntoViewIfNeeded()
    await btn(dlg(page), 'Editar indicador').click()
    await page.locator('[role="dialog"] #metric-name').waitFor()
    await auditDialog(page, vp, 'dialogo indicador (edição, nome de 120 caracteres)')
    await shot(page, vp, 'dialogo-indicador-edicao')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await page.locator('[role="dialog"]').first().waitFor({ state: 'detached' }).catch(() => {})
    await auditLayout(page, vp, 'overview-preenchida: layout após fechar diálogos')

    const free = page.locator('button[aria-label="Abrir indicador Indicador sem vínculos"]')
    await free.scrollIntoViewIfNeeded()
    await free.click()
    await dlg(page).waitFor()
    await btn(dlg(page), 'Excluir indicador').scrollIntoViewIfNeeded()
    await btn(dlg(page), 'Excluir indicador').click()
    await dlg(page).getByRole('group', { name: 'Confirmar exclusão do indicador' }).waitFor()
    await auditDialog(page, vp, 'dialogo detalhe com confirmação de exclusão de indicador')
    await shot(page, vp, 'confirmacao-indicador')
    await btn(dlg(page), 'Cancelar').last().click()
  } catch (error) {
    record(vp, 'overview-preenchida: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'overview-preenchida', events)
    await context.close()
  }
}

async function feedbacks(browser, vp) {
  const empty = await newContext(browser, vp)
  try {
    await go(empty.page, 'feedbacks')
    await empty.page.getByRole('heading', { name: 'Feedback Discovery', exact: true }).waitFor()
    await auditLayout(empty.page, vp, 'feedbacks-vazio: layout')
    await shot(empty.page, vp, 'feedbacks-vazio')
    await usable(empty.page, vp, 'feedbacks-vazio: Novo feedback', btn(empty.page, 'Novo feedback'))
  } catch (error) {
    record(vp, 'feedbacks-vazio: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'feedbacks-vazio', empty.events)
    await empty.context.close()
  }

  const { context, page, events } = await newContext(browser, vp, { seeded: true })
  try {
    await go(page, 'feedbacks')
    await page.locator('#feedback-search').waitFor()
    await auditLayout(page, vp, 'feedbacks: lista com conteúdo longo')
    await shot(page, vp, 'feedbacks-lista')
    for (const id of ['#feedback-search', '#feedback-filter-category', '#feedback-filter-source', '#feedback-filter-metric']) {
      await usable(page, vp, `feedbacks: controle ${id}`, page.locator(id))
    }
    await page.locator('#feedback-filter-category').selectOption({ index: 2 })
    await page.locator('#feedback-filter-source').selectOption({ index: 1 })
    await page.locator('#feedback-search').fill('feedback')
    await auditLayout(page, vp, 'feedbacks: filtros combinados')
    await shot(page, vp, 'feedbacks-filtros')
    await page.locator('#feedback-search').fill('zzzzqq-sem-resultado')
    await page.getByText('Nenhum feedback encontrado').waitFor()
    await auditLayout(page, vp, 'feedbacks: estado sem resultados')
    await usable(page, vp, 'feedbacks: Limpar busca e filtros', btn(page, 'Limpar busca e filtros'))
    await btn(page, 'Limpar busca e filtros').click()

    await btn(page, 'Novo feedback').click()
    await dlg(page).waitFor()
    await dlg(page).locator('#feedback-content').fill(prose(300))
    await auditDialog(page, vp, 'dialogo feedback (novo, texto longo)')
    await shot(page, vp, 'dialogo-feedback')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' }).catch(() => {})

    const edit = page.locator('button[aria-label^="Editar feedback"]').first()
    await edit.scrollIntoViewIfNeeded()
    await edit.click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'dialogo feedback (edição, 2000 caracteres)')
    await shot(page, vp, 'dialogo-feedback-edicao')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' }).catch(() => {})

    // Feedback vinculado a decisões: exclusão bloqueada (somente "Fechar").
    const blocked = page.locator('button[aria-label^="Excluir feedback"]').first()
    await blocked.scrollIntoViewIfNeeded()
    await blocked.click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'dialogo exclusão de feedback bloqueada (vinculado a decisões)')
    await shot(page, vp, 'confirmacao-feedback-bloqueada')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' })

    // Feedback sem vínculos: confirmação com "Cancelar" e "Excluir feedback".
    await page.locator('#feedback-search').fill('Feedback QA 9')
    const del = page.locator('button[aria-label^="Excluir feedback"]').first()
    await del.scrollIntoViewIfNeeded()
    await del.click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'dialogo confirmação de exclusão de feedback')
    await shot(page, vp, 'confirmacao-feedback')
    await btn(dlg(page), 'Cancelar').click()
  } catch (error) {
    record(vp, 'feedbacks: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'feedbacks', events)
    await context.close()
  }
}

async function decisions(browser, vp) {
  const empty = await newContext(browser, vp)
  try {
    await go(empty.page, 'decisions')
    await empty.page.getByRole('heading', { name: 'Decision Workspace', exact: true }).waitFor()
    await auditLayout(empty.page, vp, 'decisions-vazio: layout')
    await usable(empty.page, vp, 'decisions-vazio: Nova decisão', btn(empty.page, 'Nova decisão'))
  } catch (error) {
    record(vp, 'decisions-vazio: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'decisions-vazio', empty.events)
    await empty.context.close()
  }

  const { context, page, events } = await newContext(browser, vp, { seeded: true })
  try {
    await go(page, 'decisions')
    await page.locator('#decision-search').waitFor()
    await auditLayout(page, vp, 'decisions: lista (título de 160 caracteres)')
    await shot(page, vp, 'decisions-lista')
    await usable(page, vp, 'decisions: busca', page.locator('#decision-search'))
    await usable(page, vp, 'decisions: filtro de status', page.locator('#decision-filter-status'))
    await page.locator('#decision-search').fill('zzzzqq-sem-resultado')
    await page.getByText('Nenhuma decisão encontrada').waitFor()
    await auditLayout(page, vp, 'decisions: estado sem resultados')
    await page.locator('#decision-search').fill('')

    await page.goto(`${ORIGIN}/#/decisions?record=decision-qa-1`)
    await page.getByText('Alternativa 20').first().waitFor()
    await auditLayout(page, vp, 'decisions: detalhe completo (20 itens por lista)')
    await shot(page, vp, 'decisions-detalhe')
    await usable(page, vp, 'decisions detalhe: Exportar Markdown', btn(page, 'Exportar Markdown'))
    await usable(page, vp, 'decisions detalhe: Editar', btn(page, 'Editar'))
    await usable(page, vp, 'decisions detalhe: Excluir', btn(page, 'Excluir'))
    await page.reload()
    await page.getByText('Alternativa 20').first().waitFor()
    record(vp, 'decisions: detalhe permanece após reload', 'PASS')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await auditLayout(page, vp, 'decisions: detalhe rolado ao fim')
    await shot(page, vp, 'decisions-detalhe-fim')

    await btn(page, 'Excluir').click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'dialogo confirmação de exclusão de decisão')
    await shot(page, vp, 'confirmacao-decisao')
    await btn(dlg(page), 'Cancelar').click()
    await dlg(page).waitFor({ state: 'detached' }).catch(() => {})

    await btn(page, 'Editar').click()
    await page.locator('#decision-title').waitFor()
    await auditLayout(page, vp, 'decisions: formulário de edição preenchido')
    await shot(page, vp, 'decisions-formulario')
    await usable(page, vp, 'decisions form: Salvar decisão', page.getByRole('button', { name: /^Salvar (decisão|alterações)$/ }))
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await auditLayout(page, vp, 'decisions: formulário rolado ao fim')
  } catch (error) {
    record(vp, 'decisions: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'decisions', events)
    await context.close()
  }
}

async function interactiveCase(browser, vp) {
  const { context, page, events } = await newContext(browser, vp)
  try {
    await go(page, 'interactive-case')
    await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
    await auditLayout(page, vp, 'caso: estado inicial')
    await shot(page, vp, 'caso-inicial')
    await chartContained(page, vp, 'caso: gráfico inicial contido')
    await btn(page, 'Conclusão do onboarding gratuito').click()
    await chartContained(page, vp, 'caso: gráfico da métrica selecionada contido')
    await auditLayout(page, vp, 'caso: métrica selecionada')
    await page.locator('#case-evidence-case-feedback-onboarding-turma').check()
    await page.locator('#case-hypothesis').fill(prose(500).slice(0, 1500))
    await auditLayout(page, vp, 'caso: hipótese longa')
    await usable(page, vp, 'caso: alternativa (rádio)', page.locator('#case-decision-option-case-option-improve-onboarding'))
    await page.locator('#case-decision-option-case-option-improve-onboarding').check()
    await shot(page, vp, 'caso-alternativas')
    await usable(page, vp, 'caso: botão de síntese', btn(page, 'Ver síntese da minha decisão'))
    await btn(page, 'Ver síntese da minha decisão').click()
    await page.locator('#case-decision-summary-title').waitFor()
    await check(vp, 'caso: foco no título da síntese', async () => {
      const id = await page.evaluate(() => document.activeElement?.id)
      return id === 'case-decision-summary-title' ? {} : { fail: `foco em ${id}` }
    })
    await auditLayout(page, vp, 'caso: síntese completa')
    await shot(page, vp, 'caso-sintese')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await auditLayout(page, vp, 'caso: fim da página')
  } catch (error) {
    record(vp, 'caso: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'caso', events)
    await context.close()
  }
}

async function mobileNav(browser, vp) {
  if (vp.width >= 768) return
  const { context, page, events } = await newContext(browser, vp)
  try {
    await go(page, 'overview')
    await btn(page, 'Abrir navegação').click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'gaveta de navegação (mobile)')
    await shot(page, vp, 'gaveta-navegacao')
    await page.keyboard.press('Escape')
    await dlg(page).waitFor({ state: 'detached' })
  } catch (error) {
    record(vp, 'gaveta de navegação: cenário', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'navegação', events)
    await context.close()
  }
}

/* ------------------------------------------------------------------ */
/* Tour                                                                */
/* ------------------------------------------------------------------ */

function tourStateInPage() {
  const panel = document.querySelector('[role="dialog"][aria-modal="true"]')
  if (!panel) return { panel: false }
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const pr = panel.getBoundingClientRect()
  const route = location.hash
  const hl = document.querySelector('div[aria-hidden="true"][class*="outline-primary"]')
  const hr = hl ? hl.getBoundingClientRect() : null
  const buttons = [...panel.querySelectorAll('button')].map((b) => {
    const r = b.getBoundingClientRect()
    return { text: b.textContent.trim(), inside: r.top >= pr.top - 1 && r.bottom <= pr.bottom + 1 && r.left >= pr.left - 1 && r.right <= pr.right + 1, h: Math.round(r.height) }
  })
  const scrollable = panel.scrollHeight > panel.clientHeight + 1
  // Controles principais visíveis sem rolar o painel?
  const visibleNoScroll = buttons.every((b) => b.inside)
  let overlap = 0
  if (hr) {
    const x = Math.min(pr.right, hr.right) - Math.max(pr.left, hr.left)
    const y = Math.min(pr.bottom, hr.bottom) - Math.max(pr.top, hr.top)
    if (x > 0 && y > 0) overlap = Math.round(((x * y) / (hr.width * hr.height)) * 100)
  }
  return {
    panel: true,
    route,
    inViewport: pr.left >= -1 && pr.top >= -1 && pr.right <= vw + 1 && pr.bottom <= vh + 1,
    panelRect: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)],
    scrollable,
    visibleNoScroll,
    textClipped: panel.scrollWidth > panel.clientWidth + 1,
    docOverflowX: document.documentElement.scrollWidth > vw + 1,
    focusInPanel: panel.contains(document.activeElement),
    highlight: hr ? { top: Math.round(hr.top), bottom: Math.round(hr.bottom), h: Math.round(hr.height), tallerThanViewport: hr.height > vh, intersectsViewport: hr.bottom > 0 && hr.top < vh, overlapPct: overlap } : null,
    title: panel.querySelector('h2')?.textContent ?? '',
    progress: panel.querySelector('p.font-mono')?.textContent ?? '',
  }
}

async function runTour(browser, vp, { seeded }) {
  const label = seeded ? 'tour (workspace preenchido)' : 'tour (workspace vazio)'
  const { context, page, events } = await newContext(browser, vp, { seeded })
  const notes = []
  try {
    await go(page, 'decisions')
    await page.getByRole('heading', { name: 'Decision Workspace', exact: true }).waitFor()
    await btn(page, 'Como funciona').click()
    await page.locator('[role="dialog"][aria-modal="true"]').waitFor()
    await shot(page, vp, `${seeded ? 'tour-cheio' : 'tour-vazio'}-etapa-01`)
    const confirmPhase = await page.getByRole('button', { name: 'Iniciar tour', exact: true }).count()
    if (confirmPhase) await btn(page, 'Iniciar tour').click()
    await page.getByText('1 de 15', { exact: true }).waitFor()

    for (let step = 1; step <= 15; step += 1) {
      await page.getByText(`${step} de 15`, { exact: true }).waitFor()
      await page.waitForTimeout(450) // rolagem até o alvo + posicionamento do painel
      const s = await page.evaluate(tourStateInPage)
      const problems = []
      if (!s.panel) problems.push('painel ausente')
      else {
        if (!s.inViewport) problems.push(`painel fora da viewport ${JSON.stringify(s.panelRect)}`)
        if (s.docOverflowX) problems.push('overflow horizontal')
        if (s.textClipped) problems.push('texto do painel cortado na horizontal')
        if (!s.focusInPanel) problems.push('foco fora do painel')
        if (s.highlight && !s.highlight.intersectsViewport) problems.push('destaque fora da viewport')
        if (!s.visibleNoScroll && !s.scrollable) problems.push('controles cortados sem rolagem')
      }
      if (s.panel && s.scrollable) {
        // Painel rolável: o botão principal precisa ser alcançável por rolagem.
        const reach = await page.evaluate(() => {
          const panel = document.querySelector('[role="dialog"][aria-modal="true"]')
          const primary = [...panel.querySelectorAll('button')].find((b) => /Próximo|Concluir/.test(b.textContent))
          primary.scrollIntoView({ block: 'nearest' })
          const r = primary.getBoundingClientRect()
          const pr = panel.getBoundingClientRect()
          const ok = r.top >= pr.top - 1 && r.bottom <= pr.bottom + 1
          panel.scrollTop = 0
          return ok
        })
        if (!reach) problems.push('botão principal inalcançável')
      }
      const extra = s.panel
        ? `${s.route} destaque=${s.highlight ? `${s.highlight.h}px${s.highlight.tallerThanViewport ? ' (maior que a viewport)' : ''} sobreposição=${s.highlight.overlapPct}%` : 'nenhum'}${s.scrollable ? ' painel rolável' : ''}${s.visibleNoScroll ? '' : ' botões abaixo da dobra'}`
        : ''
      record(vp, `${label}: etapa ${step}`, problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : extra)
      if ([2, 3, 13, 15].includes(step)) await shot(page, vp, `${seeded ? 'tour-cheio' : 'tour-vazio'}-etapa-${String(step).padStart(2, '0')}`)
      if (step < 15) await btn(page.locator('[role="dialog"]'), 'Próximo').click()
    }
    await btn(page.locator('[role="dialog"]'), 'Concluir').click()
    await page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: 'detached' })
    await check(vp, `${label}: encerramento restaura origem e foco`, async () => {
      const state = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.textContent?.trim(), inert: document.getElementById('root').inert }))
      const bad = []
      if (!state.hash.startsWith('#/decisions')) bad.push(`hash ${state.hash}`)
      if (state.active !== 'Como funciona') bad.push(`foco em "${state.active}"`)
      if (state.inert) bad.push('#root inerte')
      return bad.length ? { fail: bad.join('; ') } : {}
    })
  } catch (error) {
    record(vp, `${label}: percurso`, 'FAIL', errText(error))
  } finally {
    reportEvents(vp, label, events)
    await context.close()
  }
  return notes
}

/* ------------------------------------------------------------------ */
/* Reflow: 320 × 256 e 256 × 320 (equivalente WCAG 1.4.10)             */
/* ------------------------------------------------------------------ */

async function reflow(browser) {
  const vp = { name: 'reflow-320x256', width: 320, height: 256, dpr: 1, mobile: false }
  for (const route of ['overview', 'feedbacks', 'decisions', 'interactive-case']) {
    for (const seeded of [false, true]) {
      const { context, page, events } = await newContext(browser, vp, { seeded })
      try {
        await go(page, route)
        await page.locator('main h1').first().waitFor()
        await page.waitForTimeout(400)
        await auditLayout(page, vp, `reflow ${route} (${seeded ? 'preenchido' : 'vazio'})`)
      } catch (error) {
        record(vp, `reflow ${route}`, 'FAIL', errText(error))
      } finally {
        reportEvents(vp, `reflow ${route}`, events)
        await context.close()
      }
    }
  }
  // Um diálogo e o tour na altura de 256 px.
  const { context, page, events } = await newContext(browser, vp, { seeded: true })
  try {
    await go(page, 'overview')
    await page.locator('button[aria-label^="Abrir indicador"]').first().click()
    await dlg(page).waitFor()
    await auditDialog(page, vp, 'reflow: diálogo de detalhe do indicador')
    await shot(page, vp, 'reflow-dialogo-320x256')
    await page.keyboard.press('Escape')
    await btn(page, 'Como funciona').click()
    await page.locator('[role="dialog"][aria-modal="true"]').waitFor()
    for (const step of [1, 2, 3, 4]) {
      await page.waitForTimeout(350)
      const s = await page.evaluate(tourStateInPage)
      const ok = s.inViewport && !s.docOverflowX && (s.visibleNoScroll || s.scrollable)
      record(vp, `reflow: tour etapa ${step}`, ok ? 'PASS' : 'FAIL', `painel ${JSON.stringify(s.panelRect)} rolável=${s.scrollable}`)
      await btn(page.locator('[role="dialog"]'), 'Próximo').click()
    }
    await shot(page, vp, 'reflow-tour-320x256')
  } catch (error) {
    record(vp, 'reflow: diálogo/tour', 'FAIL', errText(error))
  } finally {
    reportEvents(vp, 'reflow diálogo/tour', events)
    await context.close()
  }
}

/* ------------------------------------------------------------------ */
/* Execução                                                            */
/* ------------------------------------------------------------------ */

for (const vp of VIEWPORTS) {
  test(`4C5C2 módulos @ ${vp.name}`, async () => {
    const browser = await chromium.launch()
    try {
      await overviewEmpty(browser, vp)
      await overviewSeeded(browser, vp)
      await feedbacks(browser, vp)
      await decisions(browser, vp)
      await interactiveCase(browser, vp)
      await mobileNav(browser, vp)
    } finally {
      await browser.close()
    }
    const fails = results.filter((r) => r.viewport === vp.name && r.status === 'FAIL')
    assert.deepEqual(fails.map((f) => `${f.id}: ${f.detail}`), [], `falhas em ${vp.name}`)
  })
}

for (const vp of TOUR_VIEWPORTS) {
  test(`4C5C2 tour @ ${vp.name}`, async () => {
    const browser = await chromium.launch()
    const before = results.length
    try {
      await runTour(browser, vp, { seeded: false })
      await runTour(browser, vp, { seeded: true })
    } finally {
      await browser.close()
    }
    const fails = results.slice(before).filter((r) => r.status === 'FAIL')
    assert.deepEqual(fails.map((f) => `${f.id}: ${f.detail}`), [], `falhas do tour em ${vp.name}`)
  })
}

if (!ONLY) {
  test('4C5C2 reflow 320x256', async () => {
    const browser = await chromium.launch()
    const before = results.length
    try {
      await reflow(browser)
    } finally {
      await browser.close()
    }
    const fails = results.slice(before).filter((r) => r.status === 'FAIL')
    assert.deepEqual(fails.map((f) => `${f.id}: ${f.detail}`), [], 'falhas de reflow')
  })
}
