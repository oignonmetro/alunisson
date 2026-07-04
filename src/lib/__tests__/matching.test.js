import { describe, it, expect } from 'vitest'
import { normalize, isMatch } from '../matching.js'

describe('normalize', () => {
  it('supprime accents, casse et ponctuation', () => {
    expect(normalize('Crème Brûlée !')).toBe('creme brulee')
  })
  it('réduit les espaces multiples', () => {
    expect(normalize('  le   chat  ')).toBe('le chat')
  })
  it('gère null/undefined', () => {
    expect(normalize(null)).toBe('')
    expect(normalize(undefined)).toBe('')
  })
  it('rend équivalentes des variantes typographiques', () => {
    expect(normalize('L’été')).toBe(normalize('l ete'))
    expect(normalize('Paris.')).toBe(normalize('paris'))
  })
})

describe('isMatch - mcq', () => {
  const q = { type: 'mcq' }
  it('vrai si même id d’option', () => {
    expect(isMatch(q, 'a', 'a')).toBe(true)
  })
  it('faux si options différentes', () => {
    expect(isMatch(q, 'a', 'b')).toBe(false)
  })
  it('faux si une réponse manque', () => {
    expect(isMatch(q, 'a', null)).toBe(false)
  })
})

describe('isMatch - text', () => {
  const q = { type: 'text' }
  it('vrai malgré casse/accents/ponctuation', () => {
    expect(isMatch(q, 'La mer', 'la  MER')).toBe(true)
    expect(isMatch(q, 'Éléphant', 'elephant')).toBe(true)
  })
  it('faux pour des textes réellement différents', () => {
    expect(isMatch(q, 'la mer', 'la montagne')).toBe(false)
  })
  it('faux si une réponse est vide', () => {
    expect(isMatch(q, '', 'la mer')).toBe(false)
    expect(isMatch(q, '   ', 'la mer')).toBe(false)
  })
})
