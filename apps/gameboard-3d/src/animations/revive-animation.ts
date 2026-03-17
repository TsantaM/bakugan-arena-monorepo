import { BakuganList } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { getAttributColor } from '../functions/get-attrubut-color'
import gsap from 'gsap'

function updateRevivedUI({
    currentUserId,
    bakuganUserId,
}: {
    currentUserId: string
    bakuganUserId: string
}) {

    const isLocalPlayer = currentUserId === bakuganUserId

    const selector = isLocalPlayer
        ? '.left-eliminated .circle.left-circle'
        : '.right-eliminated .circle.right-circle'

    const circles = Array.from(
        document.querySelectorAll<HTMLDivElement>(selector)
    )

    const targetCircle = isLocalPlayer
        // gauche → premier mort
        ? circles.find(c => c.classList.contains('dead'))
        // droite → dernier mort
        : [...circles].reverse().find(c => c.classList.contains('dead'))

    if (!targetCircle) {
        console.warn('Aucun cercle disponible à revive')
        return
    }

    targetCircle.classList.remove('dead')
}


export function ReviveBakuganAnimation({ bakuganKey, bakuganUserId, scene, userId, camera }: { bakuganKey: string, bakuganUserId: string, scene: THREE.Scene, userId: string, camera: THREE.PerspectiveCamera }): Promise<void> {
    return new Promise((resolve) => {

        const bakugan = BakuganList.find((b) => b.key === bakuganKey)
        if (!bakugan) return resolve()

        const bakuganTexture = new THREE.TextureLoader().load(`./../images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`)

        const bakuganMesh = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: bakuganTexture, transparent: true })
        )

        bakuganMesh.scale.set(50, 50, 1)
        bakuganMesh.name = `${bakugan.key}-${bakuganUserId}`
        bakuganMesh.userData = {
            attribut: bakugan.attribut,
            bakuganKey: bakugan.key,
            powerLevel: bakugan.powerLevel,
            image: bakugan.image,
            userId: bakuganUserId,
        }
        bakuganMesh.material.transparent = true

        bakuganMesh.position.set(1, 2, 3)

        scene.add(bakuganMesh)

        const attributColor = getAttributColor(bakugan.attribut)
        const color = new THREE.Color(attributColor)

        // Création de la sphère (Bakugan qui revient)
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 64, 64),
            new THREE.MeshStandardMaterial({ color: getAttributColor(bakugan.attribut) })
        )
        scene.add(sphere)


        const timeline = gsap.timeline({
            onComplete: () => {
                // Nettoyage et résolution
                updateRevivedUI({bakuganUserId: bakuganUserId, currentUserId: userId})
                scene.remove(bakuganMesh)
                scene.remove(sphere)
                resolve()
            }
        })

        timeline.fromTo(bakuganMesh.material, {
            opacity: 0
        }, {
            opacity: 1
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
            { x: 5, y: 5, z: 1 },
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
                y: bakuganMesh.position.y,
                z: bakuganMesh.position.z
            },
            {
                x: bakuganUserId === userId ? camera.position.x : -camera.position.x,
                y: 0.5,
                z: bakuganUserId === userId ? camera.position.z : -camera.position.z,
                duration: 1,
                ease: 'power2.inOut'
            }
        )

    })
}