// Logique pure d'une partie : construction du questionnaire, résolution d'une
// manche (auto-match + rattrapage), et calcul du score final.
// Ces fonctions ne dépendent PAS de Firebase pour rester testables.

import { isMatch, isPartialMatch } from './matching.js'

/** Nombre de questions posées à chaque partie (fixe). */
export const QUESTIONS_PER_GAME = 7

/** Mode trio (3 joueurs) : 9 questions, 3 par joueur (chacun est « cible » 3 fois). */
export const TRIO_QUESTIONS = 9

/**
 * Nombre de manches « dirigées » (pack Portrait) par partie en couple et en
 * équipes : une cible répond en privé, son binôme/coéquipier devine — voir
 * `buildDirectedRounds`. Toujours incluses, indépendamment des packs choisis
 * par l'hôte (docs/redaction-questions.md §10).
 */
export const DIRECTED_ROUNDS = 2

/** Mode équipes : nombre de manches communes (packs), perso et dirigées. */
export const TEAMS_STANDARD_ROUNDS = 3
export const TEAMS_CUSTOM_ROUNDS = 2

/** Points d'une question personnalisée réussie (mode équipes). */
export const CUSTOM_POINTS = 5

/** Points d'un accord partiel (« qui de nous deux » : aucun des deux / tous les deux). */
export const PARTIAL_POINTS = 1

