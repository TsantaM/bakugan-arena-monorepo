import * as THREE from 'three'
import gsap from 'gsap'
import { GetSpritePosition } from '../functions/get-sprite-position'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type MoveBakuganProps = {
    scene: THREE.Scene,
    slot: portalSlotsTypeElement,
    bakugan: bakuganOnSlot,
    userId: string
}


export function MoveBakugan({ scene, bakugan, slot, userId }: MoveBakuganProps) {
    const newPosition = GetSpritePosition({
        slot: slot,
        userId: userId,
        bakugan: bakugan,
        slotIndex: Slots.indexOf(slot.id)
    })
    console.log(`${bakugan.key}-${bakugan.userId}`)
    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!bakuganMesh) return
    if (!newPosition) return

    const timeline = gsap.timeline()
    timeline.fromTo(bakuganMesh.position, {
        x: bakuganMesh.position.x,
        z: bakuganMesh.position.z
    }, {
        x: newPosition.x,
        z: newPosition.z
    })

    return timeline
}