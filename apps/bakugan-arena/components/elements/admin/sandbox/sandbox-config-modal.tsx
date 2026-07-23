"use client"

import { BakuganList, Bakugans, GateCardsList, AbilityCardsList, ExclusiveAbilitiesList, type slots_id } from "@bakugan-arena/game-data"
import { resolveAbilityCard, resolveGateCard, resolveGameDataName } from "@bakugan-arena/i18n"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale, useTranslations } from "next-intl"
import { Plus, Trash2 } from "lucide-react"
import SandboxCatalogPicker from "./sandbox-catalog-picker"
import SandboxReplayTab, {
    type SandboxReplayLoadPayload,
} from "./sandbox-replay-tab"
import {
    createEmptySandboxDraft,
    type SandboxBakuganDraft,
    type SandboxDraft,
    type SandboxOwner,
    type SandboxSlotDraft,
} from "./sandbox-types"
import type { replayDataType } from "@bakugan-arena/game-data"

type SandboxConfigModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    draft: SandboxDraft
    onDraftChange: (draft: SandboxDraft) => void
    onApply: () => void
    onReset: () => void
    onLoadFromReplay: (payload: SandboxReplayLoadPayload) => void
    replay: replayDataType | null
    selectedReplayEntryIndex: number
    onReplayChange: (replay: replayDataType | null) => void
    onSelectedReplayEntryIndexChange: (entryIndex: number) => void
    onClearReplay: () => void
}

function newLocalId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function updateSlot(
    draft: SandboxDraft,
    slotId: slots_id,
    updater: (slot: SandboxSlotDraft) => SandboxSlotDraft,
): SandboxDraft {
    return {
        ...draft,
        slots: draft.slots.map((slot) => (slot.id === slotId ? updater(slot) : slot)),
    }
}

