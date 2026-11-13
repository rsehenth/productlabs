/**
 * Verificação de acessibilidade 4C.5c.1 — descoberta da síntese, teclado/foco do tour,
 * contraste medido e proxy de zoom 200%.
 *
 * Uso:
 *   PLAYWRIGHT_MODULE=<caminho do playwright> node --test tests/browser/4c5c1-accessibility.cjs
 *
 * Build de produção em vite preview (padrão http://127.0.0.1:4731). Dados fictícios,
 * contextos isolados. Não substitui leitor de tela real nem zoom real do navegador.
 */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const ORIGIN = process.env.PDL_BASE_URL || 'http://127.0.0.1:4731'
const SUMMARY = 'section[aria-labelledby="case-decision-summary-title"]'
const SUMMARY_TITLE = '#case-decision-summary-title'
const HIGHLIGHT = 'div[aria-hidden="true"][class*="outline-primary"]'

const go = (page, route) => page.goto(`${ORIGIN}/#/${route}`)
const button = (scope, name) => scope.getByRole('button', { name, exact: true })
const panel = (page) => page.getByRole('dialog')
const active = (page) =>
  page.evaluate(() => ({
    tag: document.activeElement?.tagName ?? null,
    id: document.activeElement?.id ?? null,
    text: document.activeElement?.textContent?.trim() ?? null,
  }))

async function openCase(page) {
  await go(page, 'interactive-case')
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
}

async function completeRequirements(page, hypothesis = 'A queda pode estar ligada ao onboarding confuso.') {
  await page.getByRole('button', { name: 'Conclusão do onboarding gratuito', exact: true }).click()
  await page.locator('#case-evidence-case-feedback-onboarding-turma').check()
  await page.locator('#case-hypothesis').fill(hypothesis)
  await page.locator('#case-decision-option-case-option-improve-onboarding').check()
}

/* ------------------------------------------------------------------ */
/* Contraste: cores computadas no navegador + composição de transparência */
/* ------------------------------------------------------------------ */

/**
 * Mede contraste WCAG a partir de cores realmente computadas no Chromium.
 * `getComputedStyle` devolve oklch/oklab/color(srgb); o canvas converte para sRGB.
 * Fundos translúcidos são compostos subindo a árvore até um fundo opaco.
 */
async function measureContrast(page, specs) {
  return page.evaluate((items) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    function parse(css) {
      ctx.globalCompositeOperation = 'copy'
      ctx.fillStyle = 'rgba(0,0,0,0)'
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      const data = ctx.getImageData(0, 0, 1, 1).data
      return { r: data[0] / 255, g: data[1] / 255, b: data[2] / 255, a: data[3] / 255 }
    }

    const over = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    })

    function effectiveBackground(element) {
      const layers = []
      let node = element
      let base = null
      while (node) {
        const color = parse(getComputedStyle(node).backgroundColor)
        if (color.a > 0) {
          layers.push(color)
          if (color.a >= 1) {
            base = color
            break
          }
        }
        node = node.parentElement
      }
      if (!base) base = { r: 0, g: 0, b: 0, a: 1 }
      let result = { r: base.r, g: base.g, b: base.b, a: 1 }
      for (let index = layers.length - 1; index >= 0; index -= 1) {
        const layer = layers[index]
        if (layer === base) continue
        result = over(layer, result)
      }
      return result
    }

    const linear = (value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    const luminance = (color) =>
      0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b)
    const ratio = (a, b) => {
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
      return (high + 0.05) / (low + 0.05)
    }
    const hex = (color) =>
      '#' +
      [color.r, color.g, color.b]
        .map((value) => Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, '0'))
        .join('')

    return items.map((item) => {
      const element = document.querySelector(item.selector)
      if (!element) return { label: item.label, missing: true, pass: false, ratio: 0 }
      const style = getComputedStyle(element)
      const background = effectiveBackground(element)
      if (item.type === 'border' || item.type === 'outline' || item.type === 'stroke') {
        const css =
          item.type === 'border'
            ? style.borderTopColor
            : item.type === 'outline'
              ? style.outlineColor
              : style.stroke
        const width =
          item.type === 'border'
            ? parseFloat(style.borderTopWidth)
            : item.type === 'outline'
              ? parseFloat(style.outlineWidth)
              : 1
        const color = parse(css)
        const composited = color.a < 1 ? over(color, background) : color
        const value = ratio(composited, background)
        return {
          label: item.label,
          fg: hex(composited),
          bg: hex(background),
          ratio: value,
          required: 3,
          pass: width > 0 && css !== 'none' && value >= 3,
        }
      }
      if (item.type === 'fill') {
        const color = parse(style.backgroundColor)
        const backdrop = effectiveBackground(element.parentElement)
        const value = ratio(color, backdrop)
        return {
          label: item.label,
          fg: hex(color),
          bg: hex(backdrop),
          ratio: value,
          required: 3,
          pass: color.a > 0 && value >= 3,
        }
      }
      const size = parseFloat(style.fontSize)
      const weight = Number(style.fontWeight) || 400
      const large = size >= 24 || (size >= 18.66 && weight >= 700)
      const color = parse(style.color)
      const composited = color.a < 1 ? over(color, background) : color
      const value = ratio(composited, background)
      const required = large ? 3 : 4.5
      return {
        label: item.label,
        fg: hex(composited),
        bg: hex(background),
        fontSize: size,
        ratio: value,
        required,
        pass: value >= required,
      }
    })
  }, specs)
}

