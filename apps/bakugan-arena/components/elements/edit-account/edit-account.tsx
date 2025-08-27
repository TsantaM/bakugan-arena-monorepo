'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import z from "zod";
import { EditAccountSchema } from "./edit-account-zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/src/lib/auth-client";
import { deleteFile, uploadFile } from "@/src/actions/upload-action";

type editAccount_type = z.infer<typeof EditAccountSchema>

export default function EditAccount({ username, displayUsername, imgUrl }: { username: string, displayUsername: string, imgUrl: string | undefined | null }) {

    const router = useRouter()
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

    console.log(editAccountForm.formState.errors)

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Edit your data
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
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{`Username is the name you'll use it to sign in to you account`}</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editAccountForm.control}
                            name='displayName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormDescription>{`Display username is the username that will appear to you and other players`}</FormDescription>
                                </FormItem>
                            )}
                        />

                        <div className="">
                            <Label>Profile Picture</Label>
                            <Input {...editAccountForm.register('image')} type="file" />
                        </div>

                        <Button type="submit">Update</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}