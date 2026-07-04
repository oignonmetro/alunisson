// Pack « Vie quotidienne » — habitudes, petites manies, répartition des rôles.

export default {
  id: 'quotidien',
  name: 'Vie quotidienne',
  emoji: '🏠',
  description: 'Vos habitudes, vos petites manies et qui fait quoi à la maison.',
  questions: [
    {
      id: 'leve-tot',
      type: 'who',
      text: 'Qui se lève le plus tôt ?',
    },
    {
      id: 'bordelique',
      type: 'who',
      text: 'Qui est le plus bordélique ?',
    },
    {
      id: 'cuisine',
      type: 'who',
      text: 'Qui cuisine le plus souvent ?',
    },
    {
      id: 'telecommande',
      type: 'who',
      text: 'Qui contrôle la télécommande ?',
    },
    {
      id: 'menage',
      type: 'mcq',
      text: 'Le ménage chez nous, c’est…',
      options: [
        { id: 'ensemble', label: 'À deux, le samedi' },
        { id: 'zones', label: 'Chacun sa zone' },
        { id: 'fil-eau', label: 'Au fil de l’eau' },
        { id: 'repousse', label: 'On repousse toujours' },
      ],
    },
    {
      id: 'oublis',
      type: 'who',
      text: 'Qui oublie le plus souvent ses clés ou son téléphone ?',
    },
    {
      id: 'film-soir',
      type: 'who',
      text: 'Qui décide du film le soir ?',
    },
    {
      id: 'coucher',
      type: 'mcq',
      text: 'Notre rythme de coucher ?',
      options: [
        { id: 'tot', label: 'Tôt tous les deux' },
        { id: 'tard', label: 'Tard tous les deux' },
        { id: 'decale', label: 'Décalés' },
        { id: 'depend', label: 'Ça dépend des jours' },
      ],
    },
    {
      id: 'depensier',
      type: 'who',
      text: 'Qui est le plus dépensier ?',
    },
    {
      id: 'messages',
      type: 'who',
      text: 'Qui répond le plus vite aux messages ?',
    },
    {
      id: 'courses',
      type: 'who',
      text: 'Qui gère les courses ?',
    },
    {
      id: 'volant',
      type: 'who',
      text: 'Qui prend le volant pour les longs trajets ?',
    },
  ],
}
