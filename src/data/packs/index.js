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

/**
 * Nombre de questions disponibles pour une sélection de packs, selon le public.
 * @param {string[]} selectedPackIds
 * @param {'couple'|'amis'} [audience]  'amis' ne compte que les questions inclusives
 */
export function totalQuestions(selectedPackIds, audience = 'couple') {
  return (selectedPackIds || []).reduce((sum, id) => {
    const qs = PACKS_BY_ID[id]?.questions || []
    return sum + qs.filter((q) => audience !== 'amis' || q.audience === 'all').length
  }, 0)
}

/** Nombre de questions « entre amis » (audience: 'all') d'un pack. */
export function friendsCount(pack) {
  return (pack?.questions || []).filter((q) => q.audience === 'all').length
}
