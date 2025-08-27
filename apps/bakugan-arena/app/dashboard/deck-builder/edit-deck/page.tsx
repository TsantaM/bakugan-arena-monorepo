import EditDeck from "@/components/elements/deck-builder/edit-deck"
import { notFound } from "next/navigation"

export default async function EditDeckPage({ searchParams }: { searchParams: { id: string } }) {

    const id = searchParams.id

    if (!id) {
        notFound()
    }


    return (
        <>
        
            <EditDeck id={id}/>
        
        </>
    )
}