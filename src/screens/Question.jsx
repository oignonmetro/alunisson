import { useState } from 'react'
import { optionsFor, teamOfPlayer } from '../lib/players.js'
import { PACKS_BY_ID } from '../data/packs/index.js'

export default function Question({ uid, game }) {
  const { game: data, submitAnswer, leaveGame, error, setError } = game
  const idx = data.currentIndex
  const total = data.questions.length
  const question = data.questions[idx]
  const round = data.rounds?.[idx]
  const mine = round?.answers?.[uid]
  const submitted = Boolean(mine?.submitted)

  const [choice, setChoice] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const myTeam = teamOfPlayer(data, uid)
  const options = optionsFor(question, data, myTeam?.uids)
  const isText = question.type === 'text'
  const canSubmit = isText ? text.trim().length > 0 : choice !== ''

  async function handleSubmit() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      await submitAnswer(isText ? text.trim() : choice)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn btn-link" onClick={leaveGame}>← Quitter</button>
        <span />
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${((idx) / total) * 100}%` }} />
      </div>
      <div className="q-count">Question {idx + 1} / {total}</div>

      <div className="card question-card">
        <div className="q-pack">{packLabel(question)}</div>
        <h2 className="q-text">{question.text}</h2>
      </div>

      {submitted ? (
        <div className="waiting stack center">
          <div className="spinner" />
          <p>Réponse envoyée ✅</p>
          <p className="muted">En attente des autres joueurs…</p>
        </div>
      ) : (
        <div className="stack">
          {isText ? (
            <input
              className="text-answer"
              autoFocus
              value={text}
              maxLength={60}
              placeholder="Ta réponse…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
            />
          ) : (
            <div className="options">
              {options.map((o) => (
                <button
                  key={o.id}
                  className={'option' + (choice === o.id ? ' selected' : '')}
                  onClick={() => setChoice(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-primary" disabled={!canSubmit || busy} onClick={handleSubmit}>
            {busy ? 'Envoi…' : 'Valider ma réponse'}
          </button>
          <p className="muted tiny center">🤫 Réponds sans regarder l’écran de l’autre !</p>
        </div>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

function packLabel(question) {
  const pack = PACKS_BY_ID[question.packId]
  return pack ? `${pack.emoji} ${pack.name}` : ''
}
