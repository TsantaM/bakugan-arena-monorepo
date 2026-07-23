"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { FlaskConical, RefreshCw, Settings2 } from "lucide-react"
import {
    type ActivePlayerActionRequestType,
    type AnimationDirectivesTypes,
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
    const [configOpen, setConfigOpen] = useState(true)
    const [iframeReady, setIframeReady] = useState(false)
    const [loadedReplayLabel, setLoadedReplayLabel] = useState<string | null>(null)
    const [replay, setReplay] = useState<replayDataType | null>(null)
    const [selectedReplayEntryIndex, setSelectedReplayEntryIndex] = useState(0)
    const [customAnimationKeys, setCustomAnimationKeys] = useState<string[]>([])
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
            animationsToPlay,
        }: {
            snapshot: replaySnapshotType
            perspectiveUserId: string
            actionRequest?: ActivePlayerActionRequestType | null
            animationsToPlay?: AnimationDirectivesTypes[]
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
                        animationsToPlay:
                            animationsToPlay && animationsToPlay.length > 0
                                ? animationsToPlay
                                : undefined,
                    },
                },
                GAMEBOARD_URL ?? "*",
            )
        },
        [GAMEBOARD_URL],
    )

    const pushDraft = useCallback(
        (nextDraft: SandboxDraft, animationsToPlay?: AnimationDirectivesTypes[]) => {
            pushBoardState({
                snapshot: draftToSandboxSnapshot(nextDraft),
                perspectiveUserId: nextDraft.userId || SANDBOX_USER_ID,
                actionRequest: draftToActionRequest(nextDraft),
                animationsToPlay,
            })
        },
        [pushBoardState],
    )

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type === "SANDBOX_READY") {
                setIframeReady(true)
                const keys = event.data?.payload?.customAnimationKeys
                if (Array.isArray(keys)) {
                    setCustomAnimationKeys(keys.filter((k): k is string => typeof k === "string"))
                }
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
                    <Button type="button" size="sm" onClick={() => setConfigOpen(true)}>
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
                open={configOpen}
                onOpenChange={setConfigOpen}
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
                customAnimationKeys={customAnimationKeys}
                onPlayAnimations={(animations) => {
                    setConfigOpen(false)
                    // Laisse le drawer se fermer avant de jouer l'animation sur le plateau
                    window.setTimeout(() => {
                        pushDraft(draft, animations)
                    }, 320)
                }}
            />
        </div>
    )
}
