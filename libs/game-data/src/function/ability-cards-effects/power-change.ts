import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";
import { type EffectOrigin, isProtectedAgainst } from "./protection-status.js";

type PowerChangeType = {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    G: number,
    malus: boolean,
    /** Source of the effect. Defaults to ABILITY. */
    origin?: EffectOrigin,
    /** Skip protection checks (e.g. reversing a previous boost on cancel). */
    ignoreProtection?: boolean,
}

/** Copies a power boost to bakugans on the same slot that have absorbPowerBoost. Only absorbs from opponents (different userId). */
export function ApplyAbsorbPowerBoost({ roomState, bakugan, G }: {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    G: number
}) {
    if (G <= 0) return

    const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
    if (!slot) return

    slot.bakugans.forEach((b) => {
        if (b === bakugan) return
        if (b.userId === bakugan.userId) return
        if (!b.statut.absorbPowerBoost) return

        b.currentPower += G

        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [b],
            powerChange: G,
            malus: false,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })
    })
}

/**
 * Cherche le garde du slot : un allie porteur du statut `guardian` qui encaisse
 * a la place de ses allies les malus qui les visent (Serment du Gardien).
 */
function findGuardianFor(roomState: stateType, bakugan: bakuganOnSlot): bakuganOnSlot | undefined {
    // Un garde encaisse ses propres malus : pas de renvoi entre deux gardes.
    if (bakugan.statut.guardian) return undefined

    const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
    if (!slot) return undefined

    return slot.bakugans.find((b) =>
        b !== bakugan &&
        b.userId === bakugan.userId &&
        !!b.statut.guardian &&
        !b.statut.powerLocked
    )
}

export function PowerChange({
    roomState,
    bakugan,
    G,
    malus,
    origin = 'ABILITY',
    ignoreProtection = false,
}: PowerChangeType) {
    // Puissance verrouillee (Carapace Tetue) : ni gain ni perte ne passent.
    if (bakugan.statut.powerLocked) {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_power_locked',
            params: { name: Bakugans[bakugan.key].name },
        })
        return
    }

    if (malus) {
        // Carapace Reflechissante : le malus est converti en bonus, une seule fois.
        if (bakugan.statut.reflectMalus) {
            bakugan.statut.reflectMalus = false

            NewAdditionnalMessage({
                roomState: roomState,
                key: 'bakugan_malus_reflected',
                params: { name: Bakugans[bakugan.key].name, power: G },
            })

            PowerChange({ roomState, bakugan, G, malus: false, origin, ignoreProtection })
            return
        }

        // Serment du Gardien : un allie prend le malus a sa place.
        const guardian = findGuardianFor(roomState, bakugan)
        if (guardian) {
            NewAdditionnalMessage({
                roomState: roomState,
                key: 'bakugan_malus_redirected',
                params: {
                    name: Bakugans[bakugan.key].name,
                    guardian: Bakugans[guardian.key].name,
                },
            })

            PowerChange({ roomState, bakugan: guardian, G, malus: true, origin, ignoreProtection })
            return
        }

        if (!ignoreProtection && isProtectedAgainst(bakugan, origin)) {
            NewAdditionnalMessage({
                roomState: roomState,
                key: 'bakugan_protected',
                params: { name: Bakugans[bakugan.key].name },
            })
            return
        }

        bakugan.currentPower -= G

        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: G,
            malus: true,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })
    } else {
        bakugan.currentPower += G

        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: G,
            malus: false,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })

        ApplyAbsorbPowerBoost({ roomState, bakugan, G })
    }
}
