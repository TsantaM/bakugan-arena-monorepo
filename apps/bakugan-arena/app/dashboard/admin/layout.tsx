import { requireAdmin } from "@/src/actions/getUserSession"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdmin()

    return <>{children}</>
}
