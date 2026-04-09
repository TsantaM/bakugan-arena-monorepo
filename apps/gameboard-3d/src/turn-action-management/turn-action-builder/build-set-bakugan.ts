import type { ActionType } from "@bakugan-arena/game-data";
import tippy from "tippy.js";

export function BuildSetBakugan({ action, turnActionContainer }: { action: ActionType, turnActionContainer: HTMLDivElement }) {
    if (action.type !== 'SET_BAKUGAN') return

    const bakugans = action.data.bakugans
    if (!bakugans) return
    const container = document.createElement('div')
    container.classList.add("bakugans")
    turnActionContainer.appendChild(container)

    bakugans.forEach((bakugan, index) => {
        const bakuganElement = document.createElement('div');
        bakuganElement.classList.add('image-bakugan-selecter-container');
        bakuganElement.classList.add('select-bakugan-action');
        bakuganElement.setAttribute('data-key', bakugan.key);
        bakuganElement.id = `${bakugan.key}-${index}`;

        const bakuganImage = document.createElement('img');
        bakuganImage.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`;
        bakuganImage.classList.add('bakugan-image-selecter');
        bakuganElement.appendChild(bakuganImage);

        // 🔥 Tooltip content
        const tooltipContent = `
        <strong class="text-lg">${bakugan.name}</strong><br/>
        Power: ${bakugan.currentPower}
    `

        // ✅ Tippy attaché
        tippy(bakuganElement, {
            content: tooltipContent,
            allowHTML: true,
            placement: 'top',
            // mobile safe
            trigger: 'mouseenter focus',
        })
        container.appendChild(bakuganElement)

    })

}