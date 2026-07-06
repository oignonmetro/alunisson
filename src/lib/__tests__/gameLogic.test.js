import { describe, it, expect } from 'vitest'
import {
  buildQuestions,
  computeAutoMatch,
  allAnswered,
  isRoundCounted,
  pointsForQuestion,
  computeResults,
  compatibilityMessage,
} from '../gameLogic.js'

const packsById = {
  p1: { questions: [ { id: 'q1', type: 'text', text: 'A' }, { id: 'q2', type: 'text', text: 'B' } ] },
  p2: { questions: [ { id: 'q1', type: 'mcq', text: 'C', options: [] }, { id: 'q3', type: 'text', text: 'D' } ] },
}

describe('buildQuestions', () => {
  it('tire le bon nombre de questions, préfixées par pack, sans doublon', () => {
    const qs = buildQuestions(['p1', 'p2'], 3, packsById, () => 0.42)
    expect(qs).toHaveLength(3)
    const ids = qs.map((q) => q.id)
    expect(new Set(ids).size).toBe(3) // ids uniques (préfixés pack)
    ids.forEach((id) => expect(id).toMatch(/^p[12]:/))
  })
  it('plafonne au nombre de questions disponibles', () => {
    const qs = buildQuestions(['p1'], 10, packsById)
    expect(qs).toHaveLength(2)
  })
  it('ignore les packs inconnus', () => {
    const qs = buildQuestions(['inconnu'], 5, packsById)
    expect(qs).toHaveLength(0)
  })
})

describe('computeAutoMatch', () => {
  const uids = ['A', 'B']
  it('mcq : vrai si même option', () => {
    const q = { type: 'mcq' }
    expect(computeAutoMatch(q, { A: { value: 'x' }, B: { value: 'x' } }, uids)).toBe(true)
    expect(computeAutoMatch(q, { A: { value: 'x' }, B: { value: 'y' } }, uids)).toBe(false)
  })
  it('text : vrai malgré accents/casse', () => {
    const q = { type: 'text' }
    expect(computeAutoMatch(q, { A: { value: 'Été' }, B: { value: 'ete' } }, uids)).toBe(true)
  })
})

describe('allAnswered', () => {
  it('vrai seulement quand les deux ont soumis', () => {
    const uids = ['A', 'B']
    expect(allAnswered({ answers: { A: { submitted: true } } }, uids)).toBe(false)
    expect(allAnswered({ answers: { A: { submitted: true }, B: { submitted: true } } }, uids)).toBe(true)
  })
})

describe('isRoundCounted', () => {
  const uids = ['A', 'B']
  it('compte si autoMatch', () => {
    expect(isRoundCounted({ autoMatch: true }, { type: 'mcq' }, uids)).toBe(true)
  })
  it('ne compte pas un mcq raté même avec overrides', () => {
    const round = { autoMatch: false, overrides: { A: true, B: true } }
    expect(isRoundCounted(round, { type: 'mcq' }, uids)).toBe(false)
  })
  it('compte un texte raté si les deux valident le rattrapage', () => {
    const round = { autoMatch: false, overrides: { A: true, B: true } }
    expect(isRoundCounted(round, { type: 'text' }, uids)).toBe(true)
  })
  it('ne compte pas si un seul valide le rattrapage', () => {
    const round = { autoMatch: false, overrides: { A: true } }
    expect(isRoundCounted(round, { type: 'text' }, uids)).toBe(false)
  })
})

describe('pointsForQuestion', () => {
  it('les questions texte valent 3 points', () => {
    expect(pointsForQuestion({ type: 'text' })).toBe(3)
  })
  it('mcq et who valent 2 points', () => {
    expect(pointsForQuestion({ type: 'mcq' })).toBe(2)
    expect(pointsForQuestion({ type: 'who' })).toBe(2)
  })
})

describe('computeResults', () => {
  it('agrège le score en points selon le barème par type', () => {
    const game = {
      players: { A: {}, B: {} },
      questions: [
        { id: 'p1:q1', type: 'text' }, // matché : +3
        { id: 'p2:q1', type: 'mcq' }, // raté : +0
        { id: 'p1:q2', type: 'text' }, // matché via rattrapage : +3
      ],
      rounds: {
        0: { autoMatch: true },
        1: { autoMatch: false },
        2: { autoMatch: false, overrides: { A: true, B: true } },
      },
    }
    const res = computeResults(game)
    expect(res.total).toBe(3)
    expect(res.matchCount).toBe(2)
    expect(res.points).toBe(6) // 3 + 0 + 3
    expect(res.maxPoints).toBe(8) // 3 + 2 + 3
    expect(res.pct).toBe(75) // 6/8
    expect(res.details).toHaveLength(3)
    expect(res.details[0].points).toBe(3)
    expect(res.details[1].points).toBe(2)
  })
  it('gère une partie vide sans planter', () => {
    const res = computeResults({})
    expect(res).toEqual({ matchCount: 0, total: 0, points: 0, maxPoints: 0, pct: 0, details: [] })
  })
})

describe('compatibilityMessage', () => {
  it('renvoie un palier cohérent', () => {
    expect(compatibilityMessage(95).title).toBeTruthy()
    expect(compatibilityMessage(0).emoji).toBeTruthy()
  })
})
