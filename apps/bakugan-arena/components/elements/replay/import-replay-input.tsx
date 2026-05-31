'use client'

import { Input } from "@/components/ui/input"
import ImportReplayAction from "@/src/actions/replay/import-replay-action"
import { replayDataType } from "@bakugan-arena/game-data"
import { useMutation } from "@tanstack/react-query"
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
            // console.log(data)
            setReplay(data)
            if (inputRef.current) {
                inputRef.current.value = ""
            }
        },
        onError: (data) => {
            toast.error(`Importation failed`)
            if (inputRef.current) {
                inputRef.current.value = ""
            }
        }

    })

    return (
        <>

            <Input ref={inputRef} type="file" accept="application/json" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                mutation.mutate(file)
            }} />

            <Toaster />
        </>)
}