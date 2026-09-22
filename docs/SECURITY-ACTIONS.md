# Convention de sécurité des actions de jeu

Référence pour ajouter une action serveur (socket de gameplay, carte, effet).
**Toute nouvelle action doit passer la checklist de sa famille avant merge.**

---

## Les deux règles fondamentales

> ### 1. L'identité vient de la socket, jamais du payload
> Le `userId` présent dans un event est **choisi par le client**. La seule source
> fiable est `socket.handshake.auth.userId`, fixée à la connexion.
>
> ### 2. Le client ne choisit que parmi ce que le serveur a proposé
> Une action de jeu se déroule toujours en deux temps : le serveur **propose** une
> liste de coups légaux (*action request*), le client **désigne** un élément de
> cette liste. Le serveur doit reconfronter la réponse à sa propre proposition.

La règle 2 est celle qu'on oublie. Filtrer les cibles au moment de construire
l'offre (`onActivate`) ne protège de rien : c'est de la présentation. Sans
confrontation à la résolution, un client modifié renvoie ce qu'il veut, et tous
les filtres (bakugan piégé, protégé, slot sans gate…) sont contournés.

**Corollaire :** ne dupliquez jamais un filtre d'offre dans l'effet « pour
sécuriser ». Confrontez l'offre stockée. Le filtre reste au seul endroit où il
décrit une règle de jeu.

---

## Les trois familles d'actions

| Famille | Event socket | Requête serveur stockée dans |
| --- | --- | --- |
| **A. Action de tour** | `set-gate`, `set-bakugan`, `use-ability-card`, `active-gate-card`, `change-attribut`, `turn-action`, `forfait` | `ActivePlayerActionRequest` / `InactivePlayerActionRequest` |
| **B. Effet additionnel de capacité** | `ability-additional-request` | `roomState.AbilityAditionalRequest[]` |
| **C. Effet additionnel de gate** | `gate-card-additional-request` | `roomState.gateCardActionRequest[]` |

---

## Famille A — Action de tour

### Pipeline obligatoire

```ts
socket.on('mon-action', ({ roomId, userId, ...payload }: MonActionProps) => {
    // 1. IDENTITÉ — toujours en premier, avant toute lecture d'état
    if (!assertActor(socket, userId, 'mon-action')) return

    // 2. ROOM + PARTIE EN COURS
    const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
    if (!state) return
    if (state.status.finished === true) return

    // 3. LÉGALITÉ — le coup figure-t-il dans la request courante du joueur ?
    const checker = CheckTurnPermissions({
        roomState: state,
        userId,
        response: { type: 'MON_ACTION', ...payload },
    })
    if (!checker) {
        logPermissionDenied(state, 'mon-action', userId)
        return
    }

    // 4. EFFET
    clearAnimationsInRoom(roomId)
    logSocketEvent(state, { handler: 'mon-action', userId, input: payload, message: '…' })
    // …
})
```

### Checklist

- [ ] `assertActor(socket, userId, '<event>')` — [assert-actor.ts](../apps/bakugan-arena-server/src/sockets/assert-actor.ts)
- [ ] Room existante et `status.finished === false`
- [ ] `CheckTurnPermissions` — [ckeck-turn-permissions.ts](../apps/bakugan-arena-server/src/functions/ckeck-turn-permissions.ts)
- [ ] Le nouveau `type` est ajouté à `responseTypes` **et** au `switch` de `CheckTurnPermissions`
- [ ] Un builder d'offre existe dans [action-request-functions/](../libs/game-data/src/function/action-request-functions/)
- [ ] Le miroir client [`isTurnActionLegal`](../libs/game-data/src/function/is-turn-action-legal.ts) connaît aussi le nouveau type

`CheckTurnPermissions` implémente la règle 2 pour cette famille : il retrouve
l'action dans `mustDo | mustDoOne | optional` puis vérifie que la carte, le
bakugan et le slot envoyés figurent dans `action.data`. **Un `case` absent du
`switch` = aucune vérification de contenu** — le `default` implicite laisse
passer dès que le type d'action est présent dans la request.

