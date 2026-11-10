import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import type { WorkspaceLoadStatus } from '@/lib/storage/workspace-storage'

const MESSAGES: Partial<Record<WorkspaceLoadStatus, { title: string; description: string }>> = {
  invalid: {
    title: 'Dados locais inconsistentes',
    description:
      'O workspace salvo não pôde ser validado e foi iniciado vazio. O conteúdo original permanece no navegador e não foi apagado. Exporte-o para análise ou descarte-o explicitamente.',
  },
  'unsupported-version': {
    title: 'Versão de dados não suportada',
    description:
      'Os dados salvos usam uma versão mais recente que esta aplicação. O workspace foi iniciado vazio para evitar leitura incorreta. Nada foi apagado.',
  },
  unavailable: {
    title: 'Armazenamento local indisponível',
    description:
      'O navegador bloqueou o LocalStorage. A navegação continua funcionando, mas nada será salvo nesta sessão.',
  },
}

export function StorageAlert({
  status,
  children,
}: {
  status: WorkspaceLoadStatus
  children?: ReactNode
}) {
  const { t } = useLanguage()
  const message = MESSAGES[status]
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t(message.title)}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{t(message.description)}</p>
        {children}
      </div>
    </div>
  )
}
