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
 * Calcule le résultat complet d'une partie (score, %, détail par question).
 * @param {any} game document de partie
 * @returns {{matchCount: number, total: number, pct: number, details: any[]}}
 */
export function computeResults(game) {
  const playerUids = Object.keys(game?.players || {})
  const questions = game?.questions || []
  const rounds = game?.rounds || {}
  let matchCount = 0
  const details = questions.map((q, i) => {
    const round = rounds[String(i)] || {}
    const counted = isRoundCounted(round, q, playerUids)
    if (counted) matchCount++
    return {
      index: i,
      question: q,
      answers: round.answers || {},
      autoMatch: round.autoMatch ?? null,
      counted,
    }
  })
  const total = questions.length
  const pct = total ? Math.round((matchCount / total) * 100) : 0
  return { matchCount, total, pct, details }
}

/**
 * Message de compatibilité fun en fonction du pourcentage.
 * @param {number} pct
 * @returns {{emoji: string, title: string, text: string}}
 */
export function compatibilityMessage(pct) {
  if (pct >= 90) {
    return { emoji: '🔥', title: 'Fusionnels', text: 'Vous pensez pratiquement dans la même tête. Impressionnant !' }
  }
  if (pct >= 70) {
    return { emoji: '💞', title: 'Grande complicité', text: 'Vous vous connaissez vraiment bien. Belle équipe !' }
  }
  if (pct >= 50) {
    return { emoji: '😊', title: 'Sur la même longueur d’onde', text: 'Une belle harmonie, avec encore de jolies choses à découvrir.' }
  }
  if (pct >= 30) {
    return { emoji: '🤔', title: 'À explorer', text: 'Quelques surprises ! De belles discussions en perspective.' }
  }
  return { emoji: '🌱', title: 'Tout à découvrir', text: 'Vous avez plein de choses à apprendre l’un de l’autre. C’est excitant !' }
}
