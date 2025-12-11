import type { ActionRequestAnswerType, ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { TurnActionInterfaceBuilder } from "./turn-action-management/turn-interface-builder";
import { TurnActionResolution } from "./turn-action-management/turn-action-resolution";
import * as THREE from 'three'

export function TurnActionBuilder({ request, userId, camera, scene, plane }: {
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType, userId: string, camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
}) {

    let SelectedActions: ActionRequestAnswerType = [
        {
            type: 'SELECT_GATE_CARD',
            data: undefined
        },
        {
            type: 'SELECT_BAKUGAN',
            data: undefined
        },
        {
            type: 'SELECT_ABILITY_CARD',
            data: undefined
        },
        {
            type: 'SET_BAKUGAN',
            data: undefined
        },
        {
            type: 'SET_GATE_CARD_ACTION',
            data: undefined
        },
        {
            type: "USE_ABILITY_CARD",
            data: undefined
        },
        {
            type: 'ACTIVE_GATE_CARD',
            data: undefined
        }
    ]

    SelectedActions.forEach((action) => {
        if (action.data !== undefined)
            action.data = undefined
    })

    const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();


    TurnActionInterfaceBuilder({ request: request })
    TurnActionResolution({
        SelectedActions: SelectedActions,
        userId: userId,
        actions: actions,
        camera: camera,
        scene: scene,
        plane: plane
    })


    // if (actions.length === 1 && (actions[0].type === 'SELECT_GATE_CARD' || actions[0].type === 'SELECT_ABILITY_CARD' || actions[0].type === 'SELECT_BAKUGAN')) {
    //     if (actions[0].type === 'SELECT_GATE_CARD') {

    //         const SelectGateCard: SelectableGateCardAction[] = actions[0].data;

    //         console.log('SELECT_GATE_CARD', SelectGateCard);


    //         const selectOne = document.createElement('div');
    //         selectOne.classList.add('select-one');
    //         const stackSelecteOne = document.createElement('div');
    //         stackSelecteOne.id = 'stack-selecte-one';
    //         stackSelecteOne.classList.add('stack-container');
    //         selectOne.appendChild(stackSelecteOne);
    //         document.body.appendChild(selectOne);

    //         SelectGateCard.forEach((card, index) => {
    //             CreateGateCardSelecter({
    //                 card: card,
    //                 index: index
    //             })
    //         })

    //         const cardsToSelect = document.querySelectorAll('.card-selecter');
    //         cardsToSelect.forEach(card => {
    //             card.addEventListener('mouseenter', () => {

    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }

    //                 const description = document.createElement('div');
    //                 description.classList.add('hovered-card-description');
    //                 const cardName = document.createElement('p');
    //                 cardName.textContent = SelectGateCard.find(c => c.key === card.getAttribute('data-key'))?.name || '';
    //                 cardName.classList.add('card-name')
    //                 description.appendChild(cardName);

    //                 const cardDescription = document.createElement('p');
    //                 cardDescription.textContent = SelectGateCard.find(c => c.key === card.getAttribute('data-key'))?.description || '';
    //                 cardDescription.classList.add('card-description')
    //                 description.appendChild(cardDescription);


    //                 selectOne.appendChild(description);
    //             })

    //             card.addEventListener('mouseleave', () => {
    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }
    //             })

    //             card.addEventListener('click', () => {
    //                 const data = SelectGateCard.find(c => c.key === card.getAttribute('data-key'));
    //                 console.log('Selected Gate Card:', data);
    //             })
    //         })
    //     }

    //     if (actions[0].type === 'SELECT_ABILITY_CARD') {
    //         const Abilities: SelectableAbilityCardAction = {
    //             onBoardBakugans: actions[0].data.map((data) => data.onBoardBakugans).flat(),
    //             notOnBoardBakugans: actions[0].data.map((data) => data.notOnBoardBakugans).flat()
    //         }

    //         const merged = [Abilities.onBoardBakugans, Abilities.notOnBoardBakugans].flat()
    //         const cards = merged.map(bakugan => bakugan.abilities).flat();


    //         const selectOne = document.createElement('div');
    //         selectOne.classList.add('select-one');
    //         const stackSelecteOne = document.createElement('div');
    //         stackSelecteOne.id = 'stack-selecte-one';
    //         stackSelecteOne.classList.add('stack-container');
    //         selectOne.appendChild(stackSelecteOne);
    //         document.body.appendChild(selectOne);

    //         console.log(merged)

    //         merged.forEach((bakugan) => {

    //             bakugan.abilities.forEach((card, index) => {
    //                 CreateGateCardSelecter({
    //                     card: card,
    //                     index: index
    //                 })
    //             })

    //         })

    //         const cardsToSelect = document.querySelectorAll('.card-selecter');
    //         cardsToSelect.forEach(card => {
    //             card.addEventListener('mouseenter', () => {

    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }

    //                 const description = document.createElement('div');
    //                 description.classList.add('hovered-card-description');
    //                 const cardName = document.createElement('p');
    //                 cardName.textContent = cards.find(c => c.key === card.getAttribute('data-key'))?.name || '';
    //                 cardName.classList.add('card-name')
    //                 description.appendChild(cardName);

    //                 const cardDescription = document.createElement('p');
    //                 cardDescription.textContent = cards.find(c => c.key === card.getAttribute('data-key'))?.description || '';
    //                 cardDescription.classList.add('card-description')
    //                 description.appendChild(cardDescription);


    //                 selectOne.appendChild(description);
    //             })

    //             card.addEventListener('mouseleave', () => {
    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }
    //             })

    //             card.addEventListener('click', () => {
    //                 const data = cards.find(c => c.key === card.getAttribute('data-key'));
    //                 if (!data) return
    //                 console.log('Selected Gate Card:', data);
    //                 const selecter = SelectedActions.find((action) => action.type === 'SELECT_ABILITY_CARD')
    //                 if (!selecter) return
    //             })
    //         })
    //     }

    //     if (actions[0].type === 'SELECT_BAKUGAN') {

    //         const bakugans: SelectableBakuganAction[] = actions[0].data;

    //         const selectOne = document.createElement('div');
    //         selectOne.classList.add('select-one');
    //         const stackSelecteOne = document.createElement('div');
    //         stackSelecteOne.id = 'bakugan-selecter';
    //         stackSelecteOne.classList.add('bakugan-selecter');
    //         selectOne.appendChild(stackSelecteOne);
    //         document.body.appendChild(selectOne);

    //         bakugans.forEach((bakugan, index) => {

    //             CreateBakuganSelecter({
    //                 bakugan: bakugan,
    //                 index: index
    //             })


    //         })

    //         const bakugansSprites = document.querySelectorAll('.image-bakugan-selecter-container');
    //         bakugansSprites.forEach(bakugan => {
    //             bakugan.addEventListener('click', () => {
    //                 const data = bakugans.find(b => b.key === bakugan.getAttribute('data-key'));
    //                 console.log('Selected Bakugan:', data);
    //             })
    //         })
    //     }
    // } else {

    //     if (document.querySelector('.turn-interface')) {
    //         document.querySelector('.turn-interface')?.remove()
    //     }

    //     const turnActionContainer = document.createElement('div')
    //     turnActionContainer.classList.add('turn-interface')
    //     document.body.appendChild(turnActionContainer)

    //     if (actions.some(action => action.type === 'SET_BAKUGAN')) {
    //         const bakugans = actions.find((action) => action.type === 'SET_BAKUGAN')?.data.bakugans
    //         if (!bakugans) return
    //         const container = document.createElement('div')
    //         container.classList.add("bakugans")
    //         turnActionContainer.appendChild(container)

    //         bakugans.forEach((bakugan, index) => {
    //             const bakuganElement = document.createElement('div');
    //             bakuganElement.classList.add('image-bakugan-selecter-container');
    //             bakuganElement.setAttribute('data-key', bakugan.key);
    //             bakuganElement.id = `${bakugan.key}-${index}`;

    //             const bakuganImage = document.createElement('img');
    //             bakuganImage.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`;
    //             bakuganImage.classList.add('bakugan-image-selecter');
    //             bakuganElement.appendChild(bakuganImage);

    //             const bakuganData = document.createElement('p');
    //             bakuganData.classList.add('bakugan-data');
    //             bakuganData.textContent = `${bakugan.name} (${bakugan.currentPower})`;
    //             bakuganElement.appendChild(bakuganData);

    //             container.appendChild(bakuganElement)

    //         })

    //         const bakugansSprites = document.querySelectorAll('.image-bakugan-selecter-container');
    //         bakugansSprites.forEach(bakugan => {
    //             bakugan.addEventListener('click', () => {
    //                 const data = bakugans.find(b => b.key === bakugan.getAttribute('data-key'));
    //                 console.log('Selected Bakugan:', data);
    //                 if (!data) return

    //                 const selecter = SelectedActions.find((action) => action.type === 'SET_BAKUGAN')
    //                 if (!selecter) return

    //                 if (!selecter.data) {
    //                     selecter.data = {
    //                         key: data.key,
    //                         slot: '',
    //                         userId: userId
    //                     }
    //                 } else if (selecter.data.key === data.key) {
    //                     selecter.data = undefined
    //                 } else {
    //                     selecter.data = {
    //                         key: data.key,
    //                         slot: '',
    //                         userId: userId
    //                     }
    //                 }

    //                 console.log(selecter.data)

    //                 if(selecter.data?.key && selecter.data.slot === '') {

    //                 }

    //             })
    //         })

    //     }

    //     if (actions.some(action => action.type === 'USE_ABILITY_CARD')) {

    //     }

    //     if (actions.some(action => action.type === 'SET_GATE_CARD_ACTION')) {
    //         const cards = actions.find((action) => action.type === 'SET_GATE_CARD_ACTION')?.data.cards
    //         if (!cards) return

    //         const container = document.createElement('div')
    //         container.classList.add('stack-container')
    //         container.classList.add('gate-cards')
    //         container.id = 'gate-cards'
    //         turnActionContainer.appendChild(container)

    //         cards.forEach((card, index) => {
    //             CreateGateCardSelecter({
    //                 card: card,
    //                 index: index,
    //                 multiSelect: true
    //             })
    //         })

    //         const cardsToSelect = document.querySelectorAll('.card-selecter');
    //         cardsToSelect.forEach(card => {
    //             card.addEventListener('mouseenter', () => {

    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }

    //                 const description = document.createElement('div');
    //                 description.classList.add('hovered-card-description');
    //                 const cardName = document.createElement('p');
    //                 cardName.textContent = cards.find(c => c.key === card.getAttribute('data-key'))?.name || '';
    //                 cardName.classList.add('card-name')
    //                 description.appendChild(cardName);

    //                 const cardDescription = document.createElement('p');
    //                 cardDescription.textContent = cards.find(c => c.key === card.getAttribute('data-key'))?.description || '';
    //                 cardDescription.classList.add('card-description')
    //                 description.appendChild(cardDescription);


    //                 document.body.appendChild(description);
    //             })

    //             card.addEventListener('mouseleave', () => {
    //                 const existingDescription = document.querySelector('.hovered-card-description');
    //                 if (existingDescription) {
    //                     existingDescription.remove();
    //                 }
    //             })

    //             card.addEventListener('click', () => {
    //                 const data = cards.find(c => c.key === card.getAttribute('data-key'));
    //                 console.log('Selected Gate Card:', data);
    //             })
    //         })

    //     }
    // }
}