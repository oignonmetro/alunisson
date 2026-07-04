// Logique de correspondance des réponses.
//
// Deux réponses "coïncident" (= 1 point pour le duo) selon le type de question :
//  - mcq  : les deux joueurs ont choisi la même option (comparaison d'id d'option).
//  - text : les deux textes sont égaux une fois normalisés (casse, accents,
//           ponctuation et espaces ignorés). En cas d'échec, un rattrapage
//           manuel « ça compte quand même » est possible (géré au niveau du jeu).

/**
 * Normalise une chaîne pour la comparaison de réponses libres :
 * minuscules, sans accents/diacritiques, sans ponctuation, espaces réduits.
 * @param {string} value
 * @returns {string}
 */
export function normalize(value) {
  if (value == null) return ''
  return String(value)
    .normalize('NFD')
    // supprime les diacritiques (accents) — plage combinante U+0300–U+036F
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // remplace toute ponctuation par une espace
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Indique si deux réponses coïncident automatiquement (avant rattrapage).
 * @param {{type: 'mcq'|'text'}} question
 * @param {*} a valeur du joueur A (id d'option pour mcq, texte pour text)
 * @param {*} b valeur du joueur B
 * @returns {boolean}
 */
export function isMatch(question, a, b) {
  if (a == null || b == null) return false
  // Toute question à choix (mcq, who, …) se compare par id d'option.
  if (question?.type !== 'text') {
    return String(a) === String(b)
  }
  // Réponse libre : comparaison normalisée.
  const na = normalize(a)
  const nb = normalize(b)
  if (na === '' || nb === '') return false
  return na === nb
}
