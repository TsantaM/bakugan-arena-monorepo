"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Import } from "lucide-react"
import { ChangeEvent, useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { decodeDeck } from "./functions/share-deck-decrypt-code"
import { DecodedDeckType } from "@/src/types/share-deck-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import CopyDeck from "@/src/actions/deck-builder/copy-deck"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ImportDeck() {

    const [open, setOpen] = useState(false)
    const [code, setCode] = useState("")
    const [decodedReturn, setDecodedReturn] = useState<DecodedDeckType | "INVALID_CODE" | null>(null)
    const [isValidDeck, setIsValidDeck] = useState(false)
    const queryClient = useQueryClient()
    const router = useRouter()

    const importMutation = useMutation({
        mutationFn: async (deckData: DecodedDeckType) => {
            return await CopyDeck({ deckData })
        },
        onSuccess: (deckId) => {
            setCode("")
            setDecodedReturn(null)
            setIsValidDeck(false)
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            if(deckId) router.push(`/dashboard/deck-builder/edit-deck?id=${deckId}`)

        },
        onError: () => {
            toast("Failed to import deck")
        }
    })

    function handleCodeChange(e: ChangeEvent<HTMLInputElement>) {
        setCode(e.target.value)
    }

    function ImportDeckFunction() {
        if (decodedReturn && decodedReturn !== "INVALID_CODE") {
            importMutation.mutate(decodedReturn)
        }
    }

    function onClose() {
        setOpen(false)
        setCode("")
        setDecodedReturn(null)
        setIsValidDeck(false)
    }

    const checker: boolean = !code || code === "" || !isValidDeck

    useEffect(() => {
        if (!code) {
            setDecodedReturn(null)
            setIsValidDeck(false)
            return
        }

        try {
            const decoded = decodeDeck(code)

            const validDeck =
                decoded &&
                typeof decoded === "object" &&
                !Array.isArray(decoded)

            if (validDeck) {
                setDecodedReturn(decoded)
                setIsValidDeck(true)
            } else {
                setDecodedReturn("INVALID_CODE") // ou un fallback clair
                setIsValidDeck(false)
            }

        } catch {
            setDecodedReturn("INVALID_CODE")
            setIsValidDeck(false)
        }
    }, [code])

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                onClose()
            } else {
                setOpen(true)
            }
        }}>
            <DialogTrigger asChild>
                <Button variant='outline' className="cursor-pointer">
                    <Import /> Import Deck
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Deck</DialogTitle>
                    <DialogDescription>
                        Paste your deck code below to import it.
                    </DialogDescription>
                </DialogHeader>
                <Input id="deck-code" placeholder="Paste your deck code here" value={code} onChange={(e) => handleCodeChange(e)} />
                {
                    decodedReturn && (
                        <Alert
                            variant={
                                decodedReturn === "INVALID_CODE"
                                    ? "destructive"
                                    : "default"
                            }
                            className="mt-2"
                        >
                            {decodedReturn === "INVALID_CODE" && (
                                <AlertCircle className="h-4 w-4" />
                            )}

                            <AlertTitle>
                                {decodedReturn === "INVALID_CODE"
                                    ? "We couldn’t read this code"
                                    : "Deck ready to import"}
                            </AlertTitle>

                            <AlertDescription>
                                {decodedReturn === "INVALID_CODE" &&
                                    "The code you entered doesn’t seem to be valid or may be corrupted. Please double-check and try again."}

                                {decodedReturn !== "INVALID_CODE" &&
                                    "Everything looks good. You can safely import this deck now."}
                            </AlertDescription>
                        </Alert>
                    )
                }

                <DialogFooter>
                    <DialogClose>
                        <Button variant="destructive" onClick={onClose} disabled={importMutation.isPending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={ImportDeckFunction} disabled={checker || importMutation.isPending}>
                        {importMutation.isPending ? "Importing..." : "Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}