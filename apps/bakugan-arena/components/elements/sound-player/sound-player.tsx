'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { useAudioStore } from "@/src/store/sounds-store"
import { Volume2, VolumeX } from "lucide-react"

function SoundPlayer() {
    return <>


    </>
}


function SoundPlayerControls({ variant = "dropdown" }: { variant?: "dropdown" | "inline" }) {

    const { volume, setVolume, mute } = useAudioStore()

    const controls = (
        <div className="w-full flex items-center gap-3">
            <Button asChild variant='ghost' className="p-0 shrink-0" onClick={mute}>
                {volume[0] > 0 ? <Volume2 /> : <VolumeX />}
            </Button>

            <Slider
                defaultValue={volume}
                max={1}
                min={0}
                step={0.1}
                onValueChange={setVolume}
                className="mx-auto w-full max-w-xs"
            />

            <span className="text-sm font-bold text-muted-foreground tabular-nums shrink-0">
                {Math.round(volume[0] * 100)}
            </span>
        </div>
    )

    if (variant === "inline") {
        return (
            <div className="flex flex-col gap-2 rounded-md border px-2 py-2">
                {controls}
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                {volume[0] > 0 ? <Volume2 /> : <VolumeX />}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[50vw] md:w-[25vw]" align="end">
                <div className="flex flex-col gap-2 p-4">
                    {controls}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export {
    SoundPlayer,
    SoundPlayerControls
}