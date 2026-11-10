import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Field } from '@/components/ui/field'
import { PageHeader } from '@/components/ui/page-header'
import { fieldAria } from '@/lib/field-a11y'

describe('Field', () => {
  it('mantém a dica e mostra o erro ao mesmo tempo', () => {
    const html = renderToStaticMarkup(
      <Field id="x" label="Título" required hint="Dica útil" error="Campo inválido">
        <input id="x" />
      </Field>,
    )
    expect(html).toContain('id="x-hint"')
    expect(html).toContain('id="x-error"')
    expect(html).toContain('role="alert"')
    expect(html).not.toContain('uppercase')
  })

  it('fieldAria referencia dica e erro sem duplicar ids', () => {
    expect(fieldAria('x', { hint: 'a', error: 'b' })).toBe('x-hint x-error')
    expect(fieldAria('x', { hint: 'a' })).toBe('x-hint')
    expect(fieldAria('x', { error: 'b' })).toBe('x-error')
    expect(fieldAria('x', {})).toBeUndefined()
  })
})

describe('PageHeader', () => {
  it('permite quebra de títulos longos sem espaços', () => {
    const html = renderToStaticMarkup(
      <PageHeader title={'a'.repeat(140)} description="d" actions={<button>Ação</button>} />,
    )
    expect(html).toContain('break-words')
    expect(html).toContain('min-w-0')
    expect(html).toContain('Ação')
  })
})
