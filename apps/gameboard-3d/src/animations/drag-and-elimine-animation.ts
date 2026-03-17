import * as THREE from 'three'
import gsap from 'gsap'
import type { bakuganOnSlot } from '../../../../libs/game-data/src/type/type-index'
import { getAttributColor } from '../functions/get-attrubut-color'

type DragAndElimineBakuganProps = {
    scene: THREE.Scene
    bakugan: bakuganOnSlot
    cardUser: bakuganOnSlot,
    bakugansMeshs?: THREE.Sprite<THREE.Object3DEventMap>[],
}


export function DragAndElimineAnimation({ scene, bakugan, cardUser, bakugansMeshs }: DragAndElimineBakuganProps): Promise<void> {
    return new Promise((resolve) => {

        const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite<THREE.Object3DEventMap>
        const cardUserMesh = scene.getObjectByName(`${cardUser.key}-${cardUser.userId}`) as THREE.Sprite<THREE.Object3DEventMap>
        if (!bakuganMesh || !cardUserMesh) return resolve()

        const cardUserPosition = cardUserMesh.position.clone()
        const bakuganMeshPosition = bakuganMesh.position.clone()

        const timeline = gsap.timeline({
            onComplete: () => {
                scene.remove(bakuganMesh)
                resolve() // ✅ La promesse se résout à la fin de l'animation
            }
        })

        timeline.fromTo(bakuganMesh.position, {
            x: bakuganMeshPosition.x,
            z: bakuganMeshPosition.z
        }, {
            x: cardUserPosition.x * 0.75,
            z: cardUserPosition.z * 0.75,
            duration: 0.75,
            ease: 'power2.in'
        })

        const attributColor = getAttributColor(bakugan.attribut)
        const color = new THREE.Color(attributColor)

        // Étape 1 : flash de la couleur d’attribut
        timeline.to(bakuganMesh.material.color, {
            r: color.r,
            g: color.g,
            b: color.b,
            duration: 1
        })

        // Étape 2 : disparition graduelle du Bakugan
        timeline.fromTo(
            bakuganMesh.scale,
            { x: 2, y: 2, z: 1 },
            { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.in' }
        )

        bakugansMeshs?.forEach((mesh) => {
            if (mesh.name !== bakuganMesh.name) return
            const meshsIndex = bakugansMeshs.findIndex((b) => b.name === mesh.name)
            if (meshsIndex === -1) return
            bakugansMeshs.splice(meshsIndex, 1)
        })

    })
}