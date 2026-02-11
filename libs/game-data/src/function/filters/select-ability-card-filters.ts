import { type portalSlotsTypeElement, type deckType, stateType } from '../../type/type-index.js'
import { BakuganList } from '../../battle-brawlers/bakugans.js'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards.js'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities.js'

export function SelectAbilityCardFilters({ slotOfBattle, userId, bakuganKey, playersDeck, roomState }: { slotOfBattle?: portalSlotsTypeElement | undefined, userId: string, bakuganKey: string, playersDeck: deckType | undefined, roomState: stateType }) {
    if (!slotOfBattle) return
    if (!playersDeck) return
    const usersBakugan = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
    const usersBakuganKeys = slotOfBattle?.bakugans.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key)

    const bakugansList = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))

    const attribut = usersBakugan.find((a) => a.key === bakuganKey)?.attribut
    const attributLessAbilities = playersDeck.abilities.filter((a) => !a.attribut && a.used === false && a.dead === false)
    const usableAbilitiesBeforeFilter = [playersDeck?.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === attribut).filter(
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