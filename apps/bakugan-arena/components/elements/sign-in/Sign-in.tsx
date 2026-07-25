'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { authClient } from "@/src/lib/auth-client"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { SignInSchema } from "./Sign-in-Zod"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useTranslations } from "next-intl"

export type signInForm_type = z.infer<typeof SignInSchema>


export default function SignIn({ className }: { className?: string }) {
    const t = useTranslations('auth')
    const tCommon = useTranslations('common')
    const router = useRouter()
    const signInForm = useForm<signInForm_type>({
        resolver: zodResolver(SignInSchema), defaultValues: {
            username: '',
            password: ''
        }
    });
    const onSignIn = async (formData: signInForm_type) => {
        const { username, password } = formData
        try {

            const { } = await authClient.signIn.username(
                {
                    username: username.toLowerCase(),
                    password: password
                },
                {
                    onSuccess: async () => {
                        router.push('/dashboard')
                        router.refresh()
                    },
                    onError: (ctx) => {
                        toast.error(`${ctx.error.message}`)
                    },
                }
            )

        } catch (err) {
            console.error(err)
        }
    }


    return (
        // <Card className={`w-full max-w-sm ${className}`}>
        //     <CardHeader>
        //         <CardTitle>Sign in to your Account</CardTitle>
        //         <CardDescription>
        //             Enter your Email and Password to sign in to your account
        //         </CardDescription>
        //     </CardHeader>
        //     <CardContent>

        //     </CardContent>
        //     <Toaster />
        // </Card>

        <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="flex flex-col space-y-5">
                <FormField
                    control={signInForm.control}
                    name='username'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tCommon('labels.username')}</FormLabel>
                            <FormControl>
                                <Input placeholder={tCommon('placeholders.usernameExample')} {...field} type="text" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={signInForm.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tCommon('labels.password')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{t('signIn.submit')}</Button>
            </form>
        </Form>


    )
}

export function SignInModal({ triggerContent }: { triggerContent?: string }) {
    const t = useTranslations('auth')
    const tCommon = useTranslations('common')
    const router = useRouter()

    const signInForm = useForm<signInForm_type>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    })

    const signInMutation = useMutation({
        mutationFn: async (formData: signInForm_type) => {
            const { username, password } = formData

            return authClient.signIn.username(
                {
                    username: username.toLowerCase(),
                    password
                },
                {
                    onSuccess: async () => {
                        router.push('/dashboard')
                        router.refresh()
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message)
                    }
                }
            )
        }
    })





    const onSignIn = (formData: signInForm_type) => {
        signInMutation.mutate(formData)
    }
    return (<>

        <Dialog>

            <DialogTrigger asChild>
                <Button variant='outline' size="sm" className={triggerContent ? "h-auto max-w-full whitespace-normal text-center" : undefined}>
                    { triggerContent ? triggerContent : t('signIn.trigger')}
                </Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col">

                <DialogHeader>
                    <DialogTitle>{t('signIn.title')}</DialogTitle>
                    <DialogDescription>
                        {t('signIn.description')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(onSignIn)} className="flex flex-col space-y-5">
                        <FormField
                            control={signInForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.username')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={tCommon('placeholders.usernameExample')} {...field} type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signInForm.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.password')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant='destructive'>{tCommon('actions.cancel')}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={signInMutation.isPending}> {signInMutation.isPending ? <Loader /> : t('signIn.submit')}</Button>
                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>
            <Toaster />

        </Dialog>


    </>)
}