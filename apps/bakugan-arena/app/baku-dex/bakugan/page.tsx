import BakuganDex from "@/components/elements/baku-dex/bakugan-dex-page/bakugan-dex-page";
import { BakuganList } from "@bakugan-arena/game-data";

type PageProps = {
    searchParams: Promise<{ id: string }>
}

export default async function BakuDexPage({ searchParams }: PageProps) {
    const { id } = await searchParams
    const data = BakuganList.find((b) => b.key === id)

    if (data) {
        return (
            <>

                <BakuganDex data={data} />

            </>
        )
    }
}