function assertContrast(results) {
  for (const result of results) {
    assert.equal(result.missing, undefined, `elemento ausente: ${result.label}`)
    assert.ok(
      result.pass,
      `${result.label}: ${result.ratio.toFixed(2)}:1 (${result.fg} sobre ${result.bg}), exigido ${result.required}:1`,
    )
  }
  console.log(results.map((r) => `  ${r.ratio.toFixed(2)}:1 ${r.label}`).join('\n'))
}

function runBrowser(name, fn, options = {}) {
  test(name, async () => {
    const browser = await chromium.launch()
    try {
      const context = await browser.newContext({
        viewport: options.viewport ?? { width: 1280, height: 800 },
        deviceScaleFactor: options.deviceScaleFactor ?? 1,
      })
      context.setDefaultTimeout(12000)
      const page = await context.newPage()
      const events = { errors: [], pageErrors: [], failed: [], http: [] }
      page.on('console', (message) => {
        if (message.type() === 'error') events.errors.push(message.text())
      })
      page.on('pageerror', (error) => events.pageErrors.push(String(error)))
      page.on('requestfailed', (request) => {
        if (!/favicon/.test(request.url())) events.failed.push(request.url())
      })
      page.on('response', (response) => {
        if (response.status() >= 400 && !/favicon/.test(response.url())) events.http.push(response.url())
      })
      await fn(page, context)
      assert.deepEqual(events.pageErrors, [], `${name}: pageerror`)
      assert.deepEqual(events.errors, [], `${name}: console errors`)
      assert.deepEqual(events.failed, [], `${name}: failed requests`)
      assert.deepEqual(events.http, [], `${name}: HTTP >= 400`)
    } finally {
      await browser.close()
    }
  })
}

/* ------------------------------------------------------------------ */
/* 1. Descoberta da síntese                                            */
/* ------------------------------------------------------------------ */

runBrowser('4C5C1-01 Síntese: foco no título na primeira exibição (mouse e teclado)', async (page) => {
  await openCase(page)
  await completeRequirements(page)

  await button(page, 'Ver síntese da minha decisão').click()
  await page.locator(SUMMARY).waitFor()
  let focus = await active(page)
  assert.equal(focus.tag, 'H2', 'foco não foi para o título')
  assert.equal(focus.id, 'case-decision-summary-title')
  assert.equal(focus.text, 'Sua decisão de produto')
  assert.equal(
    await button(page, 'Ver síntese da minha decisão').getAttribute('aria-controls'),
    'case-decision-summary',
    'acionador sem associação ao conteúdo revelado',
  )
  console.log('PASS 4C5C1-01 mouse')

  await page.reload()
  await page.getByRole('heading', { name: 'ProfResolve — Growth & Monetization', exact: true }).waitFor()
  await completeRequirements(page)
  await button(page, 'Ver síntese da minha decisão').focus()
  await page.keyboard.press('Enter')
  await page.locator(SUMMARY).waitFor()
  focus = await active(page)
  assert.equal(focus.id, 'case-decision-summary-title', 'ativação por teclado não moveu o foco')
  console.log('PASS 4C5C1-01 teclado')
})

