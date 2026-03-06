import { create } from "zustand"

const COOKIE_NAME = "bakugan_arena_volume"

// lire cookie
const getCookieVolume = (): number => {
    if (typeof document === "undefined") return 1

    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))

    if (!match) return 1

    const value = parseFloat(match.split("=")[1])
    return isNaN(value) ? 1 : value
}

// écrire cookie
const setCookieVolume = (volume: number) => {
    document.cookie = `${COOKIE_NAME}=${volume}; path=/; max-age=31536000`
}

const initialVolume = getCookieVolume()

type AudioStore = {
    volume: number[]
    volumeValue: number
    track: string

    setVolume: (value: number[]) => void
    setTrack: (track: string) => void
    mute: () => void
}

export const useAudioStore = create<AudioStore>((set) => ({
    volume: [initialVolume],
    volumeValue: initialVolume,
    track: "",

    setVolume: (value) => {
        const volume = value[0] ?? 0
        setCookieVolume(volume)

        set({
            volume: value,
            volumeValue: volume,
        })
    },

    setTrack: (track) =>
        set({
            track,
        }),

    mute: () =>
        set((state) => {
            const newVolume = state.volume[0] === 0 ? 1 : 0

            setCookieVolume(newVolume)

            return {
                volume: [newVolume],
                volumeValue: newVolume,
            }
        }),
}))