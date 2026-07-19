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

### Déploiement sur GitHub Pages (recommandé)

Le jeu se déploie automatiquement sur **GitHub Pages** via GitHub Actions
([`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml))
à chaque push sur `main`, ou manuellement depuis l'onglet **Actions**.

Firebase reste le backend temps réel (Firestore + Auth) ; GitHub Pages ne sert
que les fichiers statiques du build. La configuration Firebase utilisée pour ce
build est dans [`.env.production`](./.env.production) — **ce fichier est
committé volontairement** : la clé API web Firebase n'est pas un secret (la
sécurité vient des règles [`firestore.rules`](./firestore.rules), pas de la clé).

**Configuration à faire une seule fois, dans les paramètres du dépôt GitHub :**

1. *Settings → Pages → Build and deployment → Source* : sélectionnez **GitHub Actions**.
2. Poussez (ou mergez) sur `main` — le workflow se déclenche automatiquement.
3. Le site sera disponible sur `https://oignonmetro.github.io/alunisson/`.

Vous pouvez aussi déclencher le déploiement manuellement : onglet **Actions**
→ *Déployer sur GitHub Pages* → **Run workflow**.

> Si vous changez de nom de dépôt, mettez à jour le chemin `base` dans
> `vite.config.js` (`/alunisson/`) pour qu'il corresponde à la nouvelle URL.

#### Alternative : Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting --project VOTRE_PROJECT_ID
```

---

## Comment on joue

1. Un joueur **crée une partie** et partage le **code** à 4 lettres.
2. Les autres **rejoignent** avec ce code (2 joueurs = mode couple, 3 joueurs = mode trio,
   4 joueurs = mode équipes).
3. L'hôte choisit **le public** (**Entre amis** / **En couple**) et les **packs** de
   questions (chaque partie compte **7 questions**). En mode **Entre amis**, seules les
   questions neutres/inclusives (goûts, personnalité, habitudes, sommeil…) sont posées ;
   les questions intimes (tendresse, histoire du couple…) sont réservées au mode couple.
4. À chaque question, chacun répond **sans regarder l'écran de l'autre**.
5. Les réponses se **révèlent** : ✅ en accord (point) ou ❌ différentes.
   Pour une réponse **texte** proche mais non identique, validez le **rattrapage**
   dans le duo pour marquer le point. Barème : 2 pts (choix), 5 pts (texte).
6. À la fin : **score et récapitulatif**. Rejouez à volonté !

### Manches dirigées 🕵️ (couple et équipes)

Sur **2 des 7 questions**, la mécanique change : au lieu que chacun réponde pour
soi, une **cible** est désignée (en alternance) et répond **en privé**, pendant
que son binôme (ou coéquipier en mode équipes) essaie de **deviner sa réponse**.
Le point vient de la coïncidence devinette↔réalité, pas d'une coïncidence de
goûts entre deux avis indépendants — ces questions (pack **Portrait**, non
sélectionnable, toujours incluses) testent la **connaissance qu'on a de
l'autre**, quel que soit son goût réel. En équipes, chaque équipe joue sa
propre paire cible/coéquipier, en parallèle sur la même question.

### Mode équipes (4 joueurs)

À **4 joueurs**, le mode équipes s'active automatiquement : chacun choisit son
camp (**Équipe A** ou **Équipe B**, 2 par équipe) dans le salon.

1. **Rédaction** : avant de jouer, chaque joueur écrit **une question pour l'équipe
   adverse**.
2. **7 manches** : 3 questions communes (packs, 2/5 pts) + **2 manches personnalisées**
   où chaque équipe reçoit une question écrite par l'adversaire (**5 pts**) + **2 manches
   dirigées** (pack Portrait, voir plus haut).
3. Sur une question personnalisée, l'équipe cible peut **« retourner la question »**
   pour ne pas y répondre : c'est alors l'équipe adverse (l'autrice) qui tente de
   gagner les 5 points.
4. Comme partout, on marque quand **les deux membres du duo répondent la même chose**.

À la révélation, on voit les réponses de tout le monde et le score de chaque équipe ;
l'équipe la plus « à l'unisson » l'emporte.

### Mode trio (3 joueurs)

À **3 joueurs**, chaque partie compte **9 questions** (3 par joueur) et se joue en
**deux temps** avec un **score commun** au trio (pas de gagnant) :

1. **Phase 1** : chacun répond **seul** à ses 3 questions (les autres ne voient pas).
2. **Phase 2** : pour chaque question, les **deux autres** doivent **se mettre d'accord**
   pour répondre **comme la personne visée** (A + B devinent C, puis B + C devinent A,
   etc.). La réponse commune n'est validée qu'au **consensus** : les deux devineurs
   doivent proposer la **même** chose.
3. Le trio marque les points de la question (2 pts choix, 5 pts texte) quand la réponse
   commune correspond à celle de la cible.

Les questions **« qui de nous deux »** deviennent **« qui de nous trois »** :
on peut **sélectionner plusieurs joueurs** (ex. A + B, ou A + B + C) ou
**« Aucun des trois »** (choix exclusif qui désélectionne les joueurs).

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
  screens/      Home, Lobby, Writing (équipes), TrioAnswer (trio), Question, Reveal, Results
firestore.rules Règles de sécurité Firestore
```

### Reconnexion automatique

Changer d'appli sur mobile (ou mettre l'onglet en veille) ne fait jamais perdre la
partie : l'identifiant du joueur (uid Firebase Auth anonyme) est persisté par le SDK,
et le **code de la room courante est persisté en `localStorage`**, relu de façon
synchrone au montage (`useGame.js`, `readPersistedCode`/`persistCode`) pour reprendre
directement la partie sans repasser par l'écran d'accueil. Il n'y a volontairement
aucun mécanisme de présence temps réel (`onDisconnect`, heartbeat…) qui retirerait un
joueur de `players` sur une simple coupure réseau — l'appartenance à la room est un
état persistant, pas une présence éphémère.

### Ajouter un pack de questions

Créez `src/data/packs/mon-pack.js` sur le modèle des packs existants, puis importez-le
dans `src/data/packs/index.js`. Types de questions : `mcq` (options fixes),
`who` (« qui de nous deux », options générées à partir des joueurs), `text` (réponse libre).
Le champ `audience` règle le public d'une question :
- absent → réservée au mode **En couple** (par défaut) ;
- `'all'` → universelle : posée **en couple et entre amis** (goûts, personnalité, habitudes…) ;
- `'amis'` → réservée au mode **Entre amis** (versions « groupe » des packs Souvenirs/Complicité,
  qui n'ont pas de sens pour un duo).

Chaque pack vise **105 questions jouables entre amis, avec au moins 30 par type**
(`who` / `mcq` / `text`).

Avant d'ajouter ou de générer des questions, suivez le guide de rédaction
[`docs/redaction-questions.md`](docs/redaction-questions.md) : il détaille les
règles (référent commun vs individuel, pas de 2ᵉ personne, sujet collectif,
neutralité `audience`, connaissance vs coïncidence de goûts…) et sert de
**procédure de test** à passer sur chaque lot.

Le pack **Portrait** (`src/data/packs/portrait.js`) est un cas à part : il
alimente les **manches dirigées** (voir plus haut) et n'est **pas**
sélectionnable au salon — il n'est donc pas dans `PACKS`/`index.js` comme les
autres, mais exporté séparément (`PORTRAIT_PACK`) et inclus automatiquement.

---

## Et ensuite ?

Prévu pour évoluer : davantage de packs et de modes de jeu, réglages de partie
personnalisables.
