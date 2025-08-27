'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { editPasswordSchema } from "./edit-password-zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export type editPasswordForm_type = z.infer<typeof editPasswordSchema>


export default function EditPassword() {

    const router = useRouter()
    const updatePasswordForm = useForm<editPasswordForm_type>({
        resolver: zodResolver(editPasswordSchema), defaultValues: {
            currentPassword: '',
            newPassword: ''
        }
    })

    const onEditPassword = async (formData: editPasswordForm_type) => {
        const currentPassword = formData.currentPassword
        const newPassword = formData.newPassword
        try {
            const { } = await authClient.changePassword({
                newPassword: newPassword, // required
                currentPassword: currentPassword, // required
                revokeOtherSessions: true,
            },
                {
                    onSuccess: async () => {
                        toast.success('Password Updated')
                        updatePasswordForm.reset()
                        router.refresh()
                    },
                    onError: (ctx) => {
                        toast.error(`${ctx.error.message}`)
                    },
                }
            );
        } catch (err) {
            console.log(err)
        }

    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Update Password
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...updatePasswordForm}>
                    <form onSubmit={updatePasswordForm.handleSubmit(onEditPassword)} className="flex flex-col space-y-5">
                        <FormField
                            control={updatePasswordForm.control}
                            name='currentPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={updatePasswordForm.control}
                            name='newPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Update Password</Button>
                    </form>
                </Form>
            </CardContent>
            <Toaster/>
        </Card>
    )
}