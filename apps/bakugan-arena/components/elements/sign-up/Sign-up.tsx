'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { createSignUpSchema, type signUpForm_type } from "./Sign-up-Zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { authClient } from "@/src/lib/auth-client"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

export type { signUpForm_type }


export function SignUp({ className }: { className?: string }) {
    const t = useTranslations('auth')
    const tCommon = useTranslations('common')
    const router = useRouter()
    const signUpSchema = useMemo(
        () => createSignUpSchema({
            usernameRequired: t('validation.usernameRequired'),
            displayUsernameRequired: t('validation.displayUsernameRequired'),
            passwordMin: t('validation.passwordMin'),
        }),
        [t]
    )
    const signUpForm = useForm<signUpForm_type>({
        resolver: zodResolver(signUpSchema), defaultValues: {
            email: '',
            username: '',
            displayUsername: '',
            password: ''
        }
    })
    const onSignUp = async (formData: signUpForm_type) => {
        const { email, displayUsername, username, password } = formData
        try {
            const { } = await authClient.signUp.email(
                {
                    password,
                    email: email,
                    name: username,
                    username: username,
                    displayUsername: displayUsername,
                    callbackURL: "/",
                },
                {
                    onRequest: () => {
                        // Afficher un indicateur de chargement
                    },
                    onSuccess: async () => {
                        router.push('/dashboard')
                        router.refresh()
                    },
                    onError: (ctx) => {
                        // Afficher le message d'erreur
                        toast(ctx.error.message);
                    },
                }
            );

        } catch (err) {
            console.error("Une exception s'est produite :", err);
        }
    }


    return (
        <Card className={`w-full max-w-sm ${className}`}>
            <CardHeader>
                <CardTitle>{t('signUp.title')}</CardTitle>
                <CardDescription>
                    {t('signUp.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="flex flex-col space-y-5">
                        <FormField
                            control={signUpForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.username')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={tCommon('placeholders.usernameExample')} {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{t('signUp.usernameHelp')}</FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name='displayUsername'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.displayUsername')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={tCommon('placeholders.displayUsernameExample')} {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{t('signUp.displayUsernameHelp')}</FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.email')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={tCommon('placeholders.emailExample')} {...field} type="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
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
                        <Button type="submit">{t('signUp.submit')}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export function SignUpModal({ triggerContent }: { triggerContent?: string }) {
    const t = useTranslations('auth')
    const tCommon = useTranslations('common')
    const router = useRouter()
    const signUpSchema = useMemo(
        () => createSignUpSchema({
            usernameRequired: t('validation.usernameRequired'),
            displayUsernameRequired: t('validation.displayUsernameRequired'),
            passwordMin: t('validation.passwordMin'),
        }),
        [t]
    )
    const signUpForm = useForm<signUpForm_type>({
        resolver: zodResolver(signUpSchema), defaultValues: {
            email: '',
            username: '',
            displayUsername: '',
            password: ''
        }
    })

    const signUpMutation = useMutation({
        mutationFn: async (formData: signUpForm_type) => {
            const { email, displayUsername, username, password } = formData
            try {
                const { } = await authClient.signUp.email(
                    {
                        password,
                        email: email,
                        name: username,
                        username: username,
                        displayUsername: displayUsername,
                        callbackURL: "/",
                    },
                    {
                        onRequest: () => {
                            // Afficher un indicateur de chargement
                        },
                        onSuccess: async () => {
                            router.push('/dashboard')
                            router.refresh()
                        },
                        onError: (ctx) => {
                            // Afficher le message d'erreur
                            toast(ctx.error.message);
                        },
                    }
                );

            } catch (err) {
                console.error("Une exception s'est produite :", err);
            }
        }
    })

    const onSignUp = (formData: signUpForm_type) => {
        signUpMutation.mutate(formData)
    }

    return (
        <>

            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        { triggerContent ? triggerContent : t('signUp.trigger')}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('signUp.title')}</DialogTitle>
                        <DialogDescription>
                            {t('signUp.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...signUpForm}>
                        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="flex flex-col space-y-5">
                            <FormField
                                control={signUpForm.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tCommon('labels.username')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={tCommon('placeholders.usernameExample')} {...field} type="text" />
                                        </FormControl>
                                        <FormDescription>{t('signUp.usernameHelp')}</FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name='displayUsername'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tCommon('labels.displayUsername')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={tCommon('placeholders.displayUsernameExample')} {...field} type="text" />
                                        </FormControl>
                                        <FormDescription>{t('signUp.displayUsernameHelp')}</FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tCommon('labels.email')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={tCommon('placeholders.emailExample')} {...field} type="email" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
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
                                <Button type="submit" disabled={signUpMutation.isPending}> {signUpMutation.isPending ? <Loader /> : t('signUp.submitModal')}</Button>
                            </DialogFooter>
                        </form>
                    </Form>

                </DialogContent>

            </Dialog>

        </>
    )
}