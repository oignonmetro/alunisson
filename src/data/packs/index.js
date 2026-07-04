// Registre des packs de questions.
// Pour ajouter un pack : créez un fichier voisin et importez-le ici.

import gouts from './gouts.js'
import souvenirs from './souvenirs.js'
import quotidien from './quotidien.js'
import complicite from './complicite.js'

/** Liste ordonnée des packs (pour l'affichage). */
export const PACKS = [gouts, souvenirs, quotidien, complicite]

/** Packs indexés par id (pour la construction d'une partie). */
export const PACKS_BY_ID = Object.fromEntries(PACKS.map((p) => [p.id, p]))

/** Nombre total de questions disponibles pour une sélection de packs. */
export function totalQuestions(selectedPackIds) {
  return (selectedPackIds || []).reduce(
    (sum, id) => sum + (PACKS_BY_ID[id]?.questions.length || 0),
    0,
  )
}
