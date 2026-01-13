import { BakuganList } from "../../battle-brawlers/bakugans";
import type { AnimationDirectivesTypes } from "../../type/animations-directives";
import type { bakuganOnSlot, portalSlotsTypeElement } from "../../type/room-types";

type Props = {
    initialSlot: portalSlotsTypeElement,
    newSlot: portalSlotsTypeElement,
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
}

type MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot }: Props) => void



export const MoveToAnotherSlotDirectiveAnimation: MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot }) => {
    const animation: AnimationDirectivesTypes = {
        type: 'MOVE_TO_ANOTHER_SLOT',
        data: {
            bakugan: bakugan,
            initialSlot: initialSlot,
            newSlot: newSlot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} move to ${newSlot.id}`
        }]
    }

    animations.push(animation)
}