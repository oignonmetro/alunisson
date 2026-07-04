import { useState } from 'react'
import { computeResults, compatibilityMessage } from '../lib/gameLogic.js'
import { labelForValue, playerUids, playerName } from '../lib/players.js'

export default function Results({ uid, game }) {
  const { game: data, replay, leaveGame, isHost, error, setError } = game
  const { matchCount, total, pct, details } = computeResults(data)
  const msg = compatibilityMessage(pct)
  const uids = playerUids(data)
  const [busy, setBusy] = useState(false)

  async function handleReplay() {
    setBusy(true)
    setError(null)
    try { await replay() } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <div className="result-hero">
        <div className="result-emoji">{msg.emoji}</div>
        <div className="score-big">{matchCount}<span className="score-total">/{total}</span></div>
        <div className="gauge"><div className="gauge-fill" style={{ width: `${pct}%` }} /></div>
        <div className="pct">{pct}% de compatibilité</div>
        <h2 className="result-title">{msg.title}</h2>
        <p className="muted">{msg.text}</p>
      </div>

      <div className="recap">
        <h3 className="section-title">Récapitulatif</h3>
        {details.map((d) => (
          <div key={d.index} className={'recap-row ' + (d.counted ? 'ok' : 'ko')}>
            <div className="recap-q">
              <span className="recap-mark">{d.counted ? '✅' : '❌'}</span>
              {d.question.text}
            </div>
            <div className="recap-answers">
              {uids.map((u) => (
                <span key={u} className="recap-a">
                  <b>{playerName(data, u)}:</b> {labelForValue(d.question, data, d.answers?.[u]?.value)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="stack">
        {isHost ? (
          <button className="btn btn-primary" disabled={busy} onClick={handleReplay}>
            {busy ? '…' : 'Rejouer 🔁'}
          </button>
        ) : (
          <p className="muted center tiny">L’hôte peut relancer une partie.</p>
        )}
        <button className="btn btn-link" onClick={leaveGame}>Quitter</button>
      </div>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
