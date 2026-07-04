import { useState } from 'react'
import { labelForValue, playerUids, playerName, otherUid } from '../lib/players.js'
import { isRoundCounted, computeResults } from '../lib/gameLogic.js'

export default function Reveal({ uid, game }) {
  const { game: data, setOverride, nextQuestion, error, setError } = game
  const idx = data.currentIndex
  const total = data.questions.length
  const question = data.questions[idx]
  const round = data.rounds?.[idx] || {}
  const uids = playerUids(data)
  const isLast = idx + 1 >= total

  const counted = isRoundCounted(round, question, uids)
  const autoMatch = round.autoMatch === true
  const canRattrapage = !autoMatch && question.type === 'text'
  const myOverride = Boolean(round.overrides?.[uid])
  const partner = otherUid(data, uid)
  const partnerOverride = Boolean(partner && round.overrides?.[partner])

  const { matchCount } = computeResults(data)
  const [busy, setBusy] = useState(false)

  async function act(fn) {
    setBusy(true)
    setError(null)
    try { await fn() } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <div className="q-count">Question {idx + 1} / {total} · <b>{matchCount}</b> en accord</div>

      <div className="card question-card">
        <h2 className="q-text small">{question.text}</h2>
      </div>

      <div className={'verdict ' + (counted ? 'match' : 'nomatch')}>
        {counted ? '✅ En accord !' : '❌ Réponses différentes'}
      </div>

      <div className="answers">
        {uids.map((u) => (
          <div key={u} className="answer-row">
            <span className="answer-name">{playerName(data, u)}{u === uid ? ' (toi)' : ''}</span>
            <span className="answer-value">{labelForValue(question, data, round.answers?.[u]?.value)}</span>
          </div>
        ))}
      </div>

      {canRattrapage && !counted && (
        <div className="card rattrapage stack">
          <p className="muted">Vous vouliez dire la même chose ? Validez le rattrapage <b>tous les deux</b> pour marquer le point.</p>
          <div className="rattrapage-status">
            <span className={myOverride ? 'ok' : ''}>{myOverride ? '✅' : '⬜'} Toi</span>
            <span className={partnerOverride ? 'ok' : ''}>{partnerOverride ? '✅' : '⬜'} {playerName(data, partner)}</span>
          </div>
          {!myOverride && (
            <button className="btn btn-ghost" disabled={busy} onClick={() => act(setOverride)}>
              Ça compte quand même 🤝
            </button>
          )}
          {myOverride && !partnerOverride && (
            <p className="muted tiny center">En attente de la validation de ton binôme…</p>
          )}
        </div>
      )}

      <button className="btn btn-primary" disabled={busy} onClick={() => act(nextQuestion)}>
        {isLast ? 'Voir nos résultats 🎊' : 'Question suivante →'}
      </button>
      <p className="muted tiny center">L’un ou l’autre peut passer à la suite.</p>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
