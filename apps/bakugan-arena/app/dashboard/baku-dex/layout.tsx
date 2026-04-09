import BakuDexSidebar from "@/components/elements/app-sidebar/baku-dex-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getUser } from "@/src/actions/getUserSession"

export default async function Layout({ children }: { children: React.ReactNode }) {

    const user = await getUser()


    return (
        <SidebarProvider>
            <SidebarProvider>
                <BakuDexSidebar user={user} />
                <SidebarInset>
                    <main className="w-full p-3 flex flex-col gap-3">
                        <div className="w-full flex items-center justify-between">
                            <SidebarTrigger />
                            {/* <div className="flex items-center gap-2">
                                <AnimatedThemeToggler />
                                {
                                    user ?
                                        <Suspense fallback={<Skeleton />}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant='outline' asChild className="p-0">
                                                        <Avatar>
                                                            {
                                                                user.image != undefined && <AvatarImage src={user.image} className="size-5" alt={user.name} />
                                                            }
                                                            <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link className="flex items-center gap-3" href='/dashboard'>
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

                                        : <>
                                            <SignInModal />
                                            <SignUpModal />
                                        </>
                                }
                            </div> */}

                        </div>
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </SidebarProvider>

    )
}