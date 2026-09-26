# Écrire une capacité exclusive

Référence pour ajouter une carte capacité exclusive (`exclusiveAbilitiesType`).
Les capacités **standard** (`abilityCardsType`) suivent exactement le même
contrat, à deux champs près signalés plus bas.

> Avant toute chose : une capacité est une **action de jeu**. Si elle demande
> quelque chose au joueur (choisir une cible, un emplacement, un Bakugan), elle
> relève de la famille B de [`SECURITY-ACTIONS.md`](./SECURITY-ACTIONS.md).
> Lisez-la — la règle « le client ne choisit que parmi ce que le serveur a
> proposé » n'est pas optionnelle.

---

## La checklist

Une carte n'existe vraiment que quand ces sept points sont faits. En sauter un
ne provoque aucune erreur de compilation — la carte est juste invisible, muette
ou inanimée en partie.

| # | Quoi | Où |
| --- | --- | --- |
| 1 | Le fichier de la carte | `libs/game-data/src/battle-brawlers/exclusive-abilities/<cle>.ts` |
| 2 | L'enregistrement | `battle-brawlers/exclusive-abilities.ts` → import + entrée dans `ExclusiveAbilities` |
| 3 | Le câblage sur un Bakugan | `battle-brawlers/bakugans/<famille>.ts` → `exclusiveAbilities: ['<cle>']` |
| 4 | Nom + description | `libs/i18n/locales/{fr,en,ar}/gameData.json` → `exclusiveAbilities.<cle>` |
| 5 | Messages de combat | `libs/i18n/locales/{fr,en,ar}/battle.json` |
| 6 | L'animation 3D | `apps/gameboard-3d/src/animations/custom-animations/` ([README](../apps/gameboard-3d/src/animations/custom-animations/README.md)) |
| 7 | La vérification | typecheck des 5 paquets + un harnais de comportement |

**Point 3 :** la clé dans `exclusiveAbilities` est une simple chaîne, jamais
vérifiée par le compilateur. Une faute de frappe donne un Bakugan qui pointe
vers une carte inexistante, silencieusement. C'est arrivé deux fois dans ce
repo (`regain-subit`, `souffle-infini`). Vérifiez avec un script qui croise
`BakuganList` et `ExclusiveAbilities`.

---

## Le contrat de carte

```ts
export const MaCapacite: exclusiveAbilitiesType = {
    key: 'ma-capacite',            // kebab-case, identique au nom de fichier
    maxInDeck: 1,                  // exemplaires autorisés dans un deck
    usable_in_neutral: true,       // utilisable hors combat ?
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',             // pilote la texture de carte par défaut
    onActivate({ roomState, userId, bakuganKey, slot }) { /* … */ return null },
}
```

### Les champs

