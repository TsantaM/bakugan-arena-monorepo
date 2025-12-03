import { ActionType, notOnBoardBakugans, onBoardBakugans, SelectableAbilityCardAction } from '../../type/actions-serveur-requests'
import { SelectAbilityCardFilters } from '../filters/select-ability-card-filters'
import { stateType } from '../../type/room-types'
import { Slots } from '../../store/slots'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities'

export function UseAbilityCardActionRequest({ roomState }: { roomState: stateType }) {

    if (!roomState) return

    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const inactivePlayer = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
    const battleState = roomState.battleState
    const turnCount = roomState.turnState.turnCount
    const request = roomState.ActivePlayerActionRequest

    if (!activePlayer) return
    if (!inactivePlayer) return

    const activePlayerBakugansOnSlot = roomState.protalSlots.filter((slot) => slot.bakugans.some((bakugan) => bakugan.userId === activePlayer.userId)).map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === activePlayer.userId)

    // Bakugans on board abilities
    let onBoardAbilities: onBoardBakugans[] = []
    activePlayerBakugansOnSlot.forEach((bakugan) => {
        const selectAbilitiesResult = SelectAbilityCardFilters({
            bakuganKey: bakugan.key,
            playersDeck: activePlayer,
            slotOfBattle: roomState.protalSlots[Slots.indexOf(bakugan.slot_id)],
            userId: activePlayer.userId
        })

        const abilities = [selectAbilitiesResult!.usableAbilities.map((ability) => ({
            key: ability!.key,
            name: ability!.name,
            description: ability!.description,
            image: AbilityCardsList.find((card) => card.key === ability.key)?.image || ''
        })), selectAbilitiesResult!.usableExclusives.map((ability) => ({
            key: ability!.key,
            name: ability!.name,
            description: ability!.description,
            image: ExclusiveAbilitiesList.find((card) => card.key === ability!.key)?.image || ''
        }))].flat()

        const abilitieRequest: onBoardBakugans = {
            slot: bakugan.slot_id,
            bakuganKey: bakugan.key,
            abilities: abilities
        }

        onBoardAbilities.push(abilitieRequest)

    })

    // Not on board bakugan's abilities
    const activePlayerNotOnBoardBakugans = activePlayer.bakugans.filter((bakugan) => bakugan && !bakugan.bakuganData.elimined && !bakugan.bakuganData.onDomain)
    let notOnBoardBakugansAbilities: notOnBoardBakugans[] = []
    activePlayerNotOnBoardBakugans.forEach((bakugan) => {
        if (!bakugan) return
        if (!bakugan.bakuganData.key) return

        const attributLessAbilities = activePlayer.abilities.filter((a) => !a.attribut && a.used === false && a.dead === false)
        const usableAbilities = [activePlayer.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === bakugan?.bakuganData.attribut).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        ), attributLessAbilities].flat();

        const usableExclusives = [activePlayer.bakugans.find((b) => b?.bakuganData.key === bakugan?.bakuganData.family)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        )].flat();

        const abilities = [usableAbilities.map((ability) => ({
            key: ability!.key,
            name: ability!.name,
            description: ability!.description,
            image: AbilityCardsList.find((card) => card.key === ability.key)?.image || ''
        })), usableExclusives.map((ability) => {

            if (!ability) return null

            return {
                key: ability.key,
                name: ability.name,
                description: ability.description,
                image: ExclusiveAbilitiesList.find((card) => card.key === ability.key)?.image || ''
            }
        })].flat().filter((abilities) => abilities !== null)

        const selectAbilitiesResult: notOnBoardBakugans = {
            bakuganKey: bakugan.bakuganData.key,
            abilities: abilities
        }

        notOnBoardBakugansAbilities.push(selectAbilitiesResult)
    })

    const requestAction: SelectableAbilityCardAction = {
        onBoardBakugans: onBoardAbilities,
        notOnBoardBakugans: notOnBoardBakugansAbilities
    }

    if (turnCount > 0) {
        if (!battleState.battleInProcess || battleState.paused) {
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