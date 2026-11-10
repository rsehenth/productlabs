const assert = require('node:assert/strict')
const { test } = require('node:test')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const origin = process.env.PDL_BASE_URL || 'http://127.0.0.1:4816'
const key = 'product-decision-lab:workspace'
const button = (scope, name) => scope.getByRole('button', { name, exact: true })
const dialog = (page) => page.getByRole('dialog')
const go = (page, route) => page.goto(origin + '/#/' + route)
const active = (page, selector) => page.waitForFunction((value) =>
  document.activeElement.matches(value), selector)
const stored = (page) => page.evaluate((storageKey) => localStorage.getItem(storageKey), key)

function browserTest(name, run) {
  test(name, async () => {
    const browser = await chromium.launch()
    try {
      const context = await browser.newContext()
      context.setDefaultTimeout(5000)
      await run(await context.newPage(), context)
    } finally {
      await browser.close()
    }
  })
}

async function submit(scope, name) {
  await button(scope, name).press('Enter')
}

async function createFeedback(page, content) {
  await button(page, 'Novo feedback').click()
  await page.locator('#feedback-content').fill(content)
  await submit(dialog(page), 'Criar feedback')
  await dialog(page).waitFor({ state: 'hidden' })
}

async function createMetric(page, name) {
  await go(page, 'overview')
  await button(page, 'Novo indicador').click()
  await page.locator('#metric-name').fill(name)
  await submit(dialog(page), 'Criar indicador')
  await dialog(page).getByRole('heading', { name }).waitFor()
}

browserTest('Indicador em salvamento mantém diálogo e rascunho abertos', async (page) => {
  await go(page, 'overview')
  await button(page, 'Novo indicador').click()
  await page.locator('#metric-name').fill('Indicador fictício em salvamento')
  await page.evaluate(() => {
    window.testLockReady = new Promise((resolve) => {
      navigator.locks.request('product-decision-lab:workspace-write', () => new Promise((release) => {
        window.testReleaseLock = release
        resolve()
      }))
    })
  })
  await page.evaluate(() => window.testLockReady)
  try {
    await button(dialog(page), 'Criar indicador').click()
    await button(dialog(page), 'Salvando…').waitFor()
    assert.equal(await button(dialog(page), 'Cancelar').isDisabled(), true)
    await page.keyboard.press('Escape')
    assert.equal(await dialog(page).isVisible(), true)
    assert.equal(await page.locator('#metric-name').inputValue(), 'Indicador fictício em salvamento')
  } finally {
    await page.evaluate(() => window.testReleaseLock())
  }
  await dialog(page).getByRole('heading', { name: 'Indicador fictício em salvamento' }).waitFor()
})

browserTest('Exclusão de indicador pendente bloqueia repetição e fechamento', async (page) => {
  await createMetric(page, 'Indicador fictício pendente')
  await button(dialog(page), 'Excluir indicador').click()
  await page.evaluate(() => {
    window.testLockReady = new Promise((resolve) => {
      navigator.locks.request('product-decision-lab:workspace-write', () => new Promise((release) => {
        window.testReleaseLock = release
        resolve()
      }))
    })
  })
  await page.evaluate(() => window.testLockReady)
  try {
    await button(dialog(page), 'Confirmar exclusão').click()
    await dialog(page).getByRole('button', { name: 'Excluindo…', exact: true }).waitFor()
    assert.equal(await dialog(page).getByRole('button', { name: 'Excluindo…', exact: true }).isDisabled(), true)
    assert.equal(await button(dialog(page), 'Cancelar').isDisabled(), true)
    await page.keyboard.press('Escape')
    assert.equal(await dialog(page).isVisible(), true)
  } finally {
    await page.evaluate(() => window.testReleaseLock())
  }
  await dialog(page).waitFor({ state: 'hidden' })
})

