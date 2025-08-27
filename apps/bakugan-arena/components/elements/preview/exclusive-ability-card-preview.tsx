import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetExclusiveAbilityCardsDataType } from "@/src/actions/dex/get-exclusive-ability-cards";

export default function ExclusiveAbilityCardPreview({ data }: { data: GetExclusiveAbilityCardsDataType }) {
    return (
        <Card className="hover:bg-accent">
            <CardHeader>
                <CardTitle>
                    {data.nom}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {data.description}
                <div className="flex w-full flex-wrap gap-2">
                    {
                        data.bakugan.map((b, index) => <Badge key={index} variant="outline">{`${b.nom} ${b.attribut}`}</Badge>)
                    }

                </div>
            </CardContent>
        </Card>
    )
}