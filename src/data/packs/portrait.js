// Pack « Portrait » — contenu dédié à la manche « dirigée » : un·e joueur·se
// (la cible) répond en privé, l'autre devine sa réponse. Le match ne mesure
// alors PAS une coïncidence de goûts (cf. docs/redaction-questions.md §10)
// mais une vraie connaissance de l'autre : quel que soit le trait réel de la
// cible, un devineur qui la connaît bien doit pouvoir le retrouver.
//
// Conséquences sur la rédaction (différentes des 4 packs « classiques ») :
//  - pas de type `who` (la question porte sur UNE personne, pas une
//    comparaison entre joueurs) ;
//  - pas de séparation couple/amis (`audience`) : ce pack est universel,
//    utilisable en couple comme en équipes ;
//  - pas besoin de « référent partagé » (§2) : la question porte
//    explicitement sur le vécu/les traits propres à la cible, devinés par
//    la connaissance qu'on en a — c'est la mécanique elle-même (cible +
//    devineur), pas la formulation, qui rend la question testable.
//
// Ce pack n'est PAS sélectionnable dans le salon : il est inclus
// automatiquement par `buildDirectedRounds` (voir gameLogic.js).

export default {
  id: 'portrait',
  name: 'Portrait',
  emoji: '🕵️',
  description: 'Une question, une vraie réponse, une devinette — ce qu’on sait vraiment de l’autre.',
  questions: [
    { id: 'pt-excuse-corvee', type: 'text', text: 'L’excuse la plus utilisée pour éviter une corvée ?' },
    { id: 'pt-refuse-tort', type: 'text', text: 'Le sujet sur lequel on refuse d’avoir tort ?' },
    { id: 'pt-secret-aime', type: 'text', text: 'Le truc qu’on prétend détester mais qu’on adore en secret ?' },
    { id: 'pt-chanson-honte', type: 'text', text: 'La chanson qu’on connaît par cœur mais qu’on n’assumerait jamais en public ?' },
    { id: 'pt-juron', type: 'text', text: 'Le juron ou l’exclamation signature ?' },
    { id: 'pt-jamais-prete', type: 'text', text: 'L’objet qu’on ne prêterait jamais à personne ?' },
    { id: 'pt-mensonge-pieux', type: 'text', text: 'Le petit mensonge qu’on raconte le plus souvent ?' },
    { id: 'pt-motivation-lundi', type: 'text', text: 'La technique secrète pour se motiver un lundi matin ?' },
    { id: 'pt-talent-cache', type: 'text', text: 'Le talent caché que peu de gens connaissent ?' },
    { id: 'pt-peur-avouee', type: 'text', text: 'La petite peur qu’on n’avoue pas facilement ?' },
    { id: 'pt-fierte-discrete', type: 'text', text: 'Une fierté qu’on ne montre jamais mais qui compte beaucoup ?' },
    { id: 'pt-manie', type: 'text', text: 'La petite manie que tout le monde finit par remarquer ?' },
    { id: 'pt-regret', type: 'text', text: 'Le petit regret qui revient de temps en temps ?' },
    { id: 'pt-refuge', type: 'text', text: 'L’activité refuge quand le moral est bas ?' },
    { id: 'pt-surnom-enfance', type: 'text', text: 'Le surnom d’enfance qu’on préfère oublier ?' },
    { id: 'pt-obsession', type: 'text', text: 'Le sujet sur lequel on pourrait parler des heures ?' },
    { id: 'pt-fausse-excuse', type: 'text', text: 'L’excuse préférée pour partir tôt d’une soirée ?' },
    { id: 'pt-superstition', type: 'text', text: 'La petite superstition ou le petit rituel personnel ?' },

    { id: 'pt-reaction-critique', type: 'mcq', text: 'Face à une critique, la première réaction ?', options: [ { id: 'justifie', label: 'Se justifie' }, { id: 'encaisse', label: 'Encaisse en silence' }, { id: 'note', label: 'Prend note' }, { id: 'replique', label: 'Réplique direct' } ] },
    { id: 'pt-style-decision', type: 'mcq', text: 'Pour prendre une décision, le réflexe est…', options: [ { id: 'instinct', label: 'Foncer à l’instinct' }, { id: 'peser', label: 'Peser le pour et le contre' }, { id: 'conseil', label: 'Demander conseil' }, { id: 'repousse', label: 'Repousser le plus possible' } ] },
    { id: 'pt-facon-complimenter', type: 'mcq', text: 'Recevoir un compliment, c’est…', options: [ { id: 'plaisir', label: 'Un vrai plaisir' }, { id: 'gene', label: 'Un peu gênant' }, { id: 'blague', label: 'L’occasion d’une blague' }, { id: 'suspect', label: 'Suspect' } ] },
    { id: 'pt-style-excuses', type: 'mcq', text: 'Présenter ses excuses, on préfère…', options: [ { id: 'mots', label: 'Les mots' }, { id: 'geste', label: 'Un geste' }, { id: 'temps', label: 'Laisser le temps passer' }, { id: 'evite', label: 'Faire comme si de rien n’était' } ] },
    { id: 'pt-face-imprevu', type: 'mcq', text: 'Face à un imprévu, le réflexe est…', options: [ { id: 'improvise', label: 'Improviser tout de suite' }, { id: 'planb', label: 'Chercher un plan B' }, { id: 'panique', label: 'Paniquer un instant' }, { id: 'marbre', label: 'Rester de marbre' } ] },
    { id: 'pt-secret-garde', type: 'mcq', text: 'Un secret qu’on nous confie, c’est…', options: [ { id: 'coffre', label: 'Un coffre-fort' }, { id: 'poids', label: 'Un poids difficile à porter' }, { id: 'oublie', label: 'Vite oublié' }, { id: 'tentant', label: 'Parfois trop tentant à partager' } ] },
    { id: 'pt-humeur-fatigue', type: 'mcq', text: 'Fatigué, le comportement devient plutôt…', options: [ { id: 'silencieux', label: 'Silencieux' }, { id: 'grognon', label: 'Grognon' }, { id: 'hyperactif', label: 'Hyperactif malgré tout' }, { id: 'absent', label: 'Complètement absent' } ] },
    { id: 'pt-style-apprentissage', type: 'mcq', text: 'Pour apprendre un nouveau truc, le réflexe est…', options: [ { id: 'fonce', label: 'Foncer sans lire la notice' }, { id: 'tuto', label: 'Regarder un tuto' }, { id: 'lit', label: 'Tout lire avant de commencer' }, { id: 'demande', label: 'Demander à quelqu’un' } ] },
    { id: 'pt-reaction-victoire', type: 'mcq', text: 'Après une réussite, le réflexe est de…', options: [ { id: 'crie', label: 'Le crier à qui veut l’entendre' }, { id: 'savoure', label: 'Le savourer en silence' }, { id: 'appelle', label: 'Appeler quelqu’un direct' }, { id: 'passe', label: 'Déjà passer à autre chose' } ] },
    { id: 'pt-face-file-attente', type: 'mcq', text: 'Dans une file d’attente qui traîne, le comportement devient…', options: [ { id: 'impatient', label: 'Impatient' }, { id: 'zen', label: 'Zen' }, { id: 'bavard', label: 'Bavard avec les voisins' }, { id: 'absorbe', label: 'Absorbé dans son téléphone' } ] },
    { id: 'pt-style-cadeau-offert', type: 'mcq', text: 'Offrir un cadeau, on préfère…', options: [ { id: 'pratique', label: 'Un truc pratique' }, { id: 'surprise', label: 'Une surprise totale' }, { id: 'sens', label: 'Un objet qui a du sens' }, { id: 'experience', label: 'Une expérience à vivre' } ] },
    { id: 'pt-face-changement-plan', type: 'mcq', text: 'Un changement de plan de dernière minute, ça…', options: [ { id: 'aucun', label: 'Ne dérange pas du tout' }, { id: 'adaptation', label: 'Demande un temps d’adaptation' }, { id: 'stresse', label: 'Stresse un peu' }, { id: 'malvecu', label: 'Est carrément mal vécu' } ] },
  ],
}
