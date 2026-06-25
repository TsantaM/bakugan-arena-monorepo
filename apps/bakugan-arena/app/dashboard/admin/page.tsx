import AdminPanel from "@/components/elements/admin/admin-panel"
import Section from "@/components/ui/section"

export default function AdminPage() {
    return (
        <Section className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Administration</h1>
            <AdminPanel />
        </Section>
    )
}
