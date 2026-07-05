// Pack « Souvenirs & histoire » — surtout des réponses libres et des « qui de nous deux ».

export default {
  id: 'souvenirs',
  name: 'Souvenirs & histoire',
  emoji: '💭',
  description: 'Votre rencontre, vos débuts, les souvenirs qui vous appartiennent.',
  questions: [
    {
      id: 'ville-rencontre',
      type: 'text',
      text: 'Dans quelle ville s’est-on rencontrés ?',
    },
    {
      id: 'saison-couple',
      type: 'mcq',
      text: 'À quelle saison s’est-on mis ensemble ?',
      options: [
        { id: 'printemps', label: '🌸 Printemps' },
        { id: 'ete', label: '☀️ Été' },
        { id: 'automne', label: '🍂 Automne' },
        { id: 'hiver', label: '❄️ Hiver' },
      ],
    },
    {
      id: 'premier-pas',
      type: 'who',
      text: 'Qui a fait le premier pas ?',
    },
    {
      id: 'premier-lieu',
      type: 'text',
      text: 'Le lieu de notre tout premier rendez-vous ?',
    },
    {
      id: 'je-taime',
      type: 'who',
      text: 'Qui a dit « je t’aime » en premier ?',
    },
    {
      id: 'premier-voyage',
      type: 'text',
      text: 'Notre première destination de voyage ensemble ?',
    },
    {
      id: 'photos',
      type: 'who',
      text: 'Qui prend le plus de photos de nous deux ?',
    },
    {
      id: 'mot-rencontre',
      type: 'text',
      text: 'En un mot, notre première rencontre c’était… ?',
    },
    {
      id: 'animal-prenom',
      type: 'text',
      text: 'Le prénom qu’on donnerait à un animal de compagnie ?',
    },
    {
      id: 'dates',
      type: 'who',
      text: 'Qui se souvient le mieux des dates importantes ?',
    },
    {
      id: 'premier-cadeau',
      type: 'text',
      text: 'Quel a été le premier cadeau offert dans le couple ? (l’objet, en un mot)',
    },
    {
      id: 'prochaines-vacances',
      type: 'text',
      text: 'Où rêve-t-on de partir pour nos prochaines vacances ?',
    },
    {
      id: 'premier-resto',
      type: 'text',
      text: 'Le resto (ou le plat) de notre premier vrai rendez-vous ?',
    },
    {
      id: 'premier-film',
      type: 'text',
      text: 'Le premier film qu’on a vu ensemble ?',
    },
    {
      id: 'premier-baiser-lieu',
      type: 'text',
      text: 'Où a eu lieu notre premier baiser ?',
    },
    {
      id: 'comment-rencontre',
      type: 'mcq',
      text: 'Comment s’est-on rencontrés ?',
      options: [
        { id: 'amis', label: 'Par des amis' },
        { id: 'appli', label: 'Sur une appli' },
        { id: 'travail', label: 'Travail / études' },
        { id: 'hasard', label: 'Par hasard' },
      ],
    },
    {
      id: 'premier-message',
      type: 'who',
      text: 'Qui a envoyé le premier message ?',
    },
    {
      id: 'rdv-stress',
      type: 'who',
      text: 'Qui était le plus stressé au premier rendez-vous ?',
    },
    {
      id: 'propose-emmenager',
      type: 'who',
      text: 'Qui a proposé d’emménager ensemble ?',
    },
    {
      id: 'premiere-dispute',
      type: 'text',
      text: 'Le sujet de notre première (petite) dispute ?',
    },
    {
      id: 'surnom-debut',
      type: 'text',
      text: 'Le tout premier surnom qu’on s’est donné ?',
    },
    {
      id: 'saison-rencontre',
      type: 'mcq',
      text: 'À quelle saison s’est-on rencontrés ?',
      options: [
        { id: 'printemps', label: '🌸 Printemps' },
        { id: 'ete', label: '☀️ Été' },
        { id: 'automne', label: '🍂 Automne' },
        { id: 'hiver', label: '❄️ Hiver' },
      ],
    },
    {
      id: 'mois-anniversaire',
      type: 'text',
      text: 'Le mois de notre anniversaire de couple ?',
    },
    {
      id: 'premiere-impression',
      type: 'mcq',
      text: 'Ta première impression sur l’autre ?',
      options: [
        { id: 'coup-foudre', label: 'Coup de foudre' },
        { id: 'intrigue', label: 'Intrigué·e' },
        { id: 'timide', label: 'Trop timide pour oser' },
        { id: 'pas-convaincu', label: 'Pas convaincu·e au début' },
      ],
    },
    {
      id: 'chanson-debut',
      type: 'text',
      text: 'La chanson qui nous rappelle nos débuts ?',
    },
    {
      id: 'premier-cadeau-qui',
      type: 'who',
      text: 'Qui a offert le premier cadeau ?',
    },
    {
      id: 'presente-parents',
      type: 'who',
      text: 'Qui a présenté l’autre à ses parents en premier ?',
    },
    {
      id: 'temps-avant-couple',
      type: 'mcq',
      text: 'Combien de temps avant de se mettre ensemble ?',
      options: [
        { id: 'immediat', label: 'Tout de suite' },
        { id: 'semaines', label: 'Quelques semaines' },
        { id: 'mois', label: 'Plusieurs mois' },
        { id: 'annees', label: 'Des années' },
      ],
    },
    {
      id: 'premier-je-taime-lieu',
      type: 'text',
      text: 'Où s’est dit le premier « je t’aime » ?',
    },
    {
      id: 'premiere-photo',
      type: 'who',
      text: 'Qui a proposé notre première photo ensemble ?',
    },
    {
      id: 'premier-voyage-type',
      type: 'mcq',
      text: 'Notre tout premier voyage, c’était plutôt…',
      options: [
        { id: 'mer', label: '🏖️ La mer' },
        { id: 'ville', label: '🏙️ Une ville' },
        { id: 'montagne', label: '⛰️ La montagne' },
        { id: 'campagne', label: '🌾 La campagne' },
      ],
    },
    {
      id: 'qui-a-craque',
      type: 'who',
      text: 'Qui a craqué en premier ?',
    },
    {
      id: 'debut-distance',
      type: 'mcq',
      text: 'À nos débuts, on habitait…',
      options: [
        { id: 'meme-ville', label: 'La même ville' },
        { id: 'differentes', label: 'Des villes différentes' },
        { id: 'quartier', label: 'Le même quartier' },
        { id: 'loin', label: 'Très loin l’un de l’autre' },
      ],
    },
    {
      id: 'premier-nouvel-an',
      type: 'text',
      text: 'Où a-t-on passé notre premier Nouvel An ensemble ?',
    },
    {
      id: 'rituel-debut',
      type: 'text',
      text: 'Un rituel qu’on avait à nos débuts ?',
    },
    {
      id: 'plus-beau-souvenir',
      type: 'text',
      text: 'Notre plus beau souvenir ensemble, en un mot ?',
    },
    {
      id: 'ville-premier-chez-nous',
      type: 'text',
      text: 'La ville de notre premier « chez-nous » ?',
    },
    {
      id: 'stress-belle-famille',
      type: 'who',
      text: 'Qui a le plus stressé de rencontrer la belle-famille ?',
    },
    {
      id: 'premier-fou-rire',
      type: 'text',
      text: 'Le sujet de notre premier grand fou rire ?',
    },
    {
      id: 'objet-fetiche',
      type: 'text',
      text: 'Un objet qui symbolise notre histoire ?',
    },
    {
      id: 'premier-bebe',
      type: 'mcq',
      text: 'Notre premier « bébé » ensemble ?',
      options: [
        { id: 'animal', label: 'Un animal' },
        { id: 'plante', label: 'Une plante' },
        { id: 'meuble', label: 'Un meuble monté à deux' },
        { id: 'voyage', label: 'Un voyage' },
      ],
    },
    {
      id: 'osé-numero',
      type: 'who',
      text: 'Qui a osé demander le numéro de l’autre ?',
    },
    {
      id: 'lieu-officiel',
      type: 'text',
      text: 'L’endroit où c’est devenu « officiel » ?',
    },
    {
      id: 'duree-premier-voyage',
      type: 'mcq',
      text: 'Notre premier voyage a duré…',
      options: [
        { id: 'weekend', label: 'Un week-end' },
        { id: 'semaine', label: 'Une semaine' },
        { id: 'deux-semaines', label: 'Deux semaines' },
        { id: 'plus', label: 'Plus encore' },
      ],
    },
    {
      id: 'saison-plus-beau-souvenir',
      type: 'mcq',
      text: 'La saison de notre plus beau souvenir ?',
      options: [
        { id: 'printemps', label: '🌸 Printemps' },
        { id: 'ete', label: '☀️ Été' },
        { id: 'automne', label: '🍂 Automne' },
        { id: 'hiver', label: '❄️ Hiver' },
      ],
    },
    {
      id: 'chanson-premiere-danse',
      type: 'text',
      text: 'La chanson de notre première danse (ou celle qu’on choisirait) ?',
    },
    {
      id: 'anecdote-rencontre',
      type: 'text',
      text: 'Un mot qui résume l’anecdote de notre rencontre ?',
    },
    {
      id: 'moment-declic',
      type: 'text',
      text: 'Le moment où on a su que c’était sérieux, en un mot ?',
    },
  ],
}
