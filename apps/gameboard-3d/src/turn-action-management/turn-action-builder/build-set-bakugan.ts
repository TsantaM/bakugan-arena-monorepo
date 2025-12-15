import type { ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

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

        const bakuganData = document.createElement('p');
        bakuganData.classList.add('bakugan-data');
        bakuganData.textContent = `${bakugan.name} (${bakugan.currentPower})`;
        bakuganElement.appendChild(bakuganData);

        container.appendChild(bakuganElement)

    })

}