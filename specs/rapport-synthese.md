# Feature : Rapport de synthèse à partir d'une liste de lignes en texte brut

## Contexte métier

TextGen Hub ne dispose aujourd'hui d'aucune brique pour transformer une saisie texte brute (une liste de lignes) en rapport de synthèse. La fonctionnalité la plus proche, `src/legacy/LegacyRenderer.ts`, est un défaut de conception intentionnel documenté dans `CLAUDE.md` (God Class, switch géant sur le type de rapport, réservé au module de formation « Refactoring ») : elle ne doit ni être modifiée ni servir de base directe, seulement d'inspiration pour la forme des données (`{label, amount}`).

Le besoin est d'ajouter une fonction de synthèse (totaux, comptage, moyenne, min/max) à partir d'une liste de lignes fournie en texte brut, exposée comme une brique **réutilisable partout dans l'application** — c'est-à-dire un service interne appelable depuis n'importe quel autre module TypeScript, et une route HTTP pour l'exposer aux clients (front, autres services).

## Comportement attendu (Given / When / Then)

**Scénario 1 — Texte valide simple**
- Given un texte brut multi-lignes où chaque ligne respecte le format `label: montant` (ex. `Ventes: 1200.50`)
- When la synthèse est générée
- Then le rapport texte produit contient la liste des lignes, le total, le nombre de lignes, la moyenne, la ligne min et la ligne max, et aucune erreur n'est renvoyée

**Scénario 2 — Lignes partiellement malformées**
- Given un texte contenant à la fois des lignes valides et des lignes malformées (pas de `:`, montant non numérique)
- When la synthèse est générée
- Then les lignes valides sont agrégées normalement, chaque ligne malformée est signalée dans une liste d'erreurs (avec son numéro de ligne), et aucune exception n'est levée

**Scénario 3 — Texte vide**
- Given un texte vide ou ne contenant que des lignes blanches
- When la synthèse est générée
- Then le rapport indique 0 ligne, un total de 0, une moyenne de 0, une ligne min/max nulle, et aucune erreur

**Scénario 4 — Appel HTTP invalide**
- Given une requête `POST /api/summary` dont le corps ne contient pas de champ `text` de type string
- When la requête est traitée
- Then la réponse a le statut 400 avec un message d'erreur explicite, sans appeler le service de synthèse

**Scénario 5 — Appel HTTP valide**
- Given une requête `POST /api/summary` avec un champ `text` valide
- When la requête est traitée
- Then la réponse a le statut 200 et contient un JSON `{ report, errors }`

## Contraintes techniques (stack, perfs, compat)

- Stack : Node.js + TypeScript (CommonJS), Express 4.19 — aucune nouvelle dépendance à ajouter.
- Agrégation **déterministe uniquement** : pas d'appel LLM, pas de nouveau SDK (aucun SDK LLM n'est installé dans le repo à ce jour).
- Suivre le pattern de service déjà en place : fonctions pures exportées dans `src/services/*.service.ts`, câblées dans `src/app.ts` (même pattern que `POST /api/templates/render`).
- Ne pas modifier `src/legacy/LegacyRenderer.ts` (bug intentionnel réservé au module Refactoring).
- Tests Jest à placer dans `tests/` (le scan Jest est restreint à `roots: ['<rootDir>/tests']`, cf. `jest.config.js`).
- Tout nouveau bloc de code doit porter le tag de traçabilité `// [DEV: <nom>] [DATE: YYYY-MM-DD] [JIRA: <clé>]` imposé par `CLAUDE.md` — informations à obtenir auprès de l'utilisateur avant l'implémentation, jamais à inventer.
- Pas de contrainte de performance particulière (volumes attendus faibles, traitement en mémoire).

## Hors périmètre

- Résumé ou reformulation du contenu via un LLM (uniquement de l'agrégation chiffrée).
- Upload de fichier (`.txt`, CSV) ou tout autre format d'entrée que le texte brut collé/envoyé en `string`.
- Interface utilisateur (formulaire, textarea, page front) — seuls le service et l'endpoint HTTP sont dans ce périmètre.
- Persistance en base (SQLite) du texte soumis ou des rapports générés.
- Formats de ligne autres que `label: montant` (pas de CSV avec plusieurs colonnes, pas de JSON en entrée).
- Modification de `LegacyRenderer.ts` ou de tout autre défaut intentionnel listé dans `CLAUDE.md`.

## Critères d'acceptation (checklist testable)

- [ ] `parseLines` parse correctement les lignes valides au format `label: montant`
- [ ] `parseLines` ignore les lignes vides ou ne contenant que des espaces
- [ ] `parseLines` retire les espaces superflus autour du label et du montant
- [ ] `parseLines` accepte les montants décimaux et négatifs
- [ ] `parseLines` signale en erreur (avec numéro de ligne) toute ligne sans `:`, sans lever d'exception
- [ ] `parseLines` signale en erreur (avec numéro de ligne) tout montant non numérique, sans lever d'exception
- [ ] `summarize` calcule correctement total, nombre de lignes, moyenne, min et max sur plusieurs lignes
- [ ] `summarize` renvoie moyenne 0 et min/max `null` sur une liste vide, sans exception
- [ ] `generateSummaryReport` produit un texte de rapport formaté cohérent (titre, lignes, total/moyenne/min/max)
- [ ] `generateSummaryReport` renvoie les erreurs de parsing en plus du rapport, sans bloquer la génération
- [ ] `POST /api/summary` renvoie 400 si `text` est absent ou n'est pas une string
- [ ] `POST /api/summary` renvoie 200 avec `{ report, errors }` pour une entrée valide
- [ ] La suite `npm test` complète passe sans régression sur les services existants

## Fichiers concernés

- Créer `src/services/summary.service.ts`
- Modifier `src/app.ts` (ajout de l'import et de la route `POST /api/summary`, aux côtés de `POST /api/templates/render`)
- Créer `tests/summary.service.test.ts`
- Ne pas toucher `src/legacy/LegacyRenderer.ts`
