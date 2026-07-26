'use client'

import Image from 'next/image'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { SkipForward } from 'lucide-react'
import type {
    ActionType,
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
    MessageToIframe,
    TurnActionCommitPayload,
    TurnActionPartialSelection,
    attribut,
    slots_id,
} from '@bakugan-arena/game-data'
import { isTurnActionLegal } from '@bakugan-arena/game-data'
import { Button } from '@/components/ui/button'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTurnActionStore } from '@/src/store/turn-action-store'
import { resolveAbilityCard, resolveGateCard } from '@bakugan-arena/i18n'
import { cn } from '@/lib/utils'

type TurnActionBarProps = {
    iframeRef: RefObject<HTMLIFrameElement | null>
    userId: string
    gameboardOrigin: string
}

/** Tabs avec carousel (cible 3D ou sélection simple). */
type CarouselTabType =
    | 'SET_BAKUGAN'
    | 'SET_GATE_CARD_ACTION'
    | 'USE_ABILITY_CARD'
    | 'CHANGE_ATTRIBUTE'
    | 'SELECT_BAKUGAN'
    | 'SELECT_GATE_CARD'
    | 'SELECT_ABILITY_CARD'

type CarouselSlide =
    | {
        kind: 'bakugan'
        key: string
        name: string
        attribut: attribut
        power: number
        image: string
        actionType: 'SET_BAKUGAN' | 'SELECT_BAKUGAN'
    }
    | {
        kind: 'card'
        key: string
        name: string
        description?: string
        image: string
        actionType: 'SET_GATE_CARD_ACTION' | 'USE_ABILITY_CARD' | 'SELECT_GATE_CARD' | 'SELECT_ABILITY_CARD'
    }
    | {
        kind: 'attribut'
        key: attribut
        name: string
        image: string
        actionType: 'CHANGE_ATTRIBUTE'
    }

type CarouselTab = {
    type: CarouselTabType
    slides: CarouselSlide[]
    action: ActionType
}

function flattenActions(
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
): ActionType[] {
    return [
        request.actions.mustDo,
        request.actions.mustDoOne,
        request.actions.optional,
    ].flat()
}

function postToGameboard(
    iframe: HTMLIFrameElement | null,
    message: MessageToIframe,
    origin: string,
) {
    iframe?.contentWindow?.postMessage(message, origin)
}

function buildCarouselTabs(
    actions: ActionType[],
    locale: string,
): CarouselTab[] {
    const tabs: CarouselTab[] = []

    for (const action of actions) {
        if (action.type === 'SET_BAKUGAN') {
            tabs.push({
                type: 'SET_BAKUGAN',
                action,
                slides: action.data.bakugans.map((b) => ({
                    kind: 'bakugan' as const,
                    key: b.key,
                    name: b.name,
                    attribut: b.attribut,
                    power: b.currentPower,
                    image: b.image,
                    actionType: 'SET_BAKUGAN' as const,
                })),
            })
        }

        if (action.type === 'SET_GATE_CARD_ACTION') {
            tabs.push({
                type: 'SET_GATE_CARD_ACTION',
                action,
                slides: action.data.cards.map((c) => {
                    const resolved = resolveGateCard(c.key, locale)
                    return {
                        kind: 'card' as const,
                        key: c.key,
                        name: resolved.name,
                        description: resolved.description,
                        image: c.image,
                        actionType: 'SET_GATE_CARD_ACTION' as const,
                    }
                }),
            })
        }

        if (action.type === 'USE_ABILITY_CARD') {
            const cards = [
                ...new Map(
                    action.data
                        .flatMap((b) => b.abilities)
                        .map((card) => [card.key, card]),
                ).values(),
            ]
            tabs.push({
                type: 'USE_ABILITY_CARD',
                action,
                slides: cards.map((c) => {
                    const resolved = resolveAbilityCard(c.key, locale)
                    return {
                        kind: 'card' as const,
                        key: c.key,
                        name: resolved.name,
                        description: resolved.description,
                        image: c.image,
                        actionType: 'USE_ABILITY_CARD' as const,
                    }
                }),
            })
        }

        if (action.type === 'CHANGE_ATTRIBUTE') {
            const attributs = [
                ...new Set(action.data.flatMap((e) => e.attributs)),
            ]
            tabs.push({
                type: 'CHANGE_ATTRIBUTE',
                action,
                slides: attributs.map((attr) => ({
                    kind: 'attribut' as const,
                    key: attr,
                    name: attr,
                    image: `/images/attributs/${attr.toUpperCase()}.png`,
                    actionType: 'CHANGE_ATTRIBUTE' as const,
                })),
            })
        }

        if (action.type === 'SELECT_BAKUGAN') {
            tabs.push({
                type: 'SELECT_BAKUGAN',
                action,
                slides: action.data.map((b) => ({
                    kind: 'bakugan' as const,
                    key: b.key,
                    name: b.name,
                    attribut: b.attribut,
                    power: b.currentPower,
                    image: b.image,
                    actionType: 'SELECT_BAKUGAN' as const,
                })),
            })
        }

        if (action.type === 'SELECT_GATE_CARD') {
            tabs.push({
                type: 'SELECT_GATE_CARD',
                action,
                slides: action.data.map((c) => {
                    const resolved = resolveGateCard(c.key, locale)
                    return {
                        kind: 'card' as const,
                        key: c.key,
                        name: resolved.name,
                        description: resolved.description,
                        image: c.image,
                        actionType: 'SELECT_GATE_CARD' as const,
                    }
                }),
            })
        }

        if (action.type === 'SELECT_ABILITY_CARD') {
            tabs.push({
                type: 'SELECT_ABILITY_CARD',
                action,
                slides: action.data.map((c) => {
                    const resolved = resolveAbilityCard(c.key, locale)
                    return {
                        kind: 'card' as const,
                        key: c.key,
                        name: resolved.name,
                        description: resolved.description,
                        image: c.image,
                        actionType: 'SELECT_ABILITY_CARD' as const,
                    }
                }),
            })
        }
    }

    return tabs.filter((tab) => tab.slides.length > 0)
}

