# Outil de décision AHP

Application web implémentant le **processus de hiérarchie analytique (AHP)** selon la méthode de Saaty (1980). Construit avec Next.js — application complète avec interface et API.

## Adresse de l’application en ligne

- URL de l’application : https://ahp-decision-tool-bay.vercel.app/

## Stack technique

- **Next.js 15** (App Router) — frontend + API
- **TypeScript** — typage de bout en bout
- **CSS pur** — sans bibliothèque d’interface externe

---

## Comment utiliser l’application

L’application vous guide en 4 étapes :

### Étape 1 — Objectif & critères

- Saisissez votre objectif de décision (par ex. « Choisir le meilleur ordinateur portable »)
- Ajoutez au moins 3 critères (par ex. Prix, Performance, Autonomie)

### Étape 2 — Alternatives & scores

- Ajoutez au moins 2 alternatives (par ex. MacBook Pro, Dell XPS, ThinkPad)
- Saisissez un score numérique pour chaque alternative et chaque critère
- Les scores sont relatifs à l’intérieur de chaque critère — toute échelle cohérente fonctionne (1-10, prix réels, pourcentages…)

### Étape 3 — Matrice de comparaison par paires

- Pour chaque paire de critères, indiquez combien un critère est plus important qu’un autre en utilisant l’échelle de Saaty 1–9
- Utilisez la liste déroulante (mode guidé) ou la saisie manuelle
- Le triangle inférieur (valeurs réciproques) est rempli automatiquement
- Exemple : si Prix est « fortement plus important » que Autonomie, saisissez 5 en ligne Prix / colonne Autonomie

### Étape 4 — Résultats

- Si CR ≤ 0,10 : la matrice est cohérente → le classement complet est affiché avec les scores, les poids des critères et les détails de cohérence (λmax, CI, RI, CR)
- Si CR > 0,10 : la matrice est incohérente → une explication détaillée montre quelles comparaisons sont contradictoires et comment les corriger

---

## Algorithme AHP (méthode en 5 étapes de Saaty)

**Étape 1 — Modèle hiérarchique :** Objectif → Critères → Alternatives

**Étape 2 — Échelle de préférence :** échelle de Saaty 1–9
| Valeur | Signification |
|-------|--------------|
| 1 | Importance égale |
| 3 | Importance modérée |
| 5 | Importance forte |
| 7 | Importance très forte |
| 9 | Importance extrême |
| 2, 4, 6, 8 | Valeurs intermédiaires |

**Étape 3 — Matrice de comparaison par paires :** matrice n×n où l’entrée [i][j] = « combien de fois le critère i est plus important que le critère j »

**Étape 4 — Poids des critères :** chaque colonne est normalisée (÷ somme de colonne), puis la moyenne de chaque ligne donne le vecteur de priorité. Les poids totalisent toujours 1.

**Étape 5 — Vérification de cohérence :**

- λmax = moyenne de (A·w)[i] / w[i] pour chaque critère i
- CI = (λmax − n) / (n − 1)
- CR = CI / RI (indice aléatoire de Saaty pour la taille n)
- **CR ≤ 0,10** → matrice cohérente → classement calculé
- **CR > 0,10** → matrice incohérente → il faut revoir les comparaisons

**Calcul final :** normaliser les scores des alternatives par critère (chaque colonne ÷ somme de colonne), puis calculer le produit scalaire pondéré avec les poids des critères. Trier par ordre décroissant → la meilleure alternative est en tête.

---

## Auteur

LEUDJEU WOUAPPI Beautrel Horssel — Université de Yaoundé 1 — Mai 2026
