// Logique pure d'une partie : construction du questionnaire, résolution d'une
// manche (auto-match + rattrapage), et calcul du score final.
// Ces fonctions ne dépendent PAS de Firebase pour rester testables.

import { isMatch } from './matching.js'

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
 * Calcule la correspondance automatique d'une manche (avant rattrapage).
 * @param {{type: string}} question
 * @param {Record<string, {value: any}>} answers  indexé par uid
 * @param {string[]} playerUids
 * @returns {boolean}
 */
export function computeAutoMatch(question, answers, playerUids) {
  if (!question || !answers || !playerUids || playerUids.length < 2) return false
  const [a, b] = playerUids
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
 * Détermine si une manche rapporte un point au duo :
 *  - correspondance automatique, OU
 *  - rattrapage (questions texte uniquement) validé par LES DEUX joueurs.
 * @param {{autoMatch?: boolean, overrides?: Record<string, boolean>}} round
 * @param {{type: string}} question
 * @param {string[]} playerUids
 * @returns {boolean}
 */
export function isRoundCounted(round, question, playerUids) {
  if (!round) return false
  if (round.autoMatch === true) return true
  if (question?.type === 'text' && round.overrides && playerUids.length >= 2) {
    return playerUids.every((uid) => round.overrides[uid] === true)
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
 * Calcule le résultat complet d'une partie (score en points, %, détail par question).
 * @param {any} game document de partie
 * @returns {{matchCount: number, total: number, points: number, maxPoints: number, pct: number, details: any[]}}
 */
export function computeResults(game) {
  const playerUids = Object.keys(game?.players || {})
  const questions = game?.questions || []
  const rounds = game?.rounds || {}
  let matchCount = 0
  let points = 0
  let maxPoints = 0
  const details = questions.map((q, i) => {
    const round = rounds[String(i)] || {}
    const counted = isRoundCounted(round, q, playerUids)
    const questionPoints = pointsForQuestion(q)
    maxPoints += questionPoints
    if (counted) {
      matchCount++
      points += questionPoints
    }
    return {
      index: i,
      question: q,
      answers: round.answers || {},
      autoMatch: round.autoMatch ?? null,
      counted,
      points: questionPoints,
    }
  })
  const total = questions.length
  const pct = maxPoints ? Math.round((points / maxPoints) * 100) : 0
  return { matchCount, total, points, maxPoints, pct, details }
}
