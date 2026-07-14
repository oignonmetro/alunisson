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
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { generateCode, isValidCode, sanitizeCode } from '../lib/gameCode.js'
import {
  buildQuestions,
  buildTeamsSequence,
  buildTrioSequence,
  computeAutoMatch,
  computePartialMatch,
  computeTrioConsensus,
  trioGuessers,
  allAnswered,
  gameTeams,
  orderedUids,
  slotResponder,
  QUESTIONS_PER_GAME,
  TRIO_QUESTIONS,
} from '../lib/gameLogic.js'
import { isMatch } from '../lib/matching.js'
import { PACKS_BY_ID } from '../data/packs/index.js'

const gameDoc = (code) => doc(db, 'games', code)

/** Structure par défaut d'une manche perso (2 slots), en fusionnant l'existant. */
function normalizeCustomRound(round) {
  const base = { kind: 'custom', revealed: false, slots: { A: {}, B: {} }, ...(round || {}) }
  base.slots = {
    A: { returned: null, answers: {}, matched: null, ...(round?.slots?.A || {}) },
    B: { returned: null, answers: {}, matched: null, ...(round?.slots?.B || {}) },
  }
  return base
}

// Le code de la room courante est persisté en localStorage (et pas seulement
// en state React) pour survivre à un remontage complet de l'app — ce qui se
// produit typiquement quand l'OS décharge l'onglet en arrière-plan (changement
// d'appli mobile, mise en veille prolongée). Sans ça, revenir sur l'app repart
// de zéro et redemande le code, même si la room est toujours valide côté
// serveur. localStorage (et non sessionStorage) pour survivre aussi à une
// fermeture complète de l'onglet/navigateur.
export const ROOM_CODE_KEY = 'alunisson:roomCode'

export function readPersistedCode() {
  try {
    const stored = localStorage.getItem(ROOM_CODE_KEY)
    // Le code n'est retenu que s'il est déjà bien formé (pas juste
    // « nettoyable » en un code valide) : on ne veut pas reconstruire un
    // code différent à partir d'une valeur altérée en stockage.
    if (!stored || sanitizeCode(stored) !== stored || !isValidCode(stored)) return null
    return stored
  } catch {
    return null
  }
}

export function persistCode(code) {
  try {
    if (code) localStorage.setItem(ROOM_CODE_KEY, code)
    else localStorage.removeItem(ROOM_CODE_KEY)
  } catch {
    // stockage indisponible (navigation privée, quota…) : pas bloquant, on
    // perd juste la reconnexion automatique.
  }
}

