import { useState } from 'react'
import { labelForValue, playerName, teamsOf, TEAM_META } from '../lib/players.js'
import { computeResults } from '../lib/gameLogic.js'

export default function Reveal({ uid, game }) {
  const { game: data, setOverride, nextQuestion, leaveGame, error, setError } = game
  const idx = data.currentIndex
  const total = data.questions.length
  const desc = data.questions[idx]
  const round = data.rounds?.[idx] || {}
  const isLast = idx + 1 >= total

  const res = computeResults(data)
  const teams = teamsOf(data)
  const detail = res.details[idx] || {}
  const myOverride = Boolean(round.overrides?.[uid])
  const [busy, setBusy] = useState(false)

  async function act(fn) {
    setBusy(true); setError(null)
    try { await fn() } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn btn-link" onClick={leaveGame}>← Quitter</button>
        <span />
      </div>

      <div className="q-count">Question {idx + 1} / {total}</div>

      {res.mode === 'teams' && (
        <div className="scoreboard">
          {res.teams.map((t) => (
            <div key={t.id} className="score-cell">
              <span className="score-team" style={{ color: TEAM_META[t.id].color }}>{TEAM_META[t.id].name}</span>
              <span className="score-pts">{t.points}</span>
            </div>
          ))}
        </div>
      )}

      {desc.kind === 'custom' ? (
        <CustomReveal data={data} detail={detail} />
      ) : (
        <StandardReveal
          uid={uid} data={data} question={desc.q} round={round} teams={teams} detail={detail}
          mode={res.mode} myOverride={myOverride} busy={busy}
          onOverride={() => act(setOverride)}
        />
      )}

      <button className="btn btn-primary" disabled={busy} onClick={() => act(nextQuestion)}>
        {isLast ? 'Voir les résultats 🎊' : 'Question suivante →'}
      </button>
      <p className="muted tiny center">N’importe qui peut passer à la suite.</p>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

/* ---------- Révélation standard ---------- */
function StandardReveal({ uid, data, question, round, teams, detail, mode, myOverride, busy, onOverride }) {
  return (
    <>
      <div className="card question-card">
        <h2 className="q-text small">{question.text}</h2>
      </div>

      {teams.map((team) => {
        const counted = detail.perTeam?.[team.id]?.counted
        const partial = detail.perTeam?.[team.id]?.partial
        const earned = detail.perTeam?.[team.id]?.points || 0
        const autoMatch = round.teamMatch?.[team.id] === true
        const isMine = team.uids.includes(uid)
        const canRattrapage = question.type === 'text' && !autoMatch && !counted

        return (
          <div key={team.id} className="team-result" style={mode === 'teams' ? { borderColor: team.color } : undefined}>
            {mode === 'teams' && <div className="team-head" style={{ color: team.color }}>{team.name}</div>}
            <div className={'verdict small ' + (counted ? 'match' : partial ? 'partial' : 'nomatch')}>
              {counted ? '✅ En accord' : partial ? '🤏 Presque en accord' : '❌ Réponses différentes'}
              {(counted || partial) && <span className="verdict-points"> +{earned}</span>}
            </div>
            <div className="answers">
              {team.uids.map((u) => (
                <div key={u} className="answer-row">
                  <span className="answer-name">{playerName(data, u)}{u === uid ? ' (toi)' : ''}</span>
                  <span className="answer-value">{labelForValue(question, data, round.answers?.[u]?.value)}</span>
                </div>
              ))}
            </div>

            {canRattrapage && (
              <div className="rattrapage stack">
                <div className="rattrapage-status">
                  {team.uids.map((u) => (
                    <span key={u} className={round.overrides?.[u] ? 'ok' : ''}>
                      {round.overrides?.[u] ? '✅' : '⬜'} {playerName(data, u)}{u === uid ? ' (toi)' : ''}
                    </span>
                  ))}
                </div>
                {isMine && !myOverride && (
                  <button className="btn btn-ghost" disabled={busy} onClick={onOverride}>Ça compte quand même 🤝</button>
                )}
                {isMine && myOverride && <p className="muted tiny center">En attente de la validation de ton binôme…</p>}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

/* ---------- Révélation perso (2 slots) ---------- */
function CustomReveal({ data, detail }) {
  return (
    <>
      <div className="q-count muted tiny">Manche spéciale · questions personnalisées (5 pts)</div>
      {['A', 'B'].map((key) => {
        const s = detail.slots?.[key]
        if (!s) return null
        const responderId = s.responder
        const returned = s.returned === true
        return (
          <div key={key} className="team-result" style={{ borderColor: TEAM_META[key].color }}>
            <div className="team-head" style={{ color: TEAM_META[key].color }}>
              Défi pour {TEAM_META[key].name}
            </div>
            <p className="muted tiny">« {s.desc.text} » — par {playerName(data, s.desc.author)}</p>
            {returned && (
              <p className="muted tiny">↩️ Retournée → répondue par {responderId ? TEAM_META[responderId].name : '—'}</p>
            )}
            <div className={'verdict small ' + (s.matched ? 'match' : 'nomatch')}>
              {s.matched ? '✅ En accord' : '❌ Pas d’accord'}
              <span className="verdict-points"> +{s.points}</span>
              {responderId && <span className="muted tiny"> ({TEAM_META[responderId].name})</span>}
            </div>
            <div className="answers">
              {Object.entries(s.answers).map(([u, a]) => (
                <div key={u} className="answer-row">
                  <span className="answer-name">{playerName(data, u)}</span>
                  <span className="answer-value">{a?.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
