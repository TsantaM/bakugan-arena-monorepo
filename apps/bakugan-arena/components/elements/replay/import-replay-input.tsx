'use client'

import { Button } from "@/components/ui/button"
import { parseReplayJson, uploadReplayToBlob } from "@/src/lib/replay/replay-blob"
import type { LoadedReplay } from "@/src/lib/replay/loaded-replay"
import { FileJson, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"
import { toast, Toaster } from "sonner"

export default function ImportReplay({
    setReplay,
}: {
    setReplay: (loaded: LoadedReplay) => void
}) {
    const t = useTranslations('replay')
    const inputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleFile(file: File) {
        setIsLoading(true)

        try {
            const text = await file.text()
            const data = parseReplayJson(text)
            const blobUrl = await uploadReplayToBlob(data)

            toast.success(t('toasts.importSuccess'))
            setReplay({ data, blobUrl })

            if (inputRef.current) {
                inputRef.current.value = ""
            }
        } catch (error) {
            toast.error(t('toasts.importFailed'))
            if (inputRef.current) {
                inputRef.current.value = ""
            }
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    void handleFile(file)
                }}
            />
            <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => inputRef.current?.click()}
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <FileJson />
                )}
                {t('importJson')}
            </Button>
            <Toaster />
        </>
    )
}
