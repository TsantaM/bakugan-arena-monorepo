import BakuDexSidebar from "@/components/elements/app-sidebar/baku-dex-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getUser } from "@/src/actions/getUserSession"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getUser()

    return (
        <SidebarProvider>
            <BakuDexSidebar user={user} />
            <SidebarInset>
                <main className="w-full p-3 flex flex-col gap-3">
                    <div className="w-full flex items-center justify-between">
                        <SidebarTrigger />
                    </div>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
