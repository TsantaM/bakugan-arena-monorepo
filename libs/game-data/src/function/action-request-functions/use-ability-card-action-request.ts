import type { onBoardBakugans, SelectableAbilityCardAction } from '../../type/actions-serveur-requests'
import { SelectAbilityCardFilters } from '../filters/select-ability-card-filters'
import type { stateType } from '../../type/room-types'
import { Slots } from '../../store/slots'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities'
import { SelectAbilityCardInNeutralFilters } from '../filters/select-ability-card-in-neutral'

export function UseAbilityCardActionRequest({ roomState }: { roomState: stateType }) {

    if (!roomState) return

    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const battleState = roomState.battleState
    const turnCount = roomState.turnState.turnCount
    const request = roomState.ActivePlayerActionRequest

    if (!activePlayer) return
    const userId = activePlayer.userId
    const bakuganOnFieldCount = roomState.protalSlots.map((slots) => slots.bakugans).flat().filter((bakugan) => bakugan.userId === userId).length

    const usableAbilitiesCount: number = roomState.players.find((player) => player.userId === activePlayer?.userId)?.usable_abilitys || 0

    if (usableAbilitiesCount === 0) return

    const activePlayerBakugansOnSlot = roomState.protalSlots.filter((slot) => slot.bakugans.some((bakugan) => bakugan.userId === activePlayer.userId)).map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === activePlayer.userId)

    // Bakugans on board abilities
    let onBoardAbilities: onBoardBakugans[] = []
    activePlayerBakugansOnSlot.forEach((bakugan) => {

        let selectAbilitiesResult

        if (battleState.battleInProcess && battleState.slot !== null && !battleState.paused) {
            selectAbilitiesResult = SelectAbilityCardFilters({
                bakuganKey: bakugan.key,
                playersDeck: activePlayer,
                slotOfBattle: roomState.protalSlots[Slots.indexOf(battleState.slot)],
                userId: activePlayer.userId
            })
        } else {
            selectAbilitiesResult = SelectAbilityCardInNeutralFilters({
                bakuganKey: bakugan.key,
                bakuganToSet: bakugan.key,
                slots: roomState.protalSlots,
                decksState: roomState.decksState,
                userId: activePlayer.userId
            })
        }
        const abilities = [
            selectAbilitiesResult && selectAbilitiesResult.usableAbilities && selectAbilitiesResult.usableAbilities.map((ability) => ({
                key: ability!.key,
                name: ability!.name,
                description: ability!.description,
                image: AbilityCardsList.find((card) => card.key === ability.key)?.image || ''
            })),
            selectAbilitiesResult && selectAbilitiesResult.usableExclusives && selectAbilitiesResult.usableExclusives.filter((ability) => ability !== undefined).map((ability) => ({
                key: ability.key,
                name: ability.name,
                description: ability!.description,
                image: ExclusiveAbilitiesList.find((card) => card.key === ability!.key)?.image || ''
            }))].flat().filter((ability) => ability !== undefined)

        const abilitieRequest: onBoardBakugans = {
            slot: bakugan.slot_id,
            bakuganKey: bakugan.key,
            abilities: abilities
        }

        onBoardAbilities.push(abilitieRequest)

    })

    const requestAction: SelectableAbilityCardAction = {
        onBoardBakugans: onBoardAbilities,
    }

    const totalCard = requestAction.onBoardBakugans.map((bakugan) => bakugan.abilities).flat().length
    if(totalCard === 0) return

    if (turnCount > 0) {
        if ((!battleState.battleInProcess || battleState.paused) && bakuganOnFieldCount > 0) {
            request.actions.mustDoOne.push({
                type: 'USE_ABILITY_CARD',
                data: requestAction
            })
        } else {
            request.actions.optional.push({
                type: 'USE_ABILITY_CARD',
                data: requestAction
            })
        }
    }

}