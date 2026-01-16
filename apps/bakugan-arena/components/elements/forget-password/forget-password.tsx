'use client'

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import z from "zod";
import { forgetPasswordSchema } from "./forget-password-zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export type forgetPassword_type = z.infer<typeof forgetPasswordSchema>

export default function ForgetPassword() {
    const router = useRouter()
    const forgetPassWordForm = useForm<forgetPassword_type>({
        resolver: zodResolver(forgetPasswordSchema), defaultValues: {
            email: '',
        }
    })

    const onSubmit = async (formData: forgetPassword_type) => {
        const email = formData.email

        await authClient.requestPasswordReset({
            email: String(email),
            redirectTo: "/auth/reset-password"
        }, {
            onSuccess: () => {
                router.push(`/auth/forget-password/verify?email=${email}`)
                router.refresh()
            },
            onError: (error) => {
                toast.error(error.error.message)
            }
        })

    }

    return (
        <>
            <Form {...forgetPassWordForm}>
                <form onSubmit={forgetPassWordForm.handleSubmit(onSubmit)} className="flex flex-col space-y-5">
                    <FormField
                        control={forgetPassWordForm.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="mmm@gmail.com" {...field} type="email" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form >
            <Toaster />
        </>

    )
}