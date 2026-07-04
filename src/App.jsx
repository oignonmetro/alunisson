import { useAuth } from './hooks/useAuth.js'
import { useGame } from './hooks/useGame.js'
import { isFirebaseConfigured } from './firebase.js'
import Home from './screens/Home.jsx'
import Lobby from './screens/Lobby.jsx'
import Question from './screens/Question.jsx'
import Reveal from './screens/Reveal.jsx'
import Results from './screens/Results.jsx'
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
    return <Home uid={uid} game={g} />
  }

  if (game.status === 'lobby') {
    return <Lobby uid={uid} game={g} />
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
