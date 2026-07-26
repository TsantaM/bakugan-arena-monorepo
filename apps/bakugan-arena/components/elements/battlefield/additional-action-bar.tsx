'use client'

import Image from 'next/image'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type RefObject,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { SkipForward } from 'lucide-react'
import type {
    AbilityCardsActionsRequestsType,
    AdditionalAbilityCommit,
    AdditionalGateCommit,
    AdditionalPartialSelection,
    AdditionalTargetResult,
    bakuganInDeck,
    bakuganToMoveType2,
    gateCardActionRequestsType,
    LocalizedActionMessage,
    MessageToIframe,
    SelectableGateCardAction,
    attribut,
} from '@bakugan-arena/game-data'
import { BakuganList } from '@bakugan-arena/game-data'
import { Button } from '@/components/ui/button'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel'
import { resolveAbilityCard, resolveBattleMessage, isLocale, type Locale } from '@bakugan-arena/i18n'
import { cn } from '@/lib/utils'
import { useAdditionalActionStore } from '@/src/store/additional-action-store'

type AdditionalActionBarProps = {
    iframeRef: RefObject<HTMLIFrameElement | null>
    gameboardOrigin: string
}

type DeckSlide =
    | {
        kind: 'bakugan'
        key: string
        name: string
        attribut: attribut
        power: number
        image: string
        bakugan: bakuganInDeck
    }
    | {
        kind: 'card'
        key: string
        name: string
        description?: string
        image: string
        card: SelectableGateCardAction
    }

function postToGameboard(
    iframe: HTMLIFrameElement | null,
    message: MessageToIframe,
    origin: string,
) {
    iframe?.contentWindow?.postMessage(message, origin)
}

function resolvePrompt(
    message: LocalizedActionMessage | undefined,
    locale: string,
): string {
    if (!message) return ''
    const loc = (isLocale(locale) ? locale : 'en') as Locale
    return resolveBattleMessage(message, loc)
}

function bakuganNames(bakugans: bakuganToMoveType2[]) {
    return bakugans.map((b) => `${b.key}-${b.userId}`)
}

function buildAbilityResolution(
    request: AbilityCardsActionsRequestsType,
    data: AdditionalAbilityCommit['data'],
): AdditionalAbilityCommit {
    return {
        cardKey: request.cardKey,
        userId: request.userId,
        bakuganKey: request.bakuganKey,
        slot: request.slot,
        roomId: request.roomId,
        data,
    }
}

function buildGateResolution(
    request: gateCardActionRequestsType,
    data: AdditionalGateCommit['data'],
): AdditionalGateCommit {
    return {
        cardKey: request.cardKey,
        userId: request.userId,
        slot: request.slot,
        roomId: request.roomId,
        data,
    }
}

function DeckSlideVisual({
    slide,
    compact = false,
}: {
    slide: DeckSlide
    compact?: boolean
}) {
    const size = compact ? 72 : 64
    return (
        <>
            <div
                className={cn(
                    'relative overflow-hidden rounded-md bg-muted',
                    compact ? 'h-20 w-20' : 'h-16 w-16',
                )}
            >
                <Image
                    src={
                        slide.kind === 'bakugan'
                            ? `/images/bakugans/sphere/${slide.image}/${slide.attribut.toUpperCase()}.png`
                            : `/images/cards/${slide.image}`
                    }
                    alt={slide.name}
                    width={size}
                    height={size}
                    className="h-full w-full object-contain"
                    unoptimized
                />
            </div>
            <p className="line-clamp-2 w-full text-center text-[10px] leading-tight font-medium">
                {slide.name}
            </p>
            {slide.kind === 'bakugan' && (
                <p className="text-[10px] text-muted-foreground">
                    {slide.attribut} · {slide.power}G
                </p>
            )}
        </>
    )
}

