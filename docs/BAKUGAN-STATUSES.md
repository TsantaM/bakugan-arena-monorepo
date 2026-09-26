# Statuts et effets de durée

Référence des statuts portés par un `bakuganOnSlot`, de ce qui les applique et
surtout de **ce qui les fait réellement agir**.

> Un statut n'est qu'un drapeau dans l'état. Poser `statut.machin = {…}` ne
> produit aucun effet tant qu'un point du moteur ne le lit pas. Chaque ligne du
> tableau ci-dessous indique où se trouve ce lecteur — si la colonne est vide,
> le statut est décoratif.

---

## Le tableau des statuts

`bakuganOnSlot.statut`, défini dans
[`type/room-types.ts`](../libs/game-data/src/type/room-types.ts).

| Statut | Signification | Lu par |
| --- | --- | --- |
| `trapped` | Ne peut pas quitter son emplacement | `canMoveBakugan` → tous les déplacements |
| `notRetreat` | Ne peut pas battre en retraite | `canMoveBakugan` |
| `poisoned` | Perd de la puissance à chaque changement de tour | `ApplyTurnStatusEffects` |
| `protectedAgainstGate` | Immunisé aux effets de carte portail | `isProtectedAgainst('GATE')` |
| `protectedAgainstAbility` | Immunisé aux effets de capacité | `isProtectedAgainst('ABILITY')` |
| `protected` | Les deux à la fois | les deux helpers ci-dessus |
| `absorbPowerBoost` | Copie les gains de puissance des adversaires du même emplacement | `ApplyAbsorbPowerBoost` |
| `toSave` | Épargné au lieu d'être éliminé en fin de combat | `on-battle-end.ts` |
| `reanimated` | Marque un Bakugan ramené en jeu | informatif |
| `lifeLess` | Vidé de sa puissance : ne peut plus rien faire, ne peut plus être protégé | filtres de capacité, `ElimineBakuganEffect` |
| `powerLocked` | **Ignore tout gain et toute perte de puissance** | `PowerChange` |
| `guardian` | **Encaisse les malus visant ses alliés du même emplacement** | `PowerChange` |
| `reflectMalus` | **Convertit le prochain malus en bonus, puis se consomme** | `PowerChange` |
| `banished` | **Aucune réanimation possible** | `canBeRevived` |
| `markedForDeath` | **Condamné : éliminé si l'auteur de la marque gagne** | `onWin` de la carte qui l'a posé |

Les cinq derniers sont **optionnels** dans le type (`?:`). C'est délibéré : les
rendre obligatoires aurait cassé la quinzaine de constructions littérales de
`statut` dispersées dans le code. Lisez-les toujours avec `?? false`.

### La forme d'un statut

```ts
type onSlotStatutType = false | {
    check: true,
    origin: 'GATE' | 'ABILITY',
    key: string,          // la clé de la carte qui l'a posé
    value?: number,       // montant associé (dégâts de poison, puissance drainée…)
    ability?: { key: string, user: bakuganOnSlot },
}
```

**Renseignez toujours `key`.** C'est ce qui permet à `onCanceled` de ne lever
que son propre statut. `origin` sert aux vérifications de protection et au
libellé des tooltips.

