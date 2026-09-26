# Animations de cartes

Les animations « sur mesure » d'une carte — celles qui lui donnent son identité
visuelle, par opposition aux animations génériques du plateau (ouvrir une carte
portail, déplacer un Bakugan, afficher un changement de puissance) qui vivent
dans `src/animations/`.

---

## Comment une animation arrive jusqu'ici

Le moteur de jeu n'anime rien : il **émet une directive**, que le client joue.

```
libs/game-data
   CustomAnimationDirective({ roomState, animationKey, sourceBakugan,
                              targetBakugans, slotId, payload })
        │  pousse { type: 'CUSTOM_ANIMATION', data: {…} } dans roomState.animations
        ▼
   socket → apps/gameboard-3d/src/sockets/sockets-handlers.ts
        │  const play = CustomAnimationsRegistry[data.animationKey]
        ▼
   votre fonction, avec la scène, la caméra et les meshes
```

Deux conséquences :

- **Une clé absente du registre est un silence, pas une erreur.** Le jeu
  continue normalement. C'est confortable, et c'est aussi pourquoi on oublie
  d'enregistrer une animation sans jamais s'en apercevoir.
- **La directive est `await`ée.** Tant que votre promesse n'est pas résolue, la
  file d'animations est bloquée et le joueur attend. Une animation qui ne
  termine jamais gèle la partie.

---

## Le registre et ses trois espaces de clés

[`registry.ts`](./registry.ts) fusionne deux sous-registres. La clé dit d'où
vient l'animation :

| Forme de la clé | Origine | Sous-registre |
| --- | --- | --- |
| `ma-capacite` | clé d'une carte capacité ou exclusive | [`ability-cards/registry.ts`](./ability-cards/registry.ts) |
| `gate:ma-porte` | clé d'une carte portail, préfixée | [`gate-cards/registry.ts`](./gate-cards/registry.ts) |
| `status:poison-tick` | effet de statut, pas une carte | `ability-cards/registry.ts` |

Le préfixe `gate:` évite les collisions entre une carte portail et une capacité
qui porteraient le même nom ; il est posé par `gateAnimationKey()` côté moteur,
vous n'avez jamais à l'écrire à la main.

`CUSTOM_ANIMATION_KEYS` est dérivé du registre et alimente l'Animation Lab du
sandbox : enregistrer une animation suffit à l'y faire apparaître.

---

## La boîte à outils

[`shared/animation-kit.ts`](./shared/animation-kit.ts) rassemble des **phrases
visuelles** : des séquences complètes, autonomes, qui gèrent leur propre
libération de ressources. Une animation de carte est censée se lire comme
l'enchaînement de deux à quatre de ces phrases, avec sa palette et son rythme.

C'est le point important : ces animations ne se distinguent pas par leur
plomberie Three.js — elles se distinguent par **quelles phrases, dans quel
ordre, avec quelles couleurs**.

### Les phrases

| Fonction | Ce qu'elle raconte |
| --- | --- |
| `playCastCharge` | Le lanceur se charge : aura d'attribut, sprite qui enfle (ou se tasse si `scale < 1`) |
| `playImpactOn` | Les cibles grisonnent et tremblent, en cascade |
| `playDrainTo` | La puissance est arrachée aux sources et aspirée par la destination |
| `playBoardWave` | Onde de choc au sol + éclairage de scène |
| `playSlotBreak` | La carte portail se fissure, des blocs s'écrasent dessus |
| `playVortex` | Tourbillon, sur place ou d'un point à un autre |
| `playBurstAt` | Gerbe de particules montante |
| `playRainOn` | Pluie de projectiles sur des cibles |
| `playStatusHalo` | Halo pulsé : la marque des statuts qui durent |

### Les utilitaires

`attributePalette(attribut, tintShift?)` construit la palette
`{ core, mid, tip }` à partir d'un attribut. Le `tintShift` optionnel décale la
teinte — c'est ce qui permet à une carte de s'éloigner de son attribut quand son
thème l'exige : Venin Rampant est une carte Darkus teintée vert toxique, Pacte
Sanglant une carte Aquos virée au rouge sombre.

`meshOf`, `meshesOf`, `strongestMeshOf`, `gateMeshOf`, `groundPositionOf`
retrouvent les objets de la scène. Les Bakugan absents sont **ignorés
silencieusement** — un Bakugan peut avoir quitté le terrain entre l'émission de
la directive et sa lecture.

