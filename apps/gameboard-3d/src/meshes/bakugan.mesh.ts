import * as THREE from 'three'
import { type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { getAttributColor } from '../functions/get-attrubut-color'
import { GetSpritePosition } from '../functions/get-sprite-position'

function createSprite({ bakugan, scene, slot, slotIndex, userId }: { bakugan: bakuganOnSlot, scene: THREE.Scene, slot: portalSlotsTypeElement, slotIndex: number, userId: string }) {
    const bakuganTexture = new THREE.TextureLoader().load(`./../images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`)

    const bakuganMesh = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: bakuganTexture, transparent: true })
    )

    bakuganMesh.scale.set(2, 2, 1)
    bakuganMesh.position.set(0, 0.75, 0)
    bakuganMesh.name = `${bakugan.key}-${bakugan.userId}`
    bakuganMesh.userData = {
        attribut: bakugan.attribut,
        bakuganKey: bakugan.key,
    }

    const position = GetSpritePosition({
        bakugan: bakugan,
        slot: slot,
        slotIndex: slotIndex,
        userId: userId
    })

    if(!position) return

    bakuganMesh.position.set(position.x, 0.75, position.z)
    scene.add(bakuganMesh)
}

function createSphere({ bakugan, scene }: { bakugan: bakuganOnSlot, scene: THREE.Scene }) {

    const sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 64, 64),
        new THREE.MeshStandardMaterial({ color: getAttributColor(bakugan.attribut) })
    )

    sphereMesh.name = `${bakugan.key}-${bakugan.userId}-sphere`
    sphereMesh.material.visible = false
    scene.add(sphereMesh)
}


export {
    createSprite,
    createSphere
}