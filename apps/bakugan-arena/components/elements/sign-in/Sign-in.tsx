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

export type signInForm_type = z.infer<typeof SignInSchema>


export default function SignIn({className} : {className?: string}) {
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
                    username: username,
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
            console.log(err)
        }
    }


    return (
        <Card className={`w-full max-w-sm ${className}`}>
            <CardHeader>
                <CardTitle>Sign in to your Account</CardTitle>
                <CardDescription>
                    Enter your Email and Password to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(onSignIn)} className="flex flex-col space-y-5">
                        <FormField
                            control={signInForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Shun Kazami" {...field} type="text" />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Sign In</Button>
                    </form>
                </Form>
            </CardContent>
            <Toaster />
        </Card>
    )
}