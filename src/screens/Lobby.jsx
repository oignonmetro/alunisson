import { useState } from 'react'
import { PACKS, PACKS_BY_ID, friendsCount } from '../data/packs/index.js'
import { buildQuestions } from '../lib/gameLogic.js'
import { playerUids, playerName, TEAM_META } from '../lib/players.js'

export default function Lobby({ uid, game }) {
  const { code, game: data, isHost, startGame, setTeam, leaveGame, error, setError } = game
  const [packs, setPacks] = useState(['gouts'])
  const [audience, setAudience] = useState('couple')
  const [busy, setBusy] = useState(false)

  const uids = playerUids(data)
  const n = uids.length
  const teamsMode = n === 4 // le choix d'équipe ne concerne que le mode à 4
  const countA = uids.filter((u) => data.players[u].team === 'A').length
  const countB = uids.filter((u) => data.players[u].team === 'B').length
  const myTeam = data.players[uid]?.team
  const balanced = countA === 2 && countB === 2
  const available = buildQuestions(packs, 999, PACKS_BY_ID, undefined, audience).length
  const needed = n === 3 ? 9 : 7
  const enoughQuestions = available >= needed
  const canStart = (n === 2 || n === 3 || (n === 4 && balanced)) && enoughQuestions

  function togglePack(id) {
    setPacks((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function handleTeam(t) {
    setError(null)
    try {
      await setTeam(myTeam === t ? null : t)
    } catch (e) {
      setError(e)
    }
  }

  async function handleStart() {
    setBusy(true)
    setError(null)
    try {
      await startGame(packs, audience)
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

  let startLabel = 'Démarrer la partie'
  if (busy) startLabel = 'Lancement…'
  else if (n < 2) startLabel = 'En attente de joueurs…'
  else if (!enoughQuestions) startLabel = `Pas assez de questions (${available}/${needed})`
  else if (n === 3) startLabel = 'Démarrer (mode à 3)'
  else if (n === 4 && !balanced) startLabel = 'Formez 2 équipes de 2'
  else if (n === 4) startLabel = 'Démarrer (2 équipes)'

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
        <h3 className="card-title">Joueurs ({n})</h3>
        <div className="list">
          {uids.map((u) => {
            const t = data.players[u].team
            const tags = [data.hostUid === u && 'hôte', u === uid && 'toi'].filter(Boolean)
            return (
              <div key={u} className="list-row player-line">
                <span>
                  {playerName(data, u)}
                  {tags.length > 0 && <span className="muted"> · {tags.join(', ')}</span>}
                </span>
                {t && (
                  <span className="team-tag" style={{ color: TEAM_META[t].color }}>
                    {TEAM_META[t].name}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {teamsMode && (
          <div className="stack">
            <span className="muted tiny">Choisis ton équipe</span>
            <div className="team-buttons">
              {['A', 'B'].map((t) => {
                const count = t === 'A' ? countA : countB
                const full = count >= 2 && myTeam !== t
                return (
                  <button
                    key={t}
                    className={'team-btn' + (myTeam === t ? ' active' : '')}
                    style={myTeam === t ? { borderColor: TEAM_META[t].color, color: TEAM_META[t].color } : undefined}
                    disabled={full}
                    onClick={() => handleTeam(t)}
                  >
                    {TEAM_META[t].name} ({count}/2)
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {isHost ? (
        <div className="card stack">
          <h3 className="card-title">Avec qui joue-t-on ?</h3>
          <div className="team-buttons">
            {[
              { id: 'couple', label: 'En couple' },
              { id: 'amis', label: 'Entre amis' },
            ].map((a) => (
              <button
                key={a.id}
                className={'team-btn' + (audience === a.id ? ' active' : '')}
                style={audience === a.id ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : undefined}
                onClick={() => setAudience(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="muted tiny">
            {audience === 'amis'
              ? 'Seules les questions neutres (goûts, personnalité, habitudes) sont posées.'
              : 'Toutes les questions, y compris celles sur votre couple.'}
          </p>

          <h3 className="card-title">Choisir les packs de questions</h3>
          <div className="list">
            {PACKS.map((p) => {
              const count = audience === 'amis' ? friendsCount(p) : p.questions.length
              return (
                <button
                  key={p.id}
                  className={'list-row selectable' + (packs.includes(p.id) ? ' selected' : '')}
                  onClick={() => togglePack(p.id)}
                  disabled={audience === 'amis' && count === 0}
                >
                  {p.name} <span className="muted">· {count} questions{audience === 'amis' ? ' amis' : ''}</span>
                </button>
              )
            })}
          </div>

          {packs.length > 0 && available < needed && (
            <p className="muted tiny">Seulement {available} question{available > 1 ? 's' : ''} avec cette sélection — il en faut {needed}. Ajoute un pack{audience === 'amis' ? ' ou repasse « En couple »' : ''}.</p>
          )}

          <button
            className="btn btn-primary"
            disabled={busy || !canStart || packs.length === 0}
            onClick={handleStart}
          >
            {startLabel}
          </button>
        </div>
      ) : (
        <p className="muted center">L’hôte choisit les packs de questions…<br />Prépare-toi !</p>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
