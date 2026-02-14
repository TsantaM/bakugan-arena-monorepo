import { SignInModal } from "@/components/elements/sign-in/Sign-in"
import { SignUpModal } from "@/components/elements/sign-up/Sign-up"
import { Button } from "@/components/ui/button"
import Section from "@/components/ui/section"
import Link from "next/link"


export default function UnauthorizedPage() {
    return (
        <Section className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <h1 className="text-5xl font-bold">401 - Unauthorized</h1>
            <p>Please log in to access this page.</p>
            <div className="flex flex-col gap-2">
                <Button asChild variant='outline' className="w-full"><Link href='/'>Return to Home page</Link></Button>
            </div>
        </Section>
    )
}