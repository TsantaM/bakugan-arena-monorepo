'use client'

import { Button } from "@/components/ui/button"
import ImportReplayAction from "@/src/actions/replay/import-replay-action"
import { replayDataType } from "@bakugan-arena/game-data"
import { useMutation } from "@tanstack/react-query"
import { FileJson, Loader2 } from "lucide-react"
import { useRef } from "react"
import { toast, Toaster } from "sonner"

export default function ImportReplay({ setReplay }: { setReplay: (replay: replayDataType) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)

    const mutation = useMutation({
        mutationFn: async (file: File) => {
            return await ImportReplayAction(file)
        },
        onSuccess: (data) => {
            toast.success(`Importation success`)
            setReplay(data)
            if (inputRef.current) {
                inputRef.current.value = ""
            }
        },
        onError: () => {
            toast.error(`Importation failed`)
            if (inputRef.current) {
                inputRef.current.value = ""
            }
        },
    })

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
                    mutation.mutate(file)
                }}
            />
            <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => inputRef.current?.click()}
            >
                {mutation.isPending ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <FileJson />
                )}
                Import JSON
            </Button>
            <Toaster />
        </>
    )
}
