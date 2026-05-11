export type GlobalChatMessage = {
    username: string,
    text: string,
    userId: string,
    date: Date,
    id: string,
    viewers: string[]
}

export type SendedMessage = {text: string, username: string, userId: string}