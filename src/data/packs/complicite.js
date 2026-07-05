// Pack « Complicité » — plus personnel et tendre. Ton intime mais bienveillant.

export default {
  id: 'complicite',
  name: 'Complicité',
  emoji: '❤️',
  description: 'Votre tendresse, vos câlins et ce qui vous rend complices.',
  questions: [
    {
      id: 'je-taime-souvent',
      type: 'who',
      text: 'Qui dit « je t’aime » le plus souvent ?',
    },
    {
      id: 'calins',
      type: 'who',
      text: 'Qui réclame le plus de câlins ?',
    },
    {
      id: 'langage-amour',
      type: 'mcq',
      text: 'Notre principal langage de l’amour ?',
      options: [
        { id: 'paroles', label: 'Les mots doux' },
        { id: 'gestes', label: 'Les gestes tendres' },
        { id: 'temps', label: 'Le temps ensemble' },
        { id: 'attentions', label: 'Les petites attentions' },
        { id: 'cadeaux', label: 'Les cadeaux' },
      ],
    },
    {
      id: 'endort-premier',
      type: 'who',
      text: 'Qui s’endort le premier en se blottissant ?',
    },
    {
      id: 'surnom',
      type: 'text',
      text: 'Un petit surnom qu’on se donne ?',
    },
    {
      id: 'jaloux',
      type: 'who',
      text: 'Qui est (un tout petit peu) le plus jaloux ?',
    },
    {
      id: 'soiree-amoureux',
      type: 'mcq',
      text: 'La soirée en amoureux idéale ?',
      options: [
        { id: 'chandelles', label: 'Dîner aux chandelles' },
        { id: 'massage', label: 'Massage & détente' },
        { id: 'danse', label: 'Sortie dansante' },
        { id: 'cocooning', label: 'Cocooning sous plaid' },
      ],
    },
    {
      id: 'pardonne',
      type: 'who',
      text: 'Qui pardonne le plus vite après une dispute ?',
    },
    {
      id: 'romantique',
      type: 'who',
      text: 'Qui est le plus romantique ?',
    },
    {
      id: 'petit-geste',
      type: 'text',
      text: 'Le petit geste qui fait toujours plaisir à l’autre ?',
    },
    {
      id: 'reconciliation',
      type: 'mcq',
      text: 'Notre façon de nous réconcilier ?',
      options: [
        { id: 'parler', label: 'On en parle' },
        { id: 'calin', label: 'Un gros câlin' },
        { id: 'repas', label: 'Un bon repas' },
        { id: 'temps', label: 'On laisse le temps faire' },
      ],
    },
    {
      id: 'surprises',
      type: 'who',
      text: 'Qui aime le plus faire des surprises ?',
    },
    {
      id: 'lieu-baiser',
      type: 'text',
      text: 'Un endroit où l’on rêve de s’embrasser ?',
    },
    {
      id: 'main-public',
      type: 'who',
      text: 'Qui prend la main de l’autre en public ?',
    },
    {
      id: 'messages-tendres',
      type: 'who',
      text: 'Qui envoie le plus de messages tendres ?',
    },
    {
      id: 'compliments',
      type: 'who',
      text: 'Qui fait le plus de compliments ?',
    },
    {
      id: 'initie-calins',
      type: 'who',
      text: 'Qui initie les câlins le plus souvent ?',
    },
    {
      id: 'petit-nom',
      type: 'text',
      text: 'Le petit nom qu’on utilise le plus souvent ?',
    },
    {
      id: 'pleure-film',
      type: 'who',
      text: 'Qui pleure le plus devant un film ?',
    },
    {
      id: 'boude',
      type: 'who',
      text: 'Qui boude le plus longtemps ?',
    },
    {
      id: 'premier-pas-reconciliation',
      type: 'who',
      text: 'Qui fait le premier pas pour se réconcilier ?',
    },
    {
      id: 'fait-rire',
      type: 'who',
      text: 'Qui fait le plus rire l’autre ?',
    },
    {
      id: 'protecteur',
      type: 'who',
      text: 'Qui est le plus protecteur ?',
    },
    {
      id: 'calin-matin',
      type: 'who',
      text: 'Qui a le plus besoin de câlins le matin ?',
    },
    {
      id: 'declaration',
      type: 'mcq',
      text: 'Une déclaration, on préfère…',
      options: [
        { id: 'surprise', label: 'Par surprise' },
        { id: 'prive', label: 'En privé' },
        { id: 'mots', label: 'Avec les mots' },
        { id: 'geste', label: 'Avec un geste' },
      ],
    },
    {
      id: 'position-nuit',
      type: 'mcq',
      text: 'La nuit, on dort…',
      options: [
        { id: 'enlaces', label: 'Enlacés' },
        { id: 'dos', label: 'Dos à dos' },
        { id: 'cote', label: 'Chacun son côté' },
        { id: 'change', label: 'Ça change' },
      ],
    },
    {
      id: 'lettre-amour',
      type: 'who',
      text: 'Qui écrirait une lettre d’amour ?',
    },
    {
      id: 'jalousie-legere',
      type: 'who',
      text: 'Qui devient (adorablement) jaloux ?',
    },
    {
      id: 'lieu-proches',
      type: 'mcq',
      text: 'On se sent le plus proches…',
      options: [
        { id: 'lit', label: 'Au lit' },
        { id: 'table', label: 'À table' },
        { id: 'voyage', label: 'En voyage' },
        { id: 'canape', label: 'Sur le canapé' },
      ],
    },
    {
      id: 'geste-automatique',
      type: 'text',
      text: 'Le geste tendre qu’on fait sans même y penser ?',
    },
    {
      id: 'regard-doux',
      type: 'who',
      text: 'Qui regarde l’autre en douce le plus souvent ?',
    },
    {
      id: 'reconforte',
      type: 'who',
      text: 'Qui réconforte l’autre quand ça ne va pas ?',
    },
    {
      id: 'se-confie',
      type: 'who',
      text: 'Qui se confie le plus à l’autre ?',
    },
    {
      id: 'plus-tactile',
      type: 'who',
      text: 'Qui est le plus tactile ?',
    },
    {
      id: 'surnom-prive',
      type: 'text',
      text: 'Un surnom secret qu’on n’utilise qu’à la maison ?',
    },
    {
      id: 'rdv-surprise',
      type: 'mcq',
      text: 'Le rendez-vous surprise rêvé ?',
      options: [
        { id: 'escapade', label: 'Escapade week-end' },
        { id: 'diner', label: 'Dîner surprise' },
        { id: 'spa', label: 'Spa à deux' },
        { id: 'concert', label: 'Concert' },
      ],
    },
    {
      id: 'moment-prefere',
      type: 'mcq',
      text: 'Notre moment préféré de la journée ensemble ?',
      options: [
        { id: 'reveil', label: 'Le réveil' },
        { id: 'diner', label: 'Le repas du soir' },
        { id: 'coucher', label: 'Avant de dormir' },
        { id: 'weekend', label: 'Le week-end' },
      ],
    },
    {
      id: 'prolonge-calin',
      type: 'who',
      text: 'Qui prolonge les câlins le plus longtemps ?',
    },
    {
      id: 'compliment-favori',
      type: 'text',
      text: 'Le compliment qui touche le plus l’autre ?',
    },
    {
      id: 'danse-salon',
      type: 'who',
      text: 'Qui propose de danser dans le salon ?',
    },
    {
      id: 'geste-repare',
      type: 'text',
      text: 'Le geste qui répare tout après une dispute ?',
    },
    {
      id: 'amadoue',
      type: 'who',
      text: 'Qui sait le mieux amadouer l’autre ?',
    },
    {
      id: 'dire-je-taime',
      type: 'mcq',
      text: 'Pour dire « je t’aime », on préfère…',
      options: [
        { id: 'mots', label: 'Les mots' },
        { id: 'gestes', label: 'Les gestes' },
        { id: 'attentions', label: 'Les petites attentions' },
        { id: 'regards', label: 'Les regards' },
      ],
    },
    {
      id: 'souvenir-tendre',
      type: 'text',
      text: 'Un moment de tendresse qu’on n’oubliera jamais ?',
    },
    {
      id: 'offre-surprises',
      type: 'who',
      text: 'Qui offre le plus de petites surprises ?',
    },
    {
      id: 'premier-bisou-matin',
      type: 'who',
      text: 'Qui donne le premier bisou du matin ?',
    },
    {
      id: 'cuisine-pour-plaire',
      type: 'who',
      text: 'Qui cuisine pour faire plaisir à l’autre ?',
    },
    {
      id: 'destination-romantique',
      type: 'text',
      text: 'La destination la plus romantique pour nous deux ?',
    },
    {
      id: 'petits-mots',
      type: 'who',
      text: 'Qui laisse des petits mots à l’autre ?',
    },
    {
      id: 'reconforter-facon',
      type: 'mcq',
      text: 'Quand l’autre est triste, on…',
      options: [
        { id: 'calin', label: 'Fait un câlin' },
        { id: 'ecoute', label: 'Écoute' },
        { id: 'change-idees', label: 'Change les idées' },
        { id: 'cuisine', label: 'Cuisine un bon plat' },
      ],
    },
    {
      id: 'preuve-amour',
      type: 'text',
      text: 'La plus belle preuve d’amour reçue, en un mot ?',
    },
    {
      id: 'reve-avenir',
      type: 'text',
      text: 'Un rêve qu’on partage pour l’avenir ?',
    },
  ],
}
