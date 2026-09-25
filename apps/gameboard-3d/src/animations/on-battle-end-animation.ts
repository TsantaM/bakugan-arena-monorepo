import gsap from "gsap"

/**
 * Exit of the bakugan preview cards when a battle ends: they sink and fade out
 * before being removed.
 */
export async function OnBattleEndAnimation(): Promise<void> {
    const containers = [
        document.getElementById('left-bakugan-previews-container'),
        document.getElementById('right-bakugan-previews-container'),
    ].filter((container): container is HTMLElement => container !== null)

    if (containers.length === 0) return

    const fadeDown = (container: HTMLElement) =>
        new Promise<void>((resolve) => {
            gsap.to(container, {
                y: 40,
                scale: 0.88,
                opacity: 0,
                duration: 0.45,
                ease: 'power2.in',
                onComplete: () => {
                    container.remove()
                    resolve()
                },
            })
        })

    await Promise.all(containers.map(fadeDown))
}
