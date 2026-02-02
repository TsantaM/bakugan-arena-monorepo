
import Header from "@/components/elements/header/Header"
import Section from "@/components/ui/section"

export default function PatchNotesPage() {

    const notes: { title: string, description: string }[] = [
        {
            title: '1 – Card Translation',
            description: 'All remaining French cards have been translated into English.'
        },
        {
            title: '2 – Deck Builder Fixes & Improvements',
            description: `Fixed a bug preventing players from creating multiple decks. Updated the Deck Builder interface to be fully responsive on mobile devices.`
        },
        {
            title: `3 – Mantris Marionette Card`,
            description: `Resolved an issue causing turn-related problems when using the Mantris Marionette card.`
        },
        {
            title: `4 – Phantom Turn`,
            description: `The game no longer displays the interface to a player who cannot act during their turn. Now, if you cannot perform any action, the game now simply prompts you to end your turn.`
        },
        {
            title: `5 – Landing Page & Dashboard Fixes`,
            description: `Fixed multiple integration issues affecting the landing page and the dashboard.`
        },
        {
            title: `6 – Discord Link Added`,
            description: `Added a direct link to the game’s official Discord server on the landing page.`
        }
    ]

    return <>
        <Header />
        <Section>

            <h1 className="uppercase font-black">Bakugan Arena patch notes</h1>

            <div className="flex flex-col gap-3">
                <h2 className="font-semibold">Patch Note 1 : 02 - 02 - 2026 :</h2>
                <ul className="flex flex-col gap-2">
                    {
                        notes.map((note, index) => <li key={index} className="lg:w-[50%]"><span className="font-bold text-red-600">{note.title} :</span> {note.description}</li>)
                    }

                </ul>

            </div>

        </Section>

    </>
}