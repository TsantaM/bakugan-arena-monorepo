import * as THREE from 'three'
import gsap from 'gsap'
import { getAttributColor } from '../functions/get-attrubut-color'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type ComeBackBakuganAnimationProps = {
    bakugan: bakuganOnSlot,
    camera: THREE.PerspectiveCamera,
    userId: string,
    slot: portalSlotsTypeElement,
    scene: THREE.Scene,
    onCompleteFunction?: () => void
}

function ComeBackBakuganAnimation({ bakugan, camera, scene, slot, userId, onCompleteFunction }: ComeBackBakuganAnimationProps) {

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite<THREE.Object3DEventMap>
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 64, 64),
        new THREE.MeshStandardMaterial({ color: getAttributColor(bakugan.attribut) })
    )

    scene.add(sphere)

    const attributColor = getAttributColor(bakugan.attribut)
    const color = new THREE.Color(attributColor)

    console.log(sphere)

    if (!bakuganMesh) return
    if (!bakuganMesh) return

    const timeline = gsap.timeline({
        onComplete: () => {
            scene.remove(bakuganMesh)
            scene.remove(sphere)
            if(onCompleteFunction) {
                onCompleteFunction()
            }
        }
    })
    const index = Slots.indexOf(slot.id)

    console.log('set', bakugan.userId, userId)

    if (index === -1) return

    const position = sphere.position

    if (!position) return
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

    timeline.fromTo(sphere.scale, {
        x: 0,
        y: 0,
        z: 0
    }, {
        x: 0.3,
        y: 0.3,
        z: 0.3,
        duration: 0.2
    })

    timeline.fromTo(sphere.position, {
        x: bakuganMesh.position.x,
        y: 0.5,
        z: bakuganMesh.position.z,
        duration: 1
    }, {
        x: bakugan.userId === userId ? camera.position.x : -camera.position.x,
        y: 0.5,
        z: bakugan.userId === userId ? camera.position.z : -camera.position.z,
    })

}

export {
    ComeBackBakuganAnimation
}