import { useSyncExternalStore } from 'react'
import { getLanguage, locale, setLanguage, subscribeLanguage, t } from '@/lib/i18n'

/** Idioma da interface; sem provider, o padrão é português. */
export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage)
  return { language, setLanguage, locale: locale(), t }
}
