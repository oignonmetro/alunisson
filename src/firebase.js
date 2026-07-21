// Initialisation de Firebase.
//
// En production : les identifiants proviennent des variables VITE_FIREBASE_*
// (fichier `.env`, voir `.env.example`).
// En développement/test : si VITE_USE_EMULATOR=1, on se connecte aux émulateurs
// locaux (aucun compte Firebase requis). Utilisez `npm run dev:emulator`.

import { initializeApp } from 'firebase/app'
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const useEmulator = import.meta.env.VITE_USE_EMULATOR === '1'

// En mode émulateur, la config peut être factice (le projectId doit juste être défini).
const firebaseConfig = useEmulator
  ? { apiKey: 'demo', projectId: 'demo-leszamis', authDomain: 'demo-leszamis.firebaseapp.com' }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

export const app = initializeApp(firebaseConfig)

// Force le transport « long-polling » plutôt que le WebChannel streaming par
// défaut. Sur Safari / iOS, le flux WebChannel se fige souvent après la
// connexion initiale : les écritures des autres joueurs n'arrivent plus au
// listener onSnapshot, obligeant à rafraîchir la page pour voir l'écran
// suivant. L'auto-détection (défaut du SDK v10) ne suffit pas — sa sonde
// initiale réussit puis le streaming cale ensuite — donc on force. Le
// surcoût est négligeable pour nos documents de partie minuscules.
export const db = initializeFirestore(app, { experimentalForceLongPolling: true })
export const auth = getAuth(app)

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

/** Vrai si la configuration Firebase de production est renseignée. */
export function isFirebaseConfigured() {
  return useEmulator || Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)
}
