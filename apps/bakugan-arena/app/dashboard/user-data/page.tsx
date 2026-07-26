import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Section from "@/components/ui/section"
import { getUser } from "@/src/actions/getUserSession"
import { auth } from "@/src/lib/auth"
import { Edit, LogOut } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect, unauthorized } from "next/navigation"
import { getTranslations } from "next-intl/server"


export default async function DashboardPage() {
    const t = await getTranslations('account')
    const tCommon = await getTranslations('common')

    const user = await getUser()

    if (!user) {
        unauthorized()
    }

    return (
        <Section>

            <Card>
                <CardHeader>
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                        <CardTitle className="min-w-0 break-words">
                            {t('userData.title')}
                        </CardTitle>
                        <Button variant='outline' size="sm" className="shrink-0" asChild><Link href='/dashboard/edit-account'><Edit />{tCommon('actions.edit')}</Link></Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-5">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">{tCommon('labels.username')}</span>
                            <span className='capitalize'>{user.username}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">{tCommon('labels.displayUsername')}</span>
                            <span className='capitalize'>{user.displayUsername}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">{tCommon('labels.email')}</span>
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
                                <LogOut /> {tCommon('nav.logOut')}
                            </Button>
                        </form>
                    </div>
                </CardFooter>

            </Card>

        </Section>
    )
}
