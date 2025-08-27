import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex";
import { bakuganType } from "@bakugan-arena/game-data"
import { BakuganList } from "@bakugan-arena/game-data";
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data";
import { AbilityCardsList } from "@bakugan-arena/game-data";

export default function BakuganDex({ data }: { data: bakuganType }) {

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
                                        <li><span className='text-bold text-sm'>Power Level : </span><span className="text-sm">{bakugan?.powerLevel} G</span></li>
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
                                Exclusives Abilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                exclusiveAbilities.map((c, index) => <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} max={c.maxInDeck} />)
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Abilities Cards
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                abilityCards.map((c, index) => <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} max={c.maxInDeck} attribut={c.attribut} />)
                            }
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </>
    );
}