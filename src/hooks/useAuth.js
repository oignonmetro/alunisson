// Authentification anonyme : chaque joueur reçoit un uid stable qui l'identifie
// dans la partie. Pas d'inscription, pas de mot de passe.

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase.js'

export function useAuth() {
  const [uid, setUid] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid)
      } else {
        signInAnonymously(auth).catch((e) => setError(e))
      }
    })
    return unsub
  }, [])

  return { uid, error, ready: Boolean(uid) }
}
