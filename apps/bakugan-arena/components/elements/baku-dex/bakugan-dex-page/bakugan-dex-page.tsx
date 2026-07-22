import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex";
import { bakuganType } from "@bakugan-arena/game-data"
import { BakuganList } from "@bakugan-arena/game-data";
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data";
import { AbilityCardsList } from "@bakugan-arena/game-data";
import { resolveAbilityCard } from "@bakugan-arena/i18n";
import { getLocale, getTranslations } from "next-intl/server";

export default async function BakuganDex({ data }: { data: bakuganType }) {
    const t = await getTranslations('bakuDex')
    const locale = await getLocale()

    const bakugan = BakuganList.find((b) => b.key === data.key)
    const exclusiveAbilities = ExclusiveAbilitiesList.filter((c) => bakugan?.exclusiveAbilities.includes(c.key))
    const abilityCards = AbilityCardsList.filter((c) => bakugan?.attribut === c.attribut)

    return (
        <>
            <Card>
                <CardHeader>
                    <Card>
                        <CardContent>
                            <div className="w-full lg:w-[50%] flex gap-5">
                                <div className="relative size-32">
                                    <Image src={`/images/bakugans/sphere/${bakugan?.image}/${bakugan?.attribut.toUpperCase()}.png`} alt={`${bakugan?.name} ${bakugan?.attribut}`} fill />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <CardTitle>
                                        {bakugan?.name} {bakugan?.attribut}
                                    </CardTitle>
                                    <ul className="flex flex-col gap-1">
                                        <li className="relative size-10"><Image src={`/images/attributs/${bakugan?.attribut.toUpperCase()}.png`} alt={bakugan?.attribut ? bakugan?.attribut : ''} fill /></li>
                                        <li><span className='text-bold text-sm'>{t('detail.powerLevel')} </span><span className="text-sm">{bakugan?.powerLevel} G</span></li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('detail.exclusiveAbilities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                exclusiveAbilities.map((c, index) => {
                                    const resolved = resolveAbilityCard(c.key, locale)
                                    return <ExclusiveAbilityCardDexPreview key={index} nom={resolved.name} description={resolved.description} max={c.maxInDeck} />
                                })
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('detail.abilitiesCards')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                abilityCards.map((c, index) => {
                                    const resolved = resolveAbilityCard(c.key, locale)
                                    return <ExclusiveAbilityCardDexPreview key={index} nom={resolved.name} description={resolved.description} max={c.maxInDeck} attribut={c.attribut} />
                                })
                            }
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </>
    );
}
