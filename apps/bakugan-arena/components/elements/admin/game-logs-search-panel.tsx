'use client'

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { searchGameLogRooms } from "@/src/actions/admin/game-logs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ScrollText, Search } from "lucide-react"
import { useTranslations } from "next-intl"

export default function GameLogsSearchPanel() {
    const t = useTranslations('admin.gameLogs')
    const [roomId, setRoomId] = useState("")
    const [playerQuery, setPlayerQuery] = useState("")
    const [finishedFilter, setFinishedFilter] = useState<string>("all")
    const [submitted, setSubmitted] = useState({
        roomId: "",
        playerQuery: "",
        finished: null as boolean | null,
    })

    const searchQuery = useQuery({
        queryKey: ['admin', 'game-logs', submitted],
        queryFn: () =>
            searchGameLogRooms({
                roomId: submitted.roomId || undefined,
                playerQuery: submitted.playerQuery || undefined,
                finished: submitted.finished,
                limit: 50,
            }),
    })

    const handleSearch = () => {
        setSubmitted({
            roomId: roomId.trim(),
            playerQuery: playerQuery.trim(),
            finished:
                finishedFilter === "all"
                    ? null
                    : finishedFilter === "finished",
        })
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('searchTitle')}</CardTitle>
                    <CardDescription>{t('searchDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="room-id">{t('fields.roomId')}</Label>
                        <Input
                            id="room-id"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder={t('placeholders.roomId')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="player-query">{t('fields.player')}</Label>
                        <Input
                            id="player-query"
                            value={playerQuery}
                            onChange={(e) => setPlayerQuery(e.target.value)}
                            placeholder={t('placeholders.player')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('fields.status')}</Label>
                        <Select value={finishedFilter} onValueChange={setFinishedFilter}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.all')}</SelectItem>
                                <SelectItem value="finished">{t('filters.finished')}</SelectItem>
                                <SelectItem value="ongoing">{t('filters.ongoing')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleSearch} className="w-full">
                            <Search />
                            {t('actions.search')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('resultsTitle')}</CardTitle>
                    <CardDescription>
                        {searchQuery.isFetching
                            ? t('loading')
                            : t('resultsCount', { n: searchQuery.data?.length ?? 0 })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchQuery.isFetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-6 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.room')}</TableHead>
                                    <TableHead>{t('table.players')}</TableHead>
                                    <TableHead>{t('table.status')}</TableHead>
                                    <TableHead>{t('table.turns')}</TableHead>
                                    <TableHead>{t('table.date')}</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(searchQuery.data ?? []).map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-mono text-xs">
                                            {room.id.slice(0, 8)}…
                                        </TableCell>
                                        <TableCell>
                                            {room.player1Name ?? room.player1Id.slice(0, 8)}
                                            {" vs "}
                                            {room.player2Name ?? room.player2Id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Badge variant={room.finished ? "secondary" : "default"}>
                                                    {room.finished ? t('status.finished') : t('status.ongoing')}
                                                </Badge>
                                                {room.ranked && (
                                                    <Badge variant="outline">{t('status.ranked')}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{room.turnLogCount}</TableCell>
                                        <TableCell>
                                            {new Date(room.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/dashboard/admin/game-logs/${room.id}`}>
                                                    <ScrollText />
                                                    {t('actions.viewLogs')}
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
