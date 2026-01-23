import EditDeck from "@/components/elements/deck-builder/edit-deck"
import { notFound } from "next/navigation"

type PageProps = {
    searchParams: Promise<{ id: string }>
}


export default async function EditDeckPage({ searchParams }: PageProps) {

    const { id } = await searchParams

    if (!id) {
        notFound()
    }


    return (
        <>

            <EditDeck id={id} />

        </>
    )
}