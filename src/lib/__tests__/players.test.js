import { describe, it, expect } from 'vitest'
import { optionsFor, labelForValue, toggleWhoPick, whoPicksToValue, whoValueToPicks } from '../players.js'

const trioGame = {
  players: { A: { joinedAt: 1, name: 'Alex' }, B: { joinedAt: 2, name: 'Sam' }, C: { joinedAt: 3, name: 'Lea' } },
}
const coupleGame = {
  players: { A: { joinedAt: 1, name: 'Alex' }, B: { joinedAt: 2, name: 'Sam' } },
}

describe('optionsFor — who', () => {
  it('en trio : les 3 joueurs + Aucun des trois (pas de « Les trois »)', () => {
    const opts = optionsFor({ type: 'who' }, trioGame)
    expect(opts.map((o) => o.label)).toEqual(['Alex', 'Sam', 'Lea', 'Aucun des trois'])
  })
  it('en couple : les 2 joueurs + Les deux + Aucun des deux', () => {
    const opts = optionsFor({ type: 'who' }, coupleGame)
    expect(opts.map((o) => o.label)).toEqual(['Alex', 'Sam', 'Les deux', 'Aucun des deux'])
  })
})

describe('labelForValue — who', () => {
  it('en trio, une sélection multiple liste les prénoms', () => {
    expect(labelForValue({ type: 'who' }, trioGame, ['A', 'B'])).toBe('Alex, Sam')
    expect(labelForValue({ type: 'who' }, trioGame, ['C'])).toBe('Lea')
    expect(labelForValue({ type: 'who' }, trioGame, 'neither')).toBe('Aucun des trois')
  })
  it('en couple, both/neither = Les deux / Aucun des deux', () => {
    expect(labelForValue({ type: 'who' }, coupleGame, 'both')).toBe('Les deux')
    expect(labelForValue({ type: 'who' }, coupleGame, 'neither')).toBe('Aucun des deux')
  })
})

describe('toggleWhoPick', () => {
  it('ajoute et retire un joueur', () => {
    expect(toggleWhoPick([], 'A')).toEqual(['A'])
    expect(toggleWhoPick(['A'], 'B')).toEqual(['A', 'B'])
    expect(toggleWhoPick(['A', 'B'], 'A')).toEqual(['B'])
  })
  it('« Aucun » est exclusif : il vide les autres', () => {
    expect(toggleWhoPick(['A', 'B'], 'neither')).toEqual(['neither'])
    expect(toggleWhoPick(['neither'], 'neither')).toEqual([])
  })
  it('cocher un joueur retire « Aucun »', () => {
    expect(toggleWhoPick(['neither'], 'A')).toEqual(['A'])
  })
})

describe('whoPicksToValue / whoValueToPicks', () => {
  it('sélection de joueurs → tableau, « Aucun » → neither', () => {
    expect(whoPicksToValue(['A', 'B'])).toEqual(['A', 'B'])
    expect(whoPicksToValue(['neither'])).toBe('neither')
  })
  it('valeur stockée → sélection UI', () => {
    expect(whoValueToPicks(['A', 'B'])).toEqual(['A', 'B'])
    expect(whoValueToPicks('neither')).toEqual(['neither'])
    expect(whoValueToPicks(null)).toEqual([])
  })
})