function slideSyncKey(tabType: CarouselTabType, slide: CarouselSlide) {
    return `${tabType}:${slide.key}`
}

function ActionSlideVisual({
    slide,
    compact = false,
}: {
    slide: CarouselSlide
    compact?: boolean
}) {
    if (slide.kind === 'bakugan') {
        return (
            <>
                <div
                    className={cn(
                        'relative aspect-square w-full',
                        compact ? 'max-w-[5.5rem]' : 'max-w-[4.5rem]',
                    )}
                >
                    <Image
                        src={`/images/bakugans/sphere/${slide.image}/${slide.attribut.toUpperCase()}.png`}
                        alt={slide.name}
                        fill
                        className="object-contain"
                        sizes={compact ? '88px' : '72px'}
                    />
                </div>
                <div className="w-full text-center text-xs leading-tight">
                    <p className="truncate font-semibold" title={slide.name}>
                        {slide.name}
                    </p>
                    <p className="text-muted-foreground">
                        {slide.attribut} · {slide.power}G
                    </p>
                </div>
            </>
        )
    }

    if (slide.kind === 'card') {
        return (
            <>
                <div
                    className={cn(
                        'relative aspect-[3/4] w-full overflow-hidden rounded',
                        compact ? 'max-w-[4.75rem]' : 'max-w-[3.75rem]',
                    )}
                >
                    <Image
                        src={`/images/cards/${slide.image}`}
                        alt={slide.name}
                        fill
                        className="object-cover"
                        sizes={compact ? '76px' : '60px'}
                    />
                </div>
                <p
                    className="line-clamp-2 w-full text-center text-xs font-semibold leading-tight"
                    title={slide.name}
                >
                    {slide.name}
                </p>
            </>
        )
    }

    return (
        <>
            <div
                className={cn(
                    'relative aspect-square w-full',
                    compact ? 'max-w-[4rem]' : 'max-w-[3.25rem]',
                )}
            >
                <Image
                    src={slide.image}
                    alt={slide.name}
                    fill
                    className="object-contain"
                    sizes={compact ? '64px' : '52px'}
                />
            </div>
            <p className="truncate text-center text-xs font-semibold" title={slide.name}>
                {slide.name}
            </p>
        </>
    )
}

