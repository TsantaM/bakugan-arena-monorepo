'use client'

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useBattlefieldBattleLogStore } from "@/src/store/battlefield-battle-log-store"
import { useReplayBattleLogStore } from "@/src/store/replay-battle-log-store"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

type BattleLogToggleProps = {
    context: "battlefield" | "replay"
}

export default function BattleLogToggle({ context }: BattleLogToggleProps) {
    const t = useTranslations('battlefield')
    const pathname = usePathname()

    const battlefieldEnabled = useBattlefieldBattleLogStore((state) => state.enabled)
    const setBattlefieldEnabled = useBattlefieldBattleLogStore((state) => state.setEnabled)

    const replayEnabled = useReplayBattleLogStore((state) => state.enabled)
    const setReplayEnabled = useReplayBattleLogStore((state) => state.setEnabled)

    if (context === "battlefield" && !pathname.includes("/dashboard/battlefield")) {
        return null
    }

    const enabled = context === "battlefield" ? battlefieldEnabled : replayEnabled
    const setEnabled = context === "battlefield" ? setBattlefieldEnabled : setReplayEnabled
    const switchId = `battle-log-toggle-${context}`

    return (
        <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
            <Switch
                id={switchId}
                checked={enabled}
                onCheckedChange={setEnabled}
            />
            <Label
                htmlFor={switchId}
                className="cursor-pointer text-sm whitespace-nowrap"
            >
                {t('battleLogs.label')}
            </Label>
        </div>
    )
}