browserTest('Observação em salvamento mantém o editor aberto', async (page) => {
  await createMetric(page, 'Indicador fictício para observação pendente')
  await button(dialog(page), 'Adicionar observação').click()
  await page.locator('#observation-value').fill('25')
  await page.evaluate(() => {
    window.testLockReady = new Promise((resolve) => {
      navigator.locks.request('product-decision-lab:workspace-write', () => new Promise((release) => {
        window.testReleaseLock = release
        resolve()
      }))
    })
  })
  await page.evaluate(() => window.testLockReady)
  try {
    await button(dialog(page), 'Salvar observação').click()
    await button(dialog(page), 'Salvando…').waitFor()
    assert.equal(await button(dialog(page), 'Cancelar').isDisabled(), true)
    await page.keyboard.press('Escape')
    assert.equal(await dialog(page).isVisible(), true)
    assert.equal(await page.locator('#observation-value').inputValue(), '25')
  } finally {
    await page.evaluate(() => window.testReleaseLock())
  }
  await dialog(page).getByRole('button', { name: /Editar observação de/ }).waitFor()
})

browserTest('Importação pendente impede fechamento do diálogo', async (page) => {
  await go(page, 'overview')
  await page.evaluate(() => {
    const original = URL.createObjectURL
    URL.createObjectURL = (blob) => {
      window.testBackupBlob = blob
      return original.call(URL, blob)
    }
  })
  await button(page, 'Exportar backup').click()
  await button(page, 'Importar backup').click()
  await page.locator('#backup-file').evaluate((input) => {
    const files = new DataTransfer()
    files.items.add(new File([window.testBackupBlob], 'ficticio.json', { type: 'application/json' }))
    input.files = files.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.waitForFunction(() =>
    !Array.from(document.querySelectorAll('button')).find((item) => item.textContent.trim() === 'Substituir workspace').disabled,
  )
  await page.evaluate(() => {
    window.testLockReady = new Promise((resolve) => {
      navigator.locks.request('product-decision-lab:workspace-write', () => new Promise((release) => {
        window.testReleaseLock = release
        resolve()
      }))
    })
  })
  await page.evaluate(() => window.testLockReady)
  try {
    await button(dialog(page), 'Substituir workspace').click()
    await button(dialog(page), 'Importando…').waitFor()
    assert.equal(await button(dialog(page), 'Cancelar').isDisabled(), true)
    await page.keyboard.press('Escape')
    assert.equal(await dialog(page).isVisible(), true)
  } finally {
    await page.evaluate(() => window.testReleaseLock())
  }
  await dialog(page).waitFor({ state: 'hidden' })
})

browserTest('Validação leva o foco ao primeiro campo inválido nos quatro formulários', async (page) => {
  await go(page, 'overview')
  await button(page, 'Novo indicador').click()
  await submit(dialog(page), 'Criar indicador')
  await active(page, '#metric-name[aria-invalid="true"]')
  await page.locator('#metric-name').fill('Indicador fictício')
  await submit(dialog(page), 'Criar indicador')
  await dialog(page).getByRole('heading', { name: 'Indicador fictício' }).waitFor()
  await button(dialog(page), 'Adicionar observação').click()
  await page.locator('#observation-value').fill('-5')
  await submit(dialog(page), 'Salvar observação')
  await active(page, '#observation-value[aria-invalid="true"]')
  assert.equal(await page.locator('#observation-value').inputValue(), '-5')
  await page.keyboard.press('Escape')

  await go(page, 'feedbacks')
  await button(page, 'Novo feedback').click()
  await submit(dialog(page), 'Criar feedback')
  await active(page, '#feedback-content[aria-invalid="true"]')
  await submit(dialog(page), 'Criar feedback')
  await active(page, '#feedback-content[aria-invalid="true"]')
  await page.keyboard.press('Escape')

  await go(page, 'decisions')
  await button(page, 'Nova decisão').click()
  await page.locator('#decision-hypothesis').fill('Hipótese fictícia mantida')
  await submit(page, 'Salvar decisão')
  await active(page, '#decision-title[aria-invalid="true"]')
  assert.equal(await page.locator('#decision-problem').getAttribute('aria-invalid'), 'true')
  assert.equal(await page.locator('#decision-hypothesis').inputValue(), 'Hipótese fictícia mantida')
})

browserTest('Conflito entre abas mostra uma recuperação e permite salvar o mesmo rascunho', async (tabB, context) => {
  await go(tabB, 'feedbacks')
  await createFeedback(tabB, 'Feedback fictício original B')
  await tabB.getByRole('button', { name: /Editar feedback:/ }).click()
  await tabB.locator('#feedback-content').fill('Rascunho fictício B')

  const tabA = await context.newPage()
  await go(tabA, 'feedbacks')
  await createFeedback(tabA, 'Feedback fictício concorrente A')
  const before = await stored(tabA)
  const refresh = button(dialog(tabB), 'Atualizar dados')
  await refresh.waitFor()
  await submit(dialog(tabB), 'Salvar alterações')
  await active(tabB, '[data-workspace-refresh]')
  assert.equal(await stored(tabB), before)
  assert.equal(await tabB.getByText('Workspace desatualizado', { exact: true })
    .filter({ visible: true }).count(), 1)
  assert.equal(await tabB.getByText(/Os dados deste Workspace foram alterados/).count(), 0)

  await refresh.press('Enter')
  await refresh.waitFor({ state: 'hidden' })
  await active(tabB, '#feedback-content')
  assert.equal(await tabB.locator('#feedback-content').inputValue(), 'Rascunho fictício B')
  await submit(dialog(tabB), 'Salvar alterações')
  await dialog(tabB).waitFor({ state: 'hidden' })
  await tabB.reload()
  const feedbacks = JSON.parse(await stored(tabB)).data.feedbacks
  assert.deepEqual(feedbacks.map(({ content }) => content).sort(), [
    'Feedback fictício concorrente A', 'Rascunho fictício B',
  ])
})

browserTest('Conflito ao descartar dados não deixa aviso antigo após atualizar', async (tabB, context) => {
  const tabA = await context.newPage()
  await go(tabA, 'overview')
  await tabA.evaluate((storageKey) => localStorage.setItem(storageKey, '{inválido'), key)
  await go(tabB, 'overview')
  await button(tabB, 'Descartar dados e iniciar vazio').click()
  await tabA.evaluate((storageKey) => localStorage.setItem(storageKey, '{alterado'), key)
  const before = await stored(tabA)
  await button(dialog(tabB), 'Atualizar dados').waitFor()
  await button(dialog(tabB), 'Descartar dados').click()
  await tabB.evaluate(() => navigator.locks.request('product-decision-lab:workspace-write', () => {}))
  assert.equal(await stored(tabA), before)
  await button(dialog(tabB), 'Atualizar dados').click()
  await tabB.keyboard.press('Escape')
  assert.equal(await tabB.getByText('Workspace desatualizado', { exact: true }).count(), 0)
  assert.equal(await tabB.getByText(/Os dados deste Workspace foram alterados/).count(), 0)
})

browserTest('Atualizar mantém erros de campo e comunica falha de leitura', async (tabB, context) => {
  await go(tabB, 'feedbacks')
  await button(tabB, 'Novo feedback').click()
  await tabB.locator('#feedback-content').fill('Rascunho fictício com data inválida')
  await tabB.locator('#feedback-date').fill('')
  await submit(dialog(tabB), 'Criar feedback')
  await active(tabB, '#feedback-date[aria-invalid="true"]')

  const tabA = await context.newPage()
  await go(tabA, 'feedbacks')
  await createFeedback(tabA, 'Primeiro feedback fictício A')
  await button(dialog(tabB), 'Atualizar dados').press('Enter')
  await active(tabB, '#feedback-date[aria-invalid="true"]')
  assert.equal(await tabB.locator('#feedback-content').inputValue(), 'Rascunho fictício com data inválida')

  await createFeedback(tabA, 'Segundo feedback fictício A')
  await tabB.evaluate(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Teste de leitura', 'SecurityError') }
  })
  await button(dialog(tabB), 'Atualizar dados').press('Enter')
  await dialog(tabB).getByText('Armazenamento local indisponível', { exact: true }).waitFor()
  await active(tabB, '#feedback-date[aria-invalid="true"]')
})

browserTest('Falha de gravação mantém o rascunho e foca o aviso', async (page) => {
  await go(page, 'feedbacks')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Teste de gravação', 'QuotaExceededError') }
  })
  await button(page, 'Novo feedback').click()
  await page.locator('#feedback-content').fill('Feedback fictício preservado')
  await submit(dialog(page), 'Criar feedback')
  await active(page, '#feedback-form [role="alert"][tabindex="-1"]')
  assert.equal(await page.locator('#feedback-content').inputValue(), 'Feedback fictício preservado')
  assert.equal(await stored(page), null)
})

