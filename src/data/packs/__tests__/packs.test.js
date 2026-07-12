import { describe, it, expect } from 'vitest'
import { PACKS, PACKS_BY_ID, totalQuestions, friendsCount } from '../index.js'

describe('friendsCount / totalQuestions', () => {
  it('compte les questions « amis » (audience:all) d’un pack', () => {
    for (const p of PACKS) {
      const manual = p.questions.filter((q) => q.audience === 'all').length
      expect(friendsCount(p)).toBe(manual)
    }
  })
  it('en mode amis, le total est ≤ au total couple', () => {
    const ids = PACKS.map((p) => p.id)
    expect(totalQuestions(ids, 'amis')).toBeLessThanOrEqual(totalQuestions(ids, 'couple'))
  })
  it('goûts et quotidien offrent assez de questions amis pour un trio (≥ 9)', () => {
    expect(friendsCount(PACKS_BY_ID.gouts)).toBeGreaterThanOrEqual(9)
    expect(friendsCount(PACKS_BY_ID.quotidien)).toBeGreaterThanOrEqual(9)
  })
  it('souvenirs reste 100 % couple (0 question amis)', () => {
    expect(friendsCount(PACKS_BY_ID.souvenirs)).toBe(0)
  })
})
