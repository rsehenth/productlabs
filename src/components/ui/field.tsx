import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface FieldProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        {required ? (
          <span className="text-xs text-muted-foreground">
            Obrigatório
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
