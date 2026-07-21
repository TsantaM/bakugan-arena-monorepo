import gsap from "gsap"

export async function OnBattleEndAnimation(): Promise<void> {
    const left_container = document.getElementById('left-bakugan-previews-container')
    const right_container = document.getElementById('right-bakugan-previews-container')

    if (!left_container && !right_container) return

    const fadeOut = (container: HTMLElement) =>
        new Promise<void>((resolve) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    container.remove()
                    resolve()
                }
            })
            timeline.fromTo(container, {
                opacity: 1,
                y: 0
            }, {
                opacity: 0,
                y: 5,
                duration: 0.5
            })
        })

    await Promise.all([
        left_container ? fadeOut(left_container) : Promise.resolve(),
        right_container ? fadeOut(right_container) : Promise.resolve(),
    ])
}
