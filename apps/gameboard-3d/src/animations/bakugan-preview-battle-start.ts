import gsap from 'gsap'

async function BakuganPreviewOnBattleStartAnimation(containerId: string): Promise<void> {
    return new Promise((resolve) => {

        const container = document.getElementById(containerId)
        const x = containerId === 'left-bakugan-previews-container' ? window.innerWidth / 2.5 : -window.innerWidth / 2.5


        if (container) {
            const timeline = gsap.timeline({
                onComplete() {
                    return resolve()
                }
            })
            timeline.from(container, {
                x: x,
                scale: 0,
                duration: 0.5
            })
        }


    })

}

export {
    BakuganPreviewOnBattleStartAnimation
}