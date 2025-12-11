import gsap from "gsap"

export async function OnBattleEndAnimation() {
    const left_container = document.getElementById('left-bakugan-previews-container')
    const right_container = document.getElementById('right-bakugan-previews-container')


    if (left_container) {
        const timeline = gsap.timeline({
            onComplete: () => left_container.remove()
        })
        timeline.fromTo(left_container, {
            opacity: 1,
            y: 0
        }, {
            opacity: 0,
            y: 5,
            duration: 0.5
        })
    }

    if (right_container) {
        const timeline = gsap.timeline({
            onComplete: () => right_container.remove()
        })
        timeline.fromTo(right_container, {
            opacity: 1,
            y: 0
        }, {
            opacity: 0,
            y: 5,
            duration: 0.5
        })
    }

}