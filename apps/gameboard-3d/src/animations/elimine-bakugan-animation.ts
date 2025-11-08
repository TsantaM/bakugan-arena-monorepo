import * as THREE from 'three'
import gsap from 'gsap'
import { getAttributColor } from '../functions/get-attrubut-color'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type ElimineBakuganAnimationProps = {
    bakugan: bakuganOnSlot,
    userId: string,
    slot: portalSlotsTypeElement,
    scene: THREE.Scene,
    onCompleteFunction?: () => void
}

function ElimineBakuganAnimation({ bakugan, scene, slot, userId, onCompleteFunction }: ElimineBakuganAnimationProps) {

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite<THREE.Object3DEventMap>

    const attributColor = getAttributColor(bakugan.attribut)
    const color = new THREE.Color(attributColor)

    if (!bakuganMesh) return
    if (!bakuganMesh) return

    const timeline = gsap.timeline({
        onComplete: () => {
            scene.remove(bakuganMesh)
            if(onCompleteFunction) {
                onCompleteFunction()
            }
        }
    })
    const index = Slots.indexOf(slot.id)

    console.log('set', bakugan.userId, userId)

    if (index === -1) return


    timeline.to(bakuganMesh.material.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 1
    })

    timeline.fromTo(bakuganMesh.scale, {
        x: 2,
        y: 2,
        z: 1
    }, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1
    })

}

export {
    ElimineBakuganAnimation
}