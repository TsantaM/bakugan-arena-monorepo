
export default async function BattleField({ searchParams }: { searchParams: { id: string } }) {
    const roomId = searchParams.id

    return <>

        <h1>{roomId}</h1>

        <div className="w-full h-[75vh] flex justify-between">
            <div className="w-[25vw] md:w-[20vw] lg:w-[15vw] flex flex-col gap-2">
                <div className="w-full aspect-[4/3] bg-amber-400 p-1 rounded-lg">
                    <div className="w-full h-full bg-foreground rounded-sm">

                    </div>
                </div>

                <div className="w-full aspect-[3/4] bg-amber-400 p-1 rounded-lg">
                    <div className="w-full h-full bg-foreground rounded-sm">

                    </div>
                </div>
            </div>

            <div className="w-[25vw] md:w-[20vw] lg:w-[15vw] self-end md:self-start flex flex-col gap-2">
                <div className="w-full aspect-[4/3] bg-amber-400 p-1 rounded-lg">
                    <div className="w-full h-full bg-foreground rounded-sm">

                    </div>
                </div>

                <div className="w-full aspect-[3/4] bg-amber-400 p-1 rounded-lg">
                    <div className="w-full h-full bg-foreground rounded-sm">

                    </div>
                </div>
            </div>

        </div>

    </>

}