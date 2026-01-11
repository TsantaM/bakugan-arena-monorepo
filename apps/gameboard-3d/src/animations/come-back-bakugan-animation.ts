import * as THREE from 'three'
import gsap from 'gsap'
import { getAttributColor } from '../functions/get-attrubut-color'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type ComeBackBakuganAnimationProps = {
  bakugan: bakuganOnSlot
  camera: THREE.PerspectiveCamera
  userId: string
  slot: portalSlotsTypeElement
  scene: THREE.Scene,
  bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
  onCompleteFunction?: () => void
}

export function ComeBackBakuganAnimation({
  bakugan,
  camera,
  scene,
  slot,
  userId,
  bakugansMeshs
}: ComeBackBakuganAnimationProps): Promise<void> {
  return new Promise((resolve) => {
    const bakuganMesh = scene.getObjectByName(
      `${bakugan.key}-${bakugan.userId}`
    ) as THREE.Sprite<THREE.Object3DEventMap>

    if (!bakuganMesh) return resolve()

    // Création de la sphère (Bakugan qui revient)
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 64, 64),
      new THREE.MeshStandardMaterial({ color: getAttributColor(bakugan.attribut) })
    )
    scene.add(sphere)

    const attributColor = getAttributColor(bakugan.attribut)
    const color = new THREE.Color(attributColor)

    const index = Slots.indexOf(slot.id)
    if (index === -1) return resolve()

    const position = sphere.position
    if (!position) return resolve()

    // === Timeline GSAP ===
    const timeline = gsap.timeline({
      onComplete: () => {
        // Nettoyage et résolution
        scene.remove(bakuganMesh)
        scene.remove(sphere)
        resolve()
      }
    })

    // Étape 1 : le Bakugan prend la couleur de son attribut
    timeline.to(bakuganMesh.material.color, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: 1
    })

    // Étape 2 : le Bakugan disparaît
    timeline.fromTo(
      bakuganMesh.scale,
      { x: 2, y: 2, z: 1 },
      { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.in' }
    )

    // Étape 3 : la sphère apparaît (repli du Bakugan)
    timeline.fromTo(
      sphere.scale,
      { x: 0, y: 0, z: 0 },
      { x: 0.3, y: 0.3, z: 0.3, duration: 0.2 }
    )

    // Étape 4 : retour vers le joueur
    timeline.fromTo(
      sphere.position,
      {
        x: bakuganMesh.position.x,
        y: 0.5,
        z: bakuganMesh.position.z
      },
      {
        x: bakugan.userId === userId ? camera.position.x : -camera.position.x,
        y: 0.5,
        z: bakugan.userId === userId ? camera.position.z : -camera.position.z,
        duration: 1,
        ease: 'power2.inOut'
      }
    )

    const meshsIndex = bakugansMeshs.findIndex((b) => b === bakuganMesh)
    if(meshsIndex === -1) return
    bakugansMeshs.splice(meshsIndex, 1)

  })
}
