# Documentation des logs de partie

Ce guide explique comment lire les logs enregistrés par le serveur Bakugan Arena, tour par tour.

## Vue d'ensemble

Chaque partie produit une série de **bundles** (un par tour). Un bundle regroupe :

- les **événements** survenus pendant le tour ;
- un **résumé d'état** au début et à la fin du tour ;
- les **actions disponibles** pour les joueurs après le tour.

Les logs sont accumulés **en mémoire** pendant la partie, puis **persistés en base** à la fin de la partie (victoire, forfait, match nul) ou lors du **cleanup** de la salle si la persistance n'a pas encore eu lieu.

## Structure d'un tour (`TurnLogBundle`)

| Champ | Description |
|-------|-------------|
| `turnNumber` | Numéro UI du tour (1, 2, 3…) |
| `turnCount` | Compteur interne du moteur (`turnState.turnCount`) |
| `activePlayerId` | ID du joueur actif en fin de tour |
| `battleInProcess` | `true` si un combat était en cours |
| `events` | Liste chronologique des événements |
| `summaryStart` | État résumé au début du tour |
| `summaryEnd` | État résumé à la fin du tour |
| `actionRequests` | Actions recalculées pour le tour suivant |

### Résumé d'état (`TurnLogSummary`)

```json
{
  "turnCount": 3,
  "activePlayerId": "user_abc",
  "battleInProcess": true,
  "battleTurns": 1,
  "battleSlot": "slot-4",
  "finished": false
}
```

## Structure d'un événement (`GameLogEvent`)

| Champ | Description |
|-------|-------------|
| `handler` | Fonction ou socket à l'origine de l'événement |
| `category` | Famille d'événement (voir ci-dessous) |
| `level` | `info`, `warn`, `error` ou `debug` |
| `message` | Résumé lisible |
| `input` | Données reçues (payload socket, état avant…) |
| `output` | Résultat de la fonction |
| `ts` | Horodatage (ms) |
| `durationMs` | Durée d'exécution si mesurée |

## Catégories

| Catégorie | Signification |
|-----------|---------------|
| `socket` | Action reçue d'un client (pose gate, bakugan, fin de tour…) |
| `engine` | Logique interne (changement de tour, recalcul des actions…) |
| `battle` | Combat (début, tours de bataille, fin) |
| `permission` | Refus d'action (joueur ou action non autorisée) |
| `bot` | Décision d'un bot (coup choisi, score, skip) |
| `timer` | Horloges joueurs |
| `system` | Initialisation de partie, événements système |

## Handlers fréquents

### Sockets joueur

- **`set-gate`** — sélection ou pose d'une gate card
- **`set-bakugan`** — pose d'un bakugan sur un slot
- **`use-ability-card`** — utilisation d'une carte ability
- **`turn-action`** — le joueur termine son tour
- **`forfait`** — abandon / forfait

### Moteur de jeu

- **`createGameState`** — initialisation de la partie
- **`updateTurnState`** — fin d'un tour, passage au suivant
- **`CreateActionRequestFunction`** — recalcul des actions autorisées
- **`handleBattle`** — décrémentation ou déclenchement de combat
- **`handleGateCards`** — gates éligibles à l'ouverture automatique
- **`ActiveGateCard`** — activation d'une gate (auto ou manuelle)
- **`onBattleEnd`** — résolution de fin de bataille
- **`CheckGameFinished`** — détection de fin de partie

### Bots

- **`bot-play`** — coup joué ou `TURN_SKIP` si aucune action scorée

## Cycle de vie d'un tour

1. Le joueur (ou le bot) envoie des actions via socket → events `socket` / `bot`.
2. À la fin du tour (`turn-action`), **`turnActionUpdater`** enchaîne :
   - `handleBattle`
   - `handleGateCards` / `ActiveGateCard`
   - `updateTurnState` (finalise le bundle du tour)
   - `CreateActionRequestFunction`
3. Le bundle est stocké en mémoire dans `roomState.gameLog.turnLogs`.
4. À la **fin de partie**, tous les bundles sont écrits en table `game_turn_log`.

## Persistance en base

Table **`game_turn_log`** :

- une ligne par tour ;
- colonne `log_data` (JSONB) = le `TurnLogBundle` complet ;
- index unique `(room_id, turn_number)`.

Les logs d'une partie **en cours** n'apparaissent pas encore en base : seules les parties terminées (ou nettoyées après timeout) sont consultables ici.

## Conseils de debug

- Comparez **`summaryStart`** et **`summaryEnd`** pour voir l'évolution du combat et du joueur actif.
- Un event **`permission`** + `level: warn` indique un refus côté serveur.
- Les events **`bot-play`** incluent le score et le label du coup choisi.
- Si un tour semble vide, vérifiez le tour précédent : la finalisation se fait au **début** de `updateTurnState`.
