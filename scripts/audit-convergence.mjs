// Audit « convergence » — pré-filtre des QCM (et textes fermés) susceptibles de
// ne mesurer qu'une habitude individuelle plutôt qu'une réponse partagée.
//
// Rappel (voir docs/redaction-questions.md §9) : une question « à matcher » n'a
// de sens que si deux joueurs en phase ont une RAISON de répondre pareil —
// référent partagé, consensus, ou goût réellement partageable. Un QCM qui
// demande à chacun de décrire sa logistique privée (« La boîte mail… ») a un
// taux de coïncidence quasi aléatoire et un enjeu relationnel nul.
//
// ⚠️ Ce script est un PRÉ-FILTRE lexical, pas un verdict : il signale les QCM
// SANS marqueur de référent partagé / de consensus. Beaucoup de ces candidats
// sont en réalité des goûts légitimes (« Team 🐶/🐱 ») ; le tri final reste
// humain, avec la grille du §9.
//
//   node scripts/audit-convergence.mjs            → liste les candidats
//   node scripts/audit-convergence.mjs --counts   → compteurs par pack seulement

import { PACKS } from '../src/data/packs/index.js'

// Marqueurs d'un référent PARTAGÉ ou d'un fait d'histoire commune : la réponse
// porte alors sur un même objet/événement/routine, donc convergente.
const SHARED = /\b(notre|nos|ensemble|à deux|chez nous|entre vous|du couple|de notre|vous seuls|du groupe|de groupe|vos|votre|le groupe|réunir le groupe|se réconcilie|devenus amis)\b/i
// Faits d'histoire commune (rencontre, débuts…) : convergents même sans « notre ».
const HISTORY = /(s['’]est-on|s['’]on|rencontr|connus|mis ensemble|première sortie)/i

const onlyCounts = process.argv.includes('--counts')
let totalMcq = 0
let totalFlagged = 0

for (const p of PACKS) {
  const mcqs = p.questions.filter((q) => q.type === 'mcq')
  const flagged = mcqs.filter((q) => !SHARED.test(q.text) && !HISTORY.test(q.text))
  totalMcq += mcqs.length
  totalFlagged += flagged.length

  console.log(`\n### ${p.name} (${p.id}) — ${flagged.length}/${mcqs.length} QCM à trier`)
  if (!onlyCounts) {
    for (const q of flagged) {
      const aud = (q.audience || 'couple').padEnd(6)
      console.log(`  [${aud}] ${q.id}`)
      console.log(`           « ${q.text} »  →  ${q.options.map((o) => o.label).join(' / ')}`)
    }
  }
}

console.log(`\n— ${totalFlagged}/${totalMcq} QCM sans marqueur de référent partagé (candidats à trier, voir §9).`)
