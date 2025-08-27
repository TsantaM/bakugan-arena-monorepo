import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bakuganType } from "@bakugan-arena/game-data"
import Image from "next/image";


export default function BakuganPreview({data} : {data: bakuganType}) {
    return (
        <Card className="hover:bg-accent">
            <CardHeader>
                <div className="size-20 m-auto relative">
                    <Image src={`/images/bakugans/sphere/${data.image}/${data.attribut.toUpperCase()}.png`} alt={`${data.name} ${data.attribut}`} fill/>
                </div>
                <CardTitle className="text-center">
                    {`${data.name} ${data.attribut}`}
                </CardTitle>
            </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
    )
}