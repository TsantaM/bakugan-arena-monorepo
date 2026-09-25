import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import type { CustomAnimationContext } from "../types"

const STREAM_COUNT = 22
const DRAIN_Y = 0.75

function createOrb(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function createStreamMote(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const mote = createOrb(color, size)
    // Stretched along local Z so `lookAt` turns it into a streak.
    mote.scale.set(1, 1, 2.6)
    return mote
}

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Demon Wizard — Exedra siphons every last point of G Power out of an ally.
 * Dark streams are torn from the drained bakugan and swallowed by Exedra,
 * which swells as the ally goes lifeless.
 * Plays before POWER_CHANGE; the gate destruction follows as a coup de grâce.
 */
export async function DemonWizardAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    const ally = data.targetBakugans?.[0]
    if (!source || !ally) return

    const exedraMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    const allyMesh = scene.getObjectByName(
        `${ally.key}-${ally.userId}`,
    ) as THREE.Sprite | undefined
    if (!exedraMesh || !allyMesh) return

    const darkus = new THREE.Color(getAttributColor("Darkus"))
    const void_ = darkus.clone().lerp(new THREE.Color(0x050208), 0.55)
    const glow = darkus.clone().lerp(new THREE.Color(0xc084fc), 0.5)

    const exedraMaterial = exedraMesh.material as THREE.SpriteMaterial
    const allyMaterial = allyMesh.material as THREE.SpriteMaterial
    const exedraColor = exedraMaterial.color.clone()
    const allyColor = allyMaterial.color.clone()
    const exedraScale = exedraMesh.scale.clone()
    const allyScale = allyMesh.scale.clone()

    const from = allyMesh.position.clone()
    const to = exedraMesh.position.clone()

    // Halo that tears the power out of the ally.
    const drainHalo = createOrb(glow, 0.55)
    drainHalo.position.set(from.x, DRAIN_Y, from.z)
    drainHalo.scale.setScalar(0.1)
    scene.add(drainHalo)

    // Halo that swallows it on Exedra's side.
    const intakeHalo = createOrb(void_, 0.7)
    intakeHalo.position.set(to.x, DRAIN_Y, to.z)
    intakeHalo.scale.setScalar(0.1)
    scene.add(intakeHalo)

    const motes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = []

    try {
        // 1 — the ally is seized: a dark halo closes around it
        await Promise.all([
            tween(drainHalo.material, { opacity: 0.85, duration: 0.3, ease: "power2.out" }),
            tween(drainHalo.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.35, ease: "power2.out" }),
            tween(intakeHalo.material, { opacity: 0.6, duration: 0.3, ease: "power2.out" }),
            tween(intakeHalo.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.35, ease: "power2.out" }),
            tween(allyMaterial.color, {
                r: glow.r,
                g: glow.g,
                b: glow.b,
                duration: 0.3,
                ease: "power1.out",
            }),
        ])

        // 2 — the power is dragged across, stream by stream
        const streams = Array.from({ length: STREAM_COUNT }, (_, index) => {
            const mote = createStreamMote(glow, 0.06 + Math.random() * 0.05)
            const jitter = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.5,
            )
            mote.position.copy(from).setY(DRAIN_Y).add(jitter)
            mote.lookAt(to.x, DRAIN_Y, to.z)
            scene.add(mote)
            motes.push(mote)

            const delay = index * 0.045
            return Promise.all([
                tween(mote.material, { opacity: 0.95, duration: 0.15, delay, ease: "power1.out" }),
                tween(mote.position, {
                    x: to.x,
                    y: DRAIN_Y,
                    z: to.z,
                    duration: 0.5,
                    delay,
                    ease: "power2.in",
                }),
            ]).then(() =>
                Promise.all([
                    tween(mote.material, { opacity: 0, duration: 0.12, ease: "power1.in" }),
                    // every swallowed stream makes Exedra's halo flare
                    tween(intakeHalo.scale, {
                        x: "+=0.12",
                        y: "+=0.12",
                        z: "+=0.12",
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: "sine.out",
                    }),
                ]).then(() => undefined),
            )
        })

        // The ally drains and withers while the streams fly.
        const withering = Promise.all([
            tween(allyMaterial.color, {
                r: void_.r,
                g: void_.g,
                b: void_.b,
                duration: 1,
                ease: "power1.inOut",
            }),
            tween(allyMesh.scale, {
                x: allyScale.x * 0.82,
                y: allyScale.y * 0.82,
                duration: 1,
                ease: "power1.inOut",
            }),
            tween(drainHalo.material, { opacity: 0, duration: 1, ease: "power1.in" }),
            tween(drainHalo.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1, ease: "power1.in" }),
        ])

        // Exedra swells on what it takes.
        const swelling = Promise.all([
            tween(exedraMaterial.color, {
                r: glow.r,
                g: glow.g,
                b: glow.b,
                duration: 0.9,
                ease: "power1.inOut",
            }),
            tween(exedraMesh.scale, {
                x: exedraScale.x * 1.3,
                y: exedraScale.y * 1.3,
                duration: 0.9,
                ease: "power2.out",
            }),
        ])

        await Promise.all([...streams, withering, swelling])

        // 3 — the intake collapses, Exedra settles with the stolen power
        await Promise.all([
            tween(intakeHalo.material, { opacity: 0, duration: 0.35, ease: "power1.in" }),
            tween(intakeHalo.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.35, ease: "power1.in" }),
            tween(exedraMesh.scale, {
                x: exedraScale.x,
                y: exedraScale.y,
                duration: 0.4,
                ease: "power2.inOut",
            }),
            tween(exedraMaterial.color, {
                r: exedraColor.r,
                g: exedraColor.g,
                b: exedraColor.b,
                duration: 0.4,
                ease: "power1.inOut",
            }),
        ])
    } finally {
        gsap.killTweensOf(exedraMaterial.color)
        gsap.killTweensOf(allyMaterial.color)
        gsap.killTweensOf(exedraMesh.scale)
        gsap.killTweensOf(allyMesh.scale)
        gsap.killTweensOf(drainHalo.material)
        gsap.killTweensOf(drainHalo.scale)
        gsap.killTweensOf(intakeHalo.material)
        gsap.killTweensOf(intakeHalo.scale)

        exedraMaterial.color.copy(exedraColor)
        exedraMesh.scale.copy(exedraScale)
        allyMaterial.color.copy(allyColor)
        allyMesh.scale.copy(allyScale)

        motes.forEach((mote) => {
            gsap.killTweensOf(mote.position)
            gsap.killTweensOf(mote.material)
            scene.remove(mote)
            disposeMesh(mote)
        })

        scene.remove(drainHalo)
        scene.remove(intakeHalo)
        disposeMesh(drainHalo)
        disposeMesh(intakeHalo)
    }
}