runBrowser('4C5C1-02 Síntese: requisitos incompletos usam o alerta, sem anúncio duplicado', async (page) => {
  await openCase(page)
  await button(page, 'Ver síntese da minha decisão').focus()
  await page.keyboard.press('Enter')
  await page.getByText('Ainda faltam requisitos para visualizar a síntese.').waitFor()

  const focus = await active(page)
  assert.equal(focus.tag, 'BUTTON', 'foco saiu do acionador sem conteúdo válido')
  assert.equal(focus.text, 'Ver síntese da minha decisão')
  assert.equal(
    await page.locator(`${SUMMARY} [role="alert"]`).count(),
    1,
    'mensagem de requisitos não é anunciada por role=alert',
  )
  assert.equal(await page.locator(SUMMARY).count(), 1)
  console.log('PASS 4C5C1-02')
})

runBrowser('4C5C1-03 Síntese: nova solicitação refoca; edição visível não rouba o foco', async (page) => {
  await openCase(page)
  await completeRequirements(page, 'Hipótese inicial para verificar o foco da síntese.')
  await button(page, 'Ver síntese da minha decisão').click()
  await page.locator(SUMMARY).waitFor()
  assert.equal((await active(page)).id, 'case-decision-summary-title')

  await button(page, 'Ver síntese da minha decisão').click()
  assert.equal((await active(page)).id, 'case-decision-summary-title', 'nova solicitação não refocou')
  assert.equal(await page.locator(SUMMARY).count(), 1, 'síntese duplicada')

  await page.locator('#case-hypothesis').focus()
  await page.keyboard.type(' Ajuste.')
  const focus = await active(page)
  const text = await page.locator('#case-hypothesis').inputValue()
  assert.equal(focus.id, 'case-hypothesis', 'atualização da síntese roubou o foco da edição')
  assert.match(text, /Ajuste\.$/)
  assert.match(await page.locator(SUMMARY).innerText(), /Hipótese inicial para verificar o foco da síntese\. Ajuste\./)
  assert.equal(await page.locator(SUMMARY).count(), 1)
  console.log('PASS 4C5C1-03')
})

/* ------------------------------------------------------------------ */
/* 2. Tour: teclado, foco, mudança de rota, Escape                     */
/* ------------------------------------------------------------------ */

runBrowser('4C5C1-04 Tour: abertura por teclado, foco inicial e circulação de Tab', async (page) => {
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  const trigger = button(page, 'Como funciona')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await panel(page).waitFor()

  let focus = await active(page)
  assert.equal(focus.tag, 'H2')
  assert.equal(focus.text, 'Para que serve o Product Decision Lab')
  assert.equal(await panel(page).getAttribute('aria-modal'), 'true')
  const labelledBy = await panel(page).getAttribute('aria-labelledby')
  const describedBy = await panel(page).getAttribute('aria-describedby')
  assert.equal(await page.locator(`#${labelledBy}`).innerText(), 'Para que serve o Product Decision Lab')
  assert.ok((await page.locator(`#${describedBy}`).innerText()).length > 20)

  await page.keyboard.press('Shift+Tab')
  focus = await active(page)
  assert.equal(focus.text, 'Sair do tour', 'Shift+Tab do título não foi ao último botão')

  await page.keyboard.press('Tab')
  focus = await active(page)
  assert.equal(focus.text, 'Próximo', 'Tab do último botão não voltou ao primeiro habilitado')

  const inside = []
  for (let step = 0; step < 10; step += 1) {
    await page.keyboard.press('Tab')
    inside.push(
      await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]')
        return dialog?.contains(document.activeElement) ?? false
      }),
    )
  }
  assert.deepEqual([...new Set(inside)], [true], 'Tab escapou do painel do tour')
  assert.equal(await page.evaluate(() => document.getElementById('root').inert), true, '#root não inerte')
  console.log('PASS 4C5C1-04')
})

runBrowser('4C5C1-05 Tour: progresso, mudança de rota assíncrona, anúncio de etapa e Escape', async (page) => {
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  await button(page, 'Como funciona').click()
  await panel(page).waitFor()
  assert.equal(await page.locator('[role="dialog"] p.font-mono').innerText(), '1 de 15')
  assert.equal(await page.locator('[role="dialog"] [role="status"]').count(), 0, 'status redundante na etapa 1')

  await button(panel(page), 'Próximo').click()
  await page.getByText('2 de 15', { exact: true }).waitFor()
  assert.equal(
    await page.locator('[role="dialog"] [role="status"]').innerText(),
    'Etapa 2 de 15: O fluxo e a navegação',
  )

  for (let step = 2; step < 7; step += 1) await button(panel(page), 'Próximo').click()
  await page.getByRole('heading', { name: 'Feedback Discovery', exact: true }).waitFor()
  await page.getByText('Registrar feedbacks', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => location.hash), '#/feedbacks')
  assert.equal(
    await page.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement)),
    true,
    'mudança de rota tirou o foco do painel',
  )
  assert.equal(await page.locator('[role="dialog"] h2').innerText(), 'Registrar feedbacks')
  assert.equal(
    await page.locator('[role="dialog"] [role="status"]').innerText(),
    'Etapa 7 de 15: Registrar feedbacks',
  )

  await page.keyboard.press('Escape')
  await panel(page).waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => location.hash), '#/overview')
  assert.equal((await active(page)).text, 'Como funciona')
  assert.equal(await page.evaluate(() => document.getElementById('root').inert), false)
  assert.equal(await page.getByText('2 de 15', { exact: true }).count(), 0, 'painel residual')
  console.log('PASS 4C5C1-05')
})

