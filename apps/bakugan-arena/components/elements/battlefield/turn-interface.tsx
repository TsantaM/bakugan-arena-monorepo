import { Button } from "@/components/ui/button"
import SetGateCard from "./turn-interface-buttons/set-gate-card"

export default function TurnInterface({ turn, set_gate, set_bakugan, use_ability, roomId, userId }: { turn: boolean, set_gate: boolean, set_bakugan: boolean, use_ability: boolean, roomId: string, userId: string }) {
    if (!turn) {
        return (
            <p className="flex flex-col gap-2 lg:flex-row absolute lg:left-[50%] bottom-7 lg:translate-x-[-50%]">It's your opponent's turn</p>
        )
    } else {
        return (
            <>
                <div className="w-[25vw] lg:w-[auto] flex flex-col gap-2 lg:flex-row absolute lg:left-[50%] bottom-7 lg:translate-x-[-50%]">
                    <SetGateCard set_gate={set_gate} set_bakugan={set_bakugan} use_ability={use_ability} roomId={roomId} userId={userId}/>
                    <Button className="lg:w-[15vw]">Bakugans</Button>
                    <Button className="lg:w-[15vw]">Gate Cards</Button>
                </div>
            </>

        )
    }
}