> ⚠️ `CheckTurnActionRequest` **n'est pas** un contrôle de légalité : il vérifie
> seulement que le `userId` est un des deux joueurs de la room. Il ne remplace ni
> `assertActor`, ni `CheckTurnPermissions`.

---

## Famille B — Effet additionnel de capacité

Une capacité qui demande un choix au joueur retourne une `AbilityCardsActions`
depuis `onActivate`, puis reçoit la réponse dans `onAdditionalEffect`.

### Pipeline obligatoire

Déjà implémenté de façon générique dans
[abilities-additional-effect-socket.ts](../apps/bakugan-arena-server/src/sockets/abilities-additional-effect-socket.ts) :

```ts
const request = roomState?.AbilityAditionalRequest.find(/* bakuganKey + cardKey + userId */)

// Le répondant est le lanceur, SAUF si la request désigne l'adversaire
const responder = request?.data.target ?? request?.userId ?? resolution.userId
if (!assertActor(socket, responder, 'ability-additional-request')) return

if (request && !isAbilityResolutionAllowed(request, resolution)) { /* refus + log */ }
```

### Ce que vous avez à faire pour une nouvelle capacité

Si votre capacité réutilise un `AbilityCardsActions` existant (`SELECT_SLOT`,
`SELECT_BAKUGAN_ON_DOMAIN`, `MOVE_BAKUGAN_TO_ANOTHER_SLOT`, `ATTRACT_BAKUGAN`,
`SELECT_BAKUGAN_TO_SET`, `SELECT_ABILITY_CARD`) : **rien**. La validation est
automatique.

Si vous **ajoutez un nouveau type** de `AbilityCardsActions` :

- [ ] Ajouter le `case` correspondant dans
      [`isAbilityResolutionAllowed`](../apps/bakugan-arena-server/src/functions/validate-additional-resolution.ts)
- [ ] Ajouter l'expansion dans
      [`expandAbilityAdditional`](../apps/bakugan-arena-server/src/bot/ai/expand-legal-moves.ts) —
      sinon le bot retombe sur `SKIP_ACTION`
- [ ] Vérifier que le client renvoie **les valeurs de l'offre verbatim**, pas des
      valeurs recalculées depuis la scène 3D

Le `switch` de `isAbilityResolutionAllowed` est exhaustif sur le type de l'offre :
un type non traité ne compilera pas. C'est voulu.

### Règles de contenu

| Champ | Règle |
| --- | --- |
| `resolution.roomId / slot / cardKey / bakuganKey` | doivent égaler ceux de la request |
| cible (bakugan) | le triplet **(key, userId, slot)** doit figurer dans `request.data.bakugans` |
| destination (slot) | doit figurer dans `request.data.slots` |
| `SKIP_ACTION` | accepté si `request.data.skipable === true`, ou si l'offre est `CARD_FAILED` (le bot n'a rien d'autre à répondre) |

Le `userId` de la cible fait partie de la clé : **les deux joueurs peuvent avoir
le même bakugan en jeu**. Une recherche `find(b => b.key === target)` sans
`userId` frappe le mauvais bakugan.

---

## Famille C — Effet additionnel de gate

Symétrique de B, via
[gate-card-additional-effect-socket.ts](../apps/bakugan-arena-server/src/sockets/gate-card-additional-effect-socket.ts)
et `isGateResolutionAllowed`. La request est retrouvée sur **(cardKey, slot, userId)**
— une gate n'a pas de `bakuganKey`. `SKIP_ACTION` y est également accepté pour
`TURN_ACTION_LAUNCHER`, qui n'attend aucun choix.

> ⚠️ Contrairement à `isAbilityResolutionAllowed`, `isGateResolutionAllowed` se
> termine par un `default: return false`. Le compilateur ne vous préviendra donc
> **pas** si vous ajoutez un type de `gateCardAdditionalRequest` sans son `case` :
> il sera silencieusement refusé. Pensez-y en ajoutant un type.

---

## Effets de jeu : déplacer un bakugan

**N'écrivez jamais un déplacement à la main.** Un `push` / `splice` direct oublie
systématiquement une étape et produit des états incohérents.

