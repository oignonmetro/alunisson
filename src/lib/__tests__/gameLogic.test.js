import { describe, it, expect } from 'vitest'
import {
  buildQuestions,
  computeAutoMatch,
  computePartialMatch,
  allAnswered,
  isTeamCounted,
  isTeamPartial,
  pointsForQuestion,
  gameTeams,
  gameMode,
  computeResults,
  buildTeamsSequence,
  slotResponder,
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

describe('computePartialMatch', () => {
  const uids = ['A', 'B']
  const q = { type: 'who' }
  it('vrai si un « aucun des deux » face à un « tous les deux »', () => {
    expect(computePartialMatch(q, { A: { value: 'neither' }, B: { value: 'both' } }, uids)).toBe(true)
    expect(computePartialMatch(q, { A: { value: 'both' }, B: { value: 'neither' } }, uids)).toBe(true)
  })
  it('faux si accord complet ou désaccord classique', () => {
    expect(computePartialMatch(q, { A: { value: 'both' }, B: { value: 'both' } }, uids)).toBe(false)
    expect(computePartialMatch(q, { A: { value: 'A' }, B: { value: 'neither' } }, uids)).toBe(false)
  })
  it('ne s’applique pas aux mcq/text', () => {
    expect(computePartialMatch({ type: 'mcq' }, { A: { value: 'neither' }, B: { value: 'both' } }, uids)).toBe(false)
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

describe('isTeamPartial', () => {
  const team = { id: 'A', uids: ['A1', 'A2'] }
  it('vrai si teamPartial marqué pour l’équipe', () => {
    expect(isTeamPartial({ teamPartial: { A: true } }, team)).toBe(true)
  })
  it('faux sinon', () => {
    expect(isTeamPartial({ teamPartial: { A: false } }, team)).toBe(false)
    expect(isTeamPartial({}, team)).toBe(false)
  })
})

describe('pointsForQuestion', () => {
  it('les questions texte valent 5 points', () => {
    expect(pointsForQuestion({ type: 'text' })).toBe(5)
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
        { kind: 'standard', q: { id: 'p1:q1', type: 'text' } }, // matché : +5
        { kind: 'standard', q: { id: 'p2:q1', type: 'mcq' } }, // raté : +0
        { kind: 'standard', q: { id: 'p1:q2', type: 'text' } }, // rattrapage : +5
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
    expect(res.maxPoints).toBe(12) // 5 + 2 + 5
    expect(res.teams).toHaveLength(1)
    expect(res.teams[0].points).toBe(10) // 5 + 0 + 5
    expect(res.teams[0].matchCount).toBe(2)
    expect(res.winnerTeamId).toBe(null)
  })
})

describe('computeResults — teams (standard)', () => {
  const game = {
    players: {
      A: { joinedAt: 1, team: 'A' }, C: { joinedAt: 3, team: 'A' },
      B: { joinedAt: 2, team: 'B' }, D: { joinedAt: 4, team: 'B' },
    },
    questions: [
      { kind: 'standard', q: { id: 'p2:q1', type: 'mcq' } }, // A +2, B non
      { kind: 'standard', q: { id: 'p1:q1', type: 'text' } }, // B +5, A non
    ],
    rounds: {
      0: { teamMatch: { A: true, B: false } },
      1: { teamMatch: { A: false, B: true } },
    },
  }
  it('calcule les scores par équipe et désigne le vainqueur', () => {
    const res = computeResults(game)
    expect(res.mode).toBe('teams')
    const a = res.teams.find((t) => t.id === 'A')
    const b = res.teams.find((t) => t.id === 'B')
    expect(a.points).toBe(2)
    expect(b.points).toBe(5)
    expect(res.winnerTeamId).toBe('B')
    expect(res.details[0].perTeam.A.counted).toBe(true)
  })
})

describe('slotResponder', () => {
  it('renvoie null tant que non décidé', () => {
    expect(slotResponder({ returned: null }, 'A')).toBe(null)
    expect(slotResponder(undefined, 'A')).toBe(null)
  })
  it('la cible répond si non retournée, l’adversaire si retournée', () => {
    expect(slotResponder({ returned: false }, 'A')).toBe('A')
    expect(slotResponder({ returned: true }, 'A')).toBe('B')
    expect(slotResponder({ returned: true }, 'B')).toBe('A')
  })
})

describe('buildTeamsSequence', () => {
  const bigPack = { big: { questions: Array.from({ length: 10 }, (_, i) => ({ id: 'q' + i, type: 'text', text: 'Q' + i })) } }
  const teams = [{ id: 'A', uids: ['A1', 'A2'] }, { id: 'B', uids: ['B1', 'B2'] }]
  const prompts = { A1: 'qA1', A2: 'qA2', B1: 'qB1', B2: 'qB2' }
  it('produit 5 manches standard + 2 manches perso, questions adverses bien orientées', () => {
    const seq = buildTeamsSequence(['big'], bigPack, prompts, teams, () => 0)
    expect(seq).toHaveLength(7)
    const std = seq.filter((r) => r.kind === 'standard')
    const custom = seq.filter((r) => r.kind === 'custom')
    expect(std).toHaveLength(5)
    expect(custom).toHaveLength(2)
    // slot A (cible A) vient des joueurs de B ; slot B vient des joueurs de A
    expect(custom.map((r) => r.slots.A.text).sort()).toEqual(['qB1', 'qB2'])
    expect(custom.map((r) => r.slots.B.text).sort()).toEqual(['qA1', 'qA2'])
  })
})

describe('computeResults — teams (perso)', () => {
  const base = {
    players: {
      A1: { joinedAt: 1, team: 'A' }, A2: { joinedAt: 3, team: 'A' },
      B1: { joinedAt: 2, team: 'B' }, B2: { joinedAt: 4, team: 'B' },
    },
    questions: [
      { kind: 'custom', slots: { A: { text: 'qB', author: 'B1', target: 'A' }, B: { text: 'qA', author: 'A1', target: 'B' } } },
    ],
  }
  it('la cible qui répond juste marque 5 pts', () => {
    const game = { ...base, rounds: { 0: { kind: 'custom', slots: {
      A: { returned: false, matched: true, answers: { A1: { value: 'x' }, A2: { value: 'x' } } },
      B: { returned: false, matched: false, answers: { B1: { value: 'y' }, B2: { value: 'z' } } },
    } } } }
    const res = computeResults(game)
    expect(res.teams.find((t) => t.id === 'A').points).toBe(5)
    expect(res.teams.find((t) => t.id === 'B').points).toBe(0)
    expect(res.winnerTeamId).toBe('A')
  })
  it('une question retournée et réussie donne 5 pts à l’équipe autrice', () => {
    const game = { ...base, rounds: { 0: { kind: 'custom', slots: {
      A: { returned: true, matched: true, answers: { B1: { value: 'x' }, B2: { value: 'x' } } }, // A a retourné → B répond et gagne
      B: { returned: false, matched: false, answers: {} },
    } } } }
    const res = computeResults(game)
    expect(res.teams.find((t) => t.id === 'B').points).toBe(5)
    expect(res.teams.find((t) => t.id === 'A').points).toBe(0)
  })
})

describe('computeResults — accord partiel (who)', () => {
  it('« aucun des deux » vs « tous les deux » rapporte 1 point sans compter comme accord', () => {
    const game = {
      players: { A: { joinedAt: 1 }, B: { joinedAt: 2 } },
      questions: [
        { kind: 'standard', q: { id: 'p1:q1', type: 'who' } },
      ],
      rounds: {
        0: { teamMatch: { duo: false }, teamPartial: { duo: true } },
      },
    }
    const res = computeResults(game)
    expect(res.teams[0].points).toBe(1)
    expect(res.teams[0].matchCount).toBe(0) // pas un accord complet
    expect(res.details[0].perTeam.duo).toEqual({ counted: false, partial: true, points: 1 })
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
