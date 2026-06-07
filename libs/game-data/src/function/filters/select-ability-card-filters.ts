import { type portalSlotsTypeElement, type deckType, stateType, attribut } from '../../type/type-index.js'
import { BakuganList } from '../../battle-brawlers/bakugans.js'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards.js'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities.js'

export function SelectAbilityCardFilters({ slotOfBattle, userId, bakuganKey, playersDeck, roomState, bakuganAttribut }: { slotOfBattle?: portalSlotsTypeElement | undefined, userId: string, bakuganKey: string, playersDeck: deckType | undefined, roomState: stateType, bakuganAttribut?: attribut }) {

    if (!slotOfBattle) return
    if (!playersDeck) return
    if (!roomState?.turnState.use_ability_card) return
    if (roomState.turnState.ability_card_block.blocked) return

    const usersBakugan = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
    const usersBakuganKeys = slotOfBattle?.bakugans.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key)

    const bakugansList = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))

    const currentBakugan = slotOfBattle.bakugans.find(
        (b) => b.key === bakuganKey && b.userId === userId
    ) ?? roomState.protalSlots.flatMap((slot) => slot.bakugans).find(
        (b) => b.key === bakuganKey && b.userId === userId
    )

    const attribut = bakuganAttribut ? bakuganAttribut : currentBakugan?.attribut
    const secondAttribut = currentBakugan?.secondAttribut
    console.log('bakugan', currentBakugan?.key, 'attribut', attribut, 'secondAttribut', secondAttribut)

    const attributLessAbilities = playersDeck.abilities.filter((a) => !a.attribut && a.used === false && a.dead === false)
    const usableAbilitiesBeforeFilter = [playersDeck?.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === attribut || a.attribut === secondAttribut).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    ), attributLessAbilities].flat();

    const usableAbilities = usableAbilitiesBeforeFilter.filter(ability => {
        const card = AbilityCardsList.find(c => c.key === ability.key);
        if (!card) return false; // sécurité : aucune carte trouvée

        // Si pas de condition d'activation → carte valide
        if (!card.activationConditions) return true;

        // Sinon on évalue la condition
        return card.activationConditions({ roomState, userId });
    });


    const usable_if_user_not_on_domain = playersDeck?.bakugans.filter((b) => !b?.bakuganData.elimined)?.map((b) => b?.excluAbilitiesState).flat().filter((c) => c && c.dead === false && c.used === false && c.dead === false && c.usable_if_user_not_on_domain).filter(
        (item, index, self) =>
            item && index === self.findIndex((t) => t && t.key === item.key)

    );

    const usableExclusivesNotFiltered = [playersDeck?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    ), usable_if_user_not_on_domain].flat();


    const usableExclusives = usableExclusivesNotFiltered.filter(exclu => {
        const card = ExclusiveAbilitiesList.find(c => c.key === exclu?.key);
        if (!card) return false; // carte non trouvée → on ignore

        // Aucune condition d'activation -> ability utilisable
        if (!card.activationConditions) return true;

        // Condition définie -> on vérifie
        return card.activationConditions({ roomState, userId });
    });


    return {
        bakugansList,
        usableAbilities,
        usableExclusives
    }
}