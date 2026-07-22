import Header from "@/components/elements/header/Header"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

type ThanksEntry = {
    name: string
    role?: string
    message?: string
}

type ThanksSection = {
    title: string
    description?: string
    entries: ThanksEntry[]
}

export default async function ThanksPage() {
    const t = await getTranslations('thanks')
    const sections = t.raw('sections') as ThanksSection[]

    return (
        <>
            <Header />
            <Section className="max-w-3xl pb-12">
                <h1 className="uppercase font-black text-red-500">{t('title')}</h1>
                <p className="mt-3 text-muted-foreground">{t('intro')}</p>

                <div className="mt-10 flex flex-col gap-10">
                    {sections.map((section) => (
                        <section key={section.title} className="flex flex-col gap-4">
                            <div className="border-b border-border pb-2">
                                <h2 className="text-xl font-semibold">{section.title}</h2>
                                {section.description ? (
                                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                                ) : null}
                            </div>

                            <ul className="flex flex-col gap-4">
                                {section.entries.map((entry) => (
                                    <li key={`${section.title}-${entry.name}`}>
                                        <p>
                                            <span className="font-bold text-red-600">{entry.name}</span>
                                            {entry.role ? (
                                                <span className="text-muted-foreground"> — {entry.role}</span>
                                            ) : null}
                                        </p>
                                        {entry.message ? (
                                            <p className="mt-1 text-sm text-muted-foreground">{entry.message}</p>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </Section>
        </>
    )
}
