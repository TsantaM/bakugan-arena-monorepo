import { GlobalChatMessage } from "@bakugan-arena/game-data";


export const GlobalChatStore: GlobalChatMessage[] = []

/*
|--------------------------------------------------------------------------
| Config
|--------------------------------------------------------------------------
*/

const MESSAGE_TTL = 1000 * 60 * 60 * 24 // 24 heures
export const CLEANUP_INTERVAL_GLOBAL_CHAT = 1000 * 60 * 30 // 30 minutes

/*
|--------------------------------------------------------------------------
| Cleanup function
|--------------------------------------------------------------------------
*/

export function cleanupOldMessages() {

    const now = Date.now()

    const filteredMessages = GlobalChatStore.filter((message) => {

        const messageDate = new Date(message.date).getTime()

        return now - messageDate < MESSAGE_TTL
    })

    /*
    |--------------------------------------------------------------------------
    | Mutation propre du tableau
    |--------------------------------------------------------------------------
    */

    GlobalChatStore.length = 0
    GlobalChatStore.push(...filteredMessages)

    console.log(
        `[GLOBAL CHAT] Cleanup complete : ${GlobalChatStore.length} messages remaining`
    )
}

/*
|--------------------------------------------------------------------------
| Auto cleanup interval
|--------------------------------------------------------------------------
*/