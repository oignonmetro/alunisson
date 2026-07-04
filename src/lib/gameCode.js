// Génération et validation des codes de partie (4 lettres partageables).
// On évite les lettres ambiguës (I, O) pour faciliter la saisie orale.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
export const CODE_LENGTH = 4

/**
 * Génère un code de partie aléatoire (ex: "KPRT").
 * @returns {string}
 */
export function generateCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

/**
 * Nettoie une saisie utilisateur en code candidat (majuscules, sans espaces,
 * lettres valides uniquement, tronqué à la bonne longueur).
 * @param {string} input
 * @returns {string}
 */
export function sanitizeCode(input) {
  return String(input || '')
    .toUpperCase()
    .split('')
    .filter((c) => ALPHABET.includes(c))
    .join('')
    .slice(0, CODE_LENGTH)
}

/**
 * Vrai si le code a la bonne longueur et n'utilise que des lettres valides.
 * @param {string} code
 * @returns {boolean}
 */
export function isValidCode(code) {
  return typeof code === 'string' && sanitizeCode(code).length === CODE_LENGTH
}
