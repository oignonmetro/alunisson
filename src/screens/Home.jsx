import { useState } from 'react'
import { sanitizeCode, isValidCode, CODE_LENGTH } from '../lib/gameCode.js'

const LAST_NAME_KEY = 'alunisson:lastName'

export default function Home({ game }) {
  const { createGame, joinGame, error, setError } = game
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(LAST_NAME_KEY) || ''
    } catch {
      return ''
    }
  })
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  function updateName(value) {
    setName(value)
    try {
      localStorage.setItem(LAST_NAME_KEY, value)
    } catch { /* stockage indisponible, pas grave */ }
  }

  async function handleCreate() {
    if (!name.trim()) return setError(new Error('Entre ton pseudo.'))
    setBusy(true)
    setError(null)
    try {
      await createGame(name)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    if (!name.trim()) return setError(new Error('Entre ton pseudo.'))
    if (!isValidCode(code)) return setError(new Error('Code à ' + CODE_LENGTH + ' lettres.'))
    setBusy(true)
    setError(null)
    try {
      await joinGame(sanitizeCode(code), name)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <div className="hero">
        <div className="brand">À l’unisson</div>
        <p className="tagline">Répondez chacun de votre côté. Marquez un point à chaque fois que vous pensez pareil.</p>
      </div>

      <div className="card">
        <label className="field">
          <span>Ton pseudo</span>
          <input
            autoFocus
            value={name}
            maxLength={20}
            onChange={(e) => updateName(e.target.value)}
          />
        </label>
      </div>

      <div className="card stack">
        <button className="btn btn-primary" disabled={busy} onClick={handleCreate}>
          {busy ? 'Création…' : 'Créer une partie'}
        </button>
      </div>

      <div className="card stack">
        <label className="field">
          <span>Rejoindre avec un code</span>
          <input
            className="code-input"
            value={code}
            onChange={(e) => setCode(sanitizeCode(e.target.value))}
            placeholder="Ex. ABCD"
            inputMode="text"
            autoCapitalize="characters"
          />
        </label>
        <button className="btn btn-ghost" disabled={busy} onClick={handleJoin}>
          {busy ? 'Connexion…' : 'Rejoindre'}
        </button>
      </div>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}
