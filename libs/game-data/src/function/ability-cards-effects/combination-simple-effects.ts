import { BakuganList } from "../../battle-brawlers/bakugans"
import type { AnimationDirectivesTypes } from "../../type/animations-directives"
import { type attribut } from "../../type/game-data-types"
import { type portalSlotsTypeElement } from "../../type/room-types"
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/power-change"

export function CombinationSimpleFunction({ animations, slotOfGate, bakuganKey, userId, attribut, attributWeak} : { animations: AnimationDirectivesTypes[], slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut}) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userSecondAttribut = BakuganList.find((b) => b.key === user?.key)
    const userAttribut = [user?.attribut, userSecondAttribut?.seconaryAttribut]
    const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
    const opponentsKey = opponents.map((o) => o.key)
    const opponentsSecondAttributs = BakuganList.filter((b) => opponentsKey.includes(b.key)).map((b) => b.seconaryAttribut)
    const opponentsAttributs = [opponents.map((o) => o.attribut), opponentsSecondAttributs].flat()

    if (user && userAttribut && opponents && opponentsAttributs) {
        if (userAttribut.includes(attribut) && opponentsAttributs.includes(attributWeak)) {
            user.currentPower += 100
            PowerChangeDirectiveAnumation({
                animations: animations,
                bakugans: [user],
                powerChange: 100,
                malus: false
            })
        }
    }
}