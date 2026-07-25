'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Import } from "lucide-react"
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { decodeDeck } from "./functions/share-deck-decrypt-code"
import { DecodedDeckType } from "@/src/types/share-deck-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle } from "lucide-react"
import CopyDeck from "@/src/actions/deck-builder/copy-deck"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale, useTranslations } from "next-intl"
import { BBS1Rules, validateDeck } from "@bakugan-arena/game-data"
import { formatDeckIssue } from "@/components/elements/deck-builder/format-deck-issue"

export default function ImportDeck() {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [open, setOpen] = useState(false)
    const [code, setCode] = useState("")
    const [decodedReturn, setDecodedReturn] = useState<DecodedDeckType | "INVALID_CODE" | null>(null)
    const [isValidDeck, setIsValidDeck] = useState(false)
    const queryClient = useQueryClient()
    const router = useRouter()

    const legalityIssues = useMemo(() => {
        if (!decodedReturn || decodedReturn === "INVALID_CODE") return []
        const result = validateDeck(
            {
                id: "import-preview",
                name: "import",
                ...decodedReturn,
            },
            BBS1Rules,
        )
        return result.issues.map((issue) =>
            formatDeckIssue(issue, locale, (key, values) => t(key, values)),
        )
    }, [decodedReturn, locale, t])

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
            toast(t('import.failed'))
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
                setDecodedReturn("INVALID_CODE")
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
                <Button variant='outline' className="cursor-pointer h-auto max-w-full whitespace-normal">
                    <Import /> {t('import.trigger')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('import.title')}</DialogTitle>
                    <DialogDescription>
                        {t('import.description')}
                    </DialogDescription>
                </DialogHeader>
                <Input id="deck-code" placeholder={t('import.placeholder')} value={code} onChange={(e) => handleCodeChange(e)} />
                {
                    decodedReturn && (
                        <Alert
                            variant={
                                decodedReturn === "INVALID_CODE"
                                    ? "destructive"
                                    : legalityIssues.length > 0
                                      ? "default"
                                      : "default"
                            }
                            className="mt-2"
                        >
                            {(decodedReturn === "INVALID_CODE" || legalityIssues.length > 0) && (
                                decodedReturn === "INVALID_CODE"
                                    ? <AlertCircle className="h-4 w-4" />
                                    : <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}

                            <AlertTitle>
                                {decodedReturn === "INVALID_CODE"
                                    ? t('import.invalidTitle')
                                    : legalityIssues.length > 0
                                      ? t('import.legalWarningTitle')
                                      : t('import.readyTitle')}
                            </AlertTitle>

                            <AlertDescription>
                                {decodedReturn === "INVALID_CODE" &&
                                    t('import.invalidBody')}

                                {decodedReturn !== "INVALID_CODE" && legalityIssues.length === 0 &&
                                    t('import.readyBody')}

                                {decodedReturn !== "INVALID_CODE" && legalityIssues.length > 0 && (
                                    <div className="space-y-2">
                                        <p>{t('import.legalWarningBody')}</p>
                                        <ul className="list-disc space-y-1 pl-4">
                                            {legalityIssues.map((message, index) => (
                                                <li key={`${message}-${index}`}>{message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )
                }

                <DialogFooter>
                    <DialogClose>
                        <Button variant="destructive" onClick={onClose} disabled={importMutation.isPending}>
                            {tCommon('actions.cancel')}
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={ImportDeckFunction} disabled={checker || importMutation.isPending}>
                        {importMutation.isPending ? t('import.importing') : tCommon('actions.import')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