```ts
const outcome = applyBakuganMove({
    roomState,
    bakugan,          // référence vivante sur fromSlot
    fromSlot,
    toSlot,
    origin: 'ABILITY',            // ou 'GATE' — pilote les protections
    trapWith: { key: cardKey },   // optionnel : pose statut.trapped à l'arrivée
    enableRenfort: true,
    customAnimations,
})

if (!outcome.moved) return        // outcome.reason dit pourquoi
// outcome.bakugan = le nouvel état (id réattribué, slot_id à jour)
```

[`applyBakuganMove`](../libs/game-data/src/function/ability-cards-effects/apply-bakugan-move.ts)
garantit, dans l'ordre : destination valide → mobilité de la cible →
`onRemoveBakugan` de la gate de départ → renfort sortant → **réattribution d'un
`id` libre sur le slot d'arrivée** → déplacement → animation → `onSetBakuganOnSlot`
de la gate d'**arrivée** → renfort entrant → réévaluation du combat →
`OpenGateCardActionRequest`.

### Points non négociables

| Règle | Pourquoi |
| --- | --- |
| `id` réattribué via `nextBakuganIdOnSlot(toSlot)` | le client 3D en dérive des identifiants DOM (`left-renfor-<id>`) ; un doublon fait cibler le mauvais sprite |
| `fromSlot.id !== toSlot.id` | sinon `push` puis `splice` sur le même tableau réordonne le slot — or l'ordre est significatif (gates lisant `bakugans[0]` / `[length-1]`) |
| `toSlot.portalCard !== null` | on ne se déplace que vers un slot portant une gate |
| `CheckBattleStillInProcess` **puis** `CheckBattle` si aucun combat en cours | clore un combat devenu invalide avant d'en démarrer un ; `CheckBattle` appelé pendant un combat le **termine** |

### Filtrer les cibles proposables

Une seule fonction, utilisée **aux deux bouts** (offre et application) :

```ts
import { canMoveBakugan } from '@bakugan-arena/game-data'

// dans onActivate
.filter((b) => canMoveBakugan(b, 'ABILITY'))
```

[`canMoveBakugan`](../libs/game-data/src/function/ability-cards-effects/can-move-bakugan.ts)
refuse `trapped`, `notRetreat`, et les protections de l'origine donnée
(`isProtectedAgainstGate` pour `'GATE'`, `isProtectedAgainstAbility` pour
`'ABILITY'` — voir [protection-status.ts](../libs/game-data/src/function/ability-cards-effects/protection-status.ts)).

N'énumérez plus les statuts à la main : un nouveau statut bloquant s'ajoute dans
`moveRefusalReason`, et toutes les cartes en bénéficient.

---

## Anti-patterns

Tous relevés en audit dans ce dépôt — ce ne sont pas des hypothèses.

