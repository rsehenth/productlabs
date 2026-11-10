import { useEffect, useRef, useState } from 'react'
import type { FieldErrors, OperationFailure } from '@/lib/domain/operations'
import { CONFLICT_MESSAGE } from '@/lib/storage/workspace-storage'

type ErrorTarget = 'field' | 'notice' | 'conflict'

export function useFormErrors() {
  const formRef = useRef<HTMLFormElement>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<{ target: ErrorTarget }>()

  useEffect(() => {
    const form = formRef.current
    if (!request || !form) return

    const scope = form.closest('[role="dialog"], main')
    const target =
      request.target === 'conflict'
        ? scope?.querySelector<HTMLElement>('[data-workspace-refresh]')
        : request.target === 'field'
          ? form.querySelector<HTMLElement>('[aria-invalid="true"], [data-field-error]')
          : form.querySelector<HTMLElement>('[role="alert"][tabindex="-1"]')

    const destination = target ?? form
    destination.focus()
  }, [request])

  function focusError(target: ErrorTarget) {
    // Each failed submission is a new request, even when the error text is unchanged.
    setRequest({ target })
  }

  function reportError(result: OperationFailure) {
    if (result.error === CONFLICT_MESSAGE) {
      focusError('conflict')
      return
    }

    const errors = result.fieldErrors ?? {}
    const generalError = errors.id ?? errors.metricId
    const message = generalError ?? (Object.values(errors).some(Boolean) ? null : result.error)
    setFieldErrors(errors)
    setError(message)
    focusError(message ? 'notice' : 'field')
  }

  return { formRef, fieldErrors, setFieldErrors, error, setError, focusError, reportError }
}
