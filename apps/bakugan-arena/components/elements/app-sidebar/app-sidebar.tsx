'use client'

import Logo from "@/components/ui/logo"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import RemoveRoomButton from "@/components/elements/lobby/remove-room-button"
import { RoleType } from "@/src/actions/getUserSession"
import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { REPLAY_ENABLED } from "@/src/lib/replay/replay-flag"
import { useBattleNotificationsStore } from "@/src/store/battle-notifications-store"
import { useRoomsStore, type Room } from "@/src/store/rooms-store"
import { cn } from "@/lib/utils"
import { Bell, BookOpenText, ChartSpline, Clapperboard, Home, KeyRound, SwatchBook } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useMemo } from "react"

type LinksDashboardType = {
    icone: ReactNode,
    label: string,
    href: string
}

export default function AppSidebar({ role }: { role: RoleType | undefined }) {
    const t = useTranslations('nav')
    const tCommon = useTranslations('common')
    const router = useRouter()
    const socket = useSocket()
    const Rooms = useRoomsStore((state) => state.rooms)
    const setRooms = useRoomsStore((state) => state.setRooms)
    const user = authClient.useSession()

    const LinksDashboard: LinksDashboardType[] = useMemo(() => [
        {
            icone: <Home />,
            label: t('dashboard'),
            href: '/dashboard'
        },
        {
            icone: <SwatchBook />,
            label: t('deckBuilder'),
            href: '/dashboard/deck-builder'
        },
        {
            icone: <BookOpenText />,
            label: t('bakuDex'),
            href: '/baku-dex'
        },
        {
            icone: <BookOpenText />,
            label: t('tutorial'),
            href: '/dashboard/tutorial'
        },
        {
            icone: <ChartSpline />,
            label: t('ladder'),
            href: '/dashboard/ladder'
        },
        ...(REPLAY_ENABLED ? [{
            icone: <Clapperboard />,
            label: t('replay'),
            href: '/dashboard/replay'
        }] : [])
    ], [t])

    useEffect(() => {
        if (!socket) return
        if (!user.data?.user.id) return
        const userId = user.data.user.id
        socket.emit('get-rooms-user-id', userId)

    }, [socket, router, user.data?.user.id])

    useEffect(() => {
        if (!socket) return

        const onRooms = (rooms: { p1: string, p2: string, roomId: string, finished: boolean }[]) => {
            setRooms(rooms)
        }

        socket.on('get-rooms-user-id', onRooms)

        return () => {
            socket.off('get-rooms-user-id', onRooms)
        }
        // `Rooms` volontairement hors des deps : l'y mettre réenregistrait un
        // listener supplémentaire à chaque mise à jour, sans jamais en retirer.
    }, [socket, setRooms])

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <div className='flex items-center gap-2'>
                    <Logo height={50} width={50} />
                    <h1 className='font-bold'>{tCommon('brand')}</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        {t('group.navigation')}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href='/'>
                                        <Home />
                                        <span>{t('home')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        {
                            LinksDashboard.map((l, index) => <SidebarMenu key={index}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={l.href}>
                                            {l.icone}
                                            <span>{l.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>)
                        }

                        {
                            role === 'ADMIN' && <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href='/dashboard/admin'>
                                            <KeyRound />
                                            <span>{t('administration')}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        }

                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        {t('group.battlesInProcess', { count: Rooms.length })}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {
                            Rooms.length > 0 && Rooms.map((room) =>
                                <SidebarMenu key={room.roomId}>
                                    <SidebarMenuItem>
                                        <RoomMenuButton
                                            room={room}
                                            label={tCommon('labels.vs', { p1: room.p1, p2: room.p2 })}
                                            pendingLabel={t('notifications.pending')}
                                        />
                                        <RemoveRoomButton
                                            roomId={room.roomId}
                                            finished={room.finished}
                                            variant="sidebar"
                                        />
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            )
                        }
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar >
    )
}

/**
 * Entrée « combat » de la sidebar. Isolée dans son propre composant pour que
 * l'abonnement au store de notifications soit par room : sans ça, chaque
 * notification rerendrait toute la sidebar.
 */
function RoomMenuButton({
    room,
    label,
    pendingLabel,
}: {
    room: Room
    label: string
    pendingLabel: string
}) {
    const pending = useBattleNotificationsStore((state) => state.byRoom[room.roomId])
    const clearNotification = useBattleNotificationsStore((state) => state.clear)
    const isPending = Boolean(pending)
    // La cloche vibre seulement quand le joueur est attendu. Une action de
    // l'adversaire clignote sans s'agiter : sinon tout vibre en permanence et
    // plus rien ne ressort.
    const isWaitingForMe = pending?.kind === 'action-required'

    return (
        <SidebarMenuButton asChild>
            <Link
                href={`/dashboard/battlefield?id=${room.roomId}`}
                className={cn("min-w-0", isPending && "text-sidebar-primary font-semibold")}
                onClick={() => clearNotification(room.roomId)}
            >
                {
                    isPending
                        ? <Bell className={cn(isWaitingForMe && "animate-bell-shake")} aria-label={pendingLabel} />
                        : <KeyRound />
                }
                <span className={cn("truncate", isPending && "animate-battle-pending")}>{label}</span>
            </Link>
        </SidebarMenuButton>
    )
}
