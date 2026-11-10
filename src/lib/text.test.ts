import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeSearch, slugify, truncate } from '@/lib/text'

describe('normalizeSearch', () => {
  it('ignora caixa, acentos e espaços extras', () => {
    expect(normalizeSearch('  Usabilidade   AÇÃO ')).toBe('usabilidade acao')
  })
})

describe('matchesSearch', () => {
  it('encontra termos sem acentuação', () => {
    expect(matchesSearch('Configuração inicial', 'configuracao')).toBe(true)
    expect(matchesSearch('Configuração inicial', 'CONFIGURAÇÃO')).toBe(true)
    expect(matchesSearch('Configuração inicial', 'onboarding')).toBe(false)
  })

  it('retorna verdadeiro para busca vazia', () => {
    expect(matchesSearch('qualquer', '  ')).toBe(true)
  })
})

describe('truncate', () => {
  it('corta com reticências respeitando o limite', () => {
    expect(truncate('abcdefghijkl', 5)).toBe('abcd…')
    expect(truncate('abc', 5)).toBe('abc')
  })
})

describe('slugify', () => {
  it('gera nome seguro com acentos removidos', () => {
    expect(slugify('Melhorar compreensão dos planos Premium')).toBe(
      'melhorar-compreensao-dos-planos-premium',
    )
    expect(slugify('Preço / Monetização!')).toBe('preco-monetizacao')
    expect(slugify('!!!')).toBe('')
  })

  it('limita o comprimento', () => {
    expect(slugify('a'.repeat(100)).length).toBe(60)
  })
})
