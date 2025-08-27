'use server'

import { del, put } from "@vercel/blob"
import { getUser } from "./getUserSession";


export const uploadFile = async (file: File) => {
    const filename = file.name;
    const user = await getUser()

    if (user) {
        const blob = await put(filename, file, {
            access: 'public'
        })
        return blob.url
    }

}

export const deleteFile = async (url: string) => {
    await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
}