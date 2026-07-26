"use client"

import { useMemo } from "react"
import {
    getSnapshotAtEntryIndex,
    listReplayTurnOptions,
    type replayDataType,
    type replaySnapshotType,
} from "@bakugan-arena/game-data"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import ImportReplay from "@/components/elements/replay/import-replay-input"
import SelectUploadedReplay from "@/components/elements/replay/select-uploaded-replay"
import type { LoadedReplay } from "@/src/lib/replay/loaded-replay"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"
import { snapshotToSandboxDraft } from "./sandbox-draft"
import type { SandboxDraft } from "./sandbox-types"

export type SandboxReplayLoadPayload = {
    snapshot: replaySnapshotType
    draft: SandboxDraft
    perspectiveUserId: string
    turnNumber: number
    roomId: string
    entryIndex: number
}

type SandboxReplayTabProps = {
    replay: replayDataType | null
    selectedEntryIndex: number
    onReplayChange: (replay: replayDataType | null) => void
    onSelectedEntryIndexChange: (entryIndex: number) => void
    onLoad: (payload: SandboxReplayLoadPayload) => void
    onClearReplay: () => void
}

function buildLoadPayload(
    replay: replayDataType,
    entryIndex: number,
): SandboxReplayLoadPayload | null {
    if (!replay.player1?.id || !replay.player2?.id) return null

    const turnOptions = listReplayTurnOptions(replay)
    const selectedTurn =
        turnOptions.find((option) => option.entryIndex === entryIndex) ??
        turnOptions[0]
    if (!selectedTurn) return null

    const snapshot = getSnapshotAtEntryIndex(replay, selectedTurn.entryIndex)
    const draft = snapshotToSandboxDraft(
        snapshot,
        replay.player1.id,
        replay.player2.id,
    )

    return {
        snapshot,
        draft,
        perspectiveUserId: replay.player1.id,
        turnNumber: selectedTurn.turnNumber,
        roomId: replay.roomId,
        entryIndex: selectedTurn.entryIndex,
    }
}

export default function SandboxReplayTab({
    replay,
    selectedEntryIndex,
    onReplayChange,
    onSelectedEntryIndexChange,
    onLoad,
    onClearReplay,
}: SandboxReplayTabProps) {
    const t = useTranslations("admin.sandbox")

    const turnOptions = useMemo(
        () => (replay ? listReplayTurnOptions(replay) : []),
        [replay],
    )

    const selectedTurnIndex = turnOptions.findIndex(
        (option) => option.entryIndex === selectedEntryIndex,
    )
    const selectedTurn =
        selectedTurnIndex >= 0 ? turnOptions[selectedTurnIndex] : turnOptions[0]

    const handleSetReplay = (loaded: LoadedReplay) => {
        onReplayChange(loaded.data)
        onSelectedEntryIndexChange(0)
        const payload = buildLoadPayload(loaded.data, 0)
        if (payload) onLoad(payload)
    }

    const loadEntry = (entryIndex: number) => {
        if (!replay) return
        onSelectedEntryIndexChange(entryIndex)
        const payload = buildLoadPayload(replay, entryIndex)
        if (payload) onLoad(payload)
    }

    const playerLabel = (userId: string) => {
        if (!replay) return userId
        if (replay.player1?.id === userId) {
            return replay.player1.displayUsername ?? t("owners.user")
        }
        if (replay.player2?.id === userId) {
            return replay.player2.displayUsername ?? t("owners.opponent")
        }
        return userId
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("replay.intro")}</p>

            <div className="flex flex-col gap-2">
                <Label>{t("replay.source")}</Label>
                <div className="flex flex-wrap gap-2">
                    <ImportReplay setReplay={handleSetReplay} />
                    <SelectUploadedReplay setReplay={handleSetReplay} />
                </div>
            </div>

            {replay ? (
                <>
                    <div className="rounded-md border border-border p-3 text-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-medium">
                                    {t("replay.loaded", { roomId: replay.roomId })}
                                </p>
                                <p className="text-muted-foreground">
                                    {replay.player1?.displayUsername ?? "P1"} vs{" "}
                                    {replay.player2?.displayUsername ?? "P2"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t("replay.turnsAvailable", {
                                        n: turnOptions.length,
                                    })}
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={onClearReplay}
                                title={t("replay.clear")}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("replay.turn")}</Label>
                        <Select
                            value={String(
                                selectedTurn?.entryIndex ?? selectedEntryIndex,
                            )}
                            onValueChange={(value) => loadEntry(Number(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("placeholders.turn")} />
                            </SelectTrigger>
                            <SelectContent>
                                {turnOptions.map((option) => (
                                    <SelectItem
                                        key={option.entryIndex}
                                        value={String(option.entryIndex)}
                                    >
                                        {t("replay.turnOption", {
                                            n: option.turnNumber,
                                            turnCount: option.turnCount,
                                            player: playerLabel(option.turnUserId),
                                        })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={selectedTurnIndex <= 0}
                            onClick={() => {
                                const prev = turnOptions[selectedTurnIndex - 1]
                                if (prev) loadEntry(prev.entryIndex)
                            }}
                        >
                            <ChevronLeft />
                            {t("replay.prevTurn")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                selectedTurnIndex < 0 ||
                                selectedTurnIndex >= turnOptions.length - 1
                            }
                            onClick={() => {
                                const next = turnOptions[selectedTurnIndex + 1]
                                if (next) loadEntry(next.entryIndex)
                            }}
                        >
                            {t("replay.nextTurn")}
                            <ChevronRight />
                        </Button>
                    </div>

                    {selectedTurn ? (
                        <p className="text-xs text-muted-foreground">
                            {t("replay.turnHint", {
                                turnCount: selectedTurn.turnCount,
                                player: playerLabel(selectedTurn.turnUserId),
                            })}
                        </p>
                    ) : null}

                    <Button
                        type="button"
                        className="w-full"
                        variant="secondary"
                        disabled={!replay.player1?.id || !replay.player2?.id}
                        onClick={() => loadEntry(selectedTurn?.entryIndex ?? 0)}
                    >
                        <Download />
                        {t("replay.loadTurn")}
                    </Button>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">{t("replay.empty")}</p>
            )}
        </div>
    )
}
