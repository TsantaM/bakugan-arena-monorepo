import gsap from 'gsap'

async function BakuganPreviewOnBattleStartAnimation(containerId: string) {
    const container = document.getElementById(containerId)
    const x = containerId === 'left-bakugan-previews-container' ? window.innerWidth / 2.5 : -window.innerWidth / 2.5


    if(container) {
        const timeline = gsap.timeline()
        timeline.from(container, {
            x: x,
            scale: 0,
            duration: 0.5
        })
    }

}

export {
    BakuganPreviewOnBattleStartAnimation
}