# Rédaction des questions — guide & procédure de test

Ce document sert **deux usages** :

1. **Guide de rédaction** — les règles à respecter en écrivant (ou en générant)
   de nouvelles questions pour les packs de `src/data/packs/`.
2. **Procédure de test** — la même liste, transformée en checklist, à passer
   sur chaque lot de questions généré avant de l'intégrer.

Il synthétise toutes les corrections apportées au corpus. Chaque règle indique
si elle est **vérifiée automatiquement** (`npm run test`) ou si elle relève
d'une **relecture humaine** (le test automatique ne peut pas la juger).

---

## 0. Pourquoi ces règles : la mécanique de jeu

Le jeu mesure la **synchronisation** : tous les joueurs répondent **chacun de
leur côté** à la **même** question, et marquent quand leurs réponses
**coïncident**. Toute la rédaction découle de cette contrainte unique :

> **Une question doit avoir une seule interprétation, identique pour tous les
> joueurs, et une réponse sur laquelle des joueurs « en phase » convergent
> naturellement.**

Si deux joueurs bien assortis peuvent répondre différemment *à cause de la
formulation* (et non de leur désaccord réel), la question est ratée.

---

## 1. Modèle de données

Chaque question est un objet :

```js
{ id: 'kebab-unique', type: 'who' | 'mcq' | 'text', text: '…', audience?: 'all' | 'amis', options?: [...] }
```

