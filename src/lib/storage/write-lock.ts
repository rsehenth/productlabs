/** Serializa gravações entre abas da mesma origem (WFA-01). */
export const WRITE_LOCK_NAME = 'product-decision-lab:workspace-write'

export const LOCKS_UNSUPPORTED_MESSAGE =
  'Este navegador ou contexto não oferece a Web Locks API, necessária para gravar com segurança entre abas. Nada foi salvo. Use um navegador atual em HTTPS ou localhost.'

export interface LockManagerLike {
  request<T>(name: string, options: { mode: 'exclusive' }, callback: () => T | Promise<T>): Promise<T>
}

function resolveLocks(): LockManagerLike | null {
  try {
    return (globalThis.navigator?.locks as LockManagerLike | undefined) ?? null
  } catch {
    return null
  }
}

export type LockedResult<T> = { ok: true; value: T } | { ok: false; error: string }

/**
 * Executa `fn` com exclusão mútua entre abas. Sem Web Locks não há como
 * garantir ausência de sobrescrita, então a gravação é recusada (sem fallback fingido).
 */
export async function withWriteLock<T>(
  fn: () => T,
  locks: LockManagerLike | null = resolveLocks(),
): Promise<LockedResult<T>> {
  if (!locks) return { ok: false, error: LOCKS_UNSUPPORTED_MESSAGE }
  try {
    return { ok: true, value: await locks.request(WRITE_LOCK_NAME, { mode: 'exclusive' }, fn) }
  } catch {
    return { ok: false, error: LOCKS_UNSUPPORTED_MESSAGE }
  }
}
