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
  ],
}
