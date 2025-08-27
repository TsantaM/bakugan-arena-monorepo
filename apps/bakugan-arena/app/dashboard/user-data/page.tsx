import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Section from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"
import { getUser } from "@/src/actions/getUserSession"
import { auth } from "@/src/lib/auth"
import { Edit, LogOut } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect, unauthorized } from "next/navigation"
import { Suspense } from "react";


export default async function DashboardPage() {

    const user = await getUser()

    if (!user) {
        unauthorized()
    }

    return (
        <Section>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            User Date
                        </CardTitle>
                        <Button variant='outline' asChild><Link href='/dashboard/edit-account'><Edit />Edit</Link></Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-5">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Username</span>
                            <Suspense fallback={<Skeleton className="w-full" />}>
                                <span className='capitalize'>{user.username}</span>
                            </Suspense>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Display Username</span>
                            <Suspense fallback={<Skeleton className="w-full" />}>
                                <span className='capitalize'>{user.displayUsername}</span>
                            </Suspense>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Email</span>
                            <span>{user.email}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <div className="w-full flex flex-col">
                        <form className='w-full'>
                            <Button variant='destructive' className='w-full flex items-center gap-3' formAction={async () => {
                                'use server'

                                await auth.api.signOut({
                                    headers: await headers()
                                })

                                redirect('/auth/sign-in')
                            }}>
                                <LogOut /> Log out
                            </Button>
                        </form>
                    </div>
                </CardFooter>

            </Card>

        </Section>
    )
}