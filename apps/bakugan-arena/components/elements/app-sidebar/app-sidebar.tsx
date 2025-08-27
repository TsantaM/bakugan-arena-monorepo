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
import { BookOpenText, ChartSpline, Home, KeyRound, SwatchBook } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

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
            </SidebarContent>
        </Sidebar >
    )
}