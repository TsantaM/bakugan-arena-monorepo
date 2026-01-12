import type { ActionType, SelectableGateCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { CreateGateCardSelecter } from "../../functions/create-selecters";

export function BuildSelectGateCard({ action }: { action: ActionType }) {

    if (action.type !== 'SELECT_GATE_CARD') return

        const SelectGateCard: SelectableGateCardAction[] = action.data;

        const selectOne = document.createElement('div');
        selectOne.classList.add('select-one');
        const stackSelecteOne = document.createElement('div');
        stackSelecteOne.id = 'stack-selecte-one';
        stackSelecteOne.classList.add('stack-container');
        selectOne.appendChild(stackSelecteOne);
        document.body.appendChild(selectOne);

        SelectGateCard.forEach((card, index) => {
            CreateGateCardSelecter({
                card: card,
                index: index
            })
        })

        const cardsToSelect = document.querySelectorAll('.card-selecter');
        cardsToSelect.forEach(card => {
            card.addEventListener('mouseenter', () => {

                const existingDescription = document.querySelector('.hovered-card-description');
                if (existingDescription) {
                    existingDescription.remove();
                }

                const description = document.createElement('div');
                description.classList.add('hovered-card-description');
                const cardName = document.createElement('p');
                cardName.textContent = SelectGateCard.find(c => c.key === card.getAttribute('data-key'))?.name || '';
                cardName.classList.add('card-name')
                description.appendChild(cardName);

                const cardDescription = document.createElement('p');
                cardDescription.textContent = SelectGateCard.find(c => c.key === card.getAttribute('data-key'))?.description || '';
                cardDescription.classList.add('card-description')
                description.appendChild(cardDescription);


                selectOne.appendChild(description);
            })

            card.addEventListener('mouseleave', () => {
                const existingDescription = document.querySelector('.hovered-card-description');
                if (existingDescription) {
                    existingDescription.remove();
                }
            })
        })
    

}