export default function AdditionalActionBar({
    iframeRef,
    gameboardOrigin,
}: AdditionalActionBarProps) {
    const t = useTranslations('battlefield.additionalActions')
    const locale = useLocale()
    const kind = useAdditionalActionStore((s) => s.kind)
    const abilityRequest = useAdditionalActionStore((s) => s.abilityRequest)
    const gateRequest = useAdditionalActionStore((s) => s.gateRequest)
    const phase = useAdditionalActionStore((s) => s.phase)
    const selectedKey = useAdditionalActionStore((s) => s.selectedKey)
    const setPhase = useAdditionalActionStore((s) => s.setPhase)
    const setSelectedKey = useAdditionalActionStore((s) => s.setSelectedKey)
    const clear = useAdditionalActionStore((s) => s.clear)

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)')
        const apply = () => setIsDesktop(mq.matches)
        apply()
        mq.addEventListener('change', apply)
        return () => mq.removeEventListener('change', apply)
    }, [])

    useEffect(() => {
        if (!api) return
        const onSelect = () => setCurrent(api.selectedScrollSnap())
        onSelect()
        api.on('select', onSelect)
        return () => {
            api.off('select', onSelect)
        }
    }, [api])

    const dataType =
        kind === 'ability'
            ? abilityRequest?.data.type
            : gateRequest?.data.type

    const prompt = useMemo(() => {
        const message =
            kind === 'ability'
                ? abilityRequest?.data && 'message' in abilityRequest.data
                    ? abilityRequest.data.message
                    : undefined
                : gateRequest?.data && 'message' in gateRequest.data
                  ? gateRequest.data.message
                  : undefined
        return resolvePrompt(message, locale)
    }, [abilityRequest, gateRequest, kind, locale])

    const skipable =
        (kind === 'ability' && abilityRequest?.data.skipable) ||
        (kind === 'gate' &&
            gateRequest?.data &&
            'skipable' in gateRequest.data &&
            gateRequest.data.skipable)

    const deckSlides = useMemo((): DeckSlide[] => {
        if (kind === 'ability' && abilityRequest?.data.type === 'SELECT_BAKUGAN_TO_SET') {
            return abilityRequest.data.bakugans.map((b) => ({
                kind: 'bakugan' as const,
                key: b.bakuganData.key,
                name: b.bakuganData.name,
                attribut: b.bakuganData.attribut,
                power: b.bakuganData.currentPowerLevel,
                image: b.bakuganData.image,
                bakugan: b,
            }))
        }
        if (kind === 'gate' && gateRequest?.data.type === 'SELECT_BAKUGAN_TO_SET') {
            return gateRequest.data.bakugans.map((b) => ({
                kind: 'bakugan' as const,
                key: b.bakuganData.key,
                name: b.bakuganData.name,
                attribut: b.bakuganData.attribut,
                power: b.bakuganData.currentPowerLevel,
                image: b.bakuganData.image,
                bakugan: b,
            }))
        }
        if (kind === 'ability' && abilityRequest?.data.type === 'SELECT_ABILITY_CARD') {
            return abilityRequest.data.data.map((c) => {
                const resolved = resolveAbilityCard(c.key, locale)
                return {
                    kind: 'card' as const,
                    key: c.key,
                    name: resolved.name,
                    description: resolved.description,
                    image: c.image,
                    card: c,
                }
            })
        }
        if (kind === 'gate' && gateRequest?.data.type === 'SELECT_ABILITY_CARD') {
            return gateRequest.data.data.map((c) => {
                const resolved = resolveAbilityCard(c.key, locale)
                return {
                    kind: 'card' as const,
                    key: c.key,
                    name: resolved.name,
                    description: resolved.description,
                    image: c.image,
                    card: c,
                }
            })
        }
        return []
    }, [abilityRequest, gateRequest, kind, locale])

    const needsBoardTarget =
        dataType === 'SELECT_SLOT' ||
        dataType === 'SELECT_BAKUGAN_ON_DOMAIN' ||
        dataType === 'MOVE_BAKUGAN_TO_ANOTHER_SLOT' ||
        dataType === 'ATTRACT_BAKUGAN'

    const needsDeckPick =
        dataType === 'SELECT_BAKUGAN_TO_SET' || dataType === 'SELECT_ABILITY_CARD'

    const startBoardTargeting = useCallback(() => {
        if (kind !== 'ability' || !abilityRequest) return

        let payload: AdditionalPartialSelection | null = null
        const data = abilityRequest.data

        if (data.type === 'SELECT_SLOT') {
            const attribut =
                BakuganList.find((b) => b.key === abilityRequest.bakuganKey)
                    ?.attribut
            payload = {
                mode: 'SELECT_SLOT',
                slots: data.slots,
                emptySlot: data.emptySlot,
                attribut,
            }
        } else if (data.type === 'SELECT_BAKUGAN_ON_DOMAIN') {
            payload = {
                mode: 'SELECT_BAKUGAN_ON_DOMAIN',
                bakuganNames: bakuganNames(data.bakugans),
                bakugans: data.bakugans,
            }
        } else if (data.type === 'ATTRACT_BAKUGAN') {
            payload = {
                mode: 'ATTRACT_BAKUGAN',
                bakuganNames: bakuganNames(data.bakugans),
                bakugans: data.bakugans,
            }
        } else if (data.type === 'MOVE_BAKUGAN_TO_ANOTHER_SLOT') {
            payload = {
                mode: 'MOVE_BAKUGAN',
                bakuganNames: bakuganNames(data.bakugans),
                bakugans: data.bakugans,
                slots: data.slots,
            }
        }

        if (!payload) return

        setPhase('waiting-target')
        postToGameboard(
            iframeRef.current,
            { type: 'ADDITIONAL_PARTIAL_SELECTION', payload },
            gameboardOrigin,
        )
    }, [abilityRequest, gameboardOrigin, iframeRef, kind, setPhase])

    // Auto-start 3D targeting for board-target types
    useEffect(() => {
        if (!needsBoardTarget) return
        if (phase !== 'choosing') return
        startBoardTargeting()
    }, [needsBoardTarget, phase, startBoardTargeting])

    // Auto-select first deck slide on desktop
    useEffect(() => {
        if (!needsDeckPick || deckSlides.length === 0) return
        if (selectedKey) return
        setSelectedKey(deckSlides[0].key)
    }, [deckSlides, needsDeckPick, selectedKey, setSelectedKey])

    const commit = useCallback(
        (payload: AdditionalAbilityCommit | AdditionalGateCommit) => {
            if (!kind) return
            setPhase('validating')
            postToGameboard(
                iframeRef.current,
                {
                    type: 'COMMIT_ADDITIONAL_ACTION',
                    kind,
                    payload,
                },
                gameboardOrigin,
            )
            clear()
        },
        [clear, gameboardOrigin, iframeRef, kind, setPhase],
    )

    const skip = () => {
        if (!kind) return
        postToGameboard(iframeRef.current, { type: 'CANCEL_TARGETING' }, gameboardOrigin)
        if (kind === 'ability' && abilityRequest) {
            commit(
                buildAbilityResolution(abilityRequest, { type: 'SKIP_ACTION' }),
            )
            return
        }
        if (kind === 'gate' && gateRequest) {
            commit(buildGateResolution(gateRequest, { type: 'SKIP_ACTION' }))
        }
    }

    const confirmDeckPick = () => {
        const slide =
            deckSlides.find((s) => s.key === selectedKey) ??
            deckSlides[isDesktop ? 0 : current]
        if (!slide || !kind) return

        if (kind === 'ability' && abilityRequest) {
            if (slide.kind === 'bakugan') {
                commit(
                    buildAbilityResolution(abilityRequest, {
                        type: 'SELECT_BAKUGAN_TO_SET',
                        bakugan: slide.bakugan,
                    }),
                )
            } else {
                commit(
                    buildAbilityResolution(abilityRequest, {
                        type: 'SELECT_ABILITY_CARD',
                        card: slide.card,
                        cardOwnerId:
                            abilityRequest.data.type === 'SELECT_ABILITY_CARD' &&
                            abilityRequest.data.target
                                ? abilityRequest.data.target
                                : abilityRequest.userId,
                    }),
                )
            }
            return
        }

        if (kind === 'gate' && gateRequest) {
            if (slide.kind === 'bakugan') {
                commit(
                    buildGateResolution(gateRequest, {
                        type: 'SELECT_BAKUGAN_TO_SET',
                        bakugan: slide.bakugan,
                    }),
                )
            } else {
                commit(
                    buildGateResolution(gateRequest, {
                        type: 'SELECT_ABILITY_CARD',
                        card: slide.card,
                        cardOwnerId:
                            gateRequest.data.type === 'SELECT_ABILITY_CARD' &&
                            gateRequest.data.target
                                ? gateRequest.data.target
                                : gateRequest.userId,
                    }),
                )
            }
        }
    }

    const pickHint =
        dataType === 'MOVE_BAKUGAN_TO_ANOTHER_SLOT'
            ? t('pickBakuganThenSlot')
            : dataType === 'SELECT_SLOT'
              ? t('pickSlot')
              : t('pickBakugan')

    return (
        <div
            className="flex h-full min-h-0 w-full flex-col overflow-hidden p-2"
            data-additional-action-bar
        >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {prompt && (
                    <p className="shrink-0 border-b border-border px-3 py-2 text-center text-sm font-medium">
                        {prompt}
                    </p>
                )}

                {phase === 'waiting-target' && (
                    <p className="shrink-0 px-3 py-1.5 text-center text-xs text-muted-foreground sm:text-sm">
                        {pickHint}
                    </p>
                )}

                {needsDeckPick && deckSlides.length > 0 && (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
                        {!isDesktop && (
                            <div className="mx-auto flex min-h-0 w-full max-w-[11rem] flex-1 flex-col items-center justify-center">
                                <Carousel
                                    setApi={setApi}
                                    className="w-full max-w-[10rem]"
                                    opts={{ loop: false }}
                                >
                                    <CarouselContent>
                                        {deckSlides.map((slide) => (
                                            <CarouselItem key={slide.key}>
                                                <div className="flex flex-col items-center gap-1.5 px-1 py-1">
                                                    <DeckSlideVisual slide={slide} compact />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-0 size-7" />
                                    <CarouselNext className="right-0 size-7" />
                                </Carousel>
                                <p className="shrink-0 pt-1 text-center text-xs text-muted-foreground">
                                    {t('slideOf', {
                                        current: current + 1,
                                        count: deckSlides.length,
                                    })}
                                </p>
                            </div>
                        )}

                        {isDesktop && (
                            <div className="flex min-h-0 flex-1 flex-wrap content-start items-start justify-start gap-3 overflow-y-auto p-1">
                                {deckSlides.map((slide) => {
                                    const isSelected = selectedKey === slide.key
                                    return (
                                        <button
                                            key={slide.key}
                                            type="button"
                                            title={slide.name}
                                            onClick={() => setSelectedKey(slide.key)}
                                            className={cn(
                                                'flex w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-md border p-1.5 transition',
                                                isSelected
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
                                                    : 'border-border/60 hover:border-primary/50',
                                            )}
                                        >
                                            <DeckSlideVisual slide={slide} />
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <div className="shrink-0 pt-2">
                            <Button
                                type="button"
                                size="sm"
                                className="w-full"
                                onClick={confirmDeckPick}
                            >
                                {t('confirmSelection')}
                            </Button>
                        </div>
                    </div>
                )}

                {skipable && (
                    <div className="mt-auto shrink-0 border-t border-border p-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={skip}
                        >
                            <SkipForward className="size-4" />
                            <span className="ml-1">{t('skip')}</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

/** Assemble et commit la résolution après un pick 3D. */
export function commitAdditionalTarget(
    target: AdditionalTargetResult,
    iframe: HTMLIFrameElement | null,
    origin: string,
) {
    const state = useAdditionalActionStore.getState()
    const { kind, abilityRequest } = state

    if (kind !== 'ability' || !abilityRequest) {
        state.setPhase('choosing')
        postToGameboard(iframe, { type: 'CANCEL_TARGETING' }, origin)
        return
    }

    let data: AdditionalAbilityCommit['data'] | null = null

    if (target.mode === 'SELECT_SLOT') {
        data = { type: 'SELECT_SLOT', slot: target.slot }
    } else if (target.mode === 'SELECT_BAKUGAN_ON_DOMAIN') {
        data = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            bakugan: target.bakugan.key,
            slot: target.bakugan.slot,
            userId: target.bakugan.userId,
        }
    } else if (target.mode === 'ATTRACT_BAKUGAN') {
        data = {
            type: 'ATTRACT_BAKUGAN',
            bakugan: target.bakugan,
        }
    } else if (target.mode === 'MOVE_BAKUGAN') {
        data = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            bakugan: target.bakugan,
            slot: target.slot,
        }
    }

    if (!data) {
        state.setPhase('choosing')
        postToGameboard(iframe, { type: 'CANCEL_TARGETING' }, origin)
        return
    }

    state.setPhase('validating')
    postToGameboard(
        iframe,
        {
            type: 'COMMIT_ADDITIONAL_ACTION',
            kind: 'ability',
            payload: buildAbilityResolution(abilityRequest, data),
        },
        origin,
    )
    state.clear()
}
