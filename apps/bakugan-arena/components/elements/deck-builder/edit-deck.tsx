'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GetDeckData } from "@/src/actions/deck-builder/get-deck-data"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { EditDeckNameSchema } from "./deck-builder-zod"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditDeckNameAction } from "@/src/actions/deck-builder/edit-deck-action"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import ManageBakugansInDeck from "./edit-deck/manage-bakugans-in-deck"
import ManageAbilityCardsInDeck from "./edit-deck/manage-ability-cards-in-deck"
import ManageExclusiveAbilityCardsInDeck from "./edit-deck/manage-exclusive-ability-cards-in-deck"
import ManageGateCardsInDeckEditor from "./edit-deck/manage-gate-cards-in-deck"
import DeckChecker from "./deck-checker"
import { useTranslations } from "next-intl"
import { BBS1Rules, validateDeck } from "@bakugan-arena/game-data"
import { getProblemCardKeys } from "./format-deck-issue"
import { useMemo } from "react"

export type editDeckName_type = z.infer<typeof EditDeckNameSchema>


export default function EditDeck({ id }: { id: string }) {
    const t = useTranslations('deckBuilder')
    const queryClient = useQueryClient()
    const deckData = async () => {
        return await GetDeckData(id)
    }

    const getDeckData = useQuery({
        queryKey: ['get-deck-data'],
        queryFn: deckData,
    })

    const problemCardKeys = useMemo(() => {
        if (!getDeckData.data) return new Set<string>()
        return getProblemCardKeys(validateDeck(getDeckData.data, BBS1Rules).issues)
    }, [getDeckData.data])

    const EditDeckNameForm = useForm({
        resolver: zodResolver(EditDeckNameSchema), defaultValues: {
            nom: getDeckData.data?.name ? getDeckData.data?.name : '',
        }
    })

    const updateNameFunction = async (formData: editDeckName_type) => {
        return await EditDeckNameAction({ id, formData })
    }

    const updateNameMutation = useMutation({
        mutationKey: ['update-deck-name'],
        mutationFn: updateNameFunction,
        onSuccess: () => {

            EditDeckNameForm.reset()
            
            queryClient.invalidateQueries({
                queryKey: ['get-deck-data']
            })
            toast.success(t('toasts.updated'))
        },

        onError: (err) => {
            toast.success(t('toasts.updated') + err)

        }
    })

    const onUpdateDeckName = (formData: editDeckName_type) => {
        updateNameMutation.mutate(formData)
    }

    return (
        <>
            <Card>

                <CardHeader className="flex gap-3 items-center">
                    <CardTitle>
                        {getDeckData.data?.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {
                        getDeckData.data && <DeckChecker deck={getDeckData.data}/>
                    }
                    <Card>
                        <CardContent>
                            <Form {...EditDeckNameForm}>

                                <form onSubmit={EditDeckNameForm.handleSubmit(onUpdateDeckName)} className="flex flex-col space-y-5">
                                    <FormField
                                        control={EditDeckNameForm.control}
                                        name='nom'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('edit.nameLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('edit.namePlaceholder')} {...field} type="text" />
                                                </FormControl>
                                                <FormDescription>{t('edit.nameHelp')}</FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit"
                                        disabled={updateNameMutation.isPending ? true : false}
                                    >

                                        {updateNameMutation.isPending ? t('edit.submitting') : t('edit.updateName')}
                                    </Button>
                                </form>

                            </Form>
                        </CardContent>
                    </Card>

                    <ManageBakugansInDeck deckId={id} bakugans={getDeckData.data?.bakugans} problemCardKeys={problemCardKeys}/> 

                    <ManageAbilityCardsInDeck deckId={id} abilityCards={getDeckData.data?.ability} bakugans={getDeckData.data?.bakugans ? getDeckData.data?.bakugans : []} countBakugans={getDeckData.data?.bakugans.length ? getDeckData.data?.bakugans.length : 0 } problemCardKeys={problemCardKeys}/>

                    <ManageExclusiveAbilityCardsInDeck deckId={id} exclusiveAbilities={getDeckData.data?.exclusiveAbilities ? getDeckData.data?.exclusiveAbilities : []} bakugans={getDeckData.data?.bakugans ? getDeckData.data?.bakugans : []} countBakugans={getDeckData.data?.bakugans.length ? getDeckData.data?.bakugans.length : 0} problemCardKeys={problemCardKeys}/>

                    <ManageGateCardsInDeckEditor deckId={id} bakugans={getDeckData.data?.bakugans ? getDeckData.data?.bakugans : []} gateCards={getDeckData.data?.gateCards ? getDeckData.data?.gateCards : []} problemCardKeys={problemCardKeys}/>

                </CardContent>

            </Card>

            <Toaster/>
        </>

    )
}
