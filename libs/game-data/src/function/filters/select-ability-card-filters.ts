import { type portalSlotsTypeElement, type deckType } from '../../type/room-types'
import { BakuganList } from '../../battle-brawlers/bakugans'

export function SelectAbilityCardFilters({ slotOfBattle, userId, bakuganKey, playersDeck }: { slotOfBattle: portalSlotsTypeElement | undefined, userId: string, bakuganKey: string, playersDeck: deckType | undefined }) {
    if (!slotOfBattle) return
    if (!playersDeck) return
    const usersBakugan = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
    const usersBakuganKeys = slotOfBattle?.bakugans.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key)

    const bakugansList = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))

    const attribut = usersBakugan.find((a) => a.key === bakuganKey)?.attribut
    const attributLessAbilities = playersDeck.abilities.filter((a) => !a.attribut && a.used === false && a.dead === false)
    const usableAbilities = [playersDeck?.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === attribut).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    ), attributLessAbilities].flat();


    const usable_if_user_not_on_domain = playersDeck?.bakugans.filter((b) => !b?.bakuganData.elimined )?.map((b) => b?.excluAbilitiesState).flat().filter((c) => c && c.dead === false && c.used === false && c.dead === false && c.usable_if_user_not_on_domain ).filter(
        (item, index, self) =>
            item && index === self.findIndex((t) => t && t.key === item.key)
            
    );

    const usableExclusives = [playersDeck?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    ), usable_if_user_not_on_domain].flat();
    
    return {
        bakugansList,
        usableAbilities,
        usableExclusives
    }
}