/** Renvoie l'id de l'équipe adverse. */
export function opponentTeam(id) {
  return id === 'A' ? 'B' : 'A'
}

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
 * Public visé par une question. Trois valeurs possibles pour `audience` :
 *  - absent : question réservée au **couple** (par défaut) ;
 *  - `'all'` : universelle, jouable en couple **et** entre amis ;
 *  - `'amis'` : réservée au mode **entre amis** (ex. versions « groupe » des
 *    packs Souvenirs/Complicité, qui n'ont pas de sens pour un duo).
 * Filtrage :
 *  - mode 'couple' : tout sauf les questions `'amis'` ;
 *  - mode 'amis' : les questions `'all'` et `'amis'`.
 * @param {{audience?: string}} question
 * @param {'couple'|'amis'} audience
 * @returns {boolean}
 */
export function questionAllowed(question, audience) {
  const a = question?.audience
  if (audience === 'amis') return a === 'all' || a === 'amis'
  return a !== 'amis'
}

/**
 * Construit la liste de questions d'une partie à partir des packs choisis.
 * Chaque question reçoit un id unique préfixé par son pack.
 * @param {string[]} selectedPackIds
 * @param {number} count
 * @param {Record<string, {questions: any[]}>} packsById
 * @param {() => number} [rng]
 * @param {'couple'|'amis'} [audience]  filtre le public (défaut : couple = tout)
 * @returns {any[]}
 */
export function buildQuestions(selectedPackIds, count, packsById, rng = Math.random, audience = 'couple') {
  const pool = []
  for (const pid of selectedPackIds || []) {
    const pack = packsById[pid]
    if (!pack) continue
    for (const q of pack.questions) {
      if (!questionAllowed(q, audience)) continue
      pool.push({ ...q, packId: pid, id: `${pid}:${q.id}` })
    }
  }
  const shuffled = shuffle(pool, rng)
  const n = Math.max(0, Math.min(count, shuffled.length))
  return shuffled.slice(0, n)
}

/**
 * Construit les manches « dirigées » (pack Portrait) : pour chaque équipe
 * (au sens `gameTeams` — le duo en couple, A/B en équipes), une manche
 * désigne UN de ses membres comme cible (qui répondra en privé, vraiment
 * pour lui-même) et l'autre comme devineur. La rotation (`k % 2`) répartit
 * équitablement qui est cible d'une manche dirigée à l'autre.
 *
 * Contrairement au mode trio, il n'y a qu'un seul devineur par équipe : pas
 * de consensus à atteindre, le match se fait directement entre la réponse
 * réelle de la cible et la devinette (voir `submitAnswer` / `computeResults`).
 * @param {{id:string, questions:any[]}} portraitPack
 * @param {{id:string, uids:string[]}[]} teams
 * @param {number} [count]
 * @param {() => number} [rng]
 * @returns {{kind:'directed', q:any, targets:Record<string,string>}[]}
 */
export function buildDirectedRounds(portraitPack, teams, count = DIRECTED_ROUNDS, rng = Math.random) {
  const pool = (portraitPack?.questions || []).map((q) => ({
    ...q, packId: portraitPack.id, id: `${portraitPack.id}:${q.id}`,
  }))
  const shuffled = shuffle(pool, rng)
  const n = Math.max(0, Math.min(count, shuffled.length))
  return shuffled.slice(0, n).map((q, k) => ({
    kind: 'directed',
    q,
    targets: Object.fromEntries(
      (teams || []).map((t) => [t.id, t.uids[k % Math.max(1, t.uids.length)] ?? null]),
    ),
  }))
}

/**
 * Construit la séquence de 7 manches du mode couple : manches standard
 * (packs choisis) + manches dirigées (pack Portrait, toujours incluses).
 * @param {string[]} packs
 * @param {Record<string, {questions:any[]}>} packsById
 * @param {{id:string, questions:any[]}} portraitPack
 * @param {{id:string, uids:string[]}[]} teams  une seule équipe (le duo)
 * @param {() => number} [rng]
 * @param {'couple'|'amis'} [audience]
 */
export function buildCoupleSequence(packs, packsById, portraitPack, teams, rng = Math.random, audience = 'couple') {
  const standardCount = QUESTIONS_PER_GAME - DIRECTED_ROUNDS
  const std = buildQuestions(packs, standardCount, packsById, rng, audience).map((q) => ({ kind: 'standard', q }))
  const directed = buildDirectedRounds(portraitPack, teams, DIRECTED_ROUNDS, rng)
  return shuffle([...std, ...directed], rng)
}

/**
 * Construit la séquence de 7 manches du mode équipes : manches communes
 * (packs) + manches personnalisées (5 pts) + manches dirigées (Portrait).
 * Chaque manche perso contient une question par équipe (rédigée par
 * l'équipe adverse) ; chaque manche dirigée désigne un membre de chaque
 * équipe comme cible, son coéquipier devine.
 * @param {string[]} packs
 * @param {Record<string, {questions:any[]}>} packsById
 * @param {Record<string,string>} customPrompts  question écrite par chaque uid
 * @param {{id:string, uids:string[]}[]} teams
 * @param {{id:string, questions:any[]}} portraitPack
 * @param {() => number} [rng]
 */
export function buildTeamsSequence(packs, packsById, customPrompts, teams, portraitPack, rng = Math.random, audience = 'couple') {
  const std = buildQuestions(packs, TEAMS_STANDARD_ROUNDS, packsById, rng, audience).map((q) => ({ kind: 'standard', q }))
  const teamA = teams.find((t) => t.id === 'A') || { uids: [] }
  const teamB = teams.find((t) => t.id === 'B') || { uids: [] }
  // Les questions écrites par l'équipe A visent l'équipe B, et inversement.
  const promptsFor = (uids) => uids.map((u) => ({ text: (customPrompts?.[u] || '').trim(), author: u }))
  const forB = promptsFor(teamA.uids) // écrites par A → slot B
  const forA = promptsFor(teamB.uids) // écrites par B → slot A
  const custom = [0, 1].map((k) => ({
    kind: 'custom',
    slots: {
      A: { text: forA[k]?.text || '', author: forA[k]?.author || null, target: 'A' },
      B: { text: forB[k]?.text || '', author: forB[k]?.author || null, target: 'B' },
    },
  }))
  const directed = buildDirectedRounds(portraitPack, teams, DIRECTED_ROUNDS, rng)
  return shuffle([...std, ...custom, ...directed], rng)
}

/**
 * Les deux joueurs qui doivent deviner la réponse de la cible (mode trio).
 * @param {string[]} uids  les 3 joueurs
 * @param {string} target  la cible (le joueur dont on devine la réponse)
 * @returns {string[]}  les 2 autres joueurs
 */
export function trioGuessers(uids, target) {
  return (uids || []).filter((u) => u !== target)
}

/**
 * Construit la séquence de 9 manches du mode trio : chaque joueur est la
 * « cible » de 3 questions (il y répond seul en phase 1), les deux autres
 * devineront sa réponse en phase 2.
 * @param {string[]} packs
 * @param {Record<string, {questions:any[]}>} packsById
 * @param {string[]} uids  les 3 joueurs
 * @param {() => number} [rng]
 * @returns {{kind:'trio', q:any, target:string}[]}
 */
export function buildTrioSequence(packs, packsById, uids, rng = Math.random, audience = 'couple') {
  const qs = buildQuestions(packs, TRIO_QUESTIONS, packsById, rng, audience)
  // 3 questions par joueur : on répartit les cibles puis on mélange l'ordre.
  const targets = []
  for (const u of uids || []) {
    for (let k = 0; k < 3; k++) targets.push(u)
  }
  const shuffledTargets = shuffle(targets, rng)
  const rounds = qs.map((q, i) => ({ kind: 'trio', q, target: shuffledTargets[i % shuffledTargets.length] }))
  return shuffle(rounds, rng)
}

/**
 * Consensus des deux devineurs (mode trio) : la réponse commune n'est
 * validée que lorsque les deux ont soumis ET que leurs réponses coïncident.
 * @param {{type: string}} question
 * @param {Record<string, {value:any, submitted?:boolean}>} guesses
 * @param {string[]} guesserUids  les 2 devineurs
 * @returns {{reached: boolean, value: any}}
 */
export function computeTrioConsensus(question, guesses, guesserUids) {
  if (!guesses || !guesserUids || guesserUids.length < 2) return { reached: false, value: null }
  const [g1, g2] = guesserUids
  const a = guesses[g1]
  const b = guesses[g2]
  if (!a?.submitted || !b?.submitted) return { reached: false, value: null }
  if (!isMatch(question, a.value, b.value)) return { reached: false, value: null }
  return { reached: true, value: a.value }
}

/**
 * Équipe qui répond à un slot d'une manche perso : la cible, ou l'adversaire
 * si la question a été retournée. Renvoie null tant que la décision n'est pas prise.
 * @param {{returned?: boolean|null}} slotState  état du slot dans la manche
 * @param {string} targetId  équipe cible du slot ('A' ou 'B')
 * @returns {string|null}
 */
export function slotResponder(slotState, targetId) {
  if (!slotState || slotState.returned == null) return null
  return slotState.returned ? opponentTeam(targetId) : targetId
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
 * 2 joueurs = couple, 3 = trio, 4 = équipes.
 * @param {any} game
 * @returns {'couple'|'trio'|'teams'}
 */
export function gameMode(game) {
  if (game?.config?.mode) return game.config.mode
  const n = orderedUids(game).length
  if (n === 3) return 'trio'
  return n > 3 ? 'teams' : 'couple'
}

/**
 * Équipes de la partie (logique pure, sans métadonnées d'affichage).
 * - mode couple : une seule équipe implicite `duo` = les deux joueurs.
 * - mode trio : une seule équipe implicite `trio` = les trois joueurs (score commun).
 * - mode équipes : deux équipes `A` et `B`, chacune = joueurs ayant choisi ce camp.
 * @param {any} game
 * @returns {{id: string, uids: string[]}[]}
 */
export function gameTeams(game) {
  const players = game?.players || {}
  const uids = orderedUids(game)
  const mode = gameMode(game)
  if (mode === 'teams') {
    return ['A', 'B'].map((id) => ({
      id,
      uids: uids.filter((u) => players[u].team === id),
    }))
  }
  if (mode === 'trio') {
    return [{ id: 'trio', uids }]
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
 * Correspondance partielle d'une paire (« qui de nous deux » : un « aucun
 * des deux » et un « tous les deux » — ça revient plus ou moins au même).
 * @param {{type: string}} question
 * @param {Record<string, {value: any}>} answers  indexé par uid
 * @param {string[]} uids  les deux membres d'une équipe
 * @returns {boolean}
 */
export function computePartialMatch(question, answers, uids) {
  if (!question || !answers || !uids || uids.length < 2) return false
  const [a, b] = uids
  return isPartialMatch(question, answers[a]?.value, answers[b]?.value)
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
 * Vrai si une manche « qui de nous deux » rapporte un accord partiel à une
 * équipe (1 point) : un membre a répondu « aucun des deux », un autre
 * « tous les deux ». Ne s'applique que si l'équipe n'a pas déjà l'accord
 * complet.
 * @param {{teamPartial?: Record<string, boolean>}} round
 * @param {{id: string, uids: string[]}} team
 * @returns {boolean}
 */
export function isTeamPartial(round, team) {
  if (!round || !team) return false
  return round.teamPartial?.[team.id] === true
}

/**
 * Nombre de points rapportés par une bonne réponse à cette question.
 * Les questions texte (plus difficiles à deviner) valent plus que les
 * questions à choix (mcq / who).
 * @param {{type: string}} question
 * @returns {number}
 */
export function pointsForQuestion(question) {
  return question?.type === 'text' ? 5 : 2
}

/**
 * Calcule le résultat complet d'une partie, par équipe.
 * @param {any} game document de partie
 * @returns {{mode: string, total: number, maxPoints: number, teams: any[], winnerTeamId: string|null, details: any[]}}
 */
export function computeResults(game) {
  const teams = gameTeams(game)
  const descs = game?.questions || []
  const rounds = game?.rounds || {}
  const agg = teams.map((t) => ({ ...t, points: 0, matchCount: 0 }))
  const idxOf = Object.fromEntries(agg.map((t, i) => [t.id, i]))
  let maxPoints = 0

  const details = descs.map((desc, i) => {
    const round = rounds[String(i)] || {}

    if (desc.kind === 'custom') {
      const slots = {}
      for (const key of ['A', 'B']) {
        const s = round.slots?.[key] || {}
        const responder = slotResponder(s, key)
        const matched = s.matched === true
        const earned = matched && responder ? CUSTOM_POINTS : 0
        if (earned && idxOf[responder] != null) {
          agg[idxOf[responder]].points += CUSTOM_POINTS
          agg[idxOf[responder]].matchCount += 1
        }
        slots[key] = { desc: desc.slots[key], target: key, returned: s.returned ?? null, responder, matched, answers: s.answers || {}, points: earned }
      }
      return { index: i, kind: 'custom', slots }
    }

    if (desc.kind === 'trio') {
      const q = desc.q
      const qp = pointsForQuestion(q)
      maxPoints += qp
      const ti = idxOf.trio
      const guessers = trioGuessers(orderedUids(game), desc.target)
      const consensus = computeTrioConsensus(q, round.guesses || {}, guessers)
      const targetValue = round.targetAnswer?.value
      const matched = consensus.reached && isMatch(q, consensus.value, targetValue)
      if (matched && ti != null) {
        agg[ti].points += qp
        agg[ti].matchCount += 1
      }
      return {
        index: i, kind: 'trio', question: q, target: desc.target,
        targetValue, consensus: consensus.reached ? consensus.value : null,
        guesses: round.guesses || {}, guessers, matched, points: matched ? qp : 0,
      }
    }

    if (desc.kind === 'directed') {
      const q = desc.q
      const qp = pointsForQuestion(q)
      maxPoints += qp
      const perTeam = {}
      teams.forEach((team) => {
        const targetUid = desc.targets?.[team.id]
        const guesserUid = team.uids.find((u) => u !== targetUid)
        const targetValue = round.answers?.[targetUid]?.value
        const guessValue = round.guesses?.[guesserUid]?.value
        const matched = targetValue !== undefined && guessValue !== undefined && isMatch(q, targetValue, guessValue)
        perTeam[team.id] = { target: targetUid, guesser: guesserUid, targetValue, guessValue, matched, points: matched ? qp : 0 }
        if (matched) {
          const ti = idxOf[team.id]
          if (ti != null) {
            agg[ti].points += qp
            agg[ti].matchCount += 1
          }
        }
      })
      return { index: i, kind: 'directed', question: q, targets: desc.targets, perTeam }
    }

    // Manche standard (packs)
    const q = desc.q
    const qp = pointsForQuestion(q)
    maxPoints += qp
    const perTeam = {}
    teams.forEach((team, ti) => {
      const counted = isTeamCounted(round, q, team)
      const partial = !counted && isTeamPartial(round, team)
      const pts = counted ? qp : (partial ? PARTIAL_POINTS : 0)
      perTeam[team.id] = { counted, partial, points: pts }
      if (counted) {
        agg[ti].points += qp
        agg[ti].matchCount += 1
      } else if (partial) {
        agg[ti].points += PARTIAL_POINTS
      }
    })
    return { index: i, kind: 'standard', question: q, answers: round.answers || {}, perTeam }
  })

  const total = descs.length
  const mode = gameMode(game)
  let winnerTeamId = null
  if (mode === 'teams' && agg.length === 2) {
    if (agg[0].points > agg[1].points) winnerTeamId = agg[0].id
    else if (agg[1].points > agg[0].points) winnerTeamId = agg[1].id
  }
  return { mode, total, maxPoints, teams: agg, winnerTeamId, details }
}
