// Gestion d'une partie en temps réel via Firestore.
//
// - Abonnement au document `games/{code}` (onSnapshot) → état `game` réactif.
// - Toutes les mutations passent par des transactions pour être robustes aux
//   accès concurrents des deux joueurs (soumission de réponse, avancement…).
// - Le calcul auto-match d'une manche est fait AU MOMENT où le 2e joueur
//   soumet sa réponse, dans la même transaction : n'importe quel client peut
//   déclencher la révélation, aucun besoin d'un « host » toujours connecté.

import { useCallback, useEffect, useState } from 'react'
import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { generateCode } from '../lib/gameCode.js'
import { buildQuestions, computeAutoMatch, allAnswered, gameTeams, QUESTIONS_PER_GAME } from '../lib/gameLogic.js'
import { PACKS_BY_ID } from '../data/packs/index.js'

const gameDoc = (code) => doc(db, 'games', code)

export function useGame(uid) {
  const [code, setCode] = useState(null)
  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)

  // Abonnement temps réel au document de partie.
  useEffect(() => {
    if (!code) {
      setGame(null)
      return
    }
    const unsub = onSnapshot(
      gameDoc(code),
      (snap) => setGame(snap.exists() ? snap.data() : null),
      (e) => setError(e),
    )
    return unsub
  }, [code])

  // Quitte la partie : retour immédiat à l'accueil côté local, et retrait du
  // document Firestore en tâche de fond (pour ne pas laisser le binôme
  // attendre indéfiniment une réponse ou un « suivant » qui ne viendra plus).
  const leaveGame = useCallback(() => {
    const leavingCode = code
    const leavingUid = uid
    setCode(null)
    setGame(null)
    setError(null)
    if (!leavingCode || !leavingUid) return
    runTransaction(db, async (tx) => {
      const ref = gameDoc(leavingCode)
      const snap = await tx.get(ref)
      if (!snap.exists()) return
      const data = snap.data()
      const remaining = Object.keys(data.players || {}).filter((u) => u !== leavingUid)
      if (remaining.length === 0) {
        tx.delete(ref)
        return
      }
      const update = { [`players.${leavingUid}`]: deleteField() }
      if (data.hostUid === leavingUid) {
        update.hostUid = remaining[0]
      }
      tx.update(ref, update)
    }).catch(() => {
      // Best-effort : le joueur a déjà quitté localement, un échec de nettoyage
      // côté serveur n'est pas bloquant pour lui.
    })
  }, [code, uid])

  // Crée une nouvelle partie et rejoint son propre salon en tant qu'hôte.
  const createGame = useCallback(
    async (name) => {
      if (!uid) throw new Error('Authentification en cours…')
      let newCode = null
      for (let i = 0; i < 12; i++) {
        const candidate = generateCode()
        const snap = await getDoc(gameDoc(candidate))
        if (!snap.exists()) {
          newCode = candidate
          break
        }
      }
      if (!newCode) throw new Error('Impossible de générer un code, réessayez.')
      await setDoc(gameDoc(newCode), {
        code: newCode,
        status: 'lobby',
        hostUid: uid,
        players: {
          [uid]: { name: name?.trim() || 'Joueur 1', isHost: true, connected: true, team: null, joinedAt: Date.now() },
        },
        config: { packs: [], questionCount: QUESTIONS_PER_GAME },
        questions: [],
        currentIndex: 0,
        rounds: {},
        matchCount: 0,
        createdAt: serverTimestamp(),
      })
      setCode(newCode)
      return newCode
    },
    [uid],
  )

  // Rejoint une partie existante (2e joueur).
  const joinGame = useCallback(
    async (rawCode, name) => {
      if (!uid) throw new Error('Authentification en cours…')
      const c = rawCode
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(c)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Aucune partie avec ce code.')
        const data = snap.data()
        const players = data.players || {}
        if (!players[uid]) {
          if (Object.keys(players).length >= 4) throw new Error('Cette partie est déjà complète (4 joueurs max).')
          if (data.status !== 'lobby') throw new Error('La partie a déjà commencé.')
          tx.update(ref, {
            [`players.${uid}`]: { name: name?.trim() || 'Joueur', isHost: false, connected: true, team: null, joinedAt: Date.now() },
          })
        }
      })
      setCode(c)
    },
    [uid],
  )

  // Choisit son équipe (mode 4 joueurs) — 2 places par équipe, dans le salon.
  const setTeam = useCallback(
    async (team) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) return
        const data = snap.data()
        if (data.status !== 'lobby') return
        const players = data.players || {}
        if (team) {
          const inTeam = Object.keys(players).filter((u) => u !== uid && players[u].team === team)
          if (inTeam.length >= 2) throw new Error('Cette équipe est déjà complète.')
        }
        tx.update(ref, { [`players.${uid}.team`]: team })
      })
    },
    [code, uid],
  )

  // L'hôte lance la partie avec les packs choisis (nombre de questions fixe).
  // Le mode est déduit du nombre de joueurs : 2 = couple, 4 = équipes.
  const startGame = useCallback(
    async (packs) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        if (data.hostUid !== uid) throw new Error('Seul l’hôte peut lancer la partie.')
        const players = data.players || {}
        const n = Object.keys(players).length
        if (n !== 2 && n !== 4) throw new Error('Il faut être 2 (couple) ou 4 (équipes) pour jouer.')
        const mode = n === 4 ? 'teams' : 'couple'
        if (mode === 'teams') {
          const a = Object.keys(players).filter((u) => players[u].team === 'A').length
          const b = Object.keys(players).filter((u) => players[u].team === 'B').length
          if (a !== 2 || b !== 2) throw new Error('Répartissez-vous en 2 équipes de 2.')
        }
        const questions = buildQuestions(packs, QUESTIONS_PER_GAME, PACKS_BY_ID)
        if (questions.length === 0) throw new Error('Choisissez au moins un pack de questions.')
        tx.update(ref, {
          status: 'playing',
          config: { packs, questionCount: QUESTIONS_PER_GAME, mode, playerCount: n },
          questions,
          currentIndex: 0,
          rounds: {},
        })
      })
    },
    [code, uid],
  )

  // Soumet la réponse du joueur pour la question courante. Quand TOUS les
  // joueurs ont répondu, révèle la manche et calcule le match de chaque
  // équipe dans la même transaction.
  const submitAnswer = useCallback(
    async (value) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        const idx = data.currentIndex
        const playerUids = Object.keys(data.players || {})
        const rounds = data.rounds || {}
        const round = {
          answers: {},
          revealed: false,
          teamMatch: {},
          overrides: {},
          ...(rounds[idx] || {}),
        }
        round.answers = { ...round.answers, [uid]: { value, submitted: true } }
        if (!round.revealed && allAnswered(round, playerUids)) {
          round.revealed = true
          const question = data.questions[idx]
          round.teamMatch = {}
          for (const team of gameTeams(data)) {
            round.teamMatch[team.id] = computeAutoMatch(question, round.answers, team.uids)
          }
        }
        tx.update(ref, { [`rounds.${idx}`]: round })
      })
    },
    [code, uid],
  )

  // Rattrapage : ce joueur considère que « ça compte quand même » (questions
  // texte uniquement ; le point n'est acquis que si les DEUX valident).
  const setOverride = useCallback(async () => {
    await runTransaction(db, async (tx) => {
      const ref = gameDoc(code)
      const snap = await tx.get(ref)
      if (!snap.exists()) return
      const idx = snap.data().currentIndex
      tx.update(ref, { [`rounds.${idx}.overrides.${uid}`]: true })
    })
  }, [code, uid])

  // Passe à la question suivante (ou termine la partie). Idempotent : les deux
  // joueurs peuvent appuyer sans double avancement.
  const nextQuestion = useCallback(async () => {
    await runTransaction(db, async (tx) => {
      const ref = gameDoc(code)
      const snap = await tx.get(ref)
      if (!snap.exists()) return
      const data = snap.data()
      const idx = data.currentIndex
      if (!data.rounds?.[idx]?.revealed) return
      if (idx + 1 >= data.questions.length) {
        tx.update(ref, { status: 'finished' })
      } else {
        tx.update(ref, { currentIndex: idx + 1 })
      }
    })
  }, [code])

  // Rejouer : retour au salon en conservant les joueurs (et leurs équipes).
  const replay = useCallback(async () => {
    await runTransaction(db, async (tx) => {
      const ref = gameDoc(code)
      const snap = await tx.get(ref)
      if (!snap.exists()) return
      tx.update(ref, { status: 'lobby', questions: [], currentIndex: 0, rounds: {} })
    })
  }, [code])

  return {
    code,
    game,
    error,
    setError,
    isHost: Boolean(game && uid && game.hostUid === uid),
    createGame,
    joinGame,
    setTeam,
    startGame,
    submitAnswer,
    setOverride,
    nextQuestion,
    replay,
    leaveGame,
  }
}
