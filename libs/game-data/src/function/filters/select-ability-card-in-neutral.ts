import { stateType, type deckType, type portalSlotsType } from '../../type/type-index.js'
import { BakuganList } from '../../battle-brawlers/bakugans.js'
import { AbilityCardsList } from '../../battle-brawlers/ability-cards.js'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities.js'

export function SelectAbilityCardInNeutralFilters({ slots, userId, decksState, bakuganToSet, bakuganKey, roomState }: { slots: portalSlotsType | undefined, userId: string, decksState: deckType[] | undefined, bakuganToSet: string, bakuganKey: string, roomState: stateType }) {

    if (!slots) return
    if (!decksState) return
    const bakuganOnDomain = slots.flatMap((s) => s.bakugans).filter((b) => b.userId === userId)

    const usersBakuganKeys = [bakuganOnDomain.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key), bakuganToSet].flat()

    const bakuganList = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))

    const bakuganToSetData = BakuganList.find((b) => b.key === bakuganToSet)
    const abilityUserData = bakuganOnDomain.find((b) => b.key === bakuganKey) ? bakuganOnDomain.find((b) => b.key === bakuganKey) : bakuganToSetData
    const attribut = abilityUserData?.attribut
    const abilitiesUsableInNeutral = AbilityCardsList.filter((c) => c.usable_in_neutral === true).map((c) => c.key)
    const exclusivesUsableInNeutral = ExclusiveAbilitiesList.filter((c) => c.usable_in_neutral === true).map((c) => c.key)

    const usableAbilitiesBeforeFilter = decksState.find((d) => d.userId === userId)?.abilities.filter((a) => a.used === false && a.dead === false && abilitiesUsableInNeutral.includes(a.key)).filter((a) => a.attribut === attribut).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    );

    const usableAbilities = usableAbilitiesBeforeFilter?.filter(ability => {
        const card = AbilityCardsList.find(c => c.key === ability.key);
        if (!card) return false; // sécurité : aucune carte trouvée

        // Si pas de condition d'activation → carte valide
        if (!card.activationConditions) return true;

        // Sinon on évalue la condition
        return card.activationConditions({ roomState, userId });
    });

    const usable_if_user_not_on_domain = decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => !b?.bakuganData.elimined)?.map((b) => b?.excluAbilitiesState).flat().filter((c) => c && c.dead === false && c.used === false && c.dead === false && exclusivesUsableInNeutral.includes(c.key) && c.usable_if_user_not_on_domain).filter(
        (item, index, self) =>
            item && index === self.findIndex((t) => t && t.key === item.key)
    );

    const usableExclusivesNotFiltered = [decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false && exclusivesUsableInNeutral.includes(c.key)).filter(
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
        bakuganList,
        usableAbilities,
        usableExclusives,
        bakuganToSetData,
        abilityUserData
    }
}