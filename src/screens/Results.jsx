import { useState } from 'react'
import { computeResults } from '../lib/gameLogic.js'
import { labelForValue, playerName, teamsOf, TEAM_META } from '../lib/players.js'

export default function Results({ uid, game }) {
  const { game: data, replay, leaveGame, isHost, error, setError } = game
  const res = computeResults(data)
  const teams = teamsOf(data)
  const [busy, setBusy] = useState(false)

  async function handleReplay() {
    setBusy(true)
    setError(null)
    try { await replay() } catch (e) { setError(e) } finally { setBusy(false) }
  }

  const isTeams = res.mode === 'teams'

  return (
    <div className="screen">
      {isTeams ? (
        <div className="result-hero stack">
          <div className="winner-banner">
            {res.winnerTeamId
              ? <>🏆 {TEAM_META[res.winnerTeamId].name} l’emporte !</>
              : <>🤝 Égalité parfaite !</>}
          </div>
          <div className="team-scores">
            {res.teams.map((t) => (
              <div
                key={t.id}
                className={'team-score-card' + (res.winnerTeamId === t.id ? ' winner' : '')}
                style={{ borderColor: TEAM_META[t.id].color }}
              >
                <span className="team-score-name" style={{ color: TEAM_META[t.id].color }}>{TEAM_META[t.id].name}</span>
                <span className="score-big">{t.points}</span>
                <span className="muted tiny">{t.matchCount}/{res.total} en accord</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="result-hero">
          <div className="score-big">{res.teams[0].points}<span className="score-total">/{res.maxPoints} pts</span></div>
          <p className="muted tiny">{res.teams[0].matchCount}/{res.total} questions en accord</p>
          <div className="gauge"><div className="gauge-fill" style={{ width: `${res.maxPoints ? (res.teams[0].points / res.maxPoints) * 100 : 0}%` }} /></div>
        </div>
      )}

      <div className="recap">
        <h3 className="section-title">Récapitulatif</h3>
        {res.details.map((d) => (
          d.kind === 'custom' ? (
            <div key={d.index} className="recap-row">
              <div className="recap-q">Manche spéciale — questions personnalisées (5 pts)</div>
              <div className="recap-teams">
                {['A', 'B'].map((key) => {
                  const s = d.slots[key]
                  return (
                    <div key={key} className={'recap-team ' + (s.matched ? 'ok' : 'ko')}>
                      <div className="recap-team-head">
                        <span className="recap-mark">{s.matched ? '✅' : '❌'}</span>
                        <span style={{ color: TEAM_META[key].color }}>Défi pour {TEAM_META[key].name}</span>
                        <span className="recap-points">{s.matched ? `+${s.points}` : '+0'}</span>
                      </div>
                      <div className="recap-answers">
                        <span className="recap-a">« {s.desc.text} »{s.returned ? ' ↩️ retournée' : ''}</span>
                        {Object.entries(s.answers).map(([u, a]) => (
                          <span key={u} className="recap-a"><b>{playerName(data, u)}:</b> {a?.value || '—'}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div key={d.index} className="recap-row">
              <div className="recap-q">{d.question.text}</div>
              <div className="recap-teams">
                {teams.map((team) => {
                  const pt = d.perTeam[team.id] || {}
                  return (
                    <div key={team.id} className={'recap-team ' + (pt.counted ? 'ok' : 'ko')}>
                      <div className="recap-team-head">
                        <span className="recap-mark">{pt.counted ? '✅' : '❌'}</span>
                        {isTeams && <span style={{ color: TEAM_META[team.id].color }}>{team.name}</span>}
                        <span className="recap-points">{pt.counted ? `+${pt.points}` : '+0'}</span>
                      </div>
                      <div className="recap-answers">
                        {team.uids.map((u) => (
                          <span key={u} className="recap-a">
                            <b>{playerName(data, u)}:</b> {labelForValue(d.question, data, d.answers?.[u]?.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
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
