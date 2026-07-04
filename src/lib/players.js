// Petits utilitaires liés aux joueurs et aux options d'affichage.

/** Liste des uid des joueurs (ordre d'arrivée). */
export function playerUids(game) {
  const players = game?.players || {}
  return Object.keys(players).sort(
    (a, b) => (players[a].joinedAt || 0) - (players[b].joinedAt || 0),
  )
}

/** uid de l'autre joueur. */
export function otherUid(game, uid) {
  return playerUids(game).find((u) => u !== uid) || null
}

/** Nom d'un joueur (avec repli). */
export function playerName(game, uid) {
  return game?.players?.[uid]?.name || 'Joueur'
}

/**
 * Options d'une question à choix, y compris le type `who` dont les options
 * sont générées à partir des deux joueurs (+ « Les deux » / « Aucun »).
 * Les id d'options sont identiques pour les deux joueurs → matching correct.
 */
export function optionsFor(question, game) {
  if (question?.type === 'who') {
    const uids = playerUids(game)
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
  const opt = optionsFor(question, game).find((o) => o.id === value)
  return opt ? opt.label : String(value)
}
