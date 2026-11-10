import { useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { useLanguage } from '@/hooks/use-language'
import { WorkspaceContext } from '@/hooks/use-workspace'

/** WFA-01: aviso de Workspace desatualizado, com o caminho seguro de recuperação. */
export function StaleNotice() {
  const { t } = useLanguage()
  const workspace = useContext(WorkspaceContext)
  if (!workspace?.stale) return null
  const { refreshWorkspace } = workspace

  return (
    <Notice tone="warning">
      <p className="font-semibold">{t('Workspace desatualizado')}</p>
      <p>
        {t('Outra aba alterou os dados. Tentativas de gravação recusadas não salvam alterações.')}
      </p>
      <p>
        {t('Atualize os dados e revise o que digitou antes de tentar salvar novamente.')}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="max-sm:min-h-11"
        data-workspace-refresh
        onClick={(event) => {
          const scope = event.currentTarget.closest<HTMLElement>('[role="dialog"], main')
          const next =
            scope?.querySelector<HTMLElement>('form [aria-invalid="true"], form [data-field-error]') ??
            scope?.querySelector<HTMLElement>('form input, form textarea, form select') ??
            scope
          next?.focus()
          refreshWorkspace()
        }}
      >
        {t('Atualizar dados')}
      </Button>
    </Notice>
  )
}
