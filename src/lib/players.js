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
    // En trio, la question porte toujours sur les 3 joueurs (« qui de nous trois »).
    if (isTrio(game)) {
      return [
        ...playerUids(game).map((u) => ({ id: u, label: playerName(game, u) })),
        { id: 'both', label: 'Les trois' },
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

/** Libellé lisible d'une valeur de réponse pour une question donnée. */
export function labelForValue(question, game, value) {
  if (value == null || value === '') return '—'
  if (question?.type === 'text') return String(value)
  if (question?.type === 'who') {
    if (value === 'both') return isTrio(game) ? 'Les trois' : 'Les deux'
    if (value === 'neither') return isTrio(game) ? 'Aucun des trois' : 'Aucun des deux'
    return playerName(game, value)
  }
  const opt = (question?.options || []).find((o) => o.id === value)
  return opt ? opt.label : String(value)
}
