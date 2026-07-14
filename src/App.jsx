import { useAuth } from './hooks/useAuth.js'
import { useGame } from './hooks/useGame.js'
import { isFirebaseConfigured } from './firebase.js'
import { playerUids } from './lib/players.js'
import Home from './screens/Home.jsx'
import Lobby from './screens/Lobby.jsx'
import Writing from './screens/Writing.jsx'
import TrioAnswer from './screens/TrioAnswer.jsx'
import Question from './screens/Question.jsx'
import Reveal from './screens/Reveal.jsx'
import Results from './screens/Results.jsx'
import PartnerLeft from './screens/PartnerLeft.jsx'
import NotConfigured from './screens/NotConfigured.jsx'

export default function App() {
  const configured = isFirebaseConfigured()
  const { uid, ready } = useAuth()
  const g = useGame(uid)

  if (!configured) {
    return <NotConfigured />
  }

  if (!ready) {
    return (
      <div className="screen center">
        <div className="brand">À l’unisson</div>
        <p className="muted">Connexion…</p>
      </div>
    )
  }

  const { game } = g

  if (!game) {
    // Une room persistée (localStorage) est en cours de reconnexion : on
    // attend la première réponse Firestore plutôt que d'afficher l'accueil,
    // pour éviter un flash de retour à l'écran de saisie du code.
    if (g.loading) {
      return (
        <div className="screen center">
          <div className="brand">À l’unisson</div>
          <p className="muted">Reconnexion à la partie…</p>
        </div>
      )
    }
    return <Home uid={uid} game={g} />
  }

  if (game.status === 'lobby') {
    return <Lobby uid={uid} game={g} />
  }

  if (game.status === 'writing') {
    return <Writing uid={uid} game={g} />
  }

  if (game.status === 'answering') {
    return <TrioAnswer uid={uid} game={g} />
  }

  // La partie était en cours (ou terminée) et un joueur manque à l'appel :
  // éviter de laisser les autres attendre indéfiniment.
  const expected = game.config?.playerCount || 2
  if (playerUids(game).length < expected) {
    return <PartnerLeft game={g} />
  }

  if (game.status === 'finished') {
    return <Results uid={uid} game={g} />
  }

  // status === 'playing'
  const round = game.rounds?.[game.currentIndex]
  if (round?.revealed) {
    return <Reveal uid={uid} game={g} />
  }
  return <Question uid={uid} game={g} />
}
