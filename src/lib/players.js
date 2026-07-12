// Petits utilitaires liés aux joueurs et aux options d'affichage.

import { orderedUids, gameTeams, gameMode } from './gameLogic.js'

/** Vrai si la partie est (ou sera) en mode trio (3 joueurs). */
function isTrio(game) {
  return gameMode(game) === 'trio'
}

/** Métadonnées d'affichage des équipes (mode 4 joueurs). */
export const TEAM_META = {
  A: { name: 'Équipe A', color: '#ff5e8a' },
  B: { name: 'Équipe B', color: '#a678ff' },
  duo: { name: 'Vous deux', color: '#ff5e8a' },
  trio: { name: 'Le trio', color: '#ff5e8a' },
}

/** Liste des uid des joueurs (ordre d'arrivée). */
export function playerUids(game) {
  return orderedUids(game)
}

/** uid de l'autre joueur (mode couple). */
export function otherUid(game, uid) {
  return playerUids(game).find((u) => u !== uid) || null
}

/** Nom d'un joueur (avec repli). */
export function playerName(game, uid) {
  return game?.players?.[uid]?.name || 'Joueur'
}

/** Vrai si la partie est (ou sera) en mode équipes (4 joueurs). */
export function isTeamsMode(game) {
  return gameMode(game) === 'teams'
}

/** Équipes décorées avec nom/couleur pour l'affichage. */
export function teamsOf(game) {
  return gameTeams(game).map((t) => ({ ...t, ...(TEAM_META[t.id] || TEAM_META.duo) }))
}

/** Équipe (décorée) à laquelle appartient un joueur, ou null. */
export function teamOfPlayer(game, uid) {
  return teamsOf(game).find((t) => t.uids.includes(uid)) || null
}

/**
 * Options d'une question à choix. Pour le type `who`, les options sont les
 * deux membres de l'équipe qui répond (+ « Les deux » / « Aucun »), afin que
 * chaque duo se pose la question sur lui-même. `teamUids` = l'équipe du
 * joueur qui répond ; à défaut on retombe sur tous les joueurs (mode couple).
 */
export function optionsFor(question, game, teamUids) {
  if (question?.type === 'who') {
    // En trio, la question porte sur les 3 joueurs et se répond en sélection
    // multiple : on choisit un ou plusieurs joueurs, ou « Aucun des trois »
    // (pas de raccourci « Les trois » : on coche simplement les 3).
    if (isTrio(game)) {
      return [
        ...playerUids(game).map((u) => ({ id: u, label: playerName(game, u) })),
        { id: 'neither', label: 'Aucun des trois' },
      ]
    }
    const uids = teamUids && teamUids.length ? teamUids : playerUids(game)
    return [
      ...uids.map((u) => ({ id: u, label: playerName(game, u) })),
      { id: 'both', label: 'Les deux' },
      { id: 'neither', label: 'Aucun des deux' },
    ]
  }
  return question?.options || []
}

/**
 * Applique un clic sur une option « qui de nous trois » (sélection multiple).
 * « Aucun des trois » (neither) est exclusif : le cocher vide les autres, et
 * cocher un joueur retire « Aucun ».
 * @param {string[]} picks  sélection courante (uids et/ou 'neither')
 * @param {string} id  option cliquée
 * @returns {string[]}
 */
export function toggleWhoPick(picks, id) {
  const current = picks || []
  if (id === 'neither') {
    return current.includes('neither') ? [] : ['neither']
  }
  const base = current.filter((p) => p !== 'neither')
  return base.includes(id) ? base.filter((p) => p !== id) : [...base, id]
}

/** Convertit une sélection (uids et/ou 'neither') en valeur stockable. */
export function whoPicksToValue(picks) {
  const current = picks || []
  if (current.includes('neither')) return 'neither'
  return [...current]
}

/** Convertit une valeur stockée en sélection UI (tableau d'ids). */
export function whoValueToPicks(value) {
  if (value == null) return []
  if (value === 'neither') return ['neither']
  return Array.isArray(value) ? [...value] : [value]
}

/** Libellé lisible d'une valeur de réponse pour une question donnée. */
export function labelForValue(question, game, value) {
  if (value == null || value === '') return '—'
  if (question?.type === 'text') return String(value)
  if (question?.type === 'who') {
    if (isTrio(game)) {
      if (value === 'neither') return 'Aucun des trois'
      const arr = Array.isArray(value) ? value : [value]
      if (arr.length === 0) return 'Aucun des trois'
      return arr.map((u) => playerName(game, u)).join(', ')
    }
    if (value === 'both') return 'Les deux'
    if (value === 'neither') return 'Aucun des deux'
    return playerName(game, value)
  }
  const opt = (question?.options || []).find((o) => o.id === value)
  return opt ? opt.label : String(value)
}