browserTest('Observação mantém rascunho e informa remoção concorrente do indicador', async (tabB, context) => {
  await createMetric(tabB, 'Indicador fictício removido por outra aba')
  await submit(dialog(tabB), 'Adicionar observação')
  await tabB.locator('#observation-value').fill('25')

  const tabA = await context.newPage()
  await tabA.goto(tabB.url())
  await submit(dialog(tabA), 'Excluir indicador')
  await submit(dialog(tabA), 'Confirmar exclusão')
  await dialog(tabA).waitFor({ state: 'hidden' })
  await submit(dialog(tabB), 'Salvar observação')
  await active(tabB, '[data-workspace-refresh]')
  await submit(dialog(tabB), 'Atualizar dados')
  assert.equal(await tabB.locator('#observation-value').inputValue(), '25')

  await submit(dialog(tabB), 'Salvar observação')
  await active(tabB, 'form [role="alert"][tabindex="-1"]')
  await dialog(tabB).getByText('Indicador não encontrado.', { exact: true }).waitFor()
  assert.deepEqual(JSON.parse(await stored(tabB)).data.observations, [])
})

browserTest('Ações inline voltam ao disparador ou a Adicionar observação', async (page) => {
  await createMetric(page, 'Indicador fictício para retorno de foco')
  await submit(dialog(page), 'Adicionar observação')
  await page.locator('#observation-value').fill('25')
  await submit(dialog(page), 'Salvar observação')
  await page.waitForFunction(() => document.activeElement.textContent.trim() === 'Adicionar observação')

  const edit = dialog(page).getByRole('button', { name: /Editar observação de/ })
  await edit.press('Enter')
  await submit(dialog(page), 'Cancelar')
  await active(page, 'button[aria-label^="Editar observação de"]')

  const remove = dialog(page).getByRole('button', { name: /Excluir observação de/ })
  await remove.press('Enter')
  await submit(dialog(page), 'Cancelar')
  await active(page, 'button[aria-label^="Excluir observação de"]')
  await remove.press('Enter')
  await submit(dialog(page), 'Confirmar exclusão')
  await page.waitForFunction(() => document.activeElement.textContent.trim() === 'Adicionar observação')
})

browserTest('Detalhes abertos por URL voltam a um ponto de foco estável', async (page) => {
  await createMetric(page, 'Indicador fictício de URL direta')
  await page.reload()
  await dialog(page).waitFor()
  await page.keyboard.press('Escape')
  await active(page, 'main')

  await go(page, 'decisions')
  await button(page, 'Nova decisão').click()
  await page.locator('#decision-title').fill('Decisão fictícia de URL direta')
  await page.locator('#decision-problem').fill('Problema fictício para verificar a volta à lista.')
  await submit(page, 'Salvar decisão')
  await page.getByRole('heading', { name: 'Decisão fictícia de URL direta' }).waitFor()
  await page.reload()
  await submit(page, 'Voltar')
  await page.getByRole('heading', { name: 'Decision Workspace' }).waitFor()
  await active(page, 'main')
})
