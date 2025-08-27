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
import { UserType } from "@/src/actions/getUserSession"
import { Home, SwatchBook } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

type LinksDashboardType = {
    icone: ReactNode,
    label: string,
    href: string
}

const LinksDashboard: LinksDashboardType[] = [
    {
        icone: <SwatchBook />,
        label: 'Bakugans',
        href: '/baku-dex'
    },
    {
        icone: <SwatchBook />,
        label: 'Ability Cards',
        href: '/baku-dex/ability-cards'
    },
    {
        icone: <SwatchBook />,
        label: 'Exclusives Ability Cards',
        href: '/baku-dex/exclusive-ability-cards'
    },
    {
        icone: <SwatchBook />,
        label: 'Gate Cards',
        href: '/baku-dex/gate-cards'
    }
]

export default function BakuDexSidebar({ user }: { user: UserType | undefined }) {
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
                        Baku-Dex Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {
                            user && <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href='/dashboard'>
                                            <Home />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        }
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

                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar >
    )
}