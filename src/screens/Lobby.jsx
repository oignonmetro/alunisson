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
        <span className="muted">Code de la partie</span>
        <button className="code-badge" onClick={copyCode} title="Copier">{code}</button>
        <span className="muted tiny">Partage ce code à ton binôme (touche pour copier)</span>
      </div>

      <div className="players-row">
        {uids.map((u) => (
          <div key={u} className={'player-chip' + (u === uid ? ' me' : '')}>
            <span className="dot" /> {playerName(data, u)}{u === uid ? ' (toi)' : ''}
          </div>
        ))}
        {!bothHere && <div className="player-chip waiting"><span className="dot pulse" /> En attente du 2e joueur…</div>}
      </div>

      {isHost ? (
        <div className="stack">
          <h3 className="section-title">Choisis vos packs de questions</h3>
          <div className="pack-grid">
            {PACKS.map((p) => (
              <button
                key={p.id}
                className={'pack-card' + (packs.includes(p.id) ? ' selected' : '')}
                onClick={() => togglePack(p.id)}
              >
                <span className="pack-name">{p.name}</span>
              </button>
            ))}
          </div>

          <h3 className="section-title">Nombre de questions</h3>
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
            {busy ? 'Lancement…' : bothHere ? 'Commencer 🎉' : 'En attente du 2e joueur…'}
          </button>
        </div>
      ) : (
        <p className="muted center">L’hôte choisit les packs de questions…<br />Prépare-toi !</p>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