`tween` et `wait` enveloppent GSAP en promesses.

---

## Écrire une animation

```ts
import {
    attributePalette, groundPositionOf, meshOf, meshesOf,
    playBoardWave, playCastCharge, playImpactOn,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Ma Capacité — Pyrus Machin.
 *
 * 1) le lanceur se charge
 * 2) l'onde part de lui
 * 3) les cibles encaissent
 */
export async function MaCapaciteAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return                     // toujours : le mesh peut manquer

    const colors = attributePalette("Pyrus", { color: 0xfb923c, amount: 0.2 })

    await playCastCharge({ ctx, source, colors })
    await playBoardWave({ ctx, origin: groundPositionOf(source), colors, radius: 6 })
    await playImpactOn({ targets: meshesOf(ctx, ctx.data.targetBakugans), colors })
}
```

Puis dans `ability-cards/registry.ts` :

```ts
import { MaCapaciteAnimation } from "./ma-capacite-animation"
// …
"ma-capacite": MaCapaciteAnimation,
```

### Les règles

1. **Sortir tôt si un mesh manque.** `meshOf` retourne `undefined` sans
   prévenir. Ne présumez jamais de la présence d'un Bakugan.
2. **Toujours libérer.** Chaque effet de `animations/effects/` retourne un
   handle `{ done, dispose }`. Le `dispose` va dans un `finally` — sinon la
   géométrie et les matériaux fuient à chaque activation. Les phrases du kit le
   font déjà pour vous ; c'est le principal intérêt de passer par elles.
3. **Restaurer ce qu'on a modifié.** Teinter un sprite, changer son échelle : la
   valeur d'origine doit être remise, y compris si l'animation est interrompue.
4. **Rester bref.** Deux à trois secondes. Une animation de statut rejouée
   chaque tour doit rester sous la seconde.
5. **Le `payload` est du contenu, pas de la logique.** Il transporte des
   chiffres déjà calculés par le moteur (puissance, nombre d'éliminations) qui
   permettent de moduler l'intensité. N'y prenez jamais de décision de jeu.

### Moduler avec le payload

C'est ce qui rend une animation vivante plutôt que figée :

```ts
const kills = Number(ctx.data.payload?.kills ?? 0)

await playCastCharge({ ctx, source, colors,
    scale: 1.2 + kills * 0.04,
    density: 80 + kills * 15 })
```

Griffes Affamées grossit avec le nombre d'adversaires déjà tombés ; Rage
Sismique élargit son onde à mesure que les alliés du lanceur meurent.

---

## Vocabulaire visuel

Quelques conventions qui se sont installées, à respecter pour que le joueur
lise une carte sans avoir à la lire :

- **Un sprite qui enfle** = une charge offensive. **Un sprite qui se tasse**
  (`scale < 1`) = une posture défensive — Carapace Têtue, Carapace
  Réfléchissante, Galerie d'Ombre.
- **Un vortex à rotation négative** (`spins: -3`) = quelque chose est repris,
  retourné, inversé — Lame Usurpatrice, Contre-Courant.
- **`playStatusHalo` en fin de séquence** = un statut vient d'être posé et va
  durer.
- **Palette blanchie** = un effacement plutôt qu'une attaque — Jugement du
  Légendaire.
- **Deux cartes miroir partagent leur structure** et n'opposent que leur
  palette : Pacte Sanglant (rouge sombre) et Grâce Salvatrice (blanc) enchaînent
  les mêmes phrases.

---

## Tester

L'**Animation Lab** rejoue n'importe quelle clé du registre sans avoir à monter
une partie. C'est le seul moyen raisonnable d'itérer : une animation ne se
valide ni au typage ni à la lecture.

Il vit dans le panneau d'administration de l'app Next
(`/dashboard/admin/sandbox`), qui embarque cette page sandbox dans une iframe :
`src/sandbox.ts` publie `CUSTOM_ANIMATION_KEYS` au parent via un message
`SANDBOX_READY`, et le panneau en fait la liste déroulante des animations
jouables. Enregistrer une animation dans le registre suffit donc à l'y voir
apparaître — rien à déclarer côté Next.

Il faut les deux serveurs :

```bash
pnpm --filter ./apps/gameboard-3d dev
```

```bash
pnpm --filter ./apps/bakugan-arena dev
```
