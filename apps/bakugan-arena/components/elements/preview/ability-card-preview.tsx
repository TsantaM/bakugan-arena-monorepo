import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetAbilityCardsDataType } from "@/src/actions/dex/get-ability-cards-data";
import Image from "next/image";

export default function AbilityCardPreview({data} : {data: GetAbilityCardsDataType}) {
    return (
        <Card className="hover:bg-accent">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="size-10 relative rounded-full overflow-hidden">
                        <Image src={`/images/attributs/${data.attributs.toUpperCase()}.png`} alt='Ability Card' fill />
                    </div>
                    <CardTitle>
                        {data.nom}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Card>
                    <CardContent>
                        {data.description}
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}