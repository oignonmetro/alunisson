import { useState } from 'react'
import { optionsFor, playerName, toggleWhoPick, whoPicksToValue } from '../lib/players.js'
import { PACKS_BY_ID } from '../data/packs/index.js'

// Phase 1 du mode trio : chaque joueur répond seul à SES 3 questions.
// Les deux autres tenteront ensuite de deviner ces réponses (phase 2).
export default function TrioAnswer({ uid, game }) {
  const { game: data, submitTargetAnswer, leaveGame, error, setError } = game

  // Les 3 questions dont ce joueur est la cible, dans l'ordre de la séquence.
  const mine = data.questions
    .map((desc, idx) => ({ desc, idx }))
    .filter(({ desc }) => desc.kind === 'trio' && desc.target === uid)

  const answeredCount = mine.filter(({ idx }) => data.rounds?.[idx]?.targetAnswer?.submitted).length
  const current = mine.find(({ idx }) => !data.rounds?.[idx]?.targetAnswer?.submitted)

  const totalDone = data.questions.filter((_, i) => data.rounds?.[i]?.targetAnswer?.submitted).length

  const [choice, setChoice] = useState('')
  const [picks, setPicks] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const question = current?.desc?.q
  const isText = question?.type === 'text'
  const isWho = question?.type === 'who'
  const options = question ? optionsFor(question, data) : []
  const canSubmit = isText ? text.trim().length > 0 : isWho ? picks.length > 0 : choice !== ''

  async function handleSubmit() {
    if (!canSubmit || !current) return
    setBusy(true)
    setError(null)
    try {
      const value = isText ? text.trim() : isWho ? whoPicksToValue(picks) : choice
      await submitTargetAnswer(current.idx, value)
      setChoice('')
      setPicks([])
      setText('')
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
        <span className="brand small">À l’unisson</span>
      </div>

      {current ? (
        <>
          <div className="q-count">Tes questions · {answeredCount + 1} / {mine.length}</div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${(answeredCount / mine.length) * 100}%` }} />
          </div>

          <div className="card question-card">
            <div className="q-pack">{packLabel(question)} · réponds pour toi</div>
            <h2 className="q-text">{question.text}</h2>
          </div>

          <div className="stack">
            {isText ? (
              <input
                className="text-answer" autoFocus value={text} maxLength={60} placeholder="Ta réponse…"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
              />
            ) : isWho ? (
              <div className="options">
                {options.map((o) => (
                  <button key={o.id} className={'option' + (picks.includes(o.id) ? ' selected' : '')} onClick={() => setPicks((p) => toggleWhoPick(p, o.id))}>
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="options">
                {options.map((o) => (
                  <button key={o.id} className={'option' + (choice === o.id ? ' selected' : '')} onClick={() => setChoice(o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-primary" disabled={!canSubmit || busy} onClick={handleSubmit}>
              {busy ? 'Envoi…' : 'Valider'}
            </button>
            {isWho && <p className="muted tiny center">Tu peux en choisir plusieurs.</p>}
            <p className="muted tiny center">🤫 Réponds sincèrement : {othersNames(data, uid)} devront deviner tes réponses !</p>
          </div>
        </>
      ) : (
        <div className="waiting stack center">
          <p>Tes 3 réponses sont enregistrées ✅</p>
          <p className="muted">En attente des autres… ({totalDone}/{data.questions.length})</p>
        </div>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

function othersNames(data, uid) {
  const others = Object.keys(data.players || {}).filter((u) => u !== uid)
  return others.map((u) => playerName(data, u)).join(' et ')
}

function packLabel(question) {
  const pack = PACKS_BY_ID[question?.packId]
  return pack ? `${pack.emoji} ${pack.name}` : ''
}
