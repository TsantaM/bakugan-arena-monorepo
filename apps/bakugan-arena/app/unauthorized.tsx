import { Button } from "@/components/ui/button"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"
import Link from "next/link"


export default async function UnauthorizedPage() {
    const t = await getTranslations('auth.errors.unauthorized')

    return (
        <Section className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-bold">{t('title')}</h1>
            <p>{t('body')}</p>
            <div className="flex flex-col gap-2">
                <Button asChild variant='outline' className="w-full"><Link href='/'>{t('cta')}</Link></Button>
            </div>
        </Section>
    )
}
