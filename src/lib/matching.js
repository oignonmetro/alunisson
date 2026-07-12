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
    // Sélection multiple (« qui de nous trois » en mode trio) : comparaison
    // d'ensembles, indépendante de l'ordre.
    if (Array.isArray(a) || Array.isArray(b)) return sameSet(a, b)
    return String(a) === String(b)
  }
  // Réponse libre : comparaison normalisée.
  const na = normalize(a)
  const nb = normalize(b)
  if (na === '' || nb === '') return false
  return na === nb
}

/**
 * Égalité de deux sélections (tableaux d'ids), indépendante de l'ordre.
 * Une valeur non-tableau (ex. 'neither') est traitée comme un singleton, si
 * bien que 'neither' ne coïncide qu'avec 'neither'.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function sameSet(a, b) {
  const na = Array.isArray(a) ? a : [a]
  const nb = Array.isArray(b) ? b : [b]
  if (na.length !== nb.length) return false
  const sb = new Set(nb.map(String))
  return na.every((x) => sb.has(String(x)))
}

/**
 * Indique si deux réponses à une question « qui de nous deux » sont
 * « presque en accord » : l'une dit « aucun des deux », l'autre « tous les
 * deux ». Ça ne pointe vers personne en particulier dans les deux cas, donc
 * ça revient plus ou moins au même — vaut un demi-point (cf. gameLogic.js).
 * @param {{type: string}} question
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function isPartialMatch(question, a, b) {
  if (question?.type !== 'who') return false
  if (a == null || b == null) return false
  const set = new Set([String(a), String(b)])
  return set.size === 2 && set.has('both') && set.has('neither')
}