export default function TurnActionBar({
    iframeRef,
    userId,
    gameboardOrigin,
}: TurnActionBarProps) {
    const t = useTranslations('battlefield.turnActions')
    const locale = useLocale()
    const request = useTurnActionStore((s) => s.request)
    const phase = useTurnActionStore((s) => s.phase)
    const selectedKey = useTurnActionStore((s) => s.selectedKey)
    const setSelectedKey = useTurnActionStore((s) => s.setSelectedKey)
    const setPhase = useTurnActionStore((s) => s.setPhase)

    const actions = useMemo(
        () => (request ? flattenActions(request) : []),
        [request],
    )
    const carouselTabs = useMemo(
        () => buildCarouselTabs(actions, locale),
        [actions, locale],
    )

    const openGateActions = actions.filter(
        (a): a is Extract<ActionType, { type: 'OPEN_GATE_CARD' }> =>
            a.type === 'OPEN_GATE_CARD',
    )
    const activeGateActions = actions.filter(
        (a): a is Extract<ActionType, { type: 'ACTIVE_GATE_CARD' }> =>
            a.type === 'ACTIVE_GATE_CARD',
    )

    const mustDo = request?.actions.mustDo ?? []
    const mustDoOne = request?.actions.mustDoOne ?? []
    // Passer le tour : uniquement joueur actif, sans mustDo / mustDoOne
    const canPass =
        !!request &&
        request.target === 'ACTIVE_PLAYER' &&
        mustDo.length === 0 &&
        mustDoOne.length === 0

    const [activeTab, setActiveTab] = useState<CarouselTabType | ''>('')
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [isDesktop, setIsDesktop] = useState(false)
    const lastSyncedRef = useRef<string | null>(null)

    const activeCarouselTab = carouselTabs.find((tab) => tab.type === activeTab)

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)')
        const update = () => setIsDesktop(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    // Init / reset tab quand le request change
    useEffect(() => {
        lastSyncedRef.current = null
        if (carouselTabs.length === 0) {
            setActiveTab('')
            return
        }
        setActiveTab((prev) => {
            if (prev && carouselTabs.some((tab) => tab.type === prev)) return prev
            return carouselTabs[0].type
        })
    }, [carouselTabs])

    const cleanupAndSendPartial = useCallback(
        (payload: TurnActionPartialSelection) => {
            // Nettoyage 3D avant de rebrancher le ciblage
            postToGameboard(
                iframeRef.current,
                { type: 'CANCEL_TARGETING' },
                gameboardOrigin,
            )
            setPhase('waiting-target')
            setSelectedKey(
                'key' in payload
                    ? payload.key
                    : 'attribut' in payload
                        ? payload.attribut
                        : null,
            )
            postToGameboard(
                iframeRef.current,
                { type: 'ACTION_PARTIAL_SELECTION', payload },
                gameboardOrigin,
            )
        },
        [gameboardOrigin, iframeRef, setPhase, setSelectedKey],
    )

    const sendCommit = useCallback(
        (payload: TurnActionCommitPayload) => {
            if (!request || !isTurnActionLegal(request, payload)) return
            postToGameboard(
                iframeRef.current,
                { type: 'CANCEL_TARGETING' },
                gameboardOrigin,
            )
            setPhase('validating')
            postToGameboard(
                iframeRef.current,
                { type: 'COMMIT_ACTION', payload },
                gameboardOrigin,
            )
            setSelectedKey(null)
            setPhase('choosing')
        },
        [gameboardOrigin, iframeRef, request, setPhase, setSelectedKey],
    )

    const syncSlideToGameboard = useCallback(
        (tab: CarouselTab, slideIndex: number) => {
            const slide = tab.slides[slideIndex]
            if (!slide) return

            const syncKey = slideSyncKey(tab.type, slide)
            if (lastSyncedRef.current === syncKey) return
            lastSyncedRef.current = syncKey

            if (tab.type === 'SET_GATE_CARD_ACTION' && tab.action.type === 'SET_GATE_CARD_ACTION') {
                cleanupAndSendPartial({
                    actionType: 'SET_GATE_CARD_ACTION',
                    key: slide.key,
                    slots: tab.action.data.slots,
                })
                return
            }

            if (tab.type === 'SET_BAKUGAN' && tab.action.type === 'SET_BAKUGAN' && slide.kind === 'bakugan') {
                cleanupAndSendPartial({
                    actionType: 'SET_BAKUGAN',
                    key: slide.key,
                    attribut: slide.attribut,
                    slots: tab.action.data.setableSlots,
                })
                return
            }

            if (tab.type === 'USE_ABILITY_CARD' && tab.action.type === 'USE_ABILITY_CARD') {
                const eligible = tab.action.data.filter((b) =>
                    b.abilities.some((a) => a.key === slide.key),
                )
                if (eligible.length === 0) return
                cleanupAndSendPartial({
                    actionType: 'USE_ABILITY_CARD',
                    key: slide.key,
                    bakuganNames: eligible.map((b) => `${b.bakuganKey}-${userId}`),
                    bakugans: eligible.map((b) => ({
                        bakuganKey: b.bakuganKey,
                        slot: b.slot,
                    })),
                })
                return
            }

            if (tab.type === 'CHANGE_ATTRIBUTE' && tab.action.type === 'CHANGE_ATTRIBUTE' && slide.kind === 'attribut') {
                const eligible = tab.action.data.filter((e) =>
                    e.attributs.includes(slide.key),
                )
                if (eligible.length === 0) return
                cleanupAndSendPartial({
                    actionType: 'CHANGE_ATTRIBUTE',
                    attribut: slide.key,
                    bakuganNames: eligible.map((e) => `${e.target.key}-${userId}`),
                    bakugans: eligible.map((e) => e.target),
                })
                return
            }

            // SELECT_* : pas de ciblage 3D — on mémorise seulement la slide courante
            if (
                tab.type === 'SELECT_GATE_CARD' ||
                tab.type === 'SELECT_BAKUGAN' ||
                tab.type === 'SELECT_ABILITY_CARD'
            ) {
                postToGameboard(iframeRef.current, { type: 'CANCEL_TARGETING' }, gameboardOrigin)
                setSelectedKey(slide.key)
                setPhase('choosing')
            }
        },
        [cleanupAndSendPartial, gameboardOrigin, iframeRef, setPhase, setSelectedKey, userId],
    )

    const confirmSelectSlide = () => {
        if (!activeCarouselTab) return
        const slide =
            activeCarouselTab.slides.find((s) => s.key === selectedKey) ??
            activeCarouselTab.slides[Math.max(0, current - 1)]
        if (!slide) return

        if (activeCarouselTab.type === 'SELECT_GATE_CARD') {
            sendCommit({ actionType: 'SELECT_GATE_CARD', gateId: slide.key })
            return
        }
        if (activeCarouselTab.type === 'SELECT_BAKUGAN') {
            sendCommit({ actionType: 'SELECT_BAKUGAN', key: slide.key })
            return
        }
        if (activeCarouselTab.type === 'SELECT_ABILITY_CARD') {
            sendCommit({
                actionType: 'SELECT_ABILITY_CARD',
                key: slide.key,
                bakuganId: '',
                slot: '' as slots_id,
            })
        }
    }

    // Suivi carousel mobile → sync iframe
    useEffect(() => {
        if (isDesktop || !api || !activeCarouselTab) return

        const onSelect = () => {
            const index = api.selectedScrollSnap()
            setCurrent(index + 1)
            setCount(api.scrollSnapList().length)
            syncSlideToGameboard(activeCarouselTab, index)
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
        syncSlideToGameboard(activeCarouselTab, api.selectedScrollSnap())

        api.on('select', onSelect)
        api.on('reInit', onSelect)
        return () => {
            api.off('select', onSelect)
            api.off('reInit', onSelect)
        }
    }, [api, activeCarouselTab, syncSlideToGameboard, isDesktop])

    // Desktop : pas de carousel — sélection auto du 1er élément à l'ouverture de tab
    useEffect(() => {
        if (!isDesktop || !activeCarouselTab) return
        lastSyncedRef.current = null
        syncSlideToGameboard(activeCarouselTab, 0)
        setCurrent(1)
        setCount(activeCarouselTab.slides.length)
    }, [activeTab, activeCarouselTab, syncSlideToGameboard, isDesktop])

    const onTabChange = (value: string) => {
        lastSyncedRef.current = null
        postToGameboard(
            iframeRef.current,
            { type: 'CANCEL_TARGETING' },
            gameboardOrigin,
        )
        setActiveTab(value as CarouselTabType)
        setApi(undefined)
        setCurrent(0)
        setCount(0)
        setPhase('choosing')
    }

    const selectDesktopSlide = (tab: CarouselTab, index: number) => {
        lastSyncedRef.current = null
        syncSlideToGameboard(tab, index)
        setCurrent(index + 1)
        setCount(tab.slides.length)
    }

    const passTurn = () => {
        if (!canPass) return
        postToGameboard(iframeRef.current, { type: 'CANCEL_TARGETING' }, gameboardOrigin)
        postToGameboard(iframeRef.current, { type: 'PASS_TURN' }, gameboardOrigin)
        useTurnActionStore.getState().clear()
    }

    const showEmptyHint =
        !!request &&
        carouselTabs.length === 0 &&
        openGateActions.length === 0 &&
        activeGateActions.length === 0 &&
        request.target === 'ACTIVE_PLAYER'

    const hasActions =
        !!request &&
        phase !== 'idle' &&
        (carouselTabs.length > 0 ||
            openGateActions.length > 0 ||
            activeGateActions.length > 0 ||
            canPass ||
            showEmptyHint)

    const showConfirmSelect =
        activeCarouselTab?.type === 'SELECT_GATE_CARD' ||
        activeCarouselTab?.type === 'SELECT_BAKUGAN' ||
        activeCarouselTab?.type === 'SELECT_ABILITY_CARD'

    const hasSideButtons =
        openGateActions.length > 0 ||
        activeGateActions.length > 0 ||
        canPass

    return (
        <div
            className="flex h-full min-h-0 w-full flex-col overflow-hidden p-2"
            data-turn-action-bar
        >
            {!hasActions ? (
                <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
                    {t('waitingForTurn')}
                </div>
            ) : (
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    {phase === 'waiting-target' && (
                        <p className="shrink-0 border-b border-border px-3 py-1.5 text-center text-xs text-muted-foreground sm:text-sm">
                            {t('pickTarget')}
                        </p>
                    )}

                    {showEmptyHint && (
                        <p className="shrink-0 px-3 py-2 text-center text-sm text-muted-foreground">
                            {t('nothingToDo')}
                        </p>
                    )}

                    {carouselTabs.length > 0 && activeTab ? (
                        <Tabs
                            value={activeTab}
                            onValueChange={onTabChange}
                            className="flex min-h-0 flex-1 flex-col overflow-hidden gap-0"
                        >
                            <TabsList className="mb-2 flex h-auto w-full shrink-0 flex-wrap justify-center gap-1">
                                {carouselTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.type}
                                        value={tab.type}
                                        className="text-xs"
                                    >
                                        {t(`tabs.${tab.type}`)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)]">
                                <div className="min-h-0 overflow-hidden border-r border-border p-2">
                                    {carouselTabs.map((tab) => (
                                        <TabsContent
                                            key={tab.type}
                                            value={tab.type}
                                            className="mt-0 flex h-full min-h-0 flex-col data-[state=inactive]:hidden"
                                        >
                                            {activeTab === tab.type && (
                                                <div className="flex h-full min-h-0 flex-col">
                                                    {/* Mobile : carousel */}
                                                    {!isDesktop && (
                                                        <div className="mx-auto flex min-h-0 w-full max-w-[11rem] flex-1 flex-col items-center justify-center">
                                                            <Carousel
                                                                key={`mobile-${tab.type}`}
                                                                setApi={setApi}
                                                                className="w-full max-w-[10rem]"
                                                                opts={{ loop: false }}
                                                            >
                                                                <CarouselContent>
                                                                    {tab.slides.map((slide) => (
                                                                        <CarouselItem key={`m-${tab.type}-${slide.key}`}>
                                                                            <div className="flex flex-col items-center gap-1.5 px-1 py-1">
                                                                                <ActionSlideVisual slide={slide} compact />
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>
                                                                <CarouselPrevious className="left-0 size-7" />
                                                                <CarouselNext className="right-0 size-7" />
                                                            </Carousel>
                                                            <p className="shrink-0 pt-1 text-center text-xs text-muted-foreground">
                                                                {t('slideOf', { current, count })}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Desktop : flex cliquable */}
                                                    {isDesktop && (
                                                        <div className="flex min-h-0 flex-1 flex-wrap content-start items-start justify-start gap-3 overflow-y-auto p-1">
                                                            {tab.slides.map((slide, index) => {
                                                                const isSelected = selectedKey === slide.key
                                                                return (
                                                                    <button
                                                                        key={`d-${tab.type}-${slide.key}`}
                                                                        type="button"
                                                                        title={slide.name}
                                                                        onClick={() => selectDesktopSlide(tab, index)}
                                                                        className={cn(
                                                                            'flex w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-md border p-1.5 transition',
                                                                            isSelected
                                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
                                                                                : 'border-border/60 hover:border-primary/50',
                                                                        )}
                                                                    >
                                                                        <ActionSlideVisual slide={slide} />
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Confirmer sous les cards (SELECT_* début de combat) */}
                                                    {showConfirmSelect && (
                                                        <div className="shrink-0 pt-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={confirmSelectSlide}
                                                            >
                                                                {t('confirmSelection')}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </div>

                                <aside className="flex min-h-0 flex-col gap-2 overflow-y-auto p-2">
                                    {openGateActions.map((action) => (
                                        <Button
                                            key={`open-${action.gateId}-${action.slot}`}
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="w-full shrink-0"
                                            onClick={() =>
                                                sendCommit({
                                                    actionType: 'OPEN_GATE_CARD',
                                                    gateId: action.gateId,
                                                    slot: action.slot,
                                                })
                                            }
                                        >
                                            {t('openGate', { slot: action.slot })}
                                        </Button>
                                    ))}

                                    {activeGateActions.map((action) => {
                                        const gateId = action.data.portalCard?.key
                                        if (!gateId) return null
                                        return (
                                            <Button
                                                key={`active-${gateId}-${action.data.id}`}
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="w-full shrink-0"
                                                onClick={() =>
                                                    sendCommit({
                                                        actionType: 'ACTIVE_GATE_CARD',
                                                        gateId,
                                                        slot: action.data.id,
                                                    })
                                                }
                                            >
                                                {t('activateGate', { slot: action.data.id })}
                                            </Button>
                                        )
                                    })}

                                    {canPass && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="mt-auto w-full shrink-0"
                                            onClick={passTurn}
                                            aria-label={t('passTurn')}
                                        >
                                            <SkipForward className="size-4" />
                                            <span className="ml-1">{t('passTurn')}</span>
                                        </Button>
                                    )}
                                </aside>
                            </div>
                        </Tabs>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            <div className="flex min-h-0 flex-1 items-center justify-center p-3">
                                {showEmptyHint && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t('nothingToDo')}
                                    </p>
                                )}
                            </div>
                            {hasSideButtons && (
                                <aside className="flex shrink-0 flex-wrap items-stretch justify-end gap-2 border-t border-border p-3">
                                    {openGateActions.map((action) => (
                                        <Button
                                            key={`open-solo-${action.gateId}-${action.slot}`}
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                sendCommit({
                                                    actionType: 'OPEN_GATE_CARD',
                                                    gateId: action.gateId,
                                                    slot: action.slot,
                                                })
                                            }
                                        >
                                            {t('openGate', { slot: action.slot })}
                                        </Button>
                                    ))}
                                    {activeGateActions.map((action) => {
                                        const gateId = action.data.portalCard?.key
                                        if (!gateId) return null
                                        return (
                                            <Button
                                                key={`active-solo-${gateId}-${action.data.id}`}
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    sendCommit({
                                                        actionType: 'ACTIVE_GATE_CARD',
                                                        gateId,
                                                        slot: action.data.id,
                                                    })
                                                }
                                            >
                                                {t('activateGate', { slot: action.data.id })}
                                            </Button>
                                        )
                                    })}
                                    {canPass && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={passTurn}
                                            aria-label={t('passTurn')}
                                        >
                                            <SkipForward className="size-4" />
                                            <span className="ml-1">{t('passTurn')}</span>
                                        </Button>
                                    )}
                                </aside>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/** À appeler depuis battlefield quand le gameboard renvoie ACTION_TARGET_SELECTED */
export function commitValidatedTarget(
    payload: TurnActionCommitPayload,
    iframe: HTMLIFrameElement | null,
    origin: string,
) {
    const request = useTurnActionStore.getState().request
    if (!isTurnActionLegal(request, payload)) {
        useTurnActionStore.getState().setPhase('choosing')
        useTurnActionStore.getState().setSelectedKey(null)
        postToGameboard(iframe, { type: 'CANCEL_TARGETING' }, origin)
        return
    }

    useTurnActionStore.getState().setPhase('validating')
    postToGameboard(iframe, { type: 'COMMIT_ACTION', payload }, origin)
    useTurnActionStore.getState().setSelectedKey(null)
    useTurnActionStore.getState().setPendingCommit(null)
    useTurnActionStore.getState().setPhase('choosing')
}
