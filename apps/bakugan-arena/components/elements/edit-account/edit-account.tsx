'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEditAccountSchema, editAccount_type } from "./edit-account-zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/src/lib/auth-client";
import { deleteFile, uploadFile } from "@/src/actions/upload-action";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function EditAccount({ username, displayUsername, imgUrl }: { username: string, displayUsername: string, imgUrl: string | undefined | null }) {
    const t = useTranslations('account')
    const tAuth = useTranslations('auth')
    const tCommon = useTranslations('common')
    const router = useRouter()

    const EditAccountSchema = useMemo(
        () => createEditAccountSchema({
            imageMaxSize: t('edit.imageMaxSize'),
            imageFormats: t('edit.imageFormats'),
        }),
        [t]
    )

    const editAccountForm = useForm<editAccount_type>({
        resolver: zodResolver(EditAccountSchema), defaultValues: {
            username: username,
            displayName: displayUsername
        }
    });

    const onEditAccount = async (formData: editAccount_type) => {
        await authClient.updateUser({
            username: formData.username,
            displayUsername: formData.displayName
        })

        if (formData.image && formData.image.length > 0) {
            const file = formData.image[0] as File
            const url = await uploadFile(file)
            if (imgUrl && imgUrl != null) {
                await deleteFile(imgUrl)
            }
            await authClient.updateUser({
                image: url
            })
        }

        router.push('/dashboard')
        router.refresh()

    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {t('edit.title')}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <Form {...editAccountForm}>
                    <form onSubmit={editAccountForm.handleSubmit(onEditAccount)} className="flex flex-col space-y-5">
                        <FormField
                            control={editAccountForm.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.username')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{tAuth('signUp.usernameHelp')}</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editAccountForm.control}
                            name='displayName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCommon('labels.displayUsername')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{tAuth('signUp.displayUsernameHelp')}</FormDescription>
                                </FormItem>
                            )}
                        />

                        <div className="">
                            <Label>{t('edit.profilePicture')}</Label>
                            <Input {...editAccountForm.register('image')} type="file" />
                        </div>

                        <Button type="submit">{tCommon('actions.update')}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
