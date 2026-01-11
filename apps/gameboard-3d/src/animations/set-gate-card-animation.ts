import * as THREE from 'three'
import gsap from 'gsap'
import { GateCardsList } from '@bakugan-arena/game-data'
import { getSlotMeshPosition } from '../functions/get-slot-mesh-position'

export function SetGateCardAnimation({
    cardMesh,
    index,
    card,
    userId,
    gateCardMeshs
}: {
    cardMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>
    index: number
    card: { key: string; userId: string },
    userId: string,
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
}): Promise<void> {

    return new Promise((resolve) => {
        const cardData = GateCardsList.find((c) => c.key === card.key)
        if (!cardData) return resolve()

        const color = new THREE.Color('white')
        const position = getSlotMeshPosition({ index })
        if (!position) return resolve()

        if(card.userId === userId) {
            cardMesh.userData.cardName = cardData.name
        }

        gateCardMeshs.push(cardMesh)

        const timeline = gsap.timeline({
            onComplete: () => {
                resolve() // ✅ l’animation est terminée, on résout la promesse
            }
        }).timeScale(1)

        // Animation principale
        timeline.fromTo(
            cardMesh.scale,
            {
                x: 0,
                y: 0,
                z: 0,
            },
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                onStart: () => {
                    cardMesh.material.emissiveIntensity = 10
                    const undertimeline = gsap.timeline()
                    undertimeline.to(cardMesh.material.emissive, {
                        r: color.r,
                        g: color.g,
                        b: color.b,
                    })
                    undertimeline.to(cardMesh.material.emissive, {
                        r: 0,
                        g: 0,
                        b: 0,
                    })
                },
            }
        )
    })
}
