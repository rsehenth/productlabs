import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

/** Alterna entre português (padrão) e inglês; a escolha fica salva neste navegador. */
export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()
  const next = language === 'pt' ? 'en' : 'pt'

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-11 shrink-0 gap-1.5 px-2.5 sm:h-9"
      onClick={() => setLanguage(next)}
      aria-label={t('Alternar idioma')}
      title={`${t('Idioma da interface')}: ${language === 'pt' ? 'Português' : 'English'}`}
    >
      <Languages aria-hidden="true" />
      <span className="font-mono text-xs" lang={next}>
        {language === 'pt' ? 'PT' : 'EN'}
      </span>
    </Button>
  )
}