| Champ | Rôle réel |
| --- | --- |
| `key` | Identité de la carte. **Persistée dans les decks en base** — la renommer casse les decks existants. |
| `maxInDeck` | Nombre d'exemplaires autorisés à la construction. |
| `usable_in_neutral` | `false` = la carte n'est proposée que pendant un combat. |
| `usable_if_user_not_on_domain` | `true` = proposée même quand son Bakugan n'est pas sur le terrain. Cas rare. |
| `attribut` | Optionnel. Sans `image`, le client retombe sur `ability_card_<ATTRIBUT>.jpg`. Le renseigner suffit donc à avoir un visuel correct. |
| `image` | Optionnel. Visuel dédié. |
| `slotLimits` | `true` = les filtres de déplacement restreignent les emplacements proposés aux emplacements adjacents. Lu par `drag-bakugan-ability-filter`, `move-opponent-ability-filter`, `move-bakugan-ability-filters`. |
| `fusionWith` | Voir [Capacités Fusion](#capacités-fusion). |
| `extraInputs` | **Purement déclaratif aujourd'hui** : le champ est typé et renseigné sur plusieurs cartes, mais aucun code ne le lit. Le renseigner documente l'intention, ça ne produit aucun comportement. Ne comptez pas dessus. |

`abilityCardsType` (capacités standard) ajoute un champ `attribut` qui, lui,
**filtre l'appariement avec l'attribut du Bakugan lanceur**, et n'a pas de
`usable_if_user_not_on_domain`.

---

## Le cycle de vie

```
        ┌─ activationConditions({ roomState, userId })   ← la carte fait-elle quelque chose, là, maintenant ?
 OFFRE ─┤
        └─ canUse({ roomState, bakugan })                ← ce Bakugan-ci peut-il la lancer d'où il est ?
              │
              ▼
        onActivate({ roomState, userId, bakuganKey, slot })
              │
              ├─ return null ......................... effet immédiat, terminé
              ├─ return AbilityCardFailed(...) ....... échec, message au joueur
              └─ return <AbilityCardsActions> ........ demande au joueur
                        │
                        ▼
                  (le client répond)
                        │
                        ▼
              onAdditionalEffect({ resolution, roomData })

 PLUS TARD ─┬─ onWin({ roomState, userId, slot }) ..... le lanceur gagne le combat
            ├─ onCanceled({ roomState, userId, bakuganKey, slot })
            └─ onTargetDie({ roomState, target, status, source })
```

### `activationConditions` et `canUse` : la confusion classique

Ce sont **deux filtres différents, appelés à deux endroits différents**, et
c'est la source d'erreur numéro un.

| | `activationConditions` | `canUse` |
| --- | --- | --- |
| Signature | `({ roomState, userId })` | `({ roomState, bakugan })` |
| Connaît le lanceur ? | **Non** — juste le joueur | **Oui** — le `bakuganOnSlot` candidat |
| Question posée | « cette carte aurait-elle un effet ? » | « ce Bakugan précis peut-il la lancer d'ici ? » |
| Appelée par | `SelectAbilityCardFilters` / `SelectAbilityCardInNeutralFilters` | `UseAbilityCardActionRequest`, après les filtres |

En pratique : tout ce qui dépend de **où se trouve le lanceur** (est-il dans le
combat en cours ? y a-t-il un adversaire sur son emplacement ? sa carte portail
est-elle celle de l'adversaire ?) va dans `canUse`. Tout ce qui est une
condition **globale** (y a-t-il au moins deux Bakugan sur le terrain ? le joueur
a-t-il des capacités déjà consommées ?) va dans `activationConditions`.

Aucun des deux n'est rejoué à la résolution. Ils construisent l'offre, rien de
plus — d'où la règle de confrontation de `SECURITY-ACTIONS.md`.

Trois autres verrous s'appliquent **avant** ces hooks et n'ont pas à être
redupliqués dans vos cartes : `turnState.use_ability_card`,
`turnState.ability_card_block.blocked`, et le `abilityBlock` du Bakugan lanceur.
Un Bakugan `lifeLess` ne se voit proposer aucune carte.

### La demande au joueur en deux temps

Dès qu'une carte a besoin d'un choix, `onActivate` **retourne une demande** au
lieu d'agir, et l'effet part dans `onAdditionalEffect`.

```ts
onActivate({ roomState, userId, bakuganKey, slot }) {
    const animation = AbilityCardFailed({ abilityKey: MaCapacite.key })
    if (!roomState) return animation

    const caster = getCaster({ roomState, slot, bakuganKey, userId })
    if (!caster) return animation

    const targets = getOpponentsOnField(roomState, userId).filter(/* … */)
    if (targets.length === 0) return animation   // rien à cibler → échec net

    return {
        type: 'SELECT_BAKUGAN_ON_DOMAIN',
        message: { key: 'prompt_select_bakugan_target', params: { abilityKey: MaCapacite.key } },
        bakugans: targets.map((b) => ({ key: b.key, userId: b.userId, slot: b.slot_id })),
    }
},

onAdditionalEffect({ resolution, roomData }) {
    if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

    const { bakugan, slot, userId } = resolution.data

    // REVALIDATION — la liste ci-dessus n'était qu'une proposition.
    // L'état a pu changer, et la réponse vient du client.
    if (userId === resolution.userId) return              // pas de tir ami
    const target = roomData.protalSlots.find((s) => s.id === slot)
        ?.bakugans.find((b) => b.key === bakugan && b.userId === userId)
    if (!target) return

    PowerChange({ roomState: roomData, bakugan: target, G: 100, malus: true })
}
```

Types de demandes disponibles (`AbilityCardsActions`) : `SELECT_BAKUGAN_ON_DOMAIN`,
`SELECT_SLOT`, `SELECT_BAKUGAN_TO_SET`, `MOVE_BAKUGAN_TO_ANOTHER_SLOT`,
`ATTRACT_BAKUGAN`, `SELECT_ABILITY_CARD`, et `CARD_FAILED`.

**Ne retournez jamais `null` pour signaler un échec.** `null` veut dire « effet
appliqué, rien à demander ». Un échec se dit avec
`AbilityCardFailed({ abilityKey })`, qui affiche un message au joueur.

---

## `onCanceled` : défaire exactement ce qui a été fait

Le hook le plus facile à rater, parce qu'il ne se déclenche que dans une
partie sur dix et qu'aucun test de typage ne le couvre.

> **La règle : `onCanceled` doit défaire ce que *cette activation-ci* a fait —
> ni plus, ni moins.**

Deux pièges rencontrés en écrivant les cartes de ce repo :

- **Rendre plus qu'on n'a pris.** Une carte qui rechargeait les capacités
  consommées des alliés remettait, à l'annulation, *toutes* les capacités à
  `used: true` — y compris celles que le joueur n'avait jamais dépensées.
- **Lever le statut de quelqu'un d'autre.** `abilityBlock` est un simple booléen
  sans source. Une carte qui muselait une cible libérait, à l'annulation, *tous*
  les Bakugan muselés du terrain, y compris par d'autres cartes.

Le remède dans les deux cas : **tracer ce qu'on a modifié** dans
`roomState.persistantAbilities`, dont le champ `fusion: string[]` sert de
bloc-notes libre.

```ts
// à l'activation
roomState.persistantAbilities.push({
    id: roomState.persistantAbilities.length + 1,
    key: MaCapacite.key,
    bakuganKey, userId, canceled: false,
    fusion: touched,                  // ce que j'ai modifié, identifié
})

// à l'annulation
const record = [...roomState.persistantAbilities].reverse().find(
    (a) => a.key === MaCapacite.key && !a.canceled
        && a.userId === userId && a.bakuganKey === bakuganKey,
)
if (!record) return
record.canceled = true
record.fusion?.forEach(/* défaire précisément ça */)
```

Pour les statuts, la convention est plus simple : **stockez toujours votre `key`
dans le statut**, et ne levez que les statuts qui portent cette clé.

```ts
const status = target.statut.poisoned
if (!status || status.key !== MaCapacite.key) return
target.statut.poisoned = false
```

Pour un simple bonus de puissance, `PowerChange` avec `malus` inversé et
`ignoreProtection: true` suffit — la protection ne doit pas empêcher de
reprendre un bonus qu'on avait soi-même donné.

---

## Capacités Fusion

Une carte Fusion se greffe sur une carte mère déjà activée.

- `fusionWith: 'carte-mere'` est lu **uniquement par le deck builder** : la carte
  Fusion ne peut être ajoutée que si sa mère est déjà dans le deck.
- Le lien **en partie** est fait à la main dans le `onActivate` de la Fusion :
  elle cherche l'activation mère dans `slot.activateAbilities`, refuse si elle
  est absente ou annulée, applique son bonus, puis s'inscrit dans le
  `fusion: string[]` de l'activation mère.
- Conséquence : annuler la mère doit aussi annuler ses fusions. Les cartes
  mères existantes (`dragonoid-plus`, `chaos-of-darkness`, `dual-gazer`,
  `d-strike-attack`) parcourent leur tableau `fusion` dans leur `onCanceled`.

---

## Les primitives à réutiliser

N'écrivez pas à la main ce que le moteur fait déjà — ces fonctions gèrent les
protections, les animations, les messages i18n et l'état de combat.

| Besoin | Primitive |
| --- | --- |
| Changer une puissance | `PowerChange` — **jamais** `currentPower += x` à la main |
| Éliminer | `ElimineBakuganEffect` |
| Renvoyer en main sans éliminer | `ComeBackBakuganEffect` |
| Déplacer | `applyBakuganMove`, `dragBakuganToUserSlot`, `moveBakuganToSelectedSlot` |
| Proposer un déplacement de soi | `requestMoveSelfSlotSelection` |
| Annuler une capacité adverse | `CancelAbilityCardEffect` |
| Protéger | `ProtectCardEffect` / `RemoveProtectionCardEffect` |
| Bloquer les capacités (global) | `BlockAbilityCardsEffect` |
| Voisinage | `getAdjacentsSlots`, `getJuxtaposablesSlots` |
| Vérifier qu'une cible est déplaçable | `canMoveBakugan` |
| Message au joueur | `NewAdditionnalMessage` |
| Animation | `CustomAnimationDirective` |

Des raccourcis de lecture d'état sont regroupés dans
[`exclusive-abilities/helpers.ts`](../libs/game-data/src/battle-brawlers/exclusive-abilities/helpers.ts) :
`getCaster`, `getOpponentsOnField`, `getOpponentsOnSlot`, `getAlliesOnSlot`,
`weakestOf`, `strongestOf`, `countEliminated`, `isInActiveBattle`.

---

## i18n

Deux catalogues, trois langues, aucun repli silencieux à surveiller : une clé
manquante en `fr` ou `ar` retombe sur l'anglais, une clé absente partout affiche
la clé brute.

**`gameData.json` → `exclusiveAbilities.<cle>`** : le nom et la description de
la carte.

**`battle.json`** : les messages de combat. Les placeholders sont `{param}`, et
`resolveBattleMessage` enrichit les paramètres avant interpolation :

- `abilityKey` remplit `{ability}`, `{description}`, `{source}`, et `{name}`
  **s'il n'y a pas déjà un `name` explicite** ;
- passer `name` **et** `abilityKey` ensemble donne donc `{name}` = le Bakugan et
  `{ability}` = la carte. C'est la combinaison à utiliser pour « X active Y ».

---

## Vérifier

Le typage ne prouve à peu près rien ici : les hooks sont tous optionnels, les
clés sont des chaînes, et les bugs d'annulation ne se voient qu'à l'exécution.

```bash
# les cinq paquets
cd libs/game-data       && ./node_modules/.bin/tsc --noEmit
cd libs/i18n            && ./node_modules/.bin/tsc --noEmit
cd apps/gameboard-3d    && ./node_modules/.bin/tsc --noEmit
cd apps/bakugan-arena-server && ./node_modules/.bin/tsc -p tsconfig.json --noEmit
cd apps/bakugan-arena   && ./node_modules/.bin/tsc -p tsconfig.json --noEmit
```

Au-delà, écrivez un harnais jetable : `createBakuganOnSlot` et
`createEmptyPortalSlots` (dans `function/sandbox/`) permettent de monter un
`stateType` complet en une vingtaine de lignes, d'appeler `onActivate` /
`onAdditionalEffect` / `onWin` / `onCanceled` à la main et d'assener des
assertions sur `currentPower` et les statuts. Testez en priorité :

1. l'effet nominal ;
2. **l'annulation** — et qu'elle ne touche que ce que la carte avait fait ;
3. l'interaction avec une cible protégée ou `powerLocked` ;
4. pour tout ce qui dure, le passage de tour (`updateTurnState`).
