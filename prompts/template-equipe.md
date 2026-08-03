# Gabarit de prompt — équipe TextGen Hub

Gabarit réutilisable pour formuler une demande à Claude Code sur ce dépôt. Copier la section "Prompt" et compléter chaque champ avant d'envoyer.

## Prompt

```
Contexte :
- Module concerné : <ex. src/services/invoice.service.ts>
- Objectif : <ce qu'on veut obtenir, en une phrase>
- Type de tâche : <bug fix / feature / refactoring / tests / revue de code>

Contraintes :
- Dev : <prénom nom>
- Date : <YYYY-MM-DD>
- Ticket JIRA : <clé-ticket>
- Ne pas toucher aux bugs intentionnels listés dans CLAUDE.md sauf mention explicite du module correspondant.
- Montants de TVA : exprimés en pourcentage (vérifier la convention déjà en place localement).

Demande précise :
<décrire l'action attendue, avec le résultat souhaité et les cas limites à couvrir>

Critères de validation :
- <ex. npm test passe sur le fichier concerné>
- <ex. couverture ajoutée pour le nouveau cas>
```

## Rappels avant d'envoyer

- Préciser le fichier ou le module exact plutôt qu'une zone vague du dépôt.
- Donner dev/date/ticket JIRA dès le premier message : requis pour le tag de traçabilité (`// [DEV: ...] [DATE: ...] [JIRA: ...]`) sur tout ajout de code.
- Rappeler que ce dépôt contient des bugs intentionnels (voir tableau dans `CLAUDE.md`) : ne pas demander de correction hors du module dédié.
- Séparer clairement "ce qui doit changer" de "ce qui ne doit pas changer" quand la tâche touche un fichier partagé.
