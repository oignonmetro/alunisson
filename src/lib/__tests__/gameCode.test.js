import { describe, it, expect } from 'vitest'
import { generateCode, sanitizeCode, isValidCode, CODE_LENGTH } from '../gameCode.js'

describe('gameCode', () => {
  it('génère un code de la bonne longueur, sans lettres ambiguës', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode()
      expect(c).toHaveLength(CODE_LENGTH)
      expect(c).not.toMatch(/[IO]/)
      expect(isValidCode(c)).toBe(true)
    }
  })
  it('nettoie une saisie utilisateur', () => {
    expect(sanitizeCode('k p r t')).toBe('KPRT')
    expect(sanitizeCode('abio-cd')).toBe('ABCD') // I et O retirés
    expect(sanitizeCode('toolongvalue')).toHaveLength(CODE_LENGTH)
  })
  it('valide correctement', () => {
    expect(isValidCode('KPRT')).toBe(true)
    expect(isValidCode('KPR')).toBe(false)
    expect(isValidCode('')).toBe(false)
  })
})
