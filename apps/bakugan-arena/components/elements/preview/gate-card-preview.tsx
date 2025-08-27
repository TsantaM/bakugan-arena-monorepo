import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGateCardsDateType } from "@/src/actions/dex/get-gate-cards-data";

export default function GateCardPreview({ data }: { data: getGateCardsDateType }) {
    return (
        <Card className="hover:bg-accent">
            <CardHeader>
                <CardTitle>
                    {data.nom}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {data.description}
            </CardContent>
        </Card>
    )
}