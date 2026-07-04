// Pack « Goûts & préférences » — surtout des QCM légers.
// Types : mcq (options fixes), who (qui de nous deux), text (réponse libre).

export default {
  id: 'gouts',
  name: 'Goûts & préférences',
  emoji: '😋',
  description: 'Vos envies, vos préférences, votre idée du plaisir à deux.',
  questions: [
    {
      id: 'soiree-ideale',
      type: 'mcq',
      text: 'Notre soirée idéale, c’est plutôt…',
      options: [
        { id: 'resto', label: 'Un bon resto' },
        { id: 'canape', label: 'Cinéma-canapé' },
        { id: 'amis', label: 'Soirée entre amis' },
        { id: 'impro', label: 'Une sortie improvisée' },
      ],
    },
    {
      id: 'plage-montagne',
      type: 'mcq',
      text: 'Pour s’évader, on choisit…',
      options: [
        { id: 'plage', label: '🏖️ La plage' },
        { id: 'montagne', label: '⛰️ La montagne' },
      ],
    },
    {
      id: 'repas-parfait',
      type: 'mcq',
      text: 'Le repas parfait à deux ?',
      options: [
        { id: 'maison', label: 'Fait-maison' },
        { id: 'gastro', label: 'Resto gastronomique' },
        { id: 'street', label: 'Street food' },
        { id: 'brunch', label: 'Brunch qui n’en finit pas' },
      ],
    },
    {
      id: 'plat-partage',
      type: 'text',
      text: 'Le plat qu’on adore partager ?',
    },
    {
      id: 'type-vacances',
      type: 'mcq',
      text: 'Nos vacances de rêve, c’est…',
      options: [
        { id: 'farniente', label: 'Farniente total' },
        { id: 'aventure', label: 'Aventure & sensations' },
        { id: 'culture', label: 'Découverte culturelle' },
        { id: 'gastro', label: 'Tour gastronomique' },
      ],
    },
    {
      id: 'serie',
      type: 'mcq',
      text: 'On regarde une série…',
      options: [
        { id: 'un-episode', label: 'Un épisode à la fois' },
        { id: 'binge', label: 'On enchaîne tout' },
        { id: 'chacun', label: 'Chacun de son côté' },
        { id: 'endort', label: 'On s’endort avant la fin' },
      ],
    },
    {
      id: 'boisson',
      type: 'mcq',
      text: 'La boisson de nos soirées ?',
      options: [
        { id: 'vin', label: '🍷 Vin' },
        { id: 'cocktail', label: '🍹 Cocktail' },
        { id: 'biere', label: '🍺 Bière' },
        { id: 'the', label: '🍵 Thé / tisane' },
      ],
    },
    {
      id: 'chanson',
      type: 'text',
      text: 'S’il fallait citer « notre » chanson, ce serait ?',
    },
    {
      id: 'dimanche',
      type: 'mcq',
      text: 'Un dimanche parfait, c’est…',
      options: [
        { id: 'grasse-mat', label: 'Grasse mat’ & rien faire' },
        { id: 'nature', label: 'Balade en nature' },
        { id: 'culture', label: 'Musée ou expo' },
        { id: 'cuisine', label: 'Cuisine & amis' },
      ],
    },
    {
      id: 'valise',
      type: 'who',
      text: 'Qui boucle sa valise à la dernière minute ?',
    },
    {
      id: 'resto-style',
      type: 'mcq',
      text: 'Notre cuisine préférée au resto ?',
      options: [
        { id: 'italien', label: '🇮🇹 Italien' },
        { id: 'japonais', label: '🍣 Japonais' },
        { id: 'francais', label: '🥖 Français' },
        { id: 'monde', label: '🌍 Cuisine du monde' },
      ],
    },
    {
      id: 'petit-dej',
      type: 'mcq',
      text: 'Au petit-déj, on est plutôt…',
      options: [
        { id: 'sucre', label: 'Sucré' },
        { id: 'sale', label: 'Salé' },
        { id: 'les-deux', label: 'Les deux !' },
        { id: 'aucun', label: 'On saute le petit-déj' },
      ],
    },
    {
      id: 'destination-reve',
      type: 'text',
      text: 'La destination de rêve qu’on note sur notre liste ?',
    },
  ],
}
