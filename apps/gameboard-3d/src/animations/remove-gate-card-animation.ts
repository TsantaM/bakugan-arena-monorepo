import * as THREE from 'three'
import gsap from 'gsap'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'

function RemoveGateCardAnimation({ mesh }: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> }) {

    const color = new THREE.Color('white')
    const black = new THREE.Color('black')
    mesh.material.map = null

    const timeline = gsap.timeline()
    timeline.to(mesh.material.emissive, {
        r: color.r,
        g: color.g,
        b: color.b
    })
    timeline.fromTo(mesh.material.color, {
        r: 1,
        g: 1,
        b: 1
    }, {
        r: 0,
        g: 0,
        b: 0
    })
    timeline.to(mesh.material.emissive, {
        r: 0,
        g: 0,
        b: 0,
        onComplete: () => {
            mesh.removeFromParent()
        }
    })

}

export {
    RemoveGateCardAnimation
}