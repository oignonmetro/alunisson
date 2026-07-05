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
    {
      id: 'vaisselle',
      type: 'who',
      text: 'Qui fait la vaisselle le plus souvent ?',
    },
    {
      id: 'reveil-difficile',
      type: 'who',
      text: 'Qui a le plus de mal à sortir du lit ?',
    },
    {
      id: 'ronfle',
      type: 'who',
      text: 'Qui ronfle (un peu) ?',
    },
    {
      id: 'couverture',
      type: 'who',
      text: 'Qui vole la couverture la nuit ?',
    },
    {
      id: 'range-derriere',
      type: 'who',
      text: 'Qui range derrière l’autre ?',
    },
    {
      id: 'retard',
      type: 'who',
      text: 'Qui est le plus souvent en retard ?',
    },
    {
      id: 'plantes',
      type: 'who',
      text: 'Qui s’occupe des plantes ?',
    },
    {
      id: 'poubelle',
      type: 'who',
      text: 'Qui sort la poubelle ?',
    },
    {
      id: 'snooze',
      type: 'who',
      text: 'Qui appuie dix fois sur « snooze » ?',
    },
    {
      id: 'douche-longue',
      type: 'who',
      text: 'Qui prend les douches les plus longues ?',
    },
    {
      id: 'chauffage',
      type: 'mcq',
      text: 'À la maison, le chauffage est réglé…',
      options: [
        { id: 'chaud', label: 'Trop chaud' },
        { id: 'froid', label: 'Trop froid' },
        { id: 'parfait', label: 'Parfait' },
        { id: 'dispute', label: 'On se dispute toujours' },
      ],
    },
    {
      id: 'sujet-dispute',
      type: 'text',
      text: 'Le sujet de dispute le plus récurrent (en un mot) ?',
    },
    {
      id: 'tache-detestee',
      type: 'text',
      text: 'La tâche ménagère qu’on déteste tous les deux ?',
    },
    {
      id: 'temps-telephone',
      type: 'who',
      text: 'Qui passe le plus de temps sur son téléphone ?',
    },
    {
      id: 'repartition-cuisine',
      type: 'mcq',
      text: 'La répartition cuisine / vaisselle ?',
      options: [
        { id: 'un-lautre', label: 'Un cuisine, l’autre lave' },
        { id: 'tour', label: 'Chacun son tour' },
        { id: 'deux', label: 'À deux' },
        { id: 'aucun', label: 'Ni l’un ni l’autre' },
      ],
    },
    {
      id: 'met-reveil',
      type: 'who',
      text: 'Qui met le réveil le matin ?',
    },
    {
      id: 'liste-courses',
      type: 'who',
      text: 'Qui pense à faire la liste de courses ?',
    },
    {
      id: 'gps',
      type: 'who',
      text: 'Qui se fie le plus au GPS ?',
    },
    {
      id: 'fait-lit',
      type: 'who',
      text: 'Qui fait le lit le matin ?',
    },
    {
      id: 'impatient',
      type: 'who',
      text: 'Qui est le plus impatient ?',
    },
    {
      id: 'rate-recette',
      type: 'who',
      text: 'Qui rate le plus souvent une recette ?',
    },
    {
      id: 'gere-budget',
      type: 'who',
      text: 'Qui gère le budget du foyer ?',
    },
    {
      id: 'bricole',
      type: 'who',
      text: 'Qui bricole quand quelque chose casse ?',
    },
    {
      id: 'humeur-matin',
      type: 'who',
      text: 'Qui est de meilleure humeur le matin ?',
    },
    {
      id: 'soin-animal',
      type: 'who',
      text: 'Qui s’occupe le plus de l’animal (ou s’en occuperait) ?',
    },
    {
      id: 'endort-tele',
      type: 'who',
      text: 'Qui s’endort devant la télé ?',
    },
    {
      id: 'organise-weekend',
      type: 'who',
      text: 'Qui organise le planning du week-end ?',
    },
    {
      id: 'salle-de-bain',
      type: 'who',
      text: 'Qui passe le plus de temps dans la salle de bain ?',
    },
    {
      id: 'prepare-petit-dej',
      type: 'who',
      text: 'Qui prépare le café ou le petit-déj ?',
    },
    {
      id: 'decide-deco',
      type: 'who',
      text: 'Qui décide de la déco ?',
    },
    {
      id: 'pique-chargeur',
      type: 'who',
      text: 'Qui pique le chargeur de l’autre ?',
    },
    {
      id: 'frigo-vide',
      type: 'who',
      text: 'Qui laisse le frigo se vider sans rien dire ?',
    },
    {
      id: 'lever-weekend',
      type: 'mcq',
      text: 'Le week-end, on se lève…',
      options: [
        { id: 'tot', label: 'Tôt' },
        { id: 'tard', label: 'Tard' },
        { id: 'decale', label: 'Décalés' },
        { id: 'depend', label: 'Ça dépend' },
      ],
    },
    {
      id: 'jamais-choisir',
      type: 'text',
      text: 'Ce qu’on n’arrive jamais à choisir ensemble ?',
    },
    {
      id: 'musique-voiture',
      type: 'who',
      text: 'Qui choisit la musique en voiture ?',
    },
    {
      id: 'etat-maison',
      type: 'mcq',
      text: 'Notre maison est plutôt…',
      options: [
        { id: 'nickel', label: 'Nickel' },
        { id: 'vecue', label: 'Vécue mais accueillante' },
        { id: 'bazar', label: 'Bazar organisé' },
        { id: 'chaos', label: 'Chaos total' },
      ],
    },
  ],
}
