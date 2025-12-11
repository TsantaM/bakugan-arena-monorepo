import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { createSphere, createSprite } from '../meshes/bakugan.mesh'
import { SetBakuganAnimation } from '../animations/set-bakugan-animation'
import { MoveBakugan } from '../animations/move-bakugan-animation'


async function SetBakuganFunctionAnimation({ bakugan, scene, slot, camera, userId }: { scene: THREE.Scene, bakugan: bakuganOnSlot, slot: portalSlotsTypeElement, camera: THREE.PerspectiveCamera, userId: string }) {
    createSprite({
        bakugan: bakugan,
        scene: scene,
        slot: slot,
        slotIndex: Slots.indexOf(bakugan.slot_id),
        userId: userId
    })

    createSphere({
        bakugan: bakugan,
        scene: scene,
    })

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    const sphere = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}-sphere`)

    if (!bakuganMesh) return
    if (!sphere) return


    slot.bakugans.filter((baks) => baks.userId === bakugan.userId).forEach((b) => {
        if (b.userId === bakugan.userId && b.id !== bakugan.id) {
            MoveBakugan({
                bakugan: b,
                scene: scene,
                slot: slot,
                userId: userId
            })
        }

    })

    await SetBakuganAnimation({
        bakugan: bakugan,
        bakuganMesh: bakuganMesh as THREE.Sprite<THREE.Object3DEventMap>,
        camera: camera,
        scene: scene,
        slot: slot,
        sphere: sphere as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>,
        userId: userId
    })
}

export {
    SetBakuganFunctionAnimation
}