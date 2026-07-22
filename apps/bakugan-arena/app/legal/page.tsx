import Header from "@/components/elements/header/Header"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

export default async function LegalPage() {
    const t = await getTranslations('legal')
    const paragraphs = t.raw('paragraphs') as string[]

    return (
        <>
            <Header />
            <Section className="max-w-3xl pb-12">
                <h1 className="uppercase font-black text-red-500">{t('title')}</h1>

                <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </Section>
        </>
    )
}