**Faire confiance au `userId` du payload**
```ts
socket.on('forfait', ({ roomId, userId }) => { /* … */ })
```
→ un joueur faisait abandonner son adversaire (défaite + perte d'ELO).

**Filtrer uniquement à l'offre**
```ts
// onActivate
.filter((b) => !b.statut.trapped)
// onAdditionalEffect : plus aucun contrôle
```
→ un bakugan piégé était déplaçable en forgeant `resolution.data`.

**Utiliser le slot envoyé par le client comme destination**
```ts
const slotOfGate = roomState.protalSlots.find(s => s.id === resolution.slot)
```
→ destination arbitraire. `resolution.slot` doit être **comparé** à `request.slot`,
jamais utilisé tel quel sans confrontation.

**Garde en `&&` au lieu de `||`**
```ts
if (!slotOfGate && !deck && !userData) return   // ne se déclenche que si les TROIS manquent
```

**`splice` sur un `findIndex` non vérifié**
```ts
const i = arr.findIndex(...)
arr.splice(i, 1)        // i === -1 supprime le DERNIER élément
```

**`findIndex` en condition booléenne**
```ts
const ok = bakugan && index ? true : false   // index === 0 est falsy
```

**Chercher un bakugan sans son `userId`**
```ts
slot.bakugans.find(b => b.key === target)    // les deux joueurs peuvent l'avoir
```

---

## Recette : ajouter une action de tour

1. **Type** — ajouter le variant dans `responseTypes`
   ([is-turn-action-legal.ts](../libs/game-data/src/function/is-turn-action-legal.ts) côté client,
   [ckeck-turn-permissions.ts](../apps/bakugan-arena-server/src/functions/ckeck-turn-permissions.ts) côté serveur).
2. **Offre** — un builder dans `action-request-functions/` qui pousse l'action
   dans `ActivePlayerActionRequest` / `InactivePlayerActionRequest` avec **la
   liste exhaustive des choix légaux** dans `data`.
3. **Légalité** — un `case` dans le `switch` de `CheckTurnPermissions` qui
   confronte le payload à `action.data`.
4. **Socket** — le pipeline de la famille A, `assertActor` en première ligne.
5. **Bot** — l'expansion dans `expand-legal-moves.ts`, sinon le bot ne jouera
   jamais cette action.
6. **Test** — au minimum : un coup proposé est accepté, un coup forgé est refusé.

## Recette : ajouter une carte avec choix du joueur

1. `onActivate` retourne un `AbilityCardsActions` existant, cibles filtrées par
   `canMoveBakugan` (ou l'équivalent métier).
2. `onAdditionalEffect` applique l'effet via un helper partagé
   (`applyBakuganMove`, `dragBakuganToUserSlot`, `moveSelectedBakugan`,
   `moveBakuganToSelectedSlot`) — jamais de mutation manuelle du slot.
3. Vérifier le retour (`outcome.moved`) avant tout effet de bord secondaire
   (malus de puissance, message, blocage de gate) : **un effet refusé ne doit
   rien laisser derrière lui**.
4. Rien à faire côté validation si le type d'offre existe déjà.

---

## Réponse en cas de refus

Un garde qui refuse émet vers la socket fautive :

```ts
socket.emit('action-rejected', { event: '<event>', reason: '<RAISON>' })
```

| Raison | Sens |
| --- | --- |
| `ACTOR_MISMATCH` | la socket agit au nom d'un autre joueur |
| `RESOLUTION_NOT_OFFERED` | la réponse ne figure pas dans les choix proposés |

Un refus laisse la request en attente : le client peut renvoyer une réponse
valide, et le watchdog de room reprend la main si personne ne répond.
Les refus de légalité de la famille A sont journalisés par `logPermissionDenied`,
ceux des familles B et C par `logDiagnostic` sous les handlers
`ability-additional.rejected` / `gate-additional.rejected`. **Surveillez ces
handlers après l'ajout d'une carte** : un refus y apparaît immédiatement.

---

## État actuel des gardes

| Event | `assertActor` | `CheckTurnPermissions` | Partie finie |
| --- | :---: | :---: | :---: |
| `use-ability-card` | ✅ | ✅ | ✅ |
| `set-bakugan` | ✅ | ✅ | ✅ |
| `set-gate` | ✅ | ✅ | ✅ |
| `active-gate-card` | ✅ | ❌ | ✅ |
| `change-attribut` | ✅ | ❌ | ✅ |
| `turn-action` | ✅ | n/a | ✅ |
| `forfait` | ✅ | n/a | ✅ |
| `search-opponent` | ✅ | n/a | n/a |
| `cancel-search-opponent` | ✅ | n/a | n/a |
| `chalenge-someone` | ✅ | n/a | n/a |
| `chalenge-accept` | ✅ | n/a | n/a |
| `cancel-chalenge` | ✅ | n/a | n/a |
| `chalenge-rejected` | ✅ | n/a | n/a |
| `ability-additional-request` | ✅ | `isAbilityResolutionAllowed` | ✅ |
| `gate-card-additional-request` | ✅ | `isGateResolutionAllowed` | ✅ |

**Dette connue :** `active-gate-card` et `change-attribut` ne passent que par
`CheckTurnActionRequest` (simple appartenance à la room). Les deux ont bien une
offre côté serveur (`ACTIVE_GATE_CARD` et `CHANGE_ATTRIBUTE` sont gérés par
`isTurnActionLegal`) : il reste à brancher `CheckTurnPermissions` dessus, en
ajoutant le `case` `CHANGE_ATTRIBUTE` à son `switch`.
