import { useState } from 'react'
import { optionsFor, teamOfPlayer, playerName, playerUids, labelForValue, TEAM_META } from '../lib/players.js'
import { slotResponder, trioGuessers } from '../lib/gameLogic.js'
import { PACKS_BY_ID } from '../data/packs/index.js'

export default function Question({ uid, game }) {
  const { game: data } = game
  const idx = data.currentIndex
  const desc = data.questions[idx]

  if (desc?.kind === 'custom') {
    return <CustomQuestion uid={uid} game={game} desc={desc} idx={idx} />
  }
  if (desc?.kind === 'trio') {
    return <TrioGuessQuestion uid={uid} game={game} desc={desc} idx={idx} />
  }
  return <StandardQuestion uid={uid} game={game} desc={desc} idx={idx} />
}

function Topbar({ leaveGame, idx, total }) {
  return (
    <>
      <div className="topbar">
        <button className="btn btn-link" onClick={leaveGame}>← Quitter</button>
        <span />
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${(idx / total) * 100}%` }} />
      </div>
      <div className="q-count">Question {idx + 1} / {total}</div>
    </>
  )
}

/* ---------- Manche standard (packs) ---------- */
function StandardQuestion({ uid, game, desc, idx }) {
  const { game: data, submitAnswer, leaveGame, error, setError } = game
  const total = data.questions.length
  const question = desc.q
  const round = data.rounds?.[idx]
  const submitted = Boolean(round?.answers?.[uid]?.submitted)

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
    try { await submitAnswer(isText ? text.trim() : choice) } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <Topbar leaveGame={leaveGame} idx={idx} total={total} />

      <div className="card question-card">
        <div className="q-pack">{packLabel(question)}</div>
        <h2 className="q-text">{question.text}</h2>
      </div>

      {submitted ? (
        <Waiting />
      ) : (
        <div className="stack">
          {isText ? (
            <input
              className="text-answer" autoFocus value={text} maxLength={60} placeholder="Ta réponse…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
            />
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
            {busy ? 'Envoi…' : 'Valider ma réponse'}
          </button>
          <p className="muted tiny center">🤫 Réponds sans regarder l’écran de l’autre !</p>
        </div>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

/* ---------- Manche perso (5 pts, question de l'équipe adverse) ---------- */
function CustomQuestion({ uid, game, desc, idx }) {
  const { game: data, decideSlot, submitAnswer, leaveGame, error, setError } = game
  const total = data.questions.length
  const round = data.rounds?.[idx]
  const myTeam = teamOfPlayer(data, uid)
  const mySlotKey = myTeam?.id
  const mySlot = round?.slots?.[mySlotKey]
  const decisionPending = !mySlot || mySlot.returned == null

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  // Slots que ce joueur doit répondre (son équipe est répondante et pas encore soumis).
  const tasks = ['A', 'B'].flatMap((key) => {
    const s = round?.slots?.[key]
    if (!s || s.returned == null) return []
    if (slotResponder(s, key) !== myTeam?.id) return []
    if (s.answers?.[uid]?.submitted) return []
    return [{ key, text: desc.slots[key].text, author: desc.slots[key].author }]
  })

  async function decide(returned) {
    setBusy(true); setError(null)
    try { await decideSlot(mySlotKey, returned) } catch (e) { setError(e) } finally { setBusy(false) }
  }

  async function answer() {
    if (!text.trim()) return
    setBusy(true); setError(null)
    try { await submitAnswer(text.trim(), tasks[0].key); setText('') } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <Topbar leaveGame={leaveGame} idx={idx} total={total} />

      {decisionPending ? (
        <>
          <div className="card question-card custom">
            <div className="q-pack pts5">❓ Question de l’équipe adverse · 5 pts</div>
            <h2 className="q-text">{desc.slots[mySlotKey].text}</h2>
            <p className="muted tiny">Écrite par {playerName(data, desc.slots[mySlotKey].author)}</p>
          </div>
          <div className="stack">
            <button className="btn btn-primary" disabled={busy} onClick={() => decide(false)}>Répondre (5 pts)</button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => decide(true)}>Retourner la question 🔄</button>
            <p className="muted tiny center">Si tu retournes, c’est l’équipe adverse qui tente de gagner les 5 pts.</p>
          </div>
        </>
      ) : tasks.length > 0 ? (
        <>
          <div className="card question-card custom">
            <div className="q-pack pts5">
              {mySlotKey !== tasks[0].key ? '↩️ Question retournée · 5 pts' : '❓ Question adverse · 5 pts'}
            </div>
            <h2 className="q-text">{tasks[0].text}</h2>
          </div>
          <div className="stack">
            <input
              className="text-answer" autoFocus value={text} maxLength={60} placeholder="Ta réponse…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && text.trim() && answer()}
            />
            <button className="btn btn-primary" disabled={!text.trim() || busy} onClick={answer}>
              {busy ? 'Envoi…' : 'Valider ma réponse'}
            </button>
            <p className="muted tiny center">🤫 Ton binôme doit répondre pareil pour marquer les 5 pts.</p>
          </div>
        </>
      ) : (
        <Waiting />
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

/* ---------- Manche trio (phase 2 : deviner la réponse de la cible) ---------- */
function TrioGuessQuestion({ uid, game, desc, idx }) {
  const { game: data, submitAnswer, leaveGame, error, setError } = game
  const total = data.questions.length
  const question = desc.q
  const round = data.rounds?.[idx]
  const target = desc.target
  const isTarget = target === uid
  const guessers = trioGuessers(playerUids(data), target)
  const partnerUid = guessers.find((u) => u !== uid)

  const myGuess = round?.guesses?.[uid]?.value
  const partnerGuess = round?.guesses?.[partnerUid]?.value
  const partnerSubmitted = Boolean(round?.guesses?.[partnerUid]?.submitted)

  const isText = question.type === 'text'
  const options = optionsFor(question, data)
  const [choice, setChoice] = useState(isText ? '' : (myGuess ?? ''))
  const [text, setText] = useState(isText ? (myGuess ?? '') : '')
  const [busy, setBusy] = useState(false)
  const canSubmit = isText ? text.trim().length > 0 : choice !== ''

  async function handleSubmit() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try { await submitAnswer(isText ? text.trim() : choice) } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="screen">
      <Topbar leaveGame={leaveGame} idx={idx} total={total} />

      <div className="card question-card">
        <div className="q-pack">{isTarget ? 'On devine TA réponse' : `Devinez la réponse de ${playerName(data, target)}`}</div>
        <h2 className="q-text">{question.text}</h2>
      </div>

      {isTarget ? (
        <div className="waiting stack center">
          <div className="spinner" />
          <p>Ta réponse : <b>{labelForValue(question, data, round?.targetAnswer?.value)}</b></p>
          <p className="muted">{othersNames(data, uid)} essaient de se mettre d’accord…</p>
        </div>
      ) : (
        <div className="stack">
          {isText ? (
            <input
              className="text-answer" autoFocus value={text} maxLength={60} placeholder="Votre réponse commune…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
            />
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
            {busy ? 'Envoi…' : myGuess != null ? 'Modifier notre réponse' : 'Valider notre réponse'}
          </button>

          <div className="rattrapage-status">
            <span className={myGuess != null ? 'ok' : ''}>
              {myGuess != null ? '✅' : '⬜'} toi{myGuess != null ? ` : ${labelForValue(question, data, myGuess)}` : ''}
            </span>
            <span className={partnerSubmitted ? 'ok' : ''}>
              {partnerSubmitted ? '✅' : '⬜'} {playerName(data, partnerUid)}{partnerSubmitted ? ` : ${labelForValue(question, data, partnerGuess)}` : ''}
            </span>
          </div>
          {myGuess != null && partnerSubmitted && (
            <p className="muted tiny center">Vous n’avez pas encore la même réponse — mettez-vous d’accord 🤝</p>
          )}
          <p className="muted tiny center">Il faut répondre <b>la même chose</b> tous les deux pour valider.</p>
        </div>
      )}

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}

function othersNames(data, uid) {
  const others = playerUids(data).filter((u) => u !== uid)
  return others.map((u) => playerName(data, u)).join(' et ')
}

function Waiting() {
  return (
    <div className="waiting stack center">
      <div className="spinner" />
      <p>Réponse envoyée ✅</p>
      <p className="muted">En attente des autres joueurs…</p>
    </div>
  )
}

function packLabel(question) {
  const pack = PACKS_BY_ID[question.packId]
  return pack ? `${pack.emoji} ${pack.name}` : ''
}
