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
import { useRoomsStore } from "@/src/store/rooms-store"
import { BookOpenText, ChartSpline, Clapperboard, Home, KeyRound, SwatchBook } from "lucide-react"
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
            href: '/dashboard/baku-dex'
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
        {
            icone: <Clapperboard />,
            label: t('replay'),
            href: '/dashboard/replay'
        }
    ], [t])

    useEffect(() => {
        if (!socket) return
        if (!user.data?.user.id) return
        const userId = user.data.user.id
        socket.emit('get-rooms-user-id', userId)

    }, [socket, router, user.data?.user.id])

    useEffect(() => {
        if (!socket) return
        socket.on('get-rooms-user-id', (rooms: { p1: string, p2: string, roomId: string, finished: boolean }[]) => {
            if (rooms === Rooms) return
            setRooms(rooms)
        })
    }, [socket, Rooms, setRooms])

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
                                        <SidebarMenuButton asChild>
                                            <Link href={`/dashboard/battlefield?id=${room.roomId}`} className="min-w-0">
                                                <KeyRound />
                                                <span className="truncate">{tCommon('labels.vs', { p1: room.p1, p2: room.p2 })}</span>
                                            </Link>
                                        </SidebarMenuButton>
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
