import BotTrainingPanel from "@/components/elements/admin/bot-training-panel"
import Section from "@/components/ui/section"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function BotTrainingPage() {
  const t = await getTranslations('admin')

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('botTraining.pageTitle')}</h1>
        <Link href="/dashboard/admin" className="text-sm underline text-muted-foreground">
          {t('backToAdmin')}
        </Link>
      </div>
      <BotTrainingPanel />
    </Section>
  )
}
