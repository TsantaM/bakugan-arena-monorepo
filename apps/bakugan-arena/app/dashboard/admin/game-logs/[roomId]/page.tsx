import GameLogsDetailPanel from "@/components/elements/admin/game-logs-detail-panel"
import Section from "@/components/ui/section"
import { getGameTurnLogs } from "@/src/actions/admin/game-logs"
import { notFound } from "next/navigation"

type PageProps = {
    params: Promise<{ roomId: string }>
}

export default async function GameLogRoomPage({ params }: PageProps) {
    const { roomId } = await params
    const data = await getGameTurnLogs(roomId)

    if (!data) notFound()

    return (
        <Section className="flex flex-col gap-6">
            <GameLogsDetailPanel data={data} />
        </Section>
    )
}
