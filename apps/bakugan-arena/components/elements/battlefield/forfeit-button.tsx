'use client'

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRoomsStore } from "@/src/store/rooms-store"
import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { forfeitSocketProps } from "@bakugan-arena/game-data"
import { useTranslations } from "next-intl"

export default function ForfeitButton() {
    const t = useTranslations('battlefield.forfeit')
    const tCommon = useTranslations('common')

    const router = useRouter()
    const socket = useSocket()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const username = authClient.useSession().data?.user.displayUsername
    const userId = authClient.useSession().data?.user.id
    const rooms = useRoomsStore((state) => state.rooms)
    const roomId = searchParams.get("id")

    // 🚫 Guard : mauvais contexte → ne rend rien
    if (!username) return null
    if (!userId) return null
    if (!pathname.includes("/dashboard/battlefield") || !roomId) {
        return null
    }
    const room = rooms.find((r) => r.roomId === roomId)
    if (!room) return null
    if (room.finished) return null
    if (room.p1 !== username && room.p2 !== username) return null
    // 👉 Fonction à implémenter par toi
    const handleForfeit = () => {
        if (!socket) return

        const data: forfeitSocketProps = {
            userId: userId,
            roomId: roomId
        }

        socket.emit('forfait', data)
        router.push('/dashboard')

    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    {t('label')}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                    >
                        {tCommon('actions.cancel')}
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleForfeit}
                    >
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