runBrowser('4C5C1-06 Tour: sem conflito com diálogo Radix', async (page) => {
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  await button(page, 'Novo indicador').click()
  const radix = page.locator('[role="dialog"]')
  await radix.waitFor()
  assert.equal(
    await page.evaluate(() => Boolean(document.querySelector('header')?.closest('[aria-hidden="true"]'))),
    true,
    'conteúdo externo não foi ocultado ao leitor de tela',
  )
  assert.equal(
    await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].length),
    1,
    'tour abriu junto com o diálogo Radix',
  )
  await page.keyboard.press('Escape')
  await radix.waitFor({ state: 'detached' })

  await button(page, 'Como funciona').click()
  await panel(page).waitFor()
  assert.equal(await page.locator('[role="dialog"] h2').innerText(), 'Para que serve o Product Decision Lab')
  await page.keyboard.press('Escape')
  assert.equal((await active(page)).text, 'Como funciona')
  console.log('PASS 4C5C1-06')
})

/* ------------------------------------------------------------------ */
/* 3. Contraste medido                                                 */
/* ------------------------------------------------------------------ */

runBrowser('4C5C1-07 Contraste: síntese, botões, avisos e foco visível', async (page) => {
  await openCase(page)

  // Erro de requisitos: mede o aviso com role=alert antes de completar os requisitos.
  await button(page, 'Ver síntese da minha decisão').click()
  await page.getByText('Ainda faltam requisitos para visualizar a síntese.').waitFor()
  const errorContrast = await measureContrast(page, [
    { label: 'Aviso de erro (role=alert)', selector: `${SUMMARY} [role="alert"] p`, type: 'text' },
    { label: 'Item do aviso de erro', selector: `${SUMMARY} [role="alert"] li`, type: 'text' },
  ])
  assertContrast(errorContrast)

  await completeRequirements(page)
  await button(page, 'Ver síntese da minha decisão').click()
  await page.locator(SUMMARY).waitFor()

  // Foco visível real: ativa por teclado para acionar :focus-visible.
  await button(page, 'Como funciona').focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')

  const results = await measureContrast(page, [
    { label: 'H1 do caso', selector: 'main h1', type: 'text' },
    { label: 'Texto secundário do caso', selector: 'main p.text-muted-foreground', type: 'text' },
    { label: 'Rótulo da síntese (muted/80)', selector: `${SUMMARY} h3`, type: 'text' },
    { label: 'Corpo da síntese', selector: `${SUMMARY} p.text-foreground`, type: 'text' },
    { label: 'Evidência sobre fundo translúcido', selector: `${SUMMARY} li[class*="bg-background/40"]`, type: 'text' },
    { label: 'Aviso info da síntese', selector: `${SUMMARY} [role="status"]`, type: 'text' },
    { label: 'Botão primário (texto)', selector: 'button.bg-primary', type: 'text' },
    { label: 'Botão outline (texto)', selector: 'header button[class*="border-field"]', type: 'text' },
    { label: 'Badge simulado', selector: 'main [data-slot="badge"]', type: 'text' },
    { label: 'Tag de evidência (chart-2)', selector: 'p.text-chart-2', type: 'text' },
    { label: 'Tag de hipótese (chart-3)', selector: 'p.text-chart-3', type: 'text' },
    { label: 'Indicador numérico do progresso', selector: 'ol [class*="text-primary"]', type: 'text' },
    { label: 'Borda do botão outline', selector: 'header button[class*="border-field"]', type: 'border' },
    { label: 'Borda do campo de hipótese', selector: '#case-hypothesis', type: 'border' },
    { label: 'Anel de foco do acionador', selector: 'header button:focus', type: 'outline' },
    { label: 'Traço da série do gráfico', selector: 'figure .recharts-line-curve', type: 'stroke' },
  ])
  assertContrast(results)

  const stroke = await page.evaluate(() => {
    const path = document.querySelector('figure .recharts-line-curve')
    return path ? getComputedStyle(path).stroke : null
  })
  assert.ok(stroke && stroke !== 'none', 'gráfico sem cor de traço')
  console.log(`PASS 4C5C1-07 (stroke do gráfico: ${stroke})`)
})

