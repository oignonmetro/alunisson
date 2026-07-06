import { describe, it, expect } from 'vitest'
import {
  buildQuestions,
  computeAutoMatch,
  allAnswered,
  isTeamCounted,
  pointsForQuestion,
  gameTeams,
  gameMode,
  computeResults,
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
  it('vrai seulement quand tous ont soumis', () => {
    const uids = ['A', 'B', 'C', 'D']
    expect(allAnswered({ answers: { A: { submitted: true }, B: { submitted: true } } }, uids)).toBe(false)
    expect(allAnswered({ answers: Object.fromEntries(uids.map((u) => [u, { submitted: true }])) }, uids)).toBe(true)
  })
})

describe('gameMode / gameTeams', () => {
  it('déduit le mode couple à 2 joueurs', () => {
    const game = { players: { A: { joinedAt: 1 }, B: { joinedAt: 2 } } }
    expect(gameMode(game)).toBe('couple')
    expect(gameTeams(game)).toEqual([{ id: 'duo', uids: ['A', 'B'] }])
  })
  it('déduit le mode équipes à 4 joueurs et regroupe par camp', () => {
    const game = {
      players: {
        A: { joinedAt: 1, team: 'A' }, B: { joinedAt: 2, team: 'B' },
        C: { joinedAt: 3, team: 'A' }, D: { joinedAt: 4, team: 'B' },
      },
    }
    expect(gameMode(game)).toBe('teams')
    expect(gameTeams(game)).toEqual([
      { id: 'A', uids: ['A', 'C'] },
      { id: 'B', uids: ['B', 'D'] },
    ])
  })
  it('respecte config.mode s’il est présent', () => {
    const game = { config: { mode: 'couple' }, players: { A: { joinedAt: 1 }, B: { joinedAt: 2 } } }
    expect(gameMode(game)).toBe('couple')
  })
})

describe('isTeamCounted', () => {
  const team = { id: 'A', uids: ['A1', 'A2'] }
  it('compte si l’équipe a matché automatiquement', () => {
    expect(isTeamCounted({ teamMatch: { A: true } }, { type: 'mcq' }, team)).toBe(true)
  })
  it('ne compte pas un mcq raté même avec overrides', () => {
    const round = { teamMatch: { A: false }, overrides: { A1: true, A2: true } }
    expect(isTeamCounted(round, { type: 'mcq' }, team)).toBe(false)
  })
  it('compte un texte raté si les deux membres valident le rattrapage', () => {
    const round = { teamMatch: { A: false }, overrides: { A1: true, A2: true } }
    expect(isTeamCounted(round, { type: 'text' }, team)).toBe(true)
  })
  it('ne compte pas si un seul membre valide le rattrapage', () => {
    const round = { teamMatch: { A: false }, overrides: { A1: true } }
    expect(isTeamCounted(round, { type: 'text' }, team)).toBe(false)
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

describe('computeResults — couple', () => {
  it('agrège le score de l’unique duo selon le barème par type', () => {
    const game = {
      players: { A: { joinedAt: 1 }, B: { joinedAt: 2 } },
      questions: [
        { id: 'p1:q1', type: 'text' }, // matché : +3
        { id: 'p2:q1', type: 'mcq' }, // raté : +0
        { id: 'p1:q2', type: 'text' }, // matché via rattrapage : +3
      ],
      rounds: {
        0: { teamMatch: { duo: true } },
        1: { teamMatch: { duo: false } },
        2: { teamMatch: { duo: false }, overrides: { A: true, B: true } },
      },
    }
    const res = computeResults(game)
    expect(res.mode).toBe('couple')
    expect(res.total).toBe(3)
    expect(res.maxPoints).toBe(8) // 3 + 2 + 3
    expect(res.teams).toHaveLength(1)
    expect(res.teams[0].points).toBe(6) // 3 + 0 + 3
    expect(res.teams[0].matchCount).toBe(2)
    expect(res.winnerTeamId).toBe(null)
  })
})

describe('computeResults — teams', () => {
  const game = {
    players: {
      A: { joinedAt: 1, team: 'A' }, C: { joinedAt: 3, team: 'A' },
      B: { joinedAt: 2, team: 'B' }, D: { joinedAt: 4, team: 'B' },
    },
    questions: [
      { id: 'p2:q1', type: 'mcq' }, // A matché (+2), B non
      { id: 'p1:q1', type: 'text' }, // B matché (+3), A non
    ],
    rounds: {
      0: { teamMatch: { A: true, B: false } },
      1: { teamMatch: { A: false, B: true } },
    },
  }
  it('calcule les scores par équipe et désigne le vainqueur', () => {
    const res = computeResults(game)
    expect(res.mode).toBe('teams')
    expect(res.teams).toHaveLength(2)
    const a = res.teams.find((t) => t.id === 'A')
    const b = res.teams.find((t) => t.id === 'B')
    expect(a.points).toBe(2)
    expect(b.points).toBe(3)
    expect(res.winnerTeamId).toBe('B')
    expect(res.details[0].perTeam.A.counted).toBe(true)
    expect(res.details[0].perTeam.B.counted).toBe(false)
  })
})

describe('computeResults — partie vide', () => {
  it('ne plante pas', () => {
    const res = computeResults({})
    expect(res.total).toBe(0)
    expect(res.maxPoints).toBe(0)
    expect(res.mode).toBe('couple')
    expect(res.teams).toHaveLength(1)
  })
})
