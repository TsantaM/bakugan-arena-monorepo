import BotTrainingPanel from "@/components/elements/admin/bot-training-panel"
import Section from "@/components/ui/section"
import Link from "next/link"

export default function BotTrainingPage() {
  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Bot training</h1>
        <Link href="/dashboard/admin" className="text-sm underline text-muted-foreground">
          Back to admin
        </Link>
      </div>
      <BotTrainingPanel />
    </Section>
  )
}
