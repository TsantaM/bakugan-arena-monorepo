import gsap from "gsap"
import * as THREE from "three"

export type PowerDrainColors = {
    /** Bright color of the flowing streams. */
    stream?: THREE.ColorRepresentation
    /** Color of the halo that tears the power out of a source. */
    source?: THREE.ColorRepresentation
    /** Color of the halo that swallows it at the destination. */
    intake?: THREE.ColorRepresentation
}

export type PowerDrainStreamOptions = {
    scene: THREE.Scene
    /** Where the power is taken from — bakugans, gate cards, anything. */
    sources: THREE.Vector3[]
    /** Where it goes. */
    destination: THREE.Vector3
    colors?: PowerDrainColors
    /** Streams pulled from each source. */
    streamsPerSource?: number
    /** Height the streams travel at. */
    height?: number
    /** Optional meshes to swell / wither while the power moves. */
    destinationMesh?: THREE.Object3D
    sourceMeshes?: THREE.Object3D[]
}

export type PowerDrainStreamHandle = {
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_HEIGHT = 0.75

function createOrb(color: THREE.Color, size: number) {
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

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, { ...vars, onComplete: resolve })
    })
}

/**
 * Power torn out of one or more sources and swallowed by a destination:
 * a halo seizes each source, streams are dragged across, and the destination
 * flares as it takes them in.
 *
 * Extracted from the Demon Wizard drain so gate cards can siphon power from
 * bakugans or from the gate cards on the board with the same visual language.
 */
export function playPowerDrainStream({
    scene,
    sources,
    destination,
    colors,
    streamsPerSource = 14,
    height = DEFAULT_HEIGHT,
    destinationMesh,
    sourceMeshes = [],
}: PowerDrainStreamOptions): PowerDrainStreamHandle {
    const streamColor = new THREE.Color(colors?.stream ?? 0xc084fc)
    const sourceColor = new THREE.Color(colors?.source ?? streamColor)
    const intakeColor = new THREE.Color(colors?.intake ?? streamColor)

    const created: THREE.Mesh[] = []
    const destinationScales = destinationMesh ? destinationMesh.scale.clone() : null
    const sourceScales = sourceMeshes.map((mesh) => mesh.scale.clone())

    const intakeHalo = createOrb(intakeColor, 0.7)
    intakeHalo.position.set(destination.x, height, destination.z)
    intakeHalo.scale.setScalar(0.1)
    scene.add(intakeHalo)
    created.push(intakeHalo)

    const sourceHalos = sources.map((position) => {
        const halo = createOrb(sourceColor, 0.5)
        halo.position.set(position.x, height, position.z)
        halo.scale.setScalar(0.1)
        scene.add(halo)
        created.push(halo)
        return halo
    })

    const done = (async () => {
        // 1 — every source is seized, the destination opens up.
        await Promise.all([
            ...sourceHalos.map((halo) =>
                Promise.all([
                    tween(halo.material, { opacity: 0.85, duration: 0.3, ease: "power2.out" }),
                    tween(halo.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.35, ease: "power2.out" }),
                ]),
            ),
            tween(intakeHalo.material, { opacity: 0.6, duration: 0.3, ease: "power2.out" }),
            tween(intakeHalo.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.35, ease: "power2.out" }),
        ])

        // 2 — the power is dragged across, stream by stream.
        const streams = sources.flatMap((position, sourceIndex) =>
            Array.from({ length: streamsPerSource }, (_, index) => {
                const mote = createOrb(streamColor, 0.06 + Math.random() * 0.05)
                // Stretched along local Z so `lookAt` turns it into a streak.
                mote.scale.set(1, 1, 2.6)
                mote.position
                    .copy(position)
                    .setY(height)
                    .add(
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 0.5,
                            (Math.random() - 0.5) * 0.6,
                            (Math.random() - 0.5) * 0.5,
                        ),
                    )
                mote.lookAt(destination.x, height, destination.z)
                scene.add(mote)
                created.push(mote)

                const delay = sourceIndex * 0.06 + index * 0.045

                return Promise.all([
                    tween(mote.material, { opacity: 0.95, duration: 0.15, delay, ease: "power1.out" }),
                    tween(mote.position, {
                        x: destination.x,
                        y: height,
                        z: destination.z,
                        duration: 0.5,
                        delay,
                        ease: "power2.in",
                    }),
                ]).then(() =>
                    Promise.all([
                        tween(mote.material, { opacity: 0, duration: 0.12, ease: "power1.in" }),
                        // every swallowed stream makes the intake flare
                        tween(intakeHalo.scale, {
                            x: "+=0.1",
                            y: "+=0.1",
                            z: "+=0.1",
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1,
                            ease: "sine.out",
                        }),
                    ]).then(() => undefined),
                )
            }),
        )

        // The sources wither while the streams fly.
        const withering = Promise.all([
            ...sourceHalos.map((halo) =>
                Promise.all([
                    tween(halo.material, { opacity: 0, duration: 1, ease: "power1.in" }),
                    tween(halo.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1, ease: "power1.in" }),
                ]),
            ),
            ...sourceMeshes.map((mesh, index) =>
                tween(mesh.scale, {
                    x: sourceScales[index].x * 0.85,
                    y: sourceScales[index].y * 0.85,
                    duration: 1,
                    ease: "power1.inOut",
                }),
            ),
        ])

        // The destination swells on what it takes.
        const swelling =
            destinationMesh && destinationScales
                ? tween(destinationMesh.scale, {
                      x: destinationScales.x * 1.25,
                      y: destinationScales.y * 1.25,
                      duration: 0.9,
                      ease: "power2.out",
                  })
                : Promise.resolve()

        await Promise.all([...streams, withering, swelling])

        // 3 — the intake collapses and everything settles.
        await Promise.all([
            tween(intakeHalo.material, { opacity: 0, duration: 0.35, ease: "power1.in" }),
            tween(intakeHalo.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.35, ease: "power1.in" }),
            ...(destinationMesh && destinationScales
                ? [
                      tween(destinationMesh.scale, {
                          x: destinationScales.x,
                          y: destinationScales.y,
                          duration: 0.4,
                          ease: "power2.inOut",
                      }),
                  ]
                : []),
            ...sourceMeshes.map((mesh, index) =>
                tween(mesh.scale, {
                    x: sourceScales[index].x,
                    y: sourceScales[index].y,
                    duration: 0.4,
                    ease: "power2.inOut",
                }),
            ),
        ])
    })()

    const dispose = () => {
        for (const mesh of created) {
            gsap.killTweensOf(mesh.material)
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            mesh.removeFromParent()
            mesh.geometry.dispose()
            ;(mesh.material as THREE.Material).dispose()
        }
        created.length = 0

        // Never leave a bakugan or a card scaled by an interrupted drain.
        if (destinationMesh && destinationScales) {
            gsap.killTweensOf(destinationMesh.scale)
            destinationMesh.scale.copy(destinationScales)
        }
        sourceMeshes.forEach((mesh, index) => {
            gsap.killTweensOf(mesh.scale)
            mesh.scale.copy(sourceScales[index])
        })
    }

    return { done, dispose }
}
