import type { bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data";
import { SetBakuganFunctionAnimation } from "./set-bakugan-function-animation";
import * as THREE from 'three'
import { AddRenfortToBattleField } from "../animations/add-renfort-to-battlefield";

export function AddRenfortAnimationAndFunction({ }: {}) {

}

export async function SetBakuganAndAddRenfortAnimationAndFunction({ bakugan, scene, slot, camera, userId, bakugansMeshs }: { scene: THREE.Scene, bakugan: bakuganOnSlot, slot: portalSlotsTypeElement, camera: THREE.PerspectiveCamera, userId: string, bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] }) {

    const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)

    if (!powerContainer) return
    const final_power = parseInt(powerContainer.innerHTML) + bakugan.currentPower

    await SetBakuganFunctionAnimation({
        bakugan: bakugan,
        camera: camera,
        scene: scene,
        slot: slot,
        userId: userId,
        bakugansMeshs
    })

    AddRenfortToBattleField({
        bakugan: bakugan,
        final_power: final_power,
        userId: userId
    })

}

export async function AddRenfortToBattleAnimationFunction({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string}) {
    const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)

    if (!powerContainer) return
    const final_power = parseInt(powerContainer.innerHTML) + bakugan.currentPower

    AddRenfortToBattleField({
        bakugan: bakugan,
        final_power: final_power,
        userId: userId
    })
}