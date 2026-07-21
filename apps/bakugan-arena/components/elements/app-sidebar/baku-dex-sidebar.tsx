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
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ReactNode, useMemo } from "react"

type LinksDashboardType = {
    icone: ReactNode,
    label: string,
    href: string
}

export default function BakuDexSidebar({ user }: { user: UserType | undefined }) {
    const t = useTranslations('nav')
    const tCommon = useTranslations('common')

    const LinksDashboard: LinksDashboardType[] = useMemo(() => [
        {
            icone: <SwatchBook />,
            label: t('bakuDexLinks.bakugans'),
            href: '/dashboard/baku-dex'
        },
        {
            icone: <SwatchBook />,
            label: t('bakuDexLinks.abilityCards'),
            href: '/dashboard/baku-dex/ability-cards'
        },
        {
            icone: <SwatchBook />,
            label: t('bakuDexLinks.exclusiveAbilityCards'),
            href: '/dashboard/baku-dex/exclusive-ability-cards'
        },
        {
            icone: <SwatchBook />,
            label: t('bakuDexLinks.gateCards'),
            href: '/dashboard/baku-dex/gate-cards'
        }
    ], [t])

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
                        {t('group.bakuDexNavigation')}
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
                            user && <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href='/dashboard'>
                                            <Home />
                                            <span>{t('dashboard')}</span>
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
