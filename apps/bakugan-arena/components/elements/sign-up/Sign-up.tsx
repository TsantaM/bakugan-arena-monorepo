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
import { SignUpSchema } from "./Sign-up-Zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { authClient } from "@/src/lib/auth-client"
import z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { toast } from "sonner"

export type signUpForm_type = z.infer<typeof SignUpSchema>


export function SignUp({ className }: { className?: string }) {

    const router = useRouter()
    const signUpForm = useForm<signUpForm_type>({
        resolver: zodResolver(SignUpSchema), defaultValues: {
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
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                    Enter your Name, Email and Password to create your account
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
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Shun Kazami" {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{`Username is the name you'll use it to sign in to you account`}</FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name='displayUsername'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Shun K4z4m1" {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{`Display username is the username that will appear to you and other players`}</FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="mmm@gmail.com" {...field} type="email" />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Sign Up</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export function SignUpModal({ triggerContent }: { triggerContent?: string }) {

    const router = useRouter()
    const signUpForm = useForm<signUpForm_type>({
        resolver: zodResolver(SignUpSchema), defaultValues: {
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
                        { triggerContent ? triggerContent : 'Register'}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create an Account</DialogTitle>
                        <DialogDescription>
                            Enter your Name, Email and Password to create your account
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...signUpForm}>
                        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="flex flex-col space-y-5">
                            <FormField
                                control={signUpForm.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Shun Kazami" {...field} type="text" />
                                        </FormControl>
                                        <FormDescription>{`Username is the name you'll use it to sign in to you account`}</FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name='displayUsername'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Shun K4z4m1" {...field} type="text" />
                                        </FormControl>
                                        <FormDescription>{`Display username is the username that will appear to you and other players`}</FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signUpForm.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="mmm@gmail.com" {...field} type="email" />
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="" {...field} type="password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant='destructive'>Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={signUpMutation.isPending}> {signUpMutation.isPending ? <Loader /> : 'Register'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>

                </DialogContent>

            </Dialog>

        </>
    )
}