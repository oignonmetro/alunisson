import { useState } from 'react'
import { PACKS } from '../data/packs/index.js'
import { buildQuestions } from '../lib/gameLogic.js'
import { PACKS_BY_ID } from '../data/packs/index.js'
import { playerUids, playerName } from '../lib/players.js'

const QUESTION_COUNTS = [5, 10, 15]

export default function Lobby({ uid, game }) {
  const { code, game: data, isHost, startGame, leaveGame, error, setError } = game
  const [packs, setPacks] = useState(['gouts'])
  const [count, setCount] = useState(10)
  const [busy, setBusy] = useState(false)

  const uids = playerUids(data)
  const bothHere = uids.length >= 2
  const available = buildQuestions(packs, 999, PACKS_BY_ID).length

  function togglePack(id) {
    setPacks((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function handleStart() {
    setBusy(true)
    setError(null)
    try {
      await startGame(packs, count)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
    } catch { /* clipboard indisponible, pas grave */ }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn btn-link" onClick={leaveGame}>← Quitter</button>
        <span className="brand small">À l’unisson</span>
      </div>

      <div className="card center stack">
        <span className="muted">Code de la salle</span>
        <button className="code-big" onClick={copyCode} title="Copier">{code}</button>
      </div>

      <div className="card stack">
        <h3 className="card-title">Joueurs ({uids.length})</h3>
        <div className="list">
          {uids.map((u) => (
            <div key={u} className="list-row">
              {playerName(data, u)}
              {(data.hostUid === u || u === uid) && (
                <span className="muted"> · {[data.hostUid === u && 'hôte', u === uid && 'toi'].filter(Boolean).join(', ')}</span>
              )}
            </div>
          ))}
          {!bothHere && <div className="list-row waiting">En attente du 2e joueur…</div>}
        </div>
      </div>

      {isHost ? (
        <div className="card stack">
          <h3 className="card-title">Choisir les packs de questions</h3>
          <div className="list">
            {PACKS.map((p) => (
              <button
                key={p.id}
                className={'list-row selectable' + (packs.includes(p.id) ? ' selected' : '')}
                onClick={() => togglePack(p.id)}
              >
                {p.name} <span className="muted">· {p.questions.length} questions</span>
              </button>
            ))}
          </div>

          <h3 className="card-title">Nombre de questions</h3>
          <div className="segmented">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                className={'seg' + (count === n ? ' active' : '')}
                onClick={() => setCount(n)}
                disabled={n > available && available > 0}
              >
                {n}
              </button>
            ))}
          </div>
          {available > 0 && count > available && (
            <p className="muted tiny">Seulement {available} questions dans les packs choisis — la partie en aura {available}.</p>
          )}

          <button
            className="btn btn-primary"
            disabled={busy || !bothHere || packs.length === 0}
            onClick={handleStart}
          >
            {busy ? 'Lancement…' : bothHere ? 'Démarrer la partie' : 'En attente du 2e joueur…'}
          </button>
        </div>
      ) : (
        <p className="muted center">L’hôte choisit les packs de questions…<br />Prépare-toi !</p>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
