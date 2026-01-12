import AppSidebar from "@/components/elements/app-sidebar/app-sidebar"
import { AnimatedThemeToggler } from "@/components/magicui/theme-toggler"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarInset, SidebarMenuSkeleton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getUser, getUserRole } from "@/src/actions/getUserSession"
import { auth } from "@/src/lib/auth"
import { SocketProvider } from "@/src/providers/socket-provider"
import { LogOutIcon, User2 } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function Layout({ children }: { children: React.ReactNode }) {

    const user = await getUser()
    const role = await getUserRole()

    return (
        <SocketProvider>
            <SidebarProvider>
                <AppSidebar role={role} />
                <SidebarInset>
                    <main className="w-full flex-1 p-3 flex flex-col gap-3 min-h-0">
                        <div className="w-full flex items-center justify-between">
                            <SidebarTrigger />
                            <div className="flex items-center gap-3">
                                <AnimatedThemeToggler />
                                <Suspense fallback={<SidebarMenuSkeleton />}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Avatar>
                                                {
                                                    user?.image != undefined && <AvatarImage src={user?.image} className="size-5" alt={user.name} />
                                                }
                                                <AvatarFallback>{user?.name[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link className="flex items-center gap-3" href='/dashboard/user-data'>
                                                    <User2 />
                                                    Account
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
                                                        <LogOutIcon /> Log out
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