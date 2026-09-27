'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getGamesList, type GameListPlayer } from "@/src/actions/admin/get-games-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 50

type Filters = {
    from: string
    to: string
    playerQuery: string
}

const EMPTY_FILTERS: Filters = { from: "", to: "", playerQuery: "" }

/** Le pseudo affichable d'un joueur, avec repli sur l'identifiant. */
function playerLabel(player: GameListPlayer): string {
    return player.displayUsername ?? player.username ?? player.id.slice(0, 8)
}

export default function GamesListPanel() {
    const t = useTranslations('admin.games')

    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
    const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)

    const gamesQuery = useQuery({
        queryKey: ['admin', 'games-list', applied],
        queryFn: () =>
            getGamesList({
                from: applied.from || undefined,
                to: applied.to || undefined,
                playerQuery: applied.playerQuery || undefined,
                limit: PAGE_SIZE,
            }),
    })

    const games = gamesQuery.data ?? []
    const hasFilters = draft.from !== "" || draft.to !== "" || draft.playerQuery !== ""

    // Un intervalle inversé ne renverrait jamais rien : on le signale au lieu
    // de laisser l'admin devant un tableau vide inexplicable.
    const invalidRange = draft.from !== "" && draft.to !== "" && draft.from > draft.to

    const applyFilters = () => {
        if (invalidRange) return
        setApplied({ ...draft, playerQuery: draft.playerQuery.trim() })
    }

    const resetFilters = () => {
        setDraft(EMPTY_FILTERS)
        setApplied(EMPTY_FILTERS)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('desc')}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="games-from">{t('fields.from')}</Label>
                        <Input
                            id="games-from"
                            type="date"
                            value={draft.from}
                            max={draft.to || undefined}
                            onChange={(e) => setDraft((f) => ({ ...f, from: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="games-to">{t('fields.to')}</Label>
                        <Input
                            id="games-to"
                            type="date"
                            value={draft.to}
                            min={draft.from || undefined}
                            onChange={(e) => setDraft((f) => ({ ...f, to: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="games-player">{t('fields.player')}</Label>
                        <Input
                            id="games-player"
                            value={draft.playerQuery}
                            placeholder={t('placeholders.player')}
                            onChange={(e) => setDraft((f) => ({ ...f, playerQuery: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters()
                            }}
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <Button onClick={applyFilters} disabled={invalidRange} className="flex-1">
                            <Search />
                            {t('actions.search')}
                        </Button>
                        {hasFilters && (
                            <Button variant="outline" size="icon" onClick={resetFilters} aria-label={t('actions.reset')}>
                                <X />
                            </Button>
                        )}
                    </div>
                </div>

                {invalidRange && (
                    <p className="text-sm text-destructive">{t('invalidRange')}</p>
                )}

                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        {gamesQuery.isFetching
                            ? t('loading')
                            : games.length >= PAGE_SIZE
                                ? t('resultsCapped', { n: games.length })
                                : t('resultsCount', { n: games.length })}
                    </p>

                    {gamesQuery.isError ? (
                        <p className="py-8 text-center text-sm text-destructive">{t('error')}</p>
                    ) : gamesQuery.isFetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-6 animate-spin" />
                        </div>
                    ) : games.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.game')}</TableHead>
                                        <TableHead>{t('table.players')}</TableHead>
                                        <TableHead>{t('table.status')}</TableHead>
                                        <TableHead>{t('table.winner')}</TableHead>
                                        <TableHead>{t('table.loser')}</TableHead>
                                        <TableHead>{t('table.date')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {games.map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell className="font-mono text-xs">
                                                {game.id.slice(0, 8)}…
                                            </TableCell>
                                            <TableCell>
                                                {playerLabel(game.playerOne)}
                                                <span className="text-muted-foreground"> vs </span>
                                                {playerLabel(game.playerTwo)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Badge variant={game.finished ? "secondary" : "default"}>
                                                        {game.finished ? t('status.finished') : t('status.ongoing')}
                                                    </Badge>
                                                    {game.ranked && (
                                                        <Badge variant="outline">{t('status.ranked')}</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {game.winner ? playerLabel(game.winner) : (
                                                    <span className="text-muted-foreground">{t('none')}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {game.loser ? playerLabel(game.loser) : (
                                                    <span className="text-muted-foreground">{t('none')}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(game.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
