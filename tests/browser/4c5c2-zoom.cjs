/**
 * Zoom real do navegador a 200% (4C.5c.2) — tentativa controlada.
 *
 * Mecanismo: perfil temporário do Chromium com zoom por host em Preferences
 * (partition.per_host_zoom_levels, nível 3,8018 = 1,2^n ≈ 200%). É o mesmo armazenamento que o
 * zoom do menu do Chrome usa; não altera configurações do Windows nem de outro perfil.
 * Capturas de tela sob zoom real do host não são confiáveis no Playwright (saem escaladas/cortadas):
 * o script usa somente medidas de DOM em px CSS. Mede e só reporta "zoom real" se a janela externa for ~2× a área CSS interna
 * (o que CSS `zoom`, DPR emulado ou viewport reduzida não produzem).
 *
 * Uso: PLAYWRIGHT_MODULE=<...> node tests/browser/4c5c2-zoom.cjs
 * Saída: JSON em stdout com o resultado (PASS/FAIL/BLOCKED por rota).
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const HOST = new URL(ORIGIN).hostname
const FACTOR = Number(process.env.PDL_ZOOM || 2) // 2 = 200%, 4 = 400%
const ZOOM_LEVEL = Math.log(FACTOR) / Math.log(1.2) // 200% → 3,8018; 400% → 7,6036
const SHOTS = process.env.PDL_SHOTS_DIR || os.tmpdir()
const out = { factor: FACTOR, zoomLevel: ZOOM_LEVEL, routes: [], dialogs: [], tour: [] }

async function run() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdl-zoom-'))
  fs.mkdirSync(path.join(dir, 'Default'), { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'Default', 'Preferences'),
    JSON.stringify({
      partition: {
        per_host_zoom_levels: {
          x: { [HOST]: { zoom_level: ZOOM_LEVEL, last_modified: '13400000000000000' } },
        },
      },
    }),
  )
  const context = await chromium.launchPersistentContext(dir, {
    channel: 'chromium', // Chromium completo (headless novo), não o headless shell
    headless: true,
    viewport: null,
    args: ['--window-size=1280,800'],
  })
  try {
    const page = context.pages()[0] || (await context.newPage())
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(String(e)))
    for (const route of ['overview', 'feedbacks', 'decisions', 'interactive-case']) {
      await page.goto(`${ORIGIN}/#/${route}`)
      await page.locator('main h1').first().waitFor()
      await page.waitForTimeout(500)
      const m = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        dpr: window.devicePixelRatio,
        cssZoomOnRoot: getComputedStyle(document.documentElement).zoom,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        navigationOpenButton: !!document.querySelector('button[aria-label="Abrir navegação"]'),
      }))
      out.routes.push({ route, ...m, overflowX: m.scrollW > m.clientW + 1, errors: errors.splice(0) })
    }

    // Diálogos e tour sob zoom real.
    const inView = () =>
      page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]')
        if (!d) return null
        const r = d.getBoundingClientRect()
        const vw = document.documentElement.clientWidth
        const vh = window.innerHeight
        let reach = true
        for (const el of d.querySelectorAll('button, input, textarea, select')) {
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || el.getBoundingClientRect().width < 2) continue
          el.scrollIntoView({ block: 'nearest' })
          const b = el.getBoundingClientRect()
          if (b.left < -1 || b.right > vw + 1) reach = false
        }
        return {
          dialogInside: r.left >= -1 && r.right <= vw + 1,
          dialogTopInside: r.top >= -1,
          dialogHeightFits: r.bottom <= vh + 1,
          controlsHorizontallyReachable: reach,
          overflowX: document.documentElement.scrollWidth > vw + 1,
        }
      })
    await page.goto(`${ORIGIN}/#/overview`)
    await page.getByRole('button', { name: 'Novo indicador', exact: true }).click()
    await page.locator('#metric-name').fill('Nome extremamente longo '.repeat(5))
    await page.locator('#metric-description').fill('Descrição extensa. '.repeat(30))
    out.dialogs.push({ name: 'Novo indicador', ...(await inView()) })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Importar backup', exact: true }).click()
    await page.locator('[role="dialog"]').waitFor()
    out.dialogs.push({ name: 'Importar backup', ...(await inView()) })
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Como funciona', exact: true }).click()
    await page.getByText('1 de 15', { exact: true }).waitFor()
    for (let step = 1; step <= 15; step += 1) {
      await page.getByText(`${step} de 15`, { exact: true }).waitFor()
      await page.waitForTimeout(350)
      const t = await page.evaluate(() => {
        const p = document.querySelector('[role="dialog"][aria-modal="true"]')
        const r = p.getBoundingClientRect()
        const vw = document.documentElement.clientWidth
        const next = [...p.querySelectorAll('button')].find((b) => /Próximo|Concluir/.test(b.textContent))
        next.scrollIntoView({ block: 'nearest' })
        const nb = next.getBoundingClientRect()
        const ok = nb.top >= r.top - 1 && nb.bottom <= r.bottom + 1
        p.scrollTop = 0
        return {
          panelInside: r.left >= -1 && r.right <= vw + 1 && r.top >= -1 && r.bottom <= window.innerHeight + 1,
          primaryReachable: ok,
          scrollable: p.scrollHeight > p.clientHeight + 1,
          overflowX: document.documentElement.scrollWidth > vw + 1,
        }
      })
      out.tour.push({ step, ...t })
      await page.getByRole('button', { name: step < 15 ? 'Próximo' : 'Concluir', exact: true }).click()
    }
    // Zoom real: ~2× entre janela externa e área CSS interna; DPR 2 sozinho não basta.
    out.realZoomApplied = out.routes.every((r) => r.innerWidth > 0 && Math.abs(r.outerWidth / r.innerWidth - FACTOR) < 0.2 * FACTOR)
  } finally {
    await context.close()
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

run()
  .then(() => console.log(JSON.stringify(out, null, 2)))
  .catch((error) => {
    out.blocked = String(error.message).split('\n')[0]
    console.log(JSON.stringify(out, null, 2))
  })
