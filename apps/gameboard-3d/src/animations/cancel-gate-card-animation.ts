import * as THREE from 'three'
import gsap from 'gsap'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'


function CancelGateCardAnimation({ slot, mesh }: { slot: portalSlotsTypeElement, mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> }) {

    if (slot.portalCard === null) return
    if(slot.state.open === false) return
    const timeline = gsap.timeline()

    timeline.fromTo(mesh.material.color, {
        r: 1,
        g: 1,
        b: 1
    }, {
        r: 0.1,
        g: 0.1,
        b: 0.1
    })

    return timeline

}

export {
    CancelGateCardAnimation
}