import { describe, expect, it, vi } from 'vitest'
import { serializeBackup } from '@/lib/backup'
import { createBackupSelection, type BackupFileLike } from '@/lib/backup-selection'
import { buildDecision, buildMetric, buildWorkspace } from '@/test/fixtures'
import type { WorkspaceState } from '@/types/workspace'

type SaveResult = { ok: true } | { ok: false; error: string }

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function pendingFile(name: string) {
  const read = deferred<string>()
  const file: BackupFileLike = { name, size: 10, text: () => read.promise }
  return { file, read }
}

const wsA = buildWorkspace({ metrics: [buildMetric({ id: 'metric-a', name: 'A' })] })
const wsB = buildWorkspace({
  metrics: [
    buildMetric({ id: 'metric-b1', name: 'B1' }),
    buildMetric({ id: 'metric-b2', name: 'B2' }),
  ],
})
const textA = serializeBackup(wsA)
const textB = serializeBackup(wsB)
const NOT_JSON = '{ nao e json'

function setup(replace: (w: WorkspaceState) => Promise<SaveResult> = async () => ({ ok: true })) {
  const replaceWorkspace = vi.fn(replace)
  // cast: só ok/error de WorkspaceSaveResult são usados pelo controlador
  const selection = createBackupSelection(replaceWorkspace as never)
  return { selection, replaceWorkspace }
}

describe('seleção de backup: leituras fora de ordem (WFA-03)', () => {
  it('A: B termina antes de A; B continua sendo a seleção válida e é o que se importa (G)', async () => {
    const { selection, replaceWorkspace } = setup()
    const a = pendingFile('a.json')
    const b = pendingFile('b.json')
    const pa = selection.select(a.file)
    const pb = selection.select(b.file)
    b.read.resolve(textB)
    await pb
    a.read.resolve(textA)
    await pa

    expect(selection.getState()).toMatchObject({
      phase: 'ready',
      fileName: 'b.json',
      summary: { metrics: 2 },
    })
    await selection.confirm()
    expect(replaceWorkspace).toHaveBeenCalledTimes(1)
    expect(replaceWorkspace.mock.calls[0]?.[0]).toEqual(wsB)
  })

  it('B: A inválido termina depois de B válido e não sobrescreve a validação', async () => {
    const { selection } = setup()
    const a = pendingFile('a.json')
    const b = pendingFile('b.json')
    const pa = selection.select(a.file)
    const pb = selection.select(b.file)
    b.read.resolve(textB)
    await pb
    a.read.resolve(NOT_JSON)
    await pa

    expect(selection.getState()).toMatchObject({ phase: 'ready', error: null, fileName: 'b.json' })
  })

  it('C: A válido termina depois de B inválido e não habilita a importação (H)', async () => {
    const { selection, replaceWorkspace } = setup()
    const a = pendingFile('a.json')
    const b = pendingFile('b.json')
    const pa = selection.select(a.file)
    const pb = selection.select(b.file)
    b.read.resolve(NOT_JSON)
    await pb
    a.read.resolve(textA)
    await pa

    expect(selection.getState()).toMatchObject({
      phase: 'invalid',
      fileName: 'b.json',
      summary: null,
    })
    expect(await selection.confirm()).toBeNull()
    expect(replaceWorkspace).not.toHaveBeenCalled()
  })

  it('D: com leitura pendente a prévia anterior é invalidada e a confirmação bloqueada', async () => {
    const { selection, replaceWorkspace } = setup()
    const a = pendingFile('a.json')
    const pa = selection.select(a.file)
    a.read.resolve(textA)
    await pa
    expect(selection.getState().phase).toBe('ready')

    const b = pendingFile('b.json')
    const pb = selection.select(b.file)
    expect(selection.getState()).toMatchObject({ phase: 'reading', summary: null })
    expect(await selection.confirm()).toBeNull()
    expect(replaceWorkspace).not.toHaveBeenCalled()
    b.read.resolve(textB)
    await pb
  })

  it('leitura antiga que rejeita não altera a seleção atual', async () => {
    const { selection } = setup()
    const a = pendingFile('a.json')
    const b = pendingFile('b.json')
    const pa = selection.select(a.file)
    const pb = selection.select(b.file)
    b.read.resolve(textB)
    await pb
    a.read.reject(new Error('falha'))
    await pa
    expect(selection.getState()).toMatchObject({ phase: 'ready', error: null })
  })

  it('E: leitura de abertura anterior (diálogo fechado) não altera a nova abertura', async () => {
    const { selection } = setup()
    const a = pendingFile('a.json')
    const pa = selection.select(a.file)
    selection.invalidate() // diálogo fechado
    const reopened = setup().selection // nova abertura = novo controlador
    a.read.resolve(textA)
    await pa
    expect(selection.getState().phase).toBe('reading') // nunca chegou a ready
    expect(await selection.confirm()).toBeNull()
    expect(reopened.getState().phase).toBe('idle')
  })

  it('F: mesmo nome, conteúdos diferentes; vale a última seleção, não o nome', async () => {
    const { selection, replaceWorkspace } = setup()
    const first = pendingFile('backup.json')
    const second = pendingFile('backup.json')
    const p1 = selection.select(first.file)
    const p2 = selection.select(second.file)
    second.read.resolve(textB)
    await p2
    first.read.resolve(textA)
    await p1
    await selection.confirm()
    expect(replaceWorkspace.mock.calls[0]?.[0]).toEqual(wsB)
  })

  it('I: dois cliques rápidos executam uma única substituição; troca de arquivo é ignorada durante a gravação', async () => {
    const write = deferred<SaveResult>()
    const { selection, replaceWorkspace } = setup(() => write.promise)
    const a = pendingFile('a.json')
    const pa = selection.select(a.file)
    a.read.resolve(textA)
    await pa

    const c1 = selection.confirm()
    const c2 = selection.confirm()
    expect(await c2).toBeNull()
    expect(selection.getState().phase).toBe('importing')

    await selection.select(pendingFile('b.json').file)
    expect(selection.getState()).toMatchObject({ phase: 'importing', fileName: 'a.json' })

    write.resolve({ ok: true })
    expect(await c1).toMatchObject({ metrics: 1 })
    expect(selection.getState().phase).toBe('imported')
    expect(replaceWorkspace).toHaveBeenCalledTimes(1)
  })

  it('J (WFA-01): conflito de gravação não informa sucesso e permite nova tentativa', async () => {
    const { selection, replaceWorkspace } = setup()
    replaceWorkspace.mockResolvedValueOnce({ ok: false, error: 'Dados alterados em outra aba.' })
    const a = pendingFile('a.json')
    const pa = selection.select(a.file)
    a.read.resolve(textA)
    await pa

    expect(await selection.confirm()).toBeNull()
    expect(selection.getState()).toMatchObject({
      phase: 'failed',
      error: 'Dados alterados em outra aba.',
    })
    expect(await selection.confirm()).not.toBeNull()
    expect(replaceWorkspace).toHaveBeenCalledTimes(2)
  })

  it('J (WFA-02): decisão incompatível com as regras de domínio continua recusada', async () => {
    const { selection, replaceWorkspace } = setup()
    const bad = buildWorkspace({
      decisions: [
        buildDecision({ status: 'validated', hypothesis: '', decision: '', successCriteria: [] }),
      ],
    })
    const f = pendingFile('legado.json')
    const p = selection.select(f.file)
    f.read.resolve(serializeBackup(bad))
    await p
    expect(selection.getState().phase).toBe('invalid')
    expect(await selection.confirm()).toBeNull()
    expect(replaceWorkspace).not.toHaveBeenCalled()
  })
})
