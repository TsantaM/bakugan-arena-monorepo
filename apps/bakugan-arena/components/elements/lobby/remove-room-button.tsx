'use client'

import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SidebarMenuAction } from "@/components/ui/sidebar"
import { useRoomsStore } from "@/src/store/rooms-store"
import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { forfeitSocketProps } from "@bakugan-arena/game-data"
import { X } from "lucide-react"
import type { MouseEvent, ReactElement } from "react"

type RemoveRoomButtonProps = {
    roomId: string
    finished: boolean
    variant?: 'default' | 'sidebar'
}

export default function RemoveRoomButton({
    roomId,
    finished,
    variant = 'default',
}: RemoveRoomButtonProps) {
    const router = useRouter()
    const socket = useSocket()
    const userId = authClient.useSession().data?.user.id
    const dismissRoom = useRoomsStore((state) => state.dismissRoom)

    const handleDismiss = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dismissRoom(roomId)
    }

    const handleForfeit = () => {
        if (!socket || !userId) return

        const data: forfeitSocketProps = {
            userId,
            roomId,
        }

        socket.emit('forfait', data)
        router.push('/dashboard')
    }

    const renderTrigger = (onClick?: (e: MouseEvent) => void): ReactElement => {
        if (variant === 'sidebar') {
            return (
                <SidebarMenuAction
                    showOnHover
                    type="button"
                    aria-label={finished ? 'Remove room' : 'Forfeit match'}
                    onClick={onClick}
                >
                    <X />
                </SidebarMenuAction>
            )
        }

        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={finished ? 'Remove room' : 'Forfeit match'}
                onClick={onClick}
            >
                <X className="size-4" />
            </Button>
        )
    }

    if (finished) {
        return renderTrigger(handleDismiss)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {renderTrigger()}
            </DialogTrigger>

            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        Do you really want to forfeit this match?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 justify-end">
                    <DialogClose asChild>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        onClick={handleForfeit}
                    >
                        Confirm Forfeit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
