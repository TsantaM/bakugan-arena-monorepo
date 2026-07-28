# Documentation des logs de partie

Ce guide explique comment lire les logs enregistrés par le serveur Bakugan Arena, tour par tour.

## Vue d'ensemble

Chaque partie produit une série de **bundles** (un par tour). Un bundle regroupe :

- les **événements** survenus pendant le tour ;
- un **résumé d'état** au début et à la fin du tour ;
- les **actions disponibles** pour les joueurs après le tour.

Les logs sont accumulés **en mémoire** pendant la partie, puis **persistés en base** à la fin de la partie (victoire, forfait, match nul) ou lors du **cleanup** de la salle.

Seules les salles **ayant au moins un log persisté** apparaissent dans la recherche admin.

## Interface admin

### Recherche (`/dashboard/admin/game-logs`)

- Filtres : ID de salle, pseudo joueur, statut (terminée / en cours).
- Colonnes : joueurs, statut, **nombre de tours loggés**, date.
- Seules les rooms avec logs en base sont listées.

### Détail d'une salle (`/dashboard/admin/game-logs/[roomId]`)

- **Sélecteur de tour** : `Tour {n} · turnCount {turnCount}`.
- **Résumé du tour** : `summaryStart`, `summaryEnd`, `actionRequests`.
- **Timeline des événements** : handler, catégorie, niveau, message, input/output JSON.
- Les événements **`diagnostic`** sont surlignés en ambre dans la liste.
- Bouton **Documentation** : ouvre cette référence dans un panneau latéral.

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
| `actionRequests` | Actions recalculées après le tour |

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
| `output` | Résultat ou snapshot de décision |
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
| `timer` | Horloges joueurs (via diagnostics `syncClocks`) |
| `system` | Initialisation de partie, événements système |
| **`diagnostic`** | **Décisions du moteur : ce qui a été émis ou bloqué, et pourquoi** |

## Couche diagnostic

Les événements `diagnostic` répondent à : *« pourquoi rien ne se passe ? »*. Ils sont en **`warn`** quand un blocage est suspect.

### Handlers diagnostic

| Handler | Signification |
|---------|---------------|
| `turn-action-request.emit` | Tentative d'émission des menus d'action aux clients |
| `syncClocks` | Démarrage / arrêt des chronomètres |
| `turnActionUpdater.earlyReturn` | Pipeline de tour interrompu (souvent gate additional) |
| `gate-additional.created` | Création et envoi d'une résolution gate |
| `gate-additional.resolved` | Réponse client à une gate additional |
| `ability-additional.created` | Création et envoi d'une résolution ability |
| `ability-additional.resolved` | Réponse client à une ability additional |
| `bot.skip-turn-request` | Bot ignore un `turn-action-request` (additional en cours) |
| `bot.play-failed` | Bot n'a pas pu émettre d'action |

### `turn-action-request.emit` — champs clés

```json
{
  "source": "turnActionUpdater",
  "blockers": {
    "finished": false,
    "gateAdditionalPending": 1,
    "abilityAdditionalPending": 0
  },
  "actionRequests": {
    "active": { "mustDo": 1, "mustDoOne": 0, "optional": 2, "total": 3 },
    "inactive": { "total": 0 }
  },
  "connectedUsers": [
    { "userId": "...", "gameboardSocket": "...", "nextjsSocket": "..." }
  ],
  "results": [
    {
      "role": "active",
      "userId": "...",
      "emitted": false,
      "reason": "additional request en attente",
      "actionCounts": { "total": 3 }
    }
  ]
}
```

**Raisons fréquentes (`reason`) :**
- `socket actif absent` / `socket inactif absent` — client déconnecté ou mauvais socket
- `additional request en attente` — gate/ability additional non résolue
- `aucune action disponible (merged vide)` — moteur n'a rien à proposer à l'inactif
- `émis` — OK

### `syncClocks` — champs clés

```json
{
  "shouldRun": ["userId_actif"],
  "timerRegistryPresent": true,
  "transitions": [
    {
      "userId": "...",
      "before": true,
      "after": false,
      "remaining": 287,
      "transition": "stopped"
    }
  ]
}
```

- `shouldRun` vide + partie non finie → **timer arrêté car aucune action en cours**.
- `timerRegistryPresent: false` → entrée timer manquante pour la room.

## Handlers classiques (non diagnostic)

### Sockets joueur

- `set-gate`, `set-bakugan`, `use-ability-card`, `turn-action`, `forfait`

### Moteur

- `createGameState`, `updateTurnState`, `CreateActionRequestFunction`
- `handleBattle`, `handleGateCards`, `ActiveGateCard`, `onBattleEnd`, `CheckGameFinished`

### Bots

- `bot-play` — coup joué ou `TURN_SKIP`

## Workflow de debug d'un blocage

1. Ouvrir le **dernier tour** enregistré.
2. Filtrer visuellement les événements **diagnostic** (surbrillance ambre).
3. Vérifier le dernier `turn-action-request.emit` :
   - `emitted: false` + actions `total > 0` → client n'a pas reçu le menu.
4. Vérifier `syncClocks` :
   - `shouldRun` vide → timer normallement arrêté.
5. Chercher `earlyReturn` ou `gate/ability-additional.created` sans `.resolved` suivant → résolution bloquée.
6. Pour un bot : `bot.skip-turn-request` ou absence de `bot-play` après un emit réussi.

## Persistance en base

Table **`game_turn_log`** : une ligne par tour, colonne `log_data` (JSONB).

Les parties **en cours** n'apparaissent pas tant qu'elles ne sont pas terminées ou nettoyées.
