'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/src/lib/auth-client";
import { useSocket } from "@/src/providers/socket-provider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type RoomsToWatchType = {
    playersIds: string[]
    roomId: string,
    p1: string,
    p2: string
}

export default function WatchBattle() {
    const t = useTranslations('lobby.watch')
    const tCommon = useTranslations('common')
    const [open, setOpen] = useState(false)
    const [rooms, setRooms] = useState<RoomsToWatchType[]>([])
    const [search, setSearch] = useState("")
    const userId = authClient.useSession().data?.user.id


    const socket = useSocket()

    // 📡 Fetch rooms
    useEffect(() => {
        if (!socket || !open) return

        socket.emit("get-battle-to-watch")
    }, [open, socket])

    // 📡 Listen rooms
    useEffect(() => {
        if (!socket || !open) return

        const handler = (rooms: RoomsToWatchType[]) => {
            setRooms(rooms)
        }

        socket.on("battle-to-watch", handler)

        return () => {
            socket.off("battle-to-watch", handler)
        }
    }, [open, socket])

    // 🔍 Filter function
    const filteredRooms = useMemo(() => {
        if (!search) return rooms
        if (!userId) return rooms

        const lower = search.toLowerCase()

        return rooms.filter(
            (r) =>
                r.p1.toLowerCase().includes(lower) ||
                r.p2.toLowerCase().includes(lower) && !r.playersIds.includes(userId)
        )
    }, [rooms, search])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-auto w-full whitespace-normal">{t('trigger')}</Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle className="text-center text-xl">
                    {t('title')}
                </DialogTitle>

                <div className="flex flex-col gap-4 mt-4 w-full">
                    {/* 🔍 Search */}
                    <SearchPlayer value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} />

                    {/* 📜 Scrollable list */}
                    <ScrollArea className="max-h-75 w-full">
                        <div className="flex justify-center items-center flex-col gap-3 w-full">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((r, index) => (
                                    <Button key={index} className="h-auto w-full max-w-full overflow-hidden" variant={'outline'} asChild>
                                        <Link href={`/dashboard/battlefield?id=${r.roomId}`} className="w-full truncate italic text-center">
                                            {tCommon('labels.vs', { p1: r.p1, p2: r.p2 })}
                                        </Link>
                                    </Button>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground text-sm">
                                    {t('empty')}
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}

//
// 🔍 Search Component
//
function SearchPlayer({
    value,
    onChange,
    placeholder,
}: {
    value: string
    onChange: (v: string) => void
    placeholder: string
}) {
    return (
        <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
        />
    )
}
