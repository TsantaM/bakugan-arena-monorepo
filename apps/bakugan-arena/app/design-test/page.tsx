'use client'

import GateCardOnBoard from "@/components/elements/battlefield/game-board/gate-cards"
import { Button } from "@/components/ui/button"
import { bakuganOnSlot, Bakugans, portalSlotsTypeElement } from "@bakugan-arena/game-data"
import { useState } from "react"


export default function DesignTest() {

    const [slot, setSlot] = useState<portalSlotsTypeElement>({
        activateAbilities: [],
        bakugans: [],
        can_set: true,
        portalCard: null,
        id: "slot-2",
        state: {
            open: false,
            blocked: false,
            canceled: false
        }
    })

    const user = '1'
    const opponent = '2'

    const userBakugan: bakuganOnSlot = {
        abilityBlock: false,
        assist: false,
        attribut: 'Aquos',
        currentPower: 370,
        image: 'sirenoid',
        key: 'sirenoid-aquos',
        userId: user,
        powerLevel: 370
    }

    const opponentBakugan: bakuganOnSlot = {
        abilityBlock: false,
        assist: false,
        attribut: 'Darkus',
        currentPower: 340,
        image: 'hydranoid',
        key: 'hyranoid-darkus',
        userId: opponent,
        powerLevel: 340
    }

    const setGate = () => {
        const newSlot: portalSlotsTypeElement = {
            ...slot,
            can_set: false,
            portalCard: {
                key: 'reacteur-aquos',
                userId: '1'
            }
        }
        setSlot(newSlot)
    }

    const setBakugans = () => {
        const newSlot: portalSlotsTypeElement = {
            ...slot,
            bakugans: [userBakugan, opponentBakugan]
        }
        setSlot(newSlot)
    }

    const openGate = () => {
        const newSlot: portalSlotsTypeElement = {
            ...slot,
            state: {
                ...slot.state,
                open: true
            }
        }
        setSlot(newSlot)

    }

    const cancelGate = () => {
        const newSlot: portalSlotsTypeElement = {
            ...slot,
            state: {
                ...slot.state,
                open: true,
                canceled: true
            }
        }
        setSlot(newSlot)
    }

    const blockGate = () => {
        const newSlot: portalSlotsTypeElement = {
            ...slot,
            state: {
                ...slot.state,
                blocked: true
            }
        }
        setSlot(newSlot)

    }

    const reset = () => {
        const newSlot: portalSlotsTypeElement = {
            activateAbilities: [],
            bakugans: [],
            can_set: true,
            portalCard: null,
            id: "slot-2",
            state: {
                open: false,
                blocked: false,
                canceled: false
            }
        }
        setSlot(newSlot)
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-5">

            <div className="w-[200px]">
                <GateCardOnBoard slot={slot} userId={user} />
            </div>

            <div className="flex items-center gap-5">
                <Button onClick={setGate}>Set Gate Card</Button>
                <Button onClick={setBakugans}>Set Bakugans</Button>
                <Button onClick={openGate}>Open Gate</Button>
                <Button onClick={cancelGate}>Cancel Gate</Button>
                <Button onClick={blockGate}>Block Gate</Button>
                <Button onClick={reset}>Reset Slot</Button>
            </div>
        </div>
    )
}