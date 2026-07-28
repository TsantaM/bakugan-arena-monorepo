import GameLogsSearchPanel from "@/components/elements/admin/game-logs-search-panel"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

export default async function GameLogsPage() {
    const t = await getTranslations('admin.gameLogs')

    return (
        <Section className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
            <GameLogsSearchPanel />
        </Section>
    )
}
