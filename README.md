# TextGen Hub

Application pédagogique pour la formation Claude Code — équipe technique NEoXam.

## Contexte métier (fictif, calqué sur un contexte de type NEoXam)

TextGen Hub est un petit service de **génération de texte automatique** (rapports, factures, notifications) avec un module de traitement par lot en Java, à l'image d'un produit de maintenance type DataHub : un cœur TypeScript qui sert l'API et génère les documents, épaulé par un module Java qui traite des lots de données en tâche de fond.

Ce dépôt contient volontairement des bugs et des défauts de conception, chacun réservé à un module précis de la formation. **Ne pas corriger un bug avant le module qui lui est dédié.**

## Stack

- **Cœur applicatif** : TypeScript + Express + better-sqlite3 (`src/`)
- **Module batch** : Java 17 + Maven, sans framework lourd (`java-batch/`)
- Tests : Jest (TS) + JUnit 5 (Java)

## Démarrage

```bash
npm install
npm run dev        # démarre le serveur sur :3000
npm test           # suite Jest

cd java-batch
mvn test           # suite JUnit
```

## Carte des bugs et défauts intentionnels (à ne PAS corriger avant le module indiqué)

| # | Fichier | Langage | Nature | Module dédié |
|---|---|---|---|---|
| 1 | `src/services/auth.service.ts` | TS | Salt de mot de passe régénéré à chaque connexion | Débogage avancé |
| 2 | `src/services/report.service.ts` | TS | Regroupement par jour sensible au fuseau horaire | Débogage avancé |
| 3 | `src/async/jobQueue.ts` | TS | Race condition sur file de jobs asynchrones | Débogage avancé |
| 4 | `src/db/batchTransferService.ts` | TS | Deadlock SQL (connexion par appel, timeout court) | Débogage avancé |
| 5 | `java-batch/.../BatchReportService.java` | Java | Somme de montants en `double` (erreurs d'arrondi cumulées) | Débogage avancé (volet Java) |
| 6 | `src/legacy/LegacyRenderer.ts` | TS | God Class — switch géant, logique dupliquée | Refactoring |
| 7 | `src/services/invoice.service.ts` | TS | Couverture de tests quasi nulle (hors `calculateTTC`) | Revue de code & tests |

*(Numérotation volontairement indépendante des jours/labs — la structure exacte du programme peut évoluer sans que cette carte n'ait besoin d'être remise à jour.)*

## CLAUDE.md

Volontairement absent au démarrage de la formation — il sera construit collectivement en tout début de semaine (rappel condensé mémoire/contexte).
