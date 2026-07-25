'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createEditPasswordSchema, editPasswordForm_type } from "./edit-password-zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export type { editPasswordForm_type }

export default function EditPassword() {
    const t = useTranslations('account')
    const tAuth = useTranslations('auth')
    const router = useRouter()

    const editPasswordSchema = useMemo(
        () => createEditPasswordSchema(tAuth('validation.passwordMin')),
        [tAuth]
    )

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
                        toast.success(t('toasts.passwordUpdated'))
                        updatePasswordForm.reset()
                        router.refresh()
                    },
                    onError: (ctx) => {
                        toast.error(`${ctx.error.message}`)
                    },
                }
            );
        } catch (err) {
            console.error(err)
        }

    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="break-words">
                    {t('password.title')}
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
                                    <FormLabel>{t('password.current')}</FormLabel>
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
                                    <FormLabel>{t('password.new')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} type="password" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="h-auto w-full whitespace-normal">{t('password.submit')}</Button>
                    </form>
                </Form>
            </CardContent>
            <Toaster/>
        </Card>
    )
}
