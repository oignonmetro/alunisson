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
  ],
}
