'use server'

import { ConvertReplayToObject } from "./convert-replay-json-to-object"

export default async function ImportReplayAction(file: File) {

    try {
        const buffer = await file.arrayBuffer()
        const text = new TextDecoder().decode(buffer)
        const data = await ConvertReplayToObject(text)

        return data
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Error during replay import')
    }

}