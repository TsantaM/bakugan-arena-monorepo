import { portalSlotsTypeElement, deckType } from '../../type/room-types'
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

    const usableExclusives = playersDeck?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    );
    return {
        bakugansList,
        usableAbilities,
        usableExclusives
    }
}