- `id` — identifiant court, **unique dans le pack** (préfixé automatiquement par
  le pack à l'exécution : `gouts:gt-pizza`).
- `type` :
  - `who` — « Qui… ? » : on désigne un joueur.
  - `mcq` — choix multiple : `options: [{ id, label }]`, **au moins 2**.
  - `text` — réponse libre courte (correspondance auto, casse/accents ignorés).
- `audience` — public visé (voir §6). Absent = **couple** par défaut.
- `options` — pour les `mcq` uniquement.

---

## 2. Règle d'or — un seul référent, explicite

**[Relecture humaine]** En te mettant à la place d'un joueur qui **cherche à
coïncider**, il ne doit **jamais** y avoir d'hésitation entre :

- **(A) référence commune** — un épisode / un objet **vécu ensemble**, que
  chacun retrouve dans l'histoire partagée ; **ou**
- **(B) vécu individuel** — un fait propre à **une** personne (et il faut alors
  savoir **de qui** on parle : le répondant lui-même ? en mode trio, la cible à
  deviner ?).

Exemple du piège corrigé : *« Un moment où un ami a sauvé la mise ? »* — un ami
**du groupe** lors d'un moment partagé (A), ou n'importe quel ami dans la vie de
chacun (B) ? → reformulé *« Un moment où **l'un de vous** a sauvé la mise ? »* (A).

**Comment lever l'ambiguïté** — ancrer la formulation :

| Intention | Marqueurs à employer |
| --- | --- |
| (A) vécu **commun** | « ensemble », « entre vous », « l'un de vous », « de notre histoire », « chez nous » (couple), « votre… » |
| (B) vécu **individuel** | « de sa vie », « son / sa », « … personnel·le », « de son entourage » |

**Cas déjà sans ambiguïté** (ne rien ajouter) : les questions de
goût / personnalité / habitude **au présent** (« Le café, c'est plutôt… »,
« Enfant, on était plutôt… », « Qui est le plus bordélique ? »). La convention
implicite « chacun décrit ce qu'il pense » n'a qu'une lecture ; le match mesure
la coïncidence. De même, tout ce qui est **déjà ancré** (« notre chanson »,
« avec le groupe », « que vous seuls comprenez ») est correct.

---

## 3. Pas de 2ᵉ personne du singulier

**[Test automatique]** Aucun `text` ni `label` ne doit contenir
`tu / ton / ta / tes / toi / te` (ni `t'`), hors citation figée `je t'aime`.

Raison : « toi » désigne le joueur A pour A et le joueur B pour B — ce n'est
alors plus la même question pour tout le monde. Rester au **collectif**
(`on`, `notre`, `nos`) ou à l'**impersonnel** (`le / la / les`, `qui`).

- ❌ « Ton plat préféré ? » ❌ « Face à une tâche, tu… »
- ✅ « Le plat qu'on commande à coup sûr ? » ✅ « Face à une tâche, on… »

Le test `packs.test.js` échoue si un pronom de 2ᵉ personne du singulier apparaît.

---

## 4. Pas de nom collectif comme sujet d'action

**[Relecture humaine]** Un nom collectif dépendant du nombre de joueurs
(`le groupe`, `la bande`, `le duo`, `l'équipe`, `le trio`) ne doit pas être le
**sujet** d'une action : c'est moins clair (on décrit un tiers au lieu de
« nous ») et ça sonne faux à 2 joueurs. Utiliser **`on`**, indépendant du nombre.

- ❌ « Pour un anniversaire, **le groupe**… » → ✅ « Pour un anniversaire, **on**… »
- ❌ « **Le groupe** s'est formé… » → ✅ « **On** est devenus amis… »

En revanche, le nom collectif en **complément** est correct et à conserver :
« Qui fait le plus rire **le groupe** ? » (objet), « Dans **le groupe**, on
est… » (locatif), « une tradition **du groupe** » (possessif).

---

## 5. Accord des options avec l'amorce

**[Relecture humaine]** Chaque `label` de QCM doit se lire correctement **à la
suite de l'amorce** `text`. Quand l'amorce est « … on… », les options se
conjuguent à la 3ᵉ personne du singulier.

- Amorce « Face à une tâche à faire, on… » → ✅ « La **fait** direct » /
  ❌ « La **fais** direct ».

---

## 6. Public visé (`audience`) et neutralité

**[Test automatique pour les compteurs ; relecture humaine pour le classement]**

- **absent** → **couple uniquement** (cadre amoureux, cohabitation, intimité).
- `'all'` → **universelle** : jouable en couple **et** entre amis.
- `'amis'` → **entre amis uniquement** (versions « groupe » n'ayant pas de sens
  pour un duo).

Filtrage effectif (`questionAllowed`) : mode **couple** = tout sauf `'amis'` ;
mode **amis** = `'all'` + `'amis'`.

**Ne taguer `'all'` que si la question est réellement neutre** : aucun cadre
amoureux (« notre couple », « à deux », « l'autre », « en amoureux »), aucune
tendresse/intimité (câlin, bisou, lit, dormir enlacés), aucune histoire de
couple (rencontre, « premier… »), aucune cohabitation intime (couverture, côté
du lit, budget du foyer, déco de « notre » maison). Dans le doute → laisser
**couple** (champ absent).

**Contrainte de volume (bloquante).** Le test exige, **pour chaque pack**,
**exactement 35 questions jouables entre amis par type** (`who`, `mcq`, `text`),
soit 105 questions `all`+`amis` par pack. Toute nouvelle question `amis`/`all`
doit préserver cet équilibre (ajouter/retirer par triplets équilibrés).

---

## 7. Format par type

**[Relecture humaine, sauf mention]**

- **`who`** : commence par « Qui » et se termine par « ? ». Désigne un
  comportement où des joueurs en phase convergent vers **la même** personne.
- **`mcq`** : **≥ 2 options** *(testé)*. Options **mutuellement exclusives** et
  **collectivement plausibles**. Emojis admis (cohérents au sein d'une même
  question). Prévoir au besoin une échappatoire (« Ça dépend », « Aucun »).
- **`text`** : réponse **courte et convergente** (un mot / une expression ;
  saisie ≤ 60 caractères). Privilégier « … en un mot ? ». Éviter les réponses
  ouvertes à forte variance (« Raconte ta plus belle anecdote ») : impossibles à
  faire coïncider.

---

## 8. Unicité

**[Test automatique pour les doublons exacts ; relecture pour les quasi-doublons]**

- **`id` unique** par pack *(testé)*.
- **`text` unique** au sein d'un même mode (amis / couple) *(testé)*.
- **Pas de quasi-doublon** *(relecture)* : deux questions au sens trop proche
  dans un même pack diluent le jeu. Les différencier par le référent ou l'angle
  (ex. « première soirée mémorable **de sa vie** » en mcq vs « toute première
  grosse soirée **ensemble** » en texte).

---

## 9. Question convergente, pas simple habitude individuelle

**[Relecture humaine ; pré-filtre outillé — voir `npm run audit:convergence`]**

Une question « à matcher » n'a de sens que s'il existe **une raison d'attendre
que deux joueurs en phase répondent pareil**. Cette raison peut venir de :

| Source de convergence | Exemple | Verdict |
| --- | --- | --- |
| **Référent partagé** (objet / événement / routine **commune**) | « Notre rythme de coucher ? », « Le meilleur souvenir **commun** » | ✅ sûr |
| **Consensus** (jugement sur **la même** cible) | tous les `who` ; « Dans le groupe, on est plutôt… » | ✅ sûr |
| **Goût partageable** (préférence qu'un duo a de l'intérêt à comparer) | « Team 🐶/🐱 », « Le chocolat, on l'aime… » | ⚠️ toléré (cœur du jeu) |
| **Habitude individuelle** (chacun décrit sa logistique privée) | « La boîte mail… », « La ponctualité… », « Le temps d'écran… » | ❌ **risqué** |

**Le piège** — un QCM du type « La boîte mail… (Inbox zéro / 1000 non lus /
Le chaos) » demande à chacun de décrire **sa propre** habitude. Deux amis (ou
un couple) ont des comportements indépendants : un désaccord n'y **mesure
rien** — ce n'est pas « pas synchro », juste « personnes différentes ». Le
taux de coïncidence est quasi aléatoire et l'enjeu relationnel nul.

**Grille de détection** (à appliquer à chaque `mcq`, et aux `text` fermés) :

1. Y a-t-il un **référent / fait partagé** (« notre / nos / ensemble », histoire
   commune) ? → convergent, garder.
2. Sinon, est-ce un **consensus** (jugement sur une même cible) ou un **goût
   réellement partageable** ? → tolérable, garder.
3. Sinon → chacun décrit une **habitude / un état privé** sans raison de
   coïncider et sans enjeu → **risqué : reformuler ou supprimer**.

**Signal fort** : un QCM risqué est souvent le *doublon cassé* d'un `who`
convergent déjà présent dans le pack (« La ponctualité… » ⇄ « Qui est le plus
souvent en retard ? »). Sa version `who` étant meilleure, le QCM est à
retravailler.

**Réparer** — ancrer sur un référent commun (« **Notre** X… »), passer à un
**consensus** (« Le plus pénible quand on… ? »), ou remplacer par un vrai goût
partageable. Rester un `mcq` pour préserver l'équilibre 35/type/pack.

Le script `npm run audit:convergence` liste les QCM **sans marqueur de
convergence** (ni référent partagé, ni fait d'histoire, ni tournure de
consensus — superlatif, dynamique de groupe…) : ce sont des **candidats à
trier**, pas un verdict. Le pré-filtre reste volontairement lexical : les
candidats restants sont surtout des goûts « nus » (« Team 🐶/🐱 »), tolérés
mais à surveiller, et d'éventuelles habitudes individuelles oubliées.

---

## 10. Procédure de test

### 10.1 Barrière automatique (obligatoire)

```bash
npm run test    # vitest : structure, compteurs, unicité, 2e personne
npm run build   # vérifie que les packs se compilent
```

`packs.test.js` garantit alors : 35 amis/type/pack · ids uniques · libellés
uniques par mode · QCM ≥ 2 options · packs couple-only non pollués · **aucune**
2ᵉ personne du singulier (texte **et** options).

### 10.2 Relecture humaine (une passe par question)

Pour **chaque** question générée, répondre OUI à tout :

- [ ] **Référent (§2)** — sais-je sans hésiter si la réponse vient du **vécu
      commun** ou du **vécu individuel** (et de qui) ? Sinon, ancrer.
- [ ] **2ᵉ personne (§3)** — aucun `tu/ton/ta/tes/toi/te/t'` (hors « je t'aime »).
- [ ] **Sujet collectif (§4)** — aucun `le groupe / la bande / …` en position
      **sujet** ; `on` à la place.
- [ ] **Accord (§5)** — chaque option se lit correctement après l'amorce.
- [ ] **Audience (§6)** — `'all'` **seulement** si vraiment neutre ; sinon
      couple. Triplets `who/mcq/text` équilibrés préservés.
- [ ] **Format (§7)** — type respecté ; `text` réellement convergent et court.
- [ ] **Unicité (§8)** — pas de quasi-doublon dans le pack.
- [ ] **Convergence (§9)** — la question n'est pas une simple **habitude
      individuelle** : il existe une raison (référent partagé, consensus, goût)
      pour que deux joueurs en phase répondent pareil.
- [ ] **Test du miroir** — en me mettant à la place de **deux** joueurs
      « en phase » (puis, en modes trio/équipes, de **trois/quatre**), ils
      donnent spontanément la **même** réponse. Sinon, reformuler.

### 10.3 Vérification e2e (optionnelle, sur gros lots)

Émulateurs + partie de bout en bout (couple **et** amis), pour confirmer que le
filtrage `audience` et le décompte du salon (7 en couple/équipes, 9 en trio)
restent satisfaits avec la nouvelle sélection. Voir le README (section
émulateurs) et les scripts Playwright.
