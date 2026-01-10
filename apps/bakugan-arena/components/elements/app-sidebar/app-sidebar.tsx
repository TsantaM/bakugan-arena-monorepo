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
import { RoleType } from "@/src/actions/getUserSession"
import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { BookOpenText, ChartSpline, Home, KeyRound, SwatchBook } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

type LinksDashboardType = {
    icone: ReactNode,
    label: string,
    href: string
}

const LinksDashboard: LinksDashboardType[] = [
    {
        icone: <Home />,
        label: 'Dashboard',
        href: '/dashboard'
    },
    {
        icone: <SwatchBook />,
        label: 'Deck Builder',
        href: '/dashboard/deck-builder'
    },
    {
        icone: <BookOpenText />,
        label: 'Baku Dex',
        href: '/baku-dex'
    },
    {
        icone: <ChartSpline />,
        label: 'Ladder',
        href: '/dashboard'
    }
]


export default function AppSidebar({ role }: { role: RoleType | undefined }) {

    const router = useRouter()
    const socket = useSocket()
    const [Rooms, setRooms] = useState<{ p1: string, p2: string, roomId: string }[]>([])
    const user = authClient.useSession()

    useEffect(() => {
        if (!socket) return
        if (!user.data?.user.id) return
        const userId = user.data.user.id
        socket.emit('get-rooms-user-id', userId)

    }, [socket, router])

    useEffect(() => {
        if (!socket) return
        socket.on('get-rooms-user-id', (rooms: { p1: string, p2: string, roomId: string }[]) => {
            if(rooms === Rooms) return
            setRooms(rooms)
        })

    }, [socket])

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <div className='flex items-center gap-2'>
                    <Logo height={50} width={50} />
                    <h1 className='font-bold'>Bakugan Arena</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
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
                            role?.role === 'ADMIN' && <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={'/dashboard'}>
                                            <KeyRound />
                                            <span>Administration</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        }

                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Battles in process ({Rooms.length})
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {
                            Rooms.length > 0 && Rooms.map((room, index) =>
                                <SidebarMenu key={index}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href={`/dashboard/battlefield?id=${room.roomId}`}>
                                                <KeyRound />
                                                <span>{`${room.p1} VS ${room.p2}`}</span>
                                            </Link>
                                        </SidebarMenuButton>
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