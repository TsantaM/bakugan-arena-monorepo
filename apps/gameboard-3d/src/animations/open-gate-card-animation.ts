import { GateCardsList, type portalSlotsTypeElement } from "@bakugan-arena/game-data";
import gsap from "gsap";
import * as THREE from "three";
import { getAttributColor } from "../functions/get-attrubut-color";

export function OpenGateCardAnimation({ mesh, slot }: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>, slot: portalSlotsTypeElement }) {

    if (slot.portalCard === null) return;
    console.log('eh')

    const cardData = GateCardsList.find((c) => c.key === slot.portalCard?.key)

    if (!cardData) return
    const color = cardData.attribut ? new THREE.Color(getAttributColor(cardData.attribut)) : new THREE.Color('white')
    const texture = new THREE.TextureLoader().load(`./../images/cards/${cardData.image}`)
    const overlay = mesh.clone()
    overlay.material.emissiveIntensity = 10
    mesh.parent?.add(overlay)
    overlay.position.copy(mesh.position)

    const timeline = gsap.timeline()
    timeline.to(overlay.material.emissive, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 1,
        onComplete: () => {
            mesh.material.map = texture
            gsap.fromTo(mesh.material.color, {
                r: 0,
                g: 0,
                b: 0
            }, {
                r: 1,
                g: 1,
                b: 1
            })
        }
    })
    timeline.to(overlay.material.emissive, {
        r: 0,
        g: 0,
        b: 0,
        duration: 1,
        onComplete: () => {
            overlay.removeFromParent()
        }
    })
    return timeline

}