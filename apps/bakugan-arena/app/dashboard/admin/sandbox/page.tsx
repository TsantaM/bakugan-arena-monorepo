import TrainingSandboxPanel from "@/components/elements/admin/training-sandbox-panel"
import Section from "@/components/ui/section"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function AdminSandboxPage() {
    const t = await getTranslations("admin")

    return (
        <Section className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{t("sandbox.pageTitle")}</h1>
                    <p className="text-sm text-muted-foreground">{t("sandbox.pageDesc")}</p>
                </div>
                <Link
                    href="/dashboard/admin"
                    className="text-sm text-muted-foreground underline"
                >
                    {t("backToAdmin")}
                </Link>
            </div>
            <TrainingSandboxPanel />
        </Section>
    )
}