`abilityBlock` est l'exception : c'est un **booléen nu**, sans source. Une carte
qui le pose doit donc tracer sa cible ailleurs (voir
[`EXCLUSIVE-ABILITIES.md`](./EXCLUSIVE-ABILITIES.md#oncanceled--défaire-exactement-ce-qui-a-été-fait)).

---

## L'ordre de résolution de `PowerChange`

Tout changement de puissance passe par
[`PowerChange`](../libs/game-data/src/function/ability-cards-effects/power-change.ts).
**N'écrivez jamais `currentPower += x` directement** — vous court-circuiteriez
tout ce qui suit.

```
PowerChange(bakugan, G, malus)
│
├─ powerLocked ? ───────────────────────► rien ne passe, message, retour
│
├─ malus = true
│   ├─ reflectMalus ? ──────► le statut se consomme, relance en malus:false, retour
│   ├─ un allié guardian ? ─► relance sur le gardien, retour
│   ├─ protégé (et pas ignoreProtection) ? ──► message, retour
│   └─ currentPower -= G, animation POWER_CHANGE
│
└─ malus = false
    ├─ currentPower += G, animation POWER_CHANGE
    └─ ApplyAbsorbPowerBoost : les adversaires absorbPowerBoost du même
       emplacement copient le gain
```

Trois conséquences à connaître :

1. **`powerLocked` prime sur tout**, y compris sur les bonus du porteur. C'est
   le compromis assumé de Carapace Têtue : immunité totale contre neutralité
   totale.
2. **Le gardien encaisse ses propres malus.** `findGuardianFor` refuse de
   chercher un gardien pour un Bakugan qui est lui-même gardien — sans quoi deux
   gardiens sur un même emplacement se renverraient le malus indéfiniment.
3. **`ignoreProtection: true`** est fait pour les annulations : reprendre un
   bonus qu'on a soi-même donné ne doit pas être bloqué par une protection
   acquise entre-temps.

---

## Les effets de changement de tour

[`turn-status-effects.ts`](../libs/game-data/src/function/turn-status-effects.ts),
appelé par `updateTurnState` à chaque tour, juste après le changement de joueur
et **avant** le recyclage des emplacements vides.

### Poison

Chaque Bakugan porteur de `poisoned` perd `status.value` points (défaut
`POISON_TICK_POWER` = 50), via `PowerChange` — donc soumis aux protections et à
`powerLocked` comme n'importe quel autre malus. Une animation
`status:poison-tick` est émise, volontairement courte puisqu'elle peut se
rejouer à chaque tour.

Le statut `poisoned` existait dans le type depuis longtemps mais n'était lu
nulle part : il ne faisait rien. Il est désormais branché.

### Verrous d'emplacement

`portalSlotsTypeElement.setLock` interdit temporairement de poser une carte
portail sur un emplacement :

```ts
slot.can_set = false
slot.setLock = { locked: true, key: MaCarte.key, userId, turns: 2 }
```

À chaque tour, `turns` décroît ; à zéro, `setLock` repasse à `false` et
`can_set` à `true`. Le recyclage des emplacements vides de `updateTurnState`
respecte le verrou (`if (!p.can_set && !p.portalCard && !p.setLock)`) — sans
cette condition, il rouvrait l'emplacement au tour suivant.

---

## Réanimation

Quatre chemins peuvent ramener un Bakugan éliminé : la carte portail
**Renaissance**, la carte portail **Engourdissement**, la **Flèche du
Sagittaire**, et les renforts.

Tous passent désormais par
[`canBeRevived`](../libs/game-data/src/function/ability-cards-effects/revive-status.ts),
qui refuse un Bakugan banni.

Le bannissement est stocké **à deux endroits**, et c'est nécessaire :

| Emplacement | Pourquoi |
| --- | --- |
| `bakuganOnSlot.statut.banished` | pour l'affichage (tooltip) tant qu'il est sur le terrain |
| `bakuganInDeck.bakuganData.banished` | **la source de vérité** — le `bakuganOnSlot` disparaît à l'élimination, c'est l'entrée de deck que les cartes de réanimation consultent |

Si vous ajoutez un nouveau chemin de réanimation, passez-le par `canBeRevived`.

---

## Affichage

Les statuts apparaissent dans l'infobulle d'un Bakugan sur le plateau 3D
([`mesh-tooltip-content.ts`](../apps/gameboard-3d/src/functions/mesh-tooltip-content.ts)).
Ajouter un statut visible demande deux gestes :

1. l'ajouter à `emptyStatut()` et au tableau `candidates` ;
2. ajouter sa clé `tooltip_status_*` dans les trois `battle.json`.

Le libellé reçoit `{source}`, résolu depuis le `key` du statut — d'où
l'importance de le renseigner.
