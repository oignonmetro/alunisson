import { describe, it, expect } from 'vitest'
import { PACKS, PACKS_BY_ID, totalQuestions, friendsCount } from '../index.js'
import { questionAllowed } from '../../../lib/gameLogic.js'

const typeCounts = (qs) => {
  const t = { who: 0, mcq: 0, text: 0 }
  for (const q of qs) t[q.type]++
  return t
}

describe('friendsCount / totalQuestions', () => {
  it('friendsCount compte les questions jouables entre amis (all + amis)', () => {
    for (const p of PACKS) {
      const manual = p.questions.filter((q) => q.audience === 'all' || q.audience === 'amis').length
      expect(friendsCount(p)).toBe(manual)
    }
  })
  it('en mode amis, le total est ≤ au total couple + amis', () => {
    const ids = PACKS.map((p) => p.id)
    expect(totalQuestions(ids, 'amis')).toBeGreaterThan(0)
    expect(totalQuestions(ids, 'couple')).toBeGreaterThan(0)
  })
})

describe('équilibre du corpus « amis »', () => {
  it('chaque pack offre exactement 35 questions amis par type (who / mcq / text)', () => {
    for (const p of PACKS) {
      const amis = p.questions.filter((q) => questionAllowed(q, 'amis'))
      expect(typeCounts(amis), `pack ${p.id}`).toEqual({ who: 35, mcq: 35, text: 35 })
    }
  })
  it('les ids sont uniques au sein de chaque pack', () => {
    for (const p of PACKS) {
      const ids = p.questions.map((q) => q.id)
      expect(new Set(ids).size, `pack ${p.id}`).toBe(ids.length)
    }
  })
  it('aucun libellé dupliqué au sein d’un même mode (amis ou couple)', () => {
    for (const p of PACKS) {
      for (const aud of ['amis', 'couple']) {
        const texts = p.questions.filter((q) => questionAllowed(q, aud)).map((q) => q.text)
        expect(new Set(texts).size, `pack ${p.id} / ${aud}`).toBe(texts.length)
      }
    }
  })
  it('les QCM amis ont au moins deux options', () => {
    for (const p of PACKS) {
      for (const q of p.questions.filter((q) => questionAllowed(q, 'amis') && q.type === 'mcq')) {
        expect(Array.isArray(q.options) && q.options.length >= 2, `${p.id}:${q.id}`).toBe(true)
      }
    }
  })
})

describe('les packs couple-only gardent leur contenu couple', () => {
  it('Souvenirs et Complicité n’exposent aucune question « amis » en mode couple', () => {
    for (const id of ['souvenirs', 'complicite']) {
      const couple = PACKS_BY_ID[id].questions.filter((q) => questionAllowed(q, 'couple'))
      expect(couple.every((q) => q.audience !== 'amis' && q.audience !== 'all')).toBe(true)
    }
  })
})

// Une question posée à la 2e personne du singulier (tu/ton/ta/tes/toi/te) n'a
// pas le même sens selon qui répond (« toi » = joueur A pour A, joueur B pour
// B) : ce n'est alors plus la même question pour tout le monde. Les questions
// doivent rester formulées au collectif (on/notre) ou à l'impersonnel
// (le/la/les), hors citations figées comme « je t'aime ».
const SECOND_PERSON = new Set(['tu', 'ton', 'ta', 'tes', 'toi', 'te'])
function hasShiftingSecondPerson(text) {
  if (/je t['’]aime/i.test(text)) return false
  const words = (text.match(/\p{L}+/gu) || []).map((w) => w.toLowerCase())
  if (words.some((w) => SECOND_PERSON.has(w))) return true
  return /\bt['’]/i.test(text)
}

describe('pas de référent qui glisse selon le joueur (2e personne du singulier)', () => {
  it('aucun texte de question à la 2e personne du singulier', () => {
    for (const p of PACKS) {
      for (const q of p.questions) {
        expect(hasShiftingSecondPerson(q.text), `${p.id}:${q.id} — "${q.text}"`).toBe(false)
      }
    }
  })
  it('aucun libellé d’option à la 2e personne du singulier', () => {
    for (const p of PACKS) {
      for (const q of p.questions) {
        for (const o of q.options || []) {
          expect(hasShiftingSecondPerson(o.label), `${p.id}:${q.id} option "${o.label}"`).toBe(false)
        }
      }
    }
  })
})