export default function SandboxConfigModal({
    open,
    onOpenChange,
    draft,
    onDraftChange,
    onApply,
    onReset,
    onLoadFromReplay,
    replay,
    selectedReplayEntryIndex,
    onReplayChange,
    onSelectedReplayEntryIndexChange,
    onClearReplay,
}: SandboxConfigModalProps) {
    const t = useTranslations("admin.sandbox")
    const locale = useLocale()

    const gateOptions = GateCardsList.map((card) => ({
        value: card.key,
        label: resolveGateCard(card.key, locale).name,
        hint: card.attribut ?? "CMD",
    }))

    const bakuganOptions = BakuganList.map((bakugan) => ({
        value: bakugan.key,
        label: resolveGameDataName("bakugans", bakugan.key, locale, bakugan.key),
        hint: bakugan.attribut,
    }))

    const abilityOptions = [
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
    ]

    const placedBakugans = draft.slots.flatMap((slot) =>
        slot.bakugans.map((bakugan) => ({
            ...bakugan,
            slotId: slot.id,
        })),
    )

    const addBakugan = (slotId: slots_id, bakuganKey: string) => {
        const catalog = Bakugans[bakuganKey]
        if (!catalog) return

        const bakugan: SandboxBakuganDraft = {
            localId: newLocalId(),
            bakuganKey,
            owner: "user",
            currentPower: catalog.powerLevel,
            abilityBlock: false,
        }

        onDraftChange(
            updateSlot(draft, slotId, (slot) => ({
                ...slot,
                bakugans: [...slot.bakugans, bakugan],
            })),
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
                    <DialogTitle>{t("drawerTitle")}</DialogTitle>
                    <DialogDescription>{t("drawerDesc")}</DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    <Tabs defaultValue="replay">
                        <TabsList className="mb-4 grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                            <TabsTrigger value="replay">{t("tabs.replay")}</TabsTrigger>
                            <TabsTrigger value="board">{t("tabs.board")}</TabsTrigger>
                            <TabsTrigger value="turn">{t("tabs.turn")}</TabsTrigger>
                            <TabsTrigger value="actions">{t("tabs.actions")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="replay">
                            <SandboxReplayTab
                                replay={replay}
                                selectedEntryIndex={selectedReplayEntryIndex}
                                onReplayChange={onReplayChange}
                                onSelectedEntryIndexChange={
                                    onSelectedReplayEntryIndexChange
                                }
                                onLoad={onLoadFromReplay}
                                onClearReplay={onClearReplay}
                            />
                        </TabsContent>

                        <TabsContent value="board" className="space-y-4">
                            {draft.slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="space-y-3 border-b border-border pb-4 last:border-b-0"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium">{slot.id}</p>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs text-muted-foreground">
                                                {t("fields.canSet")}
                                            </Label>
                                            <Switch
                                                checked={slot.canSet}
                                                onCheckedChange={(canSet) =>
                                                    onDraftChange(
                                                        updateSlot(draft, slot.id, (current) => ({
                                                            ...current,
                                                            canSet,
                                                        })),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t("fields.gate")}</Label>
                                        <SandboxCatalogPicker
                                            value={slot.gateKey}
                                            onChange={(gateKey) =>
                                                onDraftChange(
                                                    updateSlot(draft, slot.id, (current) => ({
                                                        ...current,
                                                        gateKey,
                                                        bakugans: gateKey ? current.bakugans : [],
                                                        activateAbilities: gateKey
                                                            ? current.activateAbilities
                                                            : [],
                                                        open: gateKey ? current.open : false,
                                                    })),
                                                )
                                            }
                                            options={gateOptions}
                                            placeholder={t("placeholders.gate")}
                                            searchPlaceholder={t("placeholders.search")}
                                            emptyLabel={t("placeholders.empty")}
                                            clearLabel={t("placeholders.noGate")}
                                        />
                                    </div>

                                    {slot.gateKey ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label>{t("fields.gateOwner")}</Label>
                                                    <Select
                                                        value={slot.gateOwner}
                                                        onValueChange={(gateOwner: SandboxOwner) =>
                                                            onDraftChange(
                                                                updateSlot(draft, slot.id, (current) => ({
                                                                    ...current,
                                                                    gateOwner,
                                                                })),
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">
                                                                {t("owners.user")}
                                                            </SelectItem>
                                                            <SelectItem value="opponent">
                                                                {t("owners.opponent")}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-end justify-between gap-2 pb-1">
                                                    <Label>{t("fields.open")}</Label>
                                                    <Switch
                                                        checked={slot.open}
                                                        onCheckedChange={(openGate) =>
                                                            onDraftChange(
                                                                updateSlot(draft, slot.id, (current) => ({
                                                                    ...current,
                                                                    open: openGate,
                                                                })),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>{t("fields.addBakugan")}</Label>
                                                <SandboxCatalogPicker
                                                    value={null}
                                                    onChange={(bakuganKey) => {
                                                        if (bakuganKey) addBakugan(slot.id, bakuganKey)
                                                    }}
                                                    options={bakuganOptions}
                                                    placeholder={t("placeholders.bakugan")}
                                                    searchPlaceholder={t("placeholders.search")}
                                                    emptyLabel={t("placeholders.empty")}
                                                    allowClear={false}
                                                />
                                            </div>

                                            {slot.bakugans.map((bakugan) => (
                                                <div
                                                    key={bakugan.localId}
                                                    className="space-y-2 rounded-md border border-border p-3"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {resolveGameDataName(
                                                                    "bakugans",
                                                                    bakugan.bakuganKey,
                                                                    locale,
                                                                    bakugan.bakuganKey,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {bakugan.bakuganKey}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                onDraftChange(
                                                                    updateSlot(draft, slot.id, (current) => ({
                                                                        ...current,
                                                                        bakugans: current.bakugans.filter(
                                                                            (b) =>
                                                                                b.localId !==
                                                                                bakugan.localId,
                                                                        ),
                                                                        activateAbilities:
                                                                            current.activateAbilities.filter(
                                                                                (a) =>
                                                                                    a.bakuganLocalId !==
                                                                                    bakugan.localId,
                                                                            ),
                                                                    })),
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label>{t("fields.owner")}</Label>
                                                            <Select
                                                                value={bakugan.owner}
                                                                onValueChange={(owner: SandboxOwner) =>
                                                                    onDraftChange(
                                                                        updateSlot(
                                                                            draft,
                                                                            slot.id,
                                                                            (current) => ({
                                                                                ...current,
                                                                                bakugans:
                                                                                    current.bakugans.map(
                                                                                        (b) =>
                                                                                            b.localId ===
                                                                                            bakugan.localId
                                                                                                ? {
                                                                                                      ...b,
                                                                                                      owner,
                                                                                                  }
                                                                                                : b,
                                                                                    ),
                                                                            }),
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="user">
                                                                        {t("owners.user")}
                                                                    </SelectItem>
                                                                    <SelectItem value="opponent">
                                                                        {t("owners.opponent")}
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>{t("fields.power")}</Label>
                                                            <Input
                                                                type="number"
                                                                value={bakugan.currentPower}
                                                                onChange={(event) =>
                                                                    onDraftChange(
                                                                        updateSlot(
                                                                            draft,
                                                                            slot.id,
                                                                            (current) => ({
                                                                                ...current,
                                                                                bakugans:
                                                                                    current.bakugans.map(
                                                                                        (b) =>
                                                                                            b.localId ===
                                                                                            bakugan.localId
                                                                                                ? {
                                                                                                      ...b,
                                                                                                      currentPower:
                                                                                                          Number(
                                                                                                              event
                                                                                                                  .target
                                                                                                                  .value,
                                                                                                          ) ||
                                                                                                          0,
                                                                                                  }
                                                                                                : b,
                                                                                    ),
                                                                            }),
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2">
                                                        <Label>{t("fields.abilityBlock")}</Label>
                                                        <Switch
                                                            checked={bakugan.abilityBlock}
                                                            onCheckedChange={(abilityBlock) =>
                                                                onDraftChange(
                                                                    updateSlot(draft, slot.id, (current) => ({
                                                                        ...current,
                                                                        bakugans: current.bakugans.map(
                                                                            (b) =>
                                                                                b.localId ===
                                                                                bakugan.localId
                                                                                    ? {
                                                                                          ...b,
                                                                                          abilityBlock,
                                                                                      }
                                                                                    : b,
                                                                        ),
                                                                    })),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label>{t("fields.activeAbilities")}</Label>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={slot.bakugans.length === 0}
                                                        onClick={() => {
                                                            if (slot.bakugans.length === 0) return
                                                            onDraftChange(
                                                                updateSlot(draft, slot.id, (current) => ({
                                                                    ...current,
                                                                    activateAbilities: [
                                                                        ...current.activateAbilities,
                                                                        {
                                                                            localId: newLocalId(),
                                                                            abilityKey:
                                                                                abilityOptions[0]?.value ??
                                                                                "",
                                                                            bakuganLocalId:
                                                                                current.bakugans[0]
                                                                                    .localId,
                                                                        },
                                                                    ],
                                                                })),
                                                            )
                                                        }}
                                                    >
                                                        <Plus className="size-4" />
                                                        {t("actions.add")}
                                                    </Button>
                                                </div>

                                                {slot.activateAbilities.map((ability) => (
                                                    <div
                                                        key={ability.localId}
                                                        className="space-y-2 rounded-md border border-dashed border-border p-3"
                                                    >
                                                        <SandboxCatalogPicker
                                                            value={ability.abilityKey || null}
                                                            onChange={(abilityKey) =>
                                                                onDraftChange(
                                                                    updateSlot(
                                                                        draft,
                                                                        slot.id,
                                                                        (current) => ({
                                                                            ...current,
                                                                            activateAbilities:
                                                                                current.activateAbilities.map(
                                                                                    (a) =>
                                                                                        a.localId ===
                                                                                        ability.localId
                                                                                            ? {
                                                                                                  ...a,
                                                                                                  abilityKey:
                                                                                                      abilityKey ??
                                                                                                      "",
                                                                                              }
                                                                                            : a,
                                                                                ),
                                                                        }),
                                                                    ),
                                                                )
                                                            }
                                                            options={abilityOptions}
                                                            placeholder={t("placeholders.ability")}
                                                            searchPlaceholder={t("placeholders.search")}
                                                            emptyLabel={t("placeholders.empty")}
                                                            allowClear={false}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Select
                                                                value={ability.bakuganLocalId}
                                                                onValueChange={(bakuganLocalId) =>
                                                                    onDraftChange(
                                                                        updateSlot(
                                                                            draft,
                                                                            slot.id,
                                                                            (current) => ({
                                                                                ...current,
                                                                                activateAbilities:
                                                                                    current.activateAbilities.map(
                                                                                        (a) =>
                                                                                            a.localId ===
                                                                                            ability.localId
                                                                                                ? {
                                                                                                      ...a,
                                                                                                      bakuganLocalId,
                                                                                                  }
                                                                                                : a,
                                                                                    ),
                                                                            }),
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue
                                                                        placeholder={t(
                                                                            "placeholders.bakugan",
                                                                        )}
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {slot.bakugans.map((bakugan) => (
                                                                        <SelectItem
                                                                            key={bakugan.localId}
                                                                            value={bakugan.localId}
                                                                        >
                                                                            {resolveGameDataName(
                                                                                "bakugans",
                                                                                bakugan.bakuganKey,
                                                                                locale,
                                                                                bakugan.bakuganKey,
                                                                            )}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    onDraftChange(
                                                                        updateSlot(
                                                                            draft,
                                                                            slot.id,
                                                                            (current) => ({
                                                                                ...current,
                                                                                activateAbilities:
                                                                                    current.activateAbilities.filter(
                                                                                        (a) =>
                                                                                            a.localId !==
                                                                                            ability.localId,
                                                                                    ),
                                                                            }),
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="turn" className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("fields.turnOwner")}</Label>
                                <Select
                                    value={draft.turnOwner}
                                    onValueChange={(turnOwner: SandboxOwner) =>
                                        onDraftChange({ ...draft, turnOwner })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">{t("owners.user")}</SelectItem>
                                        <SelectItem value="opponent">
                                            {t("owners.opponent")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("fields.turnCount")}</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={draft.turnCount}
                                    onChange={(event) =>
                                        onDraftChange({
                                            ...draft,
                                            turnCount: Number(event.target.value) || 1,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-3">
                                {(
                                    [
                                        ["setNewGate", "setNewGate"],
                                        ["setNewBakugan", "setNewBakugan"],
                                        ["useAbilityCard", "useAbilityCard"],
                                    ] as const
                                ).map(([key, labelKey]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <Label>{t(`fields.${labelKey}`)}</Label>
                                        <Switch
                                            checked={draft[key]}
                                            onCheckedChange={(checked) =>
                                                onDraftChange({ ...draft, [key]: checked })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <div className="flex items-center justify-between gap-2">
                                    <Label>{t("fields.battleInProcess")}</Label>
                                    <Switch
                                        checked={draft.battleInProcess}
                                        onCheckedChange={(battleInProcess) =>
                                            onDraftChange({
                                                ...draft,
                                                battleInProcess,
                                                battleSlot:
                                                    battleInProcess
                                                        ? draft.battleSlot ??
                                                          draft.slots.find((s) => s.gateKey)?.id ??
                                                          null
                                                        : null,
                                            })
                                        }
                                    />
                                </div>

                                {draft.battleInProcess ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label>{t("fields.battleSlot")}</Label>
                                            <Select
                                                value={draft.battleSlot ?? undefined}
                                                onValueChange={(battleSlot: slots_id) =>
                                                    onDraftChange({ ...draft, battleSlot })
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={t("placeholders.slot")}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {draft.slots
                                                        .filter((slot) => slot.gateKey)
                                                        .map((slot) => (
                                                            <SelectItem key={slot.id} value={slot.id}>
                                                                {slot.id}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("fields.battleTurns")}</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={draft.battleTurns}
                                                onChange={(event) =>
                                                    onDraftChange({
                                                        ...draft,
                                                        battleTurns:
                                                            Number(event.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <Label>{t("fields.battlePaused")}</Label>
                                            <Switch
                                                checked={draft.battlePaused}
                                                onCheckedChange={(battlePaused) =>
                                                    onDraftChange({ ...draft, battlePaused })
                                                }
                                            />
                                        </div>
                                    </>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                                <div className="space-y-2">
                                    <Label>{t("fields.eliminatedUser")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={3}
                                        value={draft.eliminatedUser}
                                        onChange={(event) =>
                                            onDraftChange({
                                                ...draft,
                                                eliminatedUser: Number(event.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("fields.eliminatedOpponent")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={3}
                                        value={draft.eliminatedOpponent}
                                        onChange={(event) =>
                                            onDraftChange({
                                                ...draft,
                                                eliminatedOpponent:
                                                    Number(event.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <Label>{t("fields.showActionUi")}</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t("fields.showActionUiHint")}
                                    </p>
                                </div>
                                <Switch
                                    checked={draft.showActionUi}
                                    onCheckedChange={(showActionUi) =>
                                        onDraftChange({ ...draft, showActionUi })
                                    }
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={placedBakugans.length === 0}
                                onClick={() => {
                                    const first = placedBakugans[0]
                                    if (!first) return
                                    onDraftChange({
                                        ...draft,
                                        actionAbilities: [
                                            ...draft.actionAbilities,
                                            {
                                                localId: newLocalId(),
                                                abilityKey: abilityOptions[0]?.value ?? "",
                                                bakuganKey: first.bakuganKey,
                                                slotId: first.slotId,
                                            },
                                        ],
                                        showActionUi: true,
                                    })
                                }}
                            >
                                <Plus className="size-4" />
                                {t("actions.addAbilityAction")}
                            </Button>

                            {draft.actionAbilities.map((entry) => (
                                <div
                                    key={entry.localId}
                                    className="space-y-2 rounded-md border border-border p-3"
                                >
                                    <SandboxCatalogPicker
                                        value={entry.abilityKey || null}
                                        onChange={(abilityKey) =>
                                            onDraftChange({
                                                ...draft,
                                                actionAbilities: draft.actionAbilities.map((a) =>
                                                    a.localId === entry.localId
                                                        ? { ...a, abilityKey: abilityKey ?? "" }
                                                        : a,
                                                ),
                                            })
                                        }
                                        options={abilityOptions}
                                        placeholder={t("placeholders.ability")}
                                        searchPlaceholder={t("placeholders.search")}
                                        emptyLabel={t("placeholders.empty")}
                                        allowClear={false}
                                    />

                                    <Select
                                        value={`${entry.slotId}::${entry.bakuganKey}`}
                                        onValueChange={(value) => {
                                            const [slotId, bakuganKey] = value.split("::") as [
                                                slots_id,
                                                string,
                                            ]
                                            onDraftChange({
                                                ...draft,
                                                actionAbilities: draft.actionAbilities.map((a) =>
                                                    a.localId === entry.localId
                                                        ? { ...a, slotId, bakuganKey }
                                                        : a,
                                                ),
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t("placeholders.bakugan")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {placedBakugans.map((bakugan) => (
                                                <SelectItem
                                                    key={`${bakugan.slotId}-${bakugan.localId}`}
                                                    value={`${bakugan.slotId}::${bakugan.bakuganKey}`}
                                                >
                                                    {bakugan.slotId} ·{" "}
                                                    {resolveGameDataName(
                                                        "bakugans",
                                                        bakugan.bakuganKey,
                                                        locale,
                                                        bakugan.bakuganKey,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() =>
                                            onDraftChange({
                                                ...draft,
                                                actionAbilities: draft.actionAbilities.filter(
                                                    (a) => a.localId !== entry.localId,
                                                ),
                                            })
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                        {t("actions.remove")}
                                    </Button>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-stretch">
                    <Button type="button" className="sm:flex-1" onClick={onApply}>
                        {t("actions.apply")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="sm:flex-1"
                        onClick={() => {
                            onDraftChange(createEmptySandboxDraft())
                            onReset()
                        }}
                    >
                        {t("actions.reset")}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="sm:flex-1">
                            {t("actions.close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