runBrowser('4C5C1-08 Contraste: painel do tour, progresso e destaque', async (page) => {
  await go(page, 'overview')
  await page.getByRole('heading', { name: 'Seus dados no workspace', exact: true }).waitFor()
  await button(page, 'Como funciona').click()
  await panel(page).waitFor()
  await button(panel(page), 'Próximo').click()
  await page.getByText('2 de 15', { exact: true }).waitFor()
  await page.locator(HIGHLIGHT).waitFor()

  const results = await measureContrast(page, [
    { label: 'Título do tour', selector: '[role="dialog"] h2', type: 'text' },
    { label: 'Corpo do tour', selector: '[role="dialog"] p.text-muted-foreground', type: 'text' },
    { label: 'Progresso do tour', selector: '[role="dialog"] p.font-mono', type: 'text' },
    { label: 'Ação secundária do tour', selector: '[role="dialog"] button.text-muted-foreground', type: 'text' },
    { label: 'Ação primária do tour', selector: '[role="dialog"] button.bg-primary', type: 'text' },
    { label: 'Borda do painel do tour', selector: '[role="dialog"]', type: 'border' },
    { label: 'Preenchimento da barra de progresso', selector: '[role="dialog"] div.h-0\\.5 > div', type: 'fill' },
    { label: 'Contorno amarelo do alvo', selector: HIGHLIGHT, type: 'outline' },
  ])
  assertContrast(results)

  const panelBox = await page.evaluate(() => {
    const rect = document.querySelector('[role="dialog"]').getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: innerWidth,
      height: innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }
  })
  assert.ok(panelBox.top >= 0 && panelBox.left >= 0, 'painel fora da viewport')
  assert.ok(panelBox.right <= panelBox.width && panelBox.bottom <= panelBox.height, 'painel excede a viewport')
  assert.equal(panelBox.overflow, false, 'overflow horizontal com o tour aberto')
  console.log('PASS 4C5C1-08')
})

/* ------------------------------------------------------------------ */
/* 4. Proxy de zoom 200%                                              */
/* ------------------------------------------------------------------ */

runBrowser(
  '4C5C1-09 Zoom 200% (proxy 640×400 com DPR 2): painel, síntese, botões e reflow',
  async (page) => {
    assert.equal(await page.evaluate(() => window.devicePixelRatio), 2, 'DPR do proxy não aplicado')

    await openCase(page)
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      'overflow horizontal na página do caso',
    )

    await completeRequirements(page)
    await button(page, 'Ver síntese da minha decisão').click()
    await page.locator(SUMMARY).waitFor()
    assert.equal((await active(page)).id, 'case-decision-summary-title', 'foco da síntese no proxy de zoom')
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      'overflow horizontal com a síntese',
    )

    const summaryBox = await page.locator(SUMMARY).boundingBox()
    assert.ok(summaryBox && summaryBox.x >= 0 && summaryBox.x + summaryBox.width <= 640, 'síntese fora da viewport')

    await button(page, 'Como funciona').click()
    await panel(page).waitFor()
    await button(panel(page), 'Iniciar tour').click()
    await page.getByText('1 de 15', { exact: true }).waitFor()

    const boxes = []
    for (const step of [1, 2, 3, 4, 5]) {
      const box = await page.evaluate(() => {
        const rect = document.querySelector('[role="dialog"]').getBoundingClientRect()
        return {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          overflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })
      boxes.push({ step, ...box })
      if (step < 5) await button(panel(page), 'Próximo').click()
    }
    for (const box of boxes) {
      assert.ok(box.left >= 0 && box.top >= 0, `painel fora da viewport na etapa ${box.step}`)
      assert.ok(box.right <= 640 && box.bottom <= 400, `painel excede a viewport na etapa ${box.step}`)
      assert.equal(box.overflow, false, `overflow horizontal na etapa ${box.step}`)
    }

    await page.keyboard.press('Escape')
    assert.equal((await active(page)).text, 'Como funciona', 'retorno de foco no proxy de zoom')
    console.log('PASS 4C5C1-09 (proxy de zoom, não zoom real do navegador)')
  },
  { viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 },
)
