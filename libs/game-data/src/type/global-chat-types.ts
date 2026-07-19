export type GlobalChatMessage = {
    username: string,
    text: string,
    userId: string,
    date: Date,
    id: string,
    viewers: string[],
    image?: string | null,
}

export type SendedMessage = {
    text: string,
    username: string,
    userId: string,
    image?: string | null,
}