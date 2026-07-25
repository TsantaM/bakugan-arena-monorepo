import AppSidebar from "@/components/elements/app-sidebar/app-sidebar"
import DashboardSettingsMenu from "@/components/elements/dashboard/dashboard-settings-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarInset, SidebarMenuSkeleton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getUser, getUserRole } from "@/src/actions/getUserSession"
import { auth } from "@/src/lib/auth"
import { SocketProvider } from "@/src/providers/socket-provider"
import { LogOutIcon, User2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import UsersStoreUpdateListener from "@/src/global-listener/users-store-update-listener";
import ChatListener from "@/src/global-listener/chat-global-listener";
import SearchOpponentListener from "@/src/global-listener/search-opponent-listener";
import ChalengeSomeoneListener from "@/src/global-listener/chalenge-someone-listener"
import ForfeitButton from "@/components/elements/battlefield/forfeit-button"
import BattleLogToggle from "@/components/elements/battle-log/battle-log-toggle"
import GlobalChat from "@/components/elements/global-chat/global-chat"


export default async function Layout({ children }: { children: React.ReactNode }) {

    const user = await getUser()
    const role = await getUserRole()
    const tCommon = await getTranslations('common')

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
                                <ForfeitButton />
                                <BattleLogToggle context="battlefield" />
                                <Link href="https://discord.gg/8HfPK5RVuk" target="_blank" className="shrink-0">
                                    <img src="/discord.svg" alt={tCommon('a11y.discordLogo')} className="w-6 h-6" />
                                </Link>
                                <GlobalChat />
                                <DashboardSettingsMenu />
                                <Suspense fallback={<SidebarMenuSkeleton />}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant='outline' asChild className="p-0 shrink-0">
                                                <Avatar>
                                                    {
                                                        user?.image != undefined && <AvatarImage src={user.image} className="size-5" alt={user.name} />
                                                    }
                                                    <AvatarFallback>{user?.name[0].toUpperCase()}</AvatarFallback>
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
                                </Suspense>
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
