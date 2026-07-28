'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import type { TurnLogBundle } from "@bakugan-arena/game-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import GameLogsDocumentationSheet from "@/components/elements/admin/game-logs-documentation-sheet"

type GameLogRoomDetail = NonNullable<Awaited<ReturnType<typeof import("@/src/actions/admin/game-logs").getGameTurnLogs>>>

type GameLogsDetailPanelProps = {
    data: GameLogRoomDetail
    documentation: string
}

function formatPlayerName(
    user: { displayUsername: string | null; username: string | null } | undefined,
    fallbackId: string,
) {
    return user?.displayUsername ?? user?.username ?? fallbackId.slice(0, 8)
}

function EventRow({ event }: { event: TurnLogBundle["events"][number] }) {
    return (
        <div className="rounded-md border p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{event.category}</Badge>
                <span className="font-medium">{event.handler}</span>
                <Badge variant={event.level === "error" ? "destructive" : "secondary"}>
                    {event.level}
                </Badge>
                <span className="text-muted-foreground text-xs">
                    {new Date(event.ts).toLocaleTimeString()}
                </span>
            </div>
            {event.message && <p className="mb-2">{event.message}</p>}
            {event.input !== undefined && (
                <pre className="bg-muted mb-2 overflow-x-auto rounded p-2 text-xs">
                    {JSON.stringify(event.input, null, 2)}
                </pre>
            )}
            {event.output !== undefined && (
                <pre className="bg-muted overflow-x-auto rounded p-2 text-xs">
                    {JSON.stringify(event.output, null, 2)}
                </pre>
            )}
        </div>
    )
}

export default function GameLogsDetailPanel({ data, documentation }: GameLogsDetailPanelProps) {
    const t = useTranslations('admin.gameLogs')
    const [selectedTurnNumber, setSelectedTurnNumber] = useState<string>(
        data.turns[0]?.turnNumber.toString() ?? "1",
    )

    const selectedTurn = useMemo(
        () => data.turns.find((turn) => turn.turnNumber.toString() === selectedTurnNumber),
        [data.turns, selectedTurnNumber],
    )

    const bundle = selectedTurn?.logData

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/admin/game-logs">
                        <ChevronLeft />
                        {t('backToSearch')}
                    </Link>
                </Button>
                <GameLogsDocumentationSheet documentation={documentation} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('detailTitle')}</CardTitle>
                    <CardDescription className="font-mono text-xs break-all">
                        {data.room.id}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2">
                    <p>
                        {formatPlayerName(data.player1 ?? undefined, data.room.player1Id)}
                        {" vs "}
                        {formatPlayerName(data.player2 ?? undefined, data.room.player2Id)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {t('meta.created')}: {new Date(data.room.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                        <Badge variant={data.room.finished ? "secondary" : "default"}>
                            {data.room.finished ? t('status.finished') : t('status.ongoing')}
                        </Badge>
                        {data.room.ranked && <Badge variant="outline">{t('status.ranked')}</Badge>}
                    </div>
                    <p className="text-sm">{t('meta.turnCount', { n: data.turns.length })}</p>
                </CardContent>
            </Card>

            {data.turns.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {t('emptyTurns')}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <span className="text-sm font-medium">{t('fields.turn')}</span>
                        <Select value={selectedTurnNumber} onValueChange={setSelectedTurnNumber}>
                            <SelectTrigger className="md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {data.turns.map((turn) => (
                                    <SelectItem
                                        key={turn.id}
                                        value={turn.turnNumber.toString()}
                                    >
                                        {t('turnOption', {
                                            n: turn.turnNumber,
                                            turnCount: turn.turnCount,
                                        })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {bundle && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t('summaryTitle')}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-3 text-sm">
                                    <div>
                                        <p className="font-medium">{t('summary.start')}</p>
                                        <pre className="bg-muted mt-1 overflow-x-auto rounded p-2 text-xs">
                                            {JSON.stringify(bundle.summaryStart, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('summary.end')}</p>
                                        <pre className="bg-muted mt-1 overflow-x-auto rounded p-2 text-xs">
                                            {JSON.stringify(bundle.summaryEnd, null, 2)}
                                        </pre>
                                    </div>
                                    {bundle.actionRequests && (
                                        <div>
                                            <p className="font-medium">{t('summary.actions')}</p>
                                            <pre className="bg-muted mt-1 overflow-x-auto rounded p-2 text-xs">
                                                {JSON.stringify(bundle.actionRequests, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {t('eventsTitle', { n: bundle.events.length })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
                                    {bundle.events.map((event) => (
                                        <EventRow key={event.id} event={event} />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
