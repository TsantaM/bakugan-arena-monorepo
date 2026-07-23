"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { FlaskConical, RefreshCw, Settings2 } from "lucide-react"
import {
    type ActivePlayerActionRequestType,
    type replayDataType,
    type replaySnapshotType,
    SANDBOX_USER_ID,
} from "@bakugan-arena/game-data"
import { toast } from "sonner"
import SandboxConfigDrawer from "./sandbox/sandbox-config-drawer"
import { draftToActionRequest, draftToSandboxSnapshot } from "./sandbox/sandbox-draft"
import {
    createEmptySandboxDraft,
    type SandboxDraft,
} from "./sandbox/sandbox-types"
import type { SandboxReplayLoadPayload } from "./sandbox/sandbox-replay-tab"

export default function TrainingSandboxPanel() {
    const t = useTranslations("admin.sandbox")
    const locale = useLocale()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [draft, setDraft] = useState<SandboxDraft>(() => createEmptySandboxDraft())
    const [drawerOpen, setDrawerOpen] = useState(true)
    const [iframeReady, setIframeReady] = useState(false)
    const [loadedReplayLabel, setLoadedReplayLabel] = useState<string | null>(null)
    const [replay, setReplay] = useState<replayDataType | null>(null)
    const [selectedReplayEntryIndex, setSelectedReplayEntryIndex] = useState(0)
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL

    const sandboxUrl = (() => {
        const baseUrl = (GAMEBOARD_URL ?? "http://localhost:5173").replace(/\/$/, "")
        const url = new URL(`${baseUrl}/sandbox.html`)
        url.searchParams.set("locale", locale)
        return url.toString()
    })()

    const pushBoardState = useCallback(
        ({
            snapshot,
            perspectiveUserId,
            actionRequest,
        }: {
            snapshot: replaySnapshotType
            perspectiveUserId: string
            actionRequest?: ActivePlayerActionRequestType | null
        }) => {
            const iframe = iframeRef.current
            if (!iframe?.contentWindow) return

            iframe.contentWindow.postMessage(
                {
                    type: "LOAD_SANDBOX_STATE",
                    payload: {
                        snapshot,
                        perspectiveUserId,
                        actionRequest: actionRequest ?? null,
                    },
                },
                GAMEBOARD_URL ?? "*",
            )
        },
        [GAMEBOARD_URL],
    )

    const pushDraft = useCallback(
        (nextDraft: SandboxDraft) => {
            pushBoardState({
                snapshot: draftToSandboxSnapshot(nextDraft),
                perspectiveUserId: nextDraft.userId || SANDBOX_USER_ID,
                actionRequest: draftToActionRequest(nextDraft),
            })
        },
        [pushBoardState],
    )

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type === "SANDBOX_READY") {
                setIframeReady(true)
            }
        }

        window.addEventListener("message", onMessage)
        return () => window.removeEventListener("message", onMessage)
    }, [])

    useEffect(() => {
        if (!iframeReady) return
        pushDraft(createEmptySandboxDraft())
        // Premier sync uniquement quand l'iframe est prête
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iframeReady])

    const clearReplaySession = () => {
        setReplay(null)
        setSelectedReplayEntryIndex(0)
        setLoadedReplayLabel(null)
    }

    const handleLoadFromReplay = (payload: SandboxReplayLoadPayload) => {
        const isNewReplay = loadedReplayLabel === null || !loadedReplayLabel.includes(payload.roomId)

        setDraft(payload.draft)
        setSelectedReplayEntryIndex(payload.entryIndex)
        setLoadedReplayLabel(
            t("replay.loadedBanner", {
                roomId: payload.roomId,
                turn: payload.turnNumber,
            }),
        )
        pushBoardState({
            snapshot: payload.snapshot,
            perspectiveUserId: payload.perspectiveUserId,
            actionRequest: null,
        })

        if (isNewReplay) {
            toast.success(
                t("replay.loadSuccess", {
                    roomId: payload.roomId,
                    turn: payload.turnNumber,
                }),
            )
        }
    }

    return (
        <div className="relative flex min-h-[70vh] flex-col gap-2 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    {loadedReplayLabel ?? t("manualMode")}
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button type="button" size="sm" onClick={() => setDrawerOpen(true)}>
                        <Settings2 />
                        {t("openConfig")}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => pushDraft(draft)}
                    >
                        <RefreshCw />
                        {t("actions.apply")}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            const empty = createEmptySandboxDraft()
                            setDraft(empty)
                            clearReplaySession()
                            pushDraft(empty)
                        }}
                    >
                        <FlaskConical />
                        {t("actions.reset")}
                    </Button>
                </div>
            </div>

            <iframe
                ref={iframeRef}
                title={t("iframeTitle")}
                src={sandboxUrl}
                className="h-[min(75vh,900px)] w-full border-0"
                onLoad={() => {
                    window.setTimeout(() => setIframeReady(true), 300)
                }}
            />
            <SandboxConfigDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                draft={draft}
                onDraftChange={setDraft}
                onApply={() => {
                    pushDraft(draft)
                }}
                onReset={() => {
                    clearReplaySession()
                    pushDraft(createEmptySandboxDraft())
                }}
                onLoadFromReplay={handleLoadFromReplay}
                replay={replay}
                selectedReplayEntryIndex={selectedReplayEntryIndex}
                onReplayChange={setReplay}
                onSelectedReplayEntryIndexChange={setSelectedReplayEntryIndex}
                onClearReplay={clearReplaySession}
            />
        </div>
    )
}
