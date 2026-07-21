import Header from "@/components/elements/header/Header"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

export default async function PatchNotesPage() {
    const t = await getTranslations('patchNotes')

    const notes = [1, 2, 3, 4, 5, 6].map((n) => ({
        title: t(`release1.items.${n}.title`),
        description: t(`release1.items.${n}.body`),
    }))

    return <>
        <Header />
        <Section>

            <h1 className="uppercase font-black">{t('title')}</h1>

            <div className="flex flex-col gap-3">
                <h2 className="font-semibold">{t('release1.heading')}</h2>
                <ul className="flex flex-col gap-2">
                    {
                        notes.map((note, index) => <li key={index} className="lg:w-[50%]"><span className="font-bold text-red-600">{note.title} :</span> {note.description}</li>)
                    }

                </ul>

            </div>

        </Section>

    </>
}
