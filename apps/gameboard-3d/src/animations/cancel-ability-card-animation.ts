import { AbilityCardsList, ExclusiveAbilitiesList, type attribut } from "@bakugan-arena/game-data";
import gsap from "gsap";
import { setImageWithFallback } from "../functions/set-image-with-fallback";
import { getAttributColor } from "../functions/get-attrubut-color";

export async function CancelAbilityCardAnimation(card: string, attribut: attribut): Promise<void>  {
    return new Promise((resolve) => {
        const cardData = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((c) => c.key === card)
        if (!cardData) return resolve()

        const cardImage = document.createElement('div');
        cardImage.classList.add('active-ability-image');

        const image = document.createElement('img');
        image.classList.add('active-ability-image-img')

        const overlay = document.createElement('div')
        overlay.classList.add('overlay')
        const overlay2 = document.createElement('div')
        overlay2.classList.add('overlay2')
        // image.src = cardData.image === '' ? `/images/cards/special_ability_card_${'darkus'.toUpperCase()}.jpg` : `/images/cards/${cardData.image}`;

        setImageWithFallback(image, `/images/cards/${cardData.image}`, `/images/cards/ability_card_${attribut.toUpperCase()}.jpg`, 'ability_card_DARKUS.jpg')

        cardImage.appendChild(image)
        cardImage.appendChild(overlay)
        cardImage.appendChild(overlay2)

        document.body.appendChild(cardImage)

        const timeline = gsap.timeline({
            onComplete() {
                resolve()
            }
        })
        timeline.fromTo(cardImage, {
            opacity: 0,
        }, {
            opacity: 1,
            duration: 0.75
        })

        timeline.fromTo(overlay, {
            opacity: 1,
            background: getAttributColor(attribut),

        }, {
            opacity: 0,
            duration: 0.5,
            delay: 0.25,
            onComplete: () => {
                overlay.remove()
            }
        })

        timeline.fromTo(overlay2, {
            opacity: 0,
            background: 'black'

        }, {
            opacity: 0.75,
            duration: 1.5,
        })

        timeline.to(cardImage, {
            opacity: 0,
            onComplete: () => {
                cardImage.remove()
            }
        })
    })
}