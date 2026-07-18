// Audit « convergence » — pré-filtre des QCM susceptibles de ne mesurer qu'une
// habitude / un goût individuel plutôt qu'une réponse partagée.
//
// Rappel (voir docs/redaction-questions.md §9) : une question « à matcher » n'a
// de sens que si deux joueurs en phase ont une RAISON de répondre pareil —
// référent partagé, consensus, ou goût réellement partageable. Un QCM qui
// demande à chacun de décrire sa logistique privée (« La boîte mail… ») a un
// taux de coïncidence quasi aléatoire et un enjeu relationnel nul.
//
// Le script écarte les QCM qui portent un marqueur de convergence — référent
// partagé, fait d'histoire commune, ou tournure de CONSENSUS (superlatif,
// jugement, dynamique de groupe) — et ne liste que le reste.
//
// ⚠️ Reste un PRÉ-FILTRE lexical, pas un verdict : les candidats restants sont
// surtout des goûts « nus » (« Team 🐶/🐱 », « Le café, c'est plutôt… »), qui
// sont tolérés (cœur du jeu) mais méritent un œil, et d'éventuelles habitudes
// individuelles oubliées. Le tri final reste humain, avec la grille du §9.
//
//   node scripts/audit-convergence.mjs            → liste les candidats
//   node scripts/audit-convergence.mjs --counts   → compteurs par pack seulement

import { PACKS } from '../src/data/packs/index.js'

// 1. Référent PARTAGÉ ou fait d'histoire commune : la réponse porte sur un même
//    objet / événement / routine → convergente.
const SHARED = /\b(notre|nos|ensemble|chez nous|entre vous|entre potes|entre amis|entre proches|du couple|de notre|vous seuls|le groupe|du groupe|de groupe|la bande|réunir|se réconcilie|vos|votre)\b/i
const HISTORY = /(s['’]est-on|s['’]on|rencontr|connus|mis ensemble|première sortie|devenus amis|naissent)/i

// 2. Tournures de CONSENSUS : jugement partagé sur une cible commune plutôt que
//    description d'une habitude privée. Superlatifs (« le pire », « la
//    meilleure… »), jugements de valeur (« le vrai test », « le signe que »,
//    « ce qui… »), et dynamiques de groupe (« dans une embrouille… », « en soirée… »).
const CONSENSUS = /\b(le pire|la pire|le meilleur|la meilleure|le mieux|le plus|la plus|les plus|le plus beau|la plus belle|idéal|idéale|impardonnable|le vrai|numéro un|le signe|la place dans|le rôle|le moment de groupe|dans une embrouille|en soirée)\b/i
const CONSENSUS2 = /met tout le monde d['’]accord|\bce qui\b/i

// Marqueurs commençant par une lettre accentuée : le « \b » de JS ne crée PAS de
// frontière de mot devant « à/é… » (non-mot en ASCII), donc on teste en
// sous-chaîne (ces locutions sont assez spécifiques pour ne pas faire de faux
// positif).
const ACCENT_MARKERS = ['à deux', 'à plusieurs', 'à coup sûr', 'à tout prix']

const isConvergent = (text) => {
  const t = text.toLowerCase()
  if (ACCENT_MARKERS.some((m) => t.includes(m))) return true
  return SHARED.test(text) || HISTORY.test(text) || CONSENSUS.test(text) || CONSENSUS2.test(text)
}

const onlyCounts = process.argv.includes('--counts')
let totalMcq = 0
let totalFlagged = 0

for (const p of PACKS) {
  const mcqs = p.questions.filter((q) => q.type === 'mcq')
  const flagged = mcqs.filter((q) => !isConvergent(q.text))
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

console.log(`\n— ${totalFlagged}/${totalMcq} QCM sans marqueur de convergence (candidats à trier, voir §9).`)
