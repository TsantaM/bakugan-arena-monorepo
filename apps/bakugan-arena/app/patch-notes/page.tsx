import Header from "@/components/elements/header/Header"
import PatchNotesViewer from "@/components/elements/patch-notes/patch-notes-viewer"
import Section from "@/components/ui/section"
import { getTranslations } from "next-intl/server"

export default async function PatchNotesPage() {
    const t = await getTranslations('patchNotes')

    return (
        <>
            <Header />
            <Section className="pb-12">
                <h1 className="uppercase font-black text-red-500">{t('title')}</h1>
                <div className="mt-6">
                    <PatchNotesViewer />
                </div>
            </Section>
        </>
    )
}
