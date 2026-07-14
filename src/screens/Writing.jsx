import { useState } from 'react'
import { playerUids, teamOfPlayer, TEAM_META } from '../lib/players.js'

export default function Writing({ uid, game }) {
  const { game: data, submitPrompt, leaveGame, error, setError } = game
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const prompts = data.customPrompts || {}
  const submitted = Boolean(prompts[uid])
  const uids = playerUids(data)
  const doneCount = uids.filter((u) => prompts[u]).length
  const myTeam = teamOfPlayer(data, uid)
  const oppId = myTeam?.id === 'A' ? 'B' : 'A'

  async function handleSubmit() {
    if (!text.trim()) return setError(new Error('Écris une question.'))
    setBusy(true)
    setError(null)
    try {
      await submitPrompt(text)
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

      <div className="card question-card">
        <div className="q-pack">Manche spéciale</div>
        <h2 className="q-text">Piège l’équipe adverse !</h2>
        <p className="muted">
          Écris une question destinée à <b style={{ color: TEAM_META[oppId].color }}>{TEAM_META[oppId].name}</b>.
          Ses deux membres devront y répondre <b>la même chose</b> pour marquer <b>5 points</b>.
        </p>
      </div>

      {submitted ? (
        <div className="waiting stack center">
          <p>Question envoyée ✅</p>
          <p className="muted">En attente des autres… ({doneCount}/{uids.length})</p>
        </div>
      ) : (
        <div className="stack">
          <input
            className="text-answer"
            autoFocus
            value={text}
            maxLength={90}
            placeholder="Ex. Notre pire souvenir de vacances ?"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && text.trim() && handleSubmit()}
          />
          <button className="btn btn-primary" disabled={!text.trim() || busy} onClick={handleSubmit}>
            {busy ? 'Envoi…' : 'Envoyer ma question'}
          </button>
          <p className="muted tiny center">Choisis une question à laquelle l’équipe adverse aura du mal à se synchroniser 😈</p>
        </div>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
