import { describe, it, expect } from 'vitest'
import { optionsFor, labelForValue } from '../players.js'

const trioGame = {
  players: { A: { joinedAt: 1, name: 'Alex' }, B: { joinedAt: 2, name: 'Sam' }, C: { joinedAt: 3, name: 'Lea' } },
}
const coupleGame = {
  players: { A: { joinedAt: 1, name: 'Alex' }, B: { joinedAt: 2, name: 'Sam' } },
}

describe('optionsFor — who', () => {
  it('en trio : les 3 joueurs + Les trois + Aucun des trois', () => {
    const opts = optionsFor({ type: 'who' }, trioGame)
    expect(opts.map((o) => o.label)).toEqual(['Alex', 'Sam', 'Lea', 'Les trois', 'Aucun des trois'])
  })
  it('en couple : les 2 joueurs + Les deux + Aucun des deux', () => {
    const opts = optionsFor({ type: 'who' }, coupleGame)
    expect(opts.map((o) => o.label)).toEqual(['Alex', 'Sam', 'Les deux', 'Aucun des deux'])
  })
})

describe('labelForValue — who', () => {
  it('en trio, both/neither = Les trois / Aucun des trois', () => {
    expect(labelForValue({ type: 'who' }, trioGame, 'both')).toBe('Les trois')
    expect(labelForValue({ type: 'who' }, trioGame, 'neither')).toBe('Aucun des trois')
    expect(labelForValue({ type: 'who' }, trioGame, 'C')).toBe('Lea')
  })
  it('en couple, both/neither = Les deux / Aucun des deux', () => {
    expect(labelForValue({ type: 'who' }, coupleGame, 'both')).toBe('Les deux')
    expect(labelForValue({ type: 'who' }, coupleGame, 'neither')).toBe('Aucun des deux')
  })
})
