import { AbilityCardsList, ExclusiveAbilitiesList, type attribut } from "@bakugan-arena/game-data";
import gsap from "gsap";
import { setImageWithFallback } from "../functions/set-image-with-fallback";

export async function ActiveAbilityCardAnimation(card: string, attribut: attribut) {
    const cardData = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((c) => c.key === card)
    if (!cardData) return

    const cardImage = document.createElement('div');
    cardImage.classList.add('active-ability-image');

    const image = document.createElement('img');
    image.classList.add('active-ability-image-img')

    // image.src = cardData.image === '' ? `/images/cards/special_ability_card_${'darkus'.toUpperCase()}.jpg` : `/images/cards/${cardData.image}`;

    setImageWithFallback(image, `/images/cards/${cardData.image}`, `/images/cards/ability_card_${attribut.toUpperCase()}.jpg`, 'ability_card_DARKUS.jpg')

    cardImage.appendChild(image)

    document.body.appendChild(cardImage)

    const timeline = gsap.timeline()
    timeline.fromTo(cardImage, {
        opacity: 0,
        scale: 0
    }, {
        opacity: 1,
        scale: 1,
        duration: 2
    })

    timeline.to(cardImage, {
        opacity: 0,
        onComplete: () => {
            cardImage.remove()
        }
    })

}