// Logique pure d'une partie : construction du questionnaire, résolution d'une
// manche (auto-match + rattrapage), et calcul du score final.
// Ces fonctions ne dépendent PAS de Firebase pour rester testables.

import { isMatch } from './matching.js'

/** Nombre de questions posées à chaque partie (fixe). */
export const QUESTIONS_PER_GAME = 7

/**
 * Mélange (Fisher-Yates) une copie du tableau. `rng` injectable pour les tests.
 * @template T
 * @param {T[]} arr
 * @param {() => number} [rng]
 * @returns {T[]}
 */
export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Construit la liste de questions d'une partie à partir des packs choisis.
 * Chaque question reçoit un id unique préfixé par son pack.
 * @param {string[]} selectedPackIds
 * @param {number} count
 * @param {Record<string, {questions: any[]}>} packsById
 * @param {() => number} [rng]
 * @returns {any[]}
 */
export function buildQuestions(selectedPackIds, count, packsById, rng = Math.random) {
  const pool = []
  for (const pid of selectedPackIds || []) {
    const pack = packsById[pid]
    if (!pack) continue
    for (const q of pack.questions) {
      pool.push({ ...q, packId: pid, id: `${pid}:${q.id}` })
    }
  }
  const shuffled = shuffle(pool, rng)
  const n = Math.max(0, Math.min(count, shuffled.length))
  return shuffled.slice(0, n)
}

/**
 * Ordonne les uid des joueurs par ordre d'arrivée.
 * @param {any} game
 * @returns {string[]}
 */
export function orderedUids(game) {
  const players = game?.players || {}
  return Object.keys(players).sort(
    (a, b) => (players[a].joinedAt || 0) - (players[b].joinedAt || 0),
  )
}

/**
 * Mode de la partie déduit de sa configuration ou du nombre de joueurs.
 * @param {any} game
 * @returns {'couple'|'teams'}
 */
export function gameMode(game) {
  if (game?.config?.mode) return game.config.mode
  return orderedUids(game).length > 2 ? 'teams' : 'couple'
}

/**
 * Équipes de la partie (logique pure, sans métadonnées d'affichage).
 * - mode couple : une seule équipe implicite `duo` = les deux joueurs.
 * - mode équipes : deux équipes `A` et `B`, chacune = joueurs ayant choisi ce camp.
 * @param {any} game
 * @returns {{id: string, uids: string[]}[]}
 */
export function gameTeams(game) {
  const players = game?.players || {}
  const uids = orderedUids(game)
  if (gameMode(game) === 'teams') {
    return ['A', 'B'].map((id) => ({
      id,
      uids: uids.filter((u) => players[u].team === id),
    }))
  }
  return [{ id: 'duo', uids }]
}

/**
 * Correspondance automatique d'une paire (les 2 premiers uid donnés).
 * @param {{type: string}} question
 * @param {Record<string, {value: any}>} answers  indexé par uid
 * @param {string[]} uids  les deux membres d'une équipe
 * @returns {boolean}
 */
export function computeAutoMatch(question, answers, uids) {
  if (!question || !answers || !uids || uids.length < 2) return false
  const [a, b] = uids
  return isMatch(question, answers[a]?.value, answers[b]?.value)
}

/**
 * Vrai si tous les joueurs ont soumis leur réponse pour cette manche.
 * @param {{answers?: Record<string, {submitted?: boolean}>}} round
 * @param {string[]} playerUids
 * @returns {boolean}
 */
export function allAnswered(round, playerUids) {
  if (!round || !round.answers) return false
  return playerUids.every((uid) => round.answers[uid]?.submitted === true)
}

/**
 * Détermine si une manche rapporte un point à une équipe :
 *  - correspondance automatique de l'équipe, OU
 *  - rattrapage (questions texte) validé par LES DEUX membres de l'équipe.
 * @param {{teamMatch?: Record<string, boolean>, overrides?: Record<string, boolean>}} round
 * @param {{type: string}} question
 * @param {{id: string, uids: string[]}} team
 * @returns {boolean}
 */
export function isTeamCounted(round, question, team) {
  if (!round || !team) return false
  if (round.teamMatch?.[team.id] === true) return true
  if (question?.type === 'text' && round.overrides && team.uids.length >= 2) {
    return team.uids.every((uid) => round.overrides[uid] === true)
  }
  return false
}

/**
 * Nombre de points rapportés par une bonne réponse à cette question.
 * Les questions texte (plus difficiles à deviner) valent plus que les
 * questions à choix (mcq / who).
 * @param {{type: string}} question
 * @returns {number}
 */
export function pointsForQuestion(question) {
  return question?.type === 'text' ? 3 : 2
}

/**
 * Calcule le résultat complet d'une partie, par équipe.
 * @param {any} game document de partie
 * @returns {{mode: string, total: number, maxPoints: number, teams: any[], winnerTeamId: string|null, details: any[]}}
 */
export function computeResults(game) {
  const teams = gameTeams(game)
  const questions = game?.questions || []
  const rounds = game?.rounds || {}
  const agg = teams.map((t) => ({ ...t, points: 0, matchCount: 0 }))
  let maxPoints = 0

  const details = questions.map((q, i) => {
    const round = rounds[String(i)] || {}
    const qp = pointsForQuestion(q)
    maxPoints += qp
    const perTeam = {}
    teams.forEach((team, ti) => {
      const counted = isTeamCounted(round, q, team)
      perTeam[team.id] = { counted, points: counted ? qp : 0 }
      if (counted) {
        agg[ti].points += qp
        agg[ti].matchCount += 1
      }
    })
    return { index: i, question: q, answers: round.answers || {}, perTeam }
  })

  const total = questions.length
  const mode = gameMode(game)
  let winnerTeamId = null
  if (mode === 'teams' && agg.length === 2) {
    if (agg[0].points > agg[1].points) winnerTeamId = agg[0].id
    else if (agg[1].points > agg[0].points) winnerTeamId = agg[1].id
  }
  return { mode, total, maxPoints, teams: agg, winnerTeamId, details }
}
