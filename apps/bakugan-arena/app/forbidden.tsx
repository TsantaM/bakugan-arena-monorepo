import { Button } from "@/components/ui/button"
import Section from "@/components/ui/section"
import Link from "next/link"


export default function ForbiddenPage() {
    return (
        <Section className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-bold">403 - Forbidden</h1>
            <p>You do not have permission to access this page.</p>
            <div className="flex flex-col gap-2">
                <Button asChild variant='outline' className="w-full"><Link href='/dashboard'>Return to Dashboard</Link></Button>
            </div>
        </Section>
    )
}
