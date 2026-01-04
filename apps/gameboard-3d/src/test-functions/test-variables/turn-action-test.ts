import type { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export const TurnActionData: ActivePlayerActionRequestType | InactivePlayerActionRequestType = {
    target: 'ACTIVE_PLAYER',
    actions: {
        mustDo: [
            {
                type: 'SET_BAKUGAN',
                data: {
                    bakugans: [{
                        key: 'skyress-storm-ventus',
                        attribut: 'Ventus',
                        currentPower: 450,
                        image: 'skyress-storm',
                        name: 'Skyress'
                    },
                    {
                        key: 'monarus-ventus',
                        attribut: 'Ventus',
                        currentPower: 310,
                        image: 'monarus',
                        name: 'Monarus'
                    }
                    ],
                    setableSlots: ['slot-5', 'slot-2'],
                }
            },
            {
                type: 'SELECT_GATE_CARD',
                data: [
                    {
                        key: 'mine-fantome',
                        description: 'Blablabla',
                        image:'command-gate-card.png',
                        name: 'Mine Fantôme'
                    }
                ]
            },
            // {
            //     type: 'SELECT_BAKUGAN',
            //     data: [
            //         {
            //             key: 'skyress-storm-ventus',
            //             attribut: 'Ventus',
            //             currentPower: 450,
            //             image: 'skyress-storm',
            //             name: 'Skyress'
            //         },
            //         {
            //             key: 'monarus-ventus',
            //             attribut: 'Ventus',
            //             currentPower: 310,
            //             image: 'monarus',
            //             name: 'Monarus'
            //         }
            //     ]
            // },
            // {
            //     type: 'SELECT_ABILITY_CARD',
            //     data: [
            //         {
            //             onBoardBakugans: [
            //                 {
            //                     slot: 'slot-2',
            //                     abilities: [
            //                         {
            //                             key: 'eclat-soudain',
            //                             description: '...',
            //                             image: 'ability_card_HAOS.jpg',
            //                             name: 'Eclat Soudain'
            //                         },
            //                         {
            //                             key: 'lumière',
            //                             description: '...',
            //                             image: 'ability_card_HAOS.jpg',
            //                             name: 'Lumière Envahissante'
            //                         }
            //                     ],
            //                     bakuganKey: 'tuskor-haos'
            //                 },
            //             ],
            //             notOnBoardBakugans: []
            //         }
            //     ]
            // },

        ],
        mustDoOne: [{
            type: 'USE_ABILITY_CARD',
            data: [{
                slot: 'slot-2',
                bakuganKey: 'mantris-haos',
                attribut: 'Haos',
                abilities: [{
                    key: 'eclat-soudain',
                    description: '...',
                    image: 'ability_card_HAOS.jpg',
                    name: 'Eclat Soudain'
                },
                ]
            },
            {
                slot: 'slot-2',
                attribut: 'Haos',
                bakuganKey: 'siege-haos',
                abilities: [{
                    key: 'eclat-soudain',
                    description: '...',
                    image: 'ability_card_HAOS.jpg',
                    name: 'Eclat Soudain'
                },
                {
                    key: 'lumière',
                    description: '...',
                    image: 'ability_card_PYRUS.jpg',
                    name: 'Lumière Envahissante'
                },
                {
                    key: 'lumière1',
                    description: '...',
                    image: 'ability_card_PYRUS.jpg',
                    name: 'Lumière Envahissante1'
                },
                {
                    key: 'lumière2',
                    description: '...',
                    image: 'ability_card_PYRUS.jpg',
                    name: 'Lumière Envahissante2'
                },
                {
                    key: 'lumière3',
                    description: '...',
                    image: 'ability_card_PYRUS.jpg',
                    name: 'Lumière Envahissante3'
                }
                ]
            }]

        }],
        optional: [{
            type: 'SET_GATE_CARD_ACTION',
            data: {
                cards: [
                    {
                        key: 'mine-fantome',
                        description: "...",
                        name: 'Mine Fantôme',
                        image: 'command-gate-card.png'
                    },
                    {
                        key: 'reacteur-haos',
                        description: "...",
                        name: 'Reacteur Haos',
                        image: 'open-portal-card.png'
                    }
                ],
                slots: ['slot-1', "slot-3", "slot-4", 'slot-6']
            }
        }, {
            type: "OPEN_GATE_CARD",
            slot: 'slot-2'
        }]
    }
}