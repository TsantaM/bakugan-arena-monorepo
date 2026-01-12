import { activeGateCardProps, AnimationDirectivesTypes, GateCardsList, GetUserName, slots_id } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { turnActionUpdater } from "../sockets/turn-action"



export const ActiveGateCard = ({ roomId, gateId, slot, userId, io }: activeGateCardProps): AnimationDirectivesTypes[] | undefined => {
    // FR : On récupère les données de la room correspondante à roomId
    // EN : Get the room data that matches the given roomId
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)


    if (roomData) {
        // FR : On cherche le slot (portail) correspondant à l'id donné dans la room
        // EN : Find the portal slot in the room that matches the given slot id
        const slotOfGate = roomData.protalSlots.find((s) => s.id === slot)

        // FR : On récupère la Gate Card correspondante au gateId
        // EN : Get the Gate Card from the list that matches the gateId
        const gateCard = GateCardsList.find((g) => g.key === gateId)


        // FR : On vérifie toutes les conditions pour ouvrir la Gate Card :
        //  - le slot existe
        //  - la carte posée sur le slot correspond bien à celle passée en paramètre
        //  - le portail n'est pas déjà ouvert
        //  - le portail n'est pas bloqué
        //  - la Gate Card existe bien
        //
        // EN : Check all conditions to activate the Gate Card:
        //  - slot exists
        //  - the card placed on the slot matches the one given in parameters
        //  - the portal is not already open
        //  - the portal is not blocked
        //  - the Gate Card is valid
        if (slotOfGate && slotOfGate.portalCard?.key === gateId && !slotOfGate.state.open && !slotOfGate.state.blocked && gateCard) {

            // FR : On cherche si le joueur a un Bakugan sur ce slot
            // EN : Check if the player has a Bakugan placed on this slot
            const bakugan = slotOfGate.bakugans.find((b) => b.userId === userId)?.key

            // FR : Si la clé du Bakugan est vide ou undefined, on renvoie undefined
            // EN : If the Bakugan key is empty or undefined, set it to undefined
            const key = bakugan === undefined || bakugan === '' ? undefined : bakugan

            // FR : On déclenche l'effet spécial "onOpen" de la Gate Card si elle en possède un,
            //      en lui passant le contexte nécessaire (état de la room, slot, Bakugan et joueur)
            //
            // EN : Trigger the Gate Card's special "onOpen" effect if it exists,
            //      passing the required context (room state, slot, Bakugan, and player)

            const clone = structuredClone(slotOfGate)

            const animation: AnimationDirectivesTypes = {
                type: "OPEN_GATE_CARD",
                data: {
                    slot: clone,
                    slotId: clone.id
                },
                resolved: false,
                message: [{
                    text: `Carte Portail ouvre toi ! ${gateCard.name}`,
                    userName: GetUserName({ roomData: roomData, userId: userId })
                }]
            }

            roomData.animations.push(animation)
            const openFunction = gateCard.onOpen?.({ roomState: roomData, slot: slot, bakuganKey: key, userId: userId })


            if (!openFunction) return

            io.to(roomId).emit('animations', roomData.animations)

            if (openFunction.turnAction) {
                turnActionUpdater({
                    io: io,
                    roomId: roomId,
                    userId: userId,
                })
            }
        }
    }
}