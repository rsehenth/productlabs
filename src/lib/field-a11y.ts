export function fieldAria(
  id: string,
  options: { hint?: string; error?: string },
): string | undefined {
  const ids = [
    options.hint ? `${id}-hint` : null,
    options.error ? `${id}-error` : null,
  ].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}
