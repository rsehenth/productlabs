import { EN_MESSAGES } from '@/lib/messages'

export type Language = 'pt' | 'en'

const STORAGE_KEY = 'product-decision-lab:language'

let current: Language = 'pt'
const listeners = new Set<() => void>()

function isLanguage(value: unknown): value is Language {
  return value === 'pt' || value === 'en'
}

function documentLang(language: Language): string {
  return language === 'pt' ? 'pt-BR' : 'en'
}

if (typeof window !== 'undefined') {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) current = saved
  } catch {
    // Sem armazenamento: mantém o padrão em português.
  }
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = documentLang(current)
}

export function getLanguage(): Language {
  return current
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setLanguage(next: Language): void {
  if (next === current) return
  current = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Preferência não persistida: a sessão atual continua no idioma escolhido.
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = documentLang(next)
  }
  for (const listener of listeners) listener()
}

export function locale(): string {
  return current === 'pt' ? 'pt-BR' : 'en-US'
}

/**
 * Traduz a partir do próprio texto em português (fonte única das chaves).
 * Sem tradução cadastrada, o texto original é devolvido: nada fica em branco.
 */
export function t(source: string, vars?: Record<string, string | number>): string {
  const template = current === 'pt' ? source : (EN_MESSAGES[source] ?? source)
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

/**
 * Rótulos lidos no momento do render: um Proxy evita congelar o texto no idioma do
 * import e mantém `Object.entries(...)` funcionando nos selects.
 */
export function localizedRecord<T extends string>(
  pt: Record<T, string>,
  en: Record<T, string>,
): Record<T, string> {
  return new Proxy({} as Record<T, string>, {
    get: (_target, key: string) => (current === 'pt' ? pt : en)[key as T],
    ownKeys: () => Object.keys(pt),
    getOwnPropertyDescriptor: (_target, key: string) => {
      const value = (current === 'pt' ? pt : en)[key as T]
      return { enumerable: true, configurable: true, value }
    },
  })
}
