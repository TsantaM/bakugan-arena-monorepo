import AppSidebar from "@/components/elements/app-sidebar/app-sidebar"
import DashboardSettingsMenu from "@/components/elements/dashboard/dashboard-settings-menu"
import BattlefieldHeaderActions from "@/components/elements/dashboard/battlefield-header-actions"
import GlobalChatLoader from "@/components/elements/dashboard/global-chat-loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getUser, getUserRole } from "@/src/actions/getUserSession"
import { auth } from "@/src/lib/auth"
import { SocketProvider } from "@/src/providers/socket-provider"
import { LogOutIcon, User2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import UsersStoreUpdateListener from "@/src/global-listener/users-store-update-listener";
import ChatListener from "@/src/global-listener/chat-global-listener";
import SearchOpponentListener from "@/src/global-listener/search-opponent-listener";
import ChalengeSomeoneListener from "@/src/global-listener/chalenge-someone-listener"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const [user, role, tCommon] = await Promise.all([
        getUser(),
        getUserRole(),
        getTranslations('common'),
    ])

    return (
        <SocketProvider>
            <UsersStoreUpdateListener />
            <ChatListener />
            <SearchOpponentListener />
            <ChalengeSomeoneListener />
            <SidebarProvider>
                <AppSidebar role={role} />
                <SidebarInset>
                    <main className="w-full flex-1 p-3 flex flex-col gap-3 min-h-0">
                        <div className="w-full flex items-center justify-between gap-2">
                            <SidebarTrigger className="shrink-0" />
                            <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                                <BattlefieldHeaderActions />
                                <Link href="https://discord.gg/8HfPK5RVuk" target="_blank" className="shrink-0">
                                    <Image src="/discord.svg" alt={tCommon('a11y.discordLogo')} width={24} height={24} className="size-6" unoptimized />
                                </Link>
                                <GlobalChatLoader />
                                <DashboardSettingsMenu />
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button variant='outline' asChild className="p-0 shrink-0">
                                            <Avatar>
                                                {
                                                    user?.image != undefined && <AvatarImage src={user.image} className="size-5" alt={user.name} />
                                                }
                                                <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link className="flex items-center gap-3" href='/dashboard/user-data'>
                                                <User2 />
                                                {tCommon('nav.account')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <form className='w-full'>
                                                <button className='w-full flex items-center gap-3' formAction={async () => {
                                                    'use server'

                                                    await auth.api.signOut({
                                                        headers: await headers()
                                                    })

                                                    redirect('/')
                                                }}>
                                                    <LogOutIcon /> {tCommon('nav.logOut')}
                                                </button>
                                            </form>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 relative overflow-hidden">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </SocketProvider>
    )
}
