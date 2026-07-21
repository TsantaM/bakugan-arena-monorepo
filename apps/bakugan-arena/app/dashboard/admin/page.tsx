import AdminPanel from "@/components/elements/admin/admin-panel"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

export default async function AdminPage() {
    const t = await getTranslations('admin')

    return (
        <Section className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <AdminPanel />
        </Section>
    )
}
