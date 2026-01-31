'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Section from "@/components/ui/section";
import CreateDeckButton from "./create-deck-button";
import DeckPreview from "./deck-preview";
import { useQuery } from "@tanstack/react-query";
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";
// import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";

export default function DeckBuilerLanding() {

    const GetUsersDecks = async () => {
        return await GetUserDecks()
    }

    const GetUsersDecksQuery = useQuery({
        queryKey: ['get-users-deck'],
        queryFn: GetUsersDecks
    })

    return (
        <>

            <Section className="md:p-0">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-end gap-2">
                            <CreateDeckButton />
                        </div>
                    </CardHeader>
                    <CardContent className={GetUsersDecksQuery.data && GetUsersDecksQuery.data.length > 0 ? 'grid grid-cols-1 lg:grid-cols-3 gap-3' : ''}>
                        {
                            GetUsersDecksQuery.data && GetUsersDecksQuery.data.length > 0 ? GetUsersDecksQuery.data.map((d, index) => <DeckPreview key={index} data={d} />) : <p className="text-center">{`You d'ont have deck create one`}</p>
                        }
                    </CardContent>
                </Card>
            </Section>

        </>
    )
}