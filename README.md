# À l'unisson 💞

Un jeu **à deux joueurs, en temps réel**, pour couples : vous répondez **chacun de
votre côté** aux mêmes questions, et vous marquez un point à chaque fois que vous
donnez la **même réponse**. À la fin : un score et un **pourcentage de compatibilité**.

- 📱 **Deux appareils synchronisés** via un **code de partie** (4 lettres à partager).
- 🎯 Questions en **QCM**, **« qui de nous deux »**, et **réponse libre**.
- 🧩 Plusieurs **packs thématiques** au choix (Goûts, Souvenirs, Vie quotidienne, Complicité).
- 🤝 Réponses texte : correspondance **automatique** (casse/accents ignorés) + **rattrapage
  manuel** (« ça compte quand même », validé par les deux).

Stack : **React + Vite** · **Firebase (Firestore + Auth anonyme)** en temps réel.

---

## Démarrage rapide

```bash
npm install
```

Vous avez deux façons de lancer le jeu :

### A) Sans compte — émulateur Firebase local (idéal pour développer/tester)

Nécessite **Java** (pour l'émulateur Firestore). Dans deux terminaux :

```bash
# Terminal 1 : les émulateurs Firebase (Auth + Firestore)
npm run emulators

# Terminal 2 : l'app branchée sur les émulateurs
npm run dev:emulator
```

Ouvrez http://localhost:5173 dans **deux fenêtres** (ou deux appareils) pour simuler
les deux joueurs.

### B) Avec votre vrai projet Firebase (pour jouer/déployer réellement)

1. **Créez un projet** sur https://console.firebase.google.com → « Ajouter un projet ».
2. **Activez Firestore** : menu *Build → Firestore Database → Créer une base de données*
   (mode production, choisissez une région).
3. **Activez la connexion anonyme** : *Build → Authentication → Sign-in method →
   Anonyme → Activer*.
4. **Enregistrez une application Web** : *Paramètres du projet (⚙️) → Vos applications →
   icône Web `</>`*. Copiez l'objet `firebaseConfig`.
5. **Configurez vos clés** : copiez `.env.example` en `.env` et remplissez :

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

6. **Publiez les règles de sécurité** (fichier [`firestore.rules`](./firestore.rules)) :

   ```bash
   npx firebase deploy --only firestore:rules --project VOTRE_PROJECT_ID
   ```

7. **Lancez** :

   ```bash
   npm run dev      # développement
   npm run build    # build de production dans dist/
   ```

> Le fichier `.env` contient vos clés — il est ignoré par git (voir `.gitignore`).

### Déploiement (optionnel) sur Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting --project VOTRE_PROJECT_ID
```

---

## Comment on joue

1. Un joueur **crée une partie** et partage le **code** à 4 lettres.
2. L'autre **rejoint** avec ce code.
3. L'hôte choisit les **packs** et le **nombre de questions** (5 / 10 / 15).
4. À chaque question, chacun répond **sans regarder l'écran de l'autre**.
5. Les réponses se **révèlent** : ✅ en accord (point) ou ❌ différentes.
   Pour une réponse **texte** proche mais non identique, validez le **rattrapage**
   tous les deux pour marquer le point.
6. À la fin : **score, % de compatibilité et récapitulatif**. Rejouez à volonté !

---

## Développement

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de dev (config `.env`). |
| `npm run dev:emulator` | Serveur de dev branché sur les émulateurs Firebase. |
| `npm run emulators` | Démarre les émulateurs Auth + Firestore. |
| `npm run test` | Tests unitaires (Vitest) de la logique de jeu. |
| `npm run build` | Build de production. |

### Structure

```
src/
  lib/          matching (correspondance), gameCode, gameLogic (score) — logique pure testée
  data/packs/   packs de questions (ajoutez-en un fichier ici)
  hooks/        useAuth (connexion anonyme), useGame (temps réel + actions)
  screens/      Home, Lobby, Question, Reveal, Results
firestore.rules Règles de sécurité Firestore
```

### Ajouter un pack de questions

Créez `src/data/packs/mon-pack.js` sur le modèle des packs existants, puis importez-le
dans `src/data/packs/index.js`. Types de questions : `mcq` (options fixes),
`who` (« qui de nous deux », options générées à partir des joueurs), `text` (réponse libre).

---

## Et ensuite ?

Prévu pour évoluer : mode **3 joueurs ou plus**, davantage de packs, création de
questions personnalisées.
