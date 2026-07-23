"use client"

import { useMemo, useState } from "react"
import {
    AbilityCardsList,
    ExclusiveAbilitiesList,
    type AnimationDirectivesTypes,
    type attribut,
} from "@bakugan-arena/game-data"
import { resolveAbilityCard, resolveGameDataName } from "@bakugan-arena/i18n"
import { Bakugans } from "@bakugan-arena/game-data"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"
import { toast } from "sonner"
import SandboxCatalogPicker from "./sandbox-catalog-picker"
import {
    buildSandboxAnimationBatch,
    SANDBOX_ATTRIBUTS,
    type SandboxAnimLabMode,
} from "./sandbox-animation-lab"
import type { SandboxDraft } from "./sandbox-types"

type SandboxAnimationLabTabProps = {
    draft: SandboxDraft
    customAnimationKeys: string[]
    onPlay: (animations: AnimationDirectivesTypes[]) => void
}

export default function SandboxAnimationLabTab({
    draft,
    customAnimationKeys,
    onPlay,
}: SandboxAnimationLabTabProps) {
    const t = useTranslations("admin.sandbox")
    const locale = useLocale()

    const [mode, setMode] = useState<SandboxAnimLabMode>("ability")
    const [cardKey, setCardKey] = useState<string | null>(null)
    const [sourceBakuganLocalId, setSourceBakuganLocalId] = useState<string | null>(null)
    const [slotId, setSlotId] = useState<string | null>(null)
    const [targetAttribut, setTargetAttribut] = useState<attribut | null>(null)
    const [queued, setQueued] = useState<AnimationDirectivesTypes[]>([])

    const abilityOptions = useMemo(
        () => [
            ...AbilityCardsList.map((card) => ({
                value: card.key,
                label: resolveAbilityCard(card.key, locale).name,
                hint: card.attribut ?? "ability",
            })),
            ...ExclusiveAbilitiesList.map((card) => ({
                value: card.key,
                label: resolveAbilityCard(card.key, locale).name,
                hint: "EX",
            })),
        ],
        [locale],
    )

    const customOptions = useMemo(
        () =>
            customAnimationKeys.map((key) => ({
                value: key,
                label: resolveAbilityCard(key, locale).name || key,
                hint: "3D",
            })),
        [customAnimationKeys, locale],
    )

    const placedBakugans = useMemo(
        () =>
            draft.slots.flatMap((slot) =>
                slot.bakugans.map((bakugan) => ({
                    ...bakugan,
                    slotId: slot.id,
                    label: `${resolveGameDataName("bakugans", bakugan.bakuganKey, locale, bakugan.bakuganKey)} · ${slot.id} · ${Bakugans[bakugan.bakuganKey]?.attribut ?? "?"}`,
                })),
            ),
        [draft.slots, locale],
    )

    const slotsWithGate = useMemo(
        () => draft.slots.filter((slot) => slot.gateKey),
        [draft.slots],
    )

    const rebuildQueue = (next?: {
        mode?: SandboxAnimLabMode
        cardKey?: string | null
        sourceBakuganLocalId?: string | null
        slotId?: string | null
        targetAttribut?: attribut | null
    }) => {
        const result = buildSandboxAnimationBatch({
            draft,
            mode: next?.mode ?? mode,
            cardKey: next?.cardKey !== undefined ? next.cardKey : cardKey,
            sourceBakuganLocalId:
                next?.sourceBakuganLocalId !== undefined
                    ? next.sourceBakuganLocalId
                    : sourceBakuganLocalId,
            slotId: next?.slotId !== undefined ? next.slotId : slotId,
            targetAttribut:
                next?.targetAttribut !== undefined
                    ? next.targetAttribut
                    : targetAttribut,
            customAnimationKeys,
        })

        setQueued(result.animations)
        return result
    }

    const handlePlay = () => {
        const result = rebuildQueue()

        if (result.errorKey) {
            toast.error(t(result.errorKey as "animLab.errors.cardRequired"))
            return
        }

        if (result.animations.length === 0) {
            toast.error(t("animLab.errors.nothingToPlay"))
            return
        }

        onPlay(result.animations)
        toast.success(
            t("animLab.playSuccess", { count: result.animations.length }),
        )
    }

    const needsSourceBakugan =
        mode === "ability" ||
        mode === "custom" ||
        mode === "gate" ||
        mode === "changeAttribut"

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("animLab.intro")}</p>

            <div className="space-y-2">
                <Label>{t("animLab.mode")}</Label>
                <Select
                    value={mode}
                    onValueChange={(value) => {
                        const nextMode = value as SandboxAnimLabMode
                        setMode(nextMode)
                        setCardKey(null)
                        setTargetAttribut(null)
                        setQueued([])
                        rebuildQueue({
                            mode: nextMode,
                            cardKey: null,
                            targetAttribut: null,
                        })
                    }}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ability">{t("animLab.modes.ability")}</SelectItem>
                        <SelectItem value="gate">{t("animLab.modes.gate")}</SelectItem>
                        <SelectItem value="changeAttribut">
                            {t("animLab.modes.changeAttribut")}
                        </SelectItem>
                        <SelectItem value="custom">{t("animLab.modes.custom")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {mode === "ability" && (
                <div className="space-y-2">
                    <Label>{t("animLab.ability")}</Label>
                    <SandboxCatalogPicker
                        value={cardKey}
                        onChange={(value) => {
                            setCardKey(value)
                            rebuildQueue({ cardKey: value })
                        }}
                        options={abilityOptions}
                        placeholder={t("placeholders.ability")}
                        searchPlaceholder={t("placeholders.search")}
                        emptyLabel={t("placeholders.empty")}
                    />
                </div>
            )}

            {mode === "custom" && (
                <div className="space-y-2">
                    <Label>{t("animLab.customKey")}</Label>
                    {customOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("animLab.noRegistry")}
                        </p>
                    ) : (
                        <SandboxCatalogPicker
                            value={cardKey}
                            onChange={(value) => {
                                setCardKey(value)
                                rebuildQueue({ cardKey: value })
                            }}
                            options={customOptions}
                            placeholder={t("animLab.placeholders.custom")}
                            searchPlaceholder={t("placeholders.search")}
                            emptyLabel={t("placeholders.empty")}
                        />
                    )}
                </div>
            )}

            {mode === "gate" && (
                <div className="space-y-2">
                    <Label>{t("animLab.gateSlot")}</Label>
                    {slotsWithGate.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("animLab.errors.gateRequired")}
                        </p>
                    ) : (
                        <Select
                            value={slotId ?? undefined}
                            onValueChange={(value) => {
                                setSlotId(value)
                                rebuildQueue({ slotId: value })
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("placeholders.slot")} />
                            </SelectTrigger>
                            <SelectContent>
                                {slotsWithGate.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>
                                        {slot.id} · {slot.gateKey}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            {mode === "changeAttribut" && (
                <div className="space-y-2">
                    <Label>{t("animLab.targetAttribut")}</Label>
                    <Select
                        value={targetAttribut ?? undefined}
                        onValueChange={(value) => {
                            const next = value as attribut
                            setTargetAttribut(next)
                            rebuildQueue({ targetAttribut: next })
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={t("animLab.placeholders.attribut")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {SANDBOX_ATTRIBUTS.map((attributValue) => (
                                <SelectItem key={attributValue} value={attributValue}>
                                    {attributValue}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {needsSourceBakugan && (
                <div className="space-y-2">
                    <Label>
                        {mode === "gate"
                            ? t("animLab.sourceBakuganOptional")
                            : t("animLab.sourceBakugan")}
                    </Label>
                    {placedBakugans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("animLab.errors.placeBakugan")}
                        </p>
                    ) : (
                        <Select
                            value={sourceBakuganLocalId ?? undefined}
                            onValueChange={(value) => {
                                setSourceBakuganLocalId(value)
                                rebuildQueue({ sourceBakuganLocalId: value })
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={t("animLab.placeholders.bakugan")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {placedBakugans.map((bakugan) => (
                                    <SelectItem
                                        key={bakugan.localId}
                                        value={bakugan.localId}
                                    >
                                        {bakugan.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            <div className="space-y-2 rounded-md border p-3">
                <Label>{t("animLab.queueTitle")}</Label>
                {queued.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        {t("animLab.queueEmpty")}
                    </p>
                ) : (
                    <ol className="list-decimal space-y-1 pl-4 text-sm">
                        {queued.map((anim, index) => (
                            <li key={`${anim.type}-${index}`}>
                                <span className="font-mono text-xs">{anim.type}</span>
                                {anim.type === "CUSTOM_ANIMATION" && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        · {anim.data.animationKey}
                                    </span>
                                )}
                                {anim.type === "ACTIVE_ABILITY_CARD" && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        · {anim.data.card}
                                    </span>
                                )}
                                {anim.type === "CHANGE_ATTRIBUT" && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        · {anim.data.bakugan.key} → {anim.data.attribut}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <Button type="button" className="w-full" onClick={handlePlay}>
                <Play className="size-4" />
                {t("animLab.play")}
            </Button>

            <p className="text-xs text-muted-foreground">{t("animLab.hint")}</p>
        </div>
    )
}
