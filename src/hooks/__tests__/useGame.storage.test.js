import { describe, it, expect, beforeEach } from 'vitest'
import { ROOM_CODE_KEY, readPersistedCode, persistCode } from '../useGame.js'

describe('persistance du code de room (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ne renvoie rien tant que rien n’est persisté', () => {
    expect(readPersistedCode()).toBe(null)
  })

  it('persiste puis relit un code valide', () => {
    persistCode('ABCD')
    expect(localStorage.getItem(ROOM_CODE_KEY)).toBe('ABCD')
    expect(readPersistedCode()).toBe('ABCD')
  })

  it('efface le code persisté quand on passe null', () => {
    persistCode('ABCD')
    persistCode(null)
    expect(localStorage.getItem(ROOM_CODE_KEY)).toBe(null)
    expect(readPersistedCode()).toBe(null)
  })

  it('ignore une valeur corrompue en storage (mauvaise longueur/caractères)', () => {
    localStorage.setItem(ROOM_CODE_KEY, 'not-a-code!!')
    expect(readPersistedCode()).toBe(null)
    localStorage.setItem(ROOM_CODE_KEY, 'AB')
    expect(readPersistedCode()).toBe(null)
  })

  it('ne plante pas si localStorage est indisponible', () => {
    const original = globalThis.localStorage
    // Simule un accès qui lève (ex. navigation privée dans certains navigateurs).
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem() { throw new Error('unavailable') },
        setItem() { throw new Error('unavailable') },
        removeItem() { throw new Error('unavailable') },
      },
      configurable: true,
    })
    expect(() => persistCode('ABCD')).not.toThrow()
    expect(readPersistedCode()).toBe(null)
    Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true })
  })
})