export function useGame(uid) {
  // Initialisé de façon synchrone (dans l'initializer de useState, pas un
  // useEffect) pour que le tout premier rendu sache déjà si on doit tenter de
  // rejoindre une room persistée, sans flash de l'écran d'accueil.
  const [code, setCodeState] = useState(readPersistedCode)
  const [game, setGame] = useState(null)
  // Vrai tant qu'on attend la première réponse Firestore pour une room
  // restaurée depuis le stockage — distingue « pas de room » de « room en
  // cours de reconnexion », pour que App.jsx n'affiche pas Home par erreur.
  const [loading, setLoading] = useState(() => Boolean(readPersistedCode()))
  const [error, setError] = useState(null)

  const setCode = useCallback((next) => {
    persistCode(next)
    setCodeState(next)
  }, [])

  // Abonnement temps réel au document de partie.
  useEffect(() => {
    if (!code) {
      setGame(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = onSnapshot(
      gameDoc(code),
      (snap) => {
        setLoading(false)
        if (snap.exists()) {
          setGame(snap.data())
        } else {
          // Room disparue (supprimée, code invalide…) : on nettoie la
          // persistance pour ne pas retenter indéfiniment le même code mort.
          setGame(null)
          persistCode(null)
          setCodeState(null)
        }
      },
      (e) => {
        setLoading(false)
        setError(e)
      },
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
        // packs/audience par défaut = présélection affichée dans le salon ;
        // l'hôte les ajuste en direct via updateLobbySelection (visible de
        // tous, pas seulement au moment de lancer la partie).
        config: { packs: ['gouts'], audience: 'couple', questionCount: QUESTIONS_PER_GAME },
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

  // Met à jour en direct la sélection de packs / le public visé pendant le
  // salon, pour que tous les joueurs la voient au fur et à mesure (pas
  // seulement l'hôte au moment de lancer). Best-effort, pas de transaction :
  // un seul rédacteur (l'hôte) touche ces champs à la fois.
  const updateLobbySelection = useCallback(
    async (packs, audience) => {
      if (!code) return
      try {
        await updateDoc(gameDoc(code), { 'config.packs': packs, 'config.audience': audience })
      } catch {
        // pas bloquant (ex: partie déjà lancée entre-temps)
      }
    },
    [code],
  )

  // L'hôte lance la partie avec les packs déjà choisis en direct dans le
  // salon (config.packs/config.audience, synchronisés via updateLobbySelection).
  // Le mode est déduit du nombre de joueurs : 2 = couple, 4 = équipes.
  const startGame = useCallback(
    async () => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        if (data.hostUid !== uid) throw new Error('Seul l’hôte peut lancer la partie.')
        const packs = data.config?.packs || []
        const audience = data.config?.audience || 'couple'
        const players = data.players || {}
        const n = Object.keys(players).length
        if (n < 2 || n > 4) throw new Error('Il faut être 2 (couple), 3 (trio) ou 4 (équipes) pour jouer.')
        const mode = n === 4 ? 'teams' : n === 3 ? 'trio' : 'couple'
        const noQuestions = 'Aucune question disponible : ajoute des packs (ou passe en mode « En couple »).'
        if (mode === 'teams') {
          const a = Object.keys(players).filter((u) => players[u].team === 'A').length
          const b = Object.keys(players).filter((u) => players[u].team === 'B').length
          if (a !== 2 || b !== 2) throw new Error('Répartissez-vous en 2 équipes de 2.')
        }
        if (mode === 'trio') {
          // Le mode trio passe d'abord par la phase 1 : chaque joueur répond
          // seul à ses 3 questions (la séquence est construite maintenant).
          const questions = buildTrioSequence(packs, PACKS_BY_ID, orderedUids(data), undefined, audience)
          if (questions.length < TRIO_QUESTIONS) throw new Error(noQuestions)
          tx.update(ref, {
            status: 'answering',
            config: { packs, mode, playerCount: n, audience },
            questions,
            currentIndex: 0,
            rounds: {},
          })
          return
        }
        if (mode === 'teams') {
          // Le mode équipes passe d'abord par la phase de rédaction des
          // questions personnalisées ; la séquence est construite ensuite.
          tx.update(ref, {
            status: 'writing',
            config: { packs, mode, playerCount: n, audience },
            customPrompts: {},
            questions: [],
            rounds: {},
            currentIndex: 0,
          })
          return
        }
        const questions = buildQuestions(packs, QUESTIONS_PER_GAME, PACKS_BY_ID, undefined, audience).map((q) => ({ kind: 'standard', q }))
        if (questions.length === 0) throw new Error(noQuestions)
        tx.update(ref, {
          status: 'playing',
          config: { packs, questionCount: QUESTIONS_PER_GAME, mode, playerCount: n, audience },
          questions,
          currentIndex: 0,
          rounds: {},
        })
      })
    },
    [code, uid],
  )

  // Phase de rédaction (mode équipes) : chaque joueur écrit une question pour
  // l'équipe adverse. Quand les 4 ont écrit, on construit la séquence et on lance.
  const submitPrompt = useCallback(
    async (text) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        if (data.status !== 'writing') return
        const prompts = { ...(data.customPrompts || {}), [uid]: (text || '').trim() }
        const playerUids = Object.keys(data.players || {})
        const allWritten = playerUids.every((u) => (prompts[u] || '').length > 0)
        if (!allWritten) {
          tx.update(ref, { [`customPrompts.${uid}`]: (text || '').trim() })
          return
        }
        const questions = buildTeamsSequence(data.config.packs, PACKS_BY_ID, prompts, gameTeams(data), undefined, data.config.audience || 'couple')
        tx.update(ref, {
          customPrompts: prompts,
          questions,
          status: 'playing',
          currentIndex: 0,
          rounds: {},
        })
      })
    },
    [code, uid],
  )

  // Manche perso : le premier membre de l'équipe cible tranche « répondre »
  // (returned=false) ou « retourner » (returned=true) — décision verrouillée.
  const decideSlot = useCallback(
    async (slotKey, returned) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) return
        const data = snap.data()
        if (data.players?.[uid]?.team !== slotKey) return // seule l'équipe cible décide
        const idx = data.currentIndex
        const desc = data.questions?.[idx]
        if (desc?.kind !== 'custom') return
        const round = normalizeCustomRound(data.rounds?.[idx])
        if (round.slots[slotKey].returned != null) return // déjà décidé
        round.slots[slotKey].returned = returned
        tx.update(ref, { [`rounds.${idx}`]: round })
      })
    },
    [code, uid],
  )

  // Phase 1 du mode trio : le joueur-cible répond seul à l'une de SES questions
  // (indexée par idx). Quand les 9 réponses-cibles sont soumises, on passe à la
  // phase 2 (devinettes) en basculant le statut sur 'playing'.
  const submitTargetAnswer = useCallback(
    async (idx, value) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        if (data.status !== 'answering') return
        const desc = data.questions?.[idx]
        if (desc?.kind !== 'trio' || desc.target !== uid) return // seule la cible répond
        const rounds = data.rounds || {}
        const round = { kind: 'trio', guesses: {}, revealed: false, ...(rounds[idx] || {}) }
        if (round.targetAnswer?.submitted) return // déjà répondu
        round.targetAnswer = { value, submitted: true }
        const allAnswered = data.questions.every((d, i) =>
          i === idx ? true : rounds[i]?.targetAnswer?.submitted === true,
        )
        const update = { [`rounds.${idx}`]: round }
        if (allAnswered) {
          update.status = 'playing'
          update.currentIndex = 0
        }
        tx.update(ref, update)
      })
    },
    [code, uid],
  )

  // Soumet la réponse du joueur pour la manche courante.
  //  - manche standard : tous répondent, révélation + match par équipe.
  //  - manche perso : on répond un slot précis ; révélation quand les deux
  //    slots sont décidés et que leurs équipes-répondantes ont soumis.
  //  - manche trio : les 2 devineurs proposent ; révélation au consensus.
  const submitAnswer = useCallback(
    async (value, slotKey) => {
      await runTransaction(db, async (tx) => {
        const ref = gameDoc(code)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Partie introuvable.')
        const data = snap.data()
        const idx = data.currentIndex
        const desc = data.questions?.[idx]
        const teams = gameTeams(data)

        if (desc?.kind === 'trio') {
          if (desc.target === uid) return // la cible ne devine pas sa propre réponse
          const guessers = trioGuessers(orderedUids(data), desc.target)
          if (!guessers.includes(uid)) return
          const rounds = data.rounds || {}
          const round = { kind: 'trio', guesses: {}, revealed: false, ...(rounds[idx] || {}) }
          round.guesses = { ...round.guesses, [uid]: { value, submitted: true } }
          const consensus = computeTrioConsensus(desc.q, round.guesses, guessers)
          if (consensus.reached) {
            round.revealed = true
            round.consensus = consensus.value
            round.matched = isMatch(desc.q, consensus.value, round.targetAnswer?.value)
          }
          tx.update(ref, { [`rounds.${idx}`]: round })
          return
        }

        if (desc?.kind === 'custom') {
          const round = normalizeCustomRound(data.rounds?.[idx])
          const slot = round.slots[slotKey]
          if (slot.returned == null) return // décision pas encore prise
          const responderId = slotResponder(slot, slotKey)
          const responder = teams.find((t) => t.id === responderId)
          if (!responder?.uids.includes(uid)) return // pas à ce joueur de répondre
          slot.answers = { ...slot.answers, [uid]: { value, submitted: true } }
          if (responder.uids.every((u) => slot.answers[u]?.submitted)) {
            slot.matched = computeAutoMatch({ type: 'text' }, slot.answers, responder.uids)
          }
          // Révélation quand les 2 slots sont décidés et complets.
          const complete = ['A', 'B'].every((key) => {
            const s = round.slots[key]
            if (s.returned == null) return false
            const rid = slotResponder(s, key)
            const rUids = teams.find((t) => t.id === rid)?.uids || []
            return rUids.every((u) => s.answers?.[u]?.submitted)
          })
          if (complete) round.revealed = true
          tx.update(ref, { [`rounds.${idx}`]: round })
          return
        }

        // Manche standard
        const playerUids = Object.keys(data.players || {})
        const rounds = data.rounds || {}
        const round = {
          kind: 'standard',
          answers: {},
          revealed: false,
          teamMatch: {},
          overrides: {},
          ...(rounds[idx] || {}),
        }
        round.answers = { ...round.answers, [uid]: { value, submitted: true } }
        if (!round.revealed && allAnswered(round, playerUids)) {
          round.revealed = true
          round.teamMatch = {}
          round.teamPartial = {}
          for (const team of teams) {
            const full = computeAutoMatch(desc.q, round.answers, team.uids)
            round.teamMatch[team.id] = full
            round.teamPartial[team.id] = !full && computePartialMatch(desc.q, round.answers, team.uids)
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
      tx.update(ref, { status: 'lobby', questions: [], currentIndex: 0, rounds: {}, customPrompts: {} })
    })
  }, [code])

  return {
    code,
    game,
    loading,
    error,
    setError,
    isHost: Boolean(game && uid && game.hostUid === uid),
    createGame,
    joinGame,
    setTeam,
    updateLobbySelection,
    startGame,
    submitPrompt,
    submitTargetAnswer,
    decideSlot,
    submitAnswer,
    setOverride,
    nextQuestion,
    replay,
    leaveGame,
  }
}
