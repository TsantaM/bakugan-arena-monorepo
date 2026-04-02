import { MessageType } from "@bakugan-arena/game-data"
import { create } from "zustand"

export type ChatWindowType = {
    targetId: string
    targetName: string
    messages: MessageType[]
}

type ChatStore = {
    chats: ChatWindowType[]

    upsertChat: (chat: { targetId: string; targetName: string }) => void
    addMessage: ( {message, targetId} : {targetId: string, message: MessageType}) => void
    setMessages: (targetId: string, messages: MessageType[]) => void
    removeChat: (targetId: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],

    upsertChat: ({ targetId, targetName }) =>
        set((state) => {
            const exists = state.chats.find(c => c.targetId === targetId)
            if (exists) return state

            return {
                chats: [
                    ...state.chats,
                    {
                        targetId,
                        targetName,
                        messages: [],
                    }
                ]
            }
        }),

addMessage: ({ targetId, message }) =>
    set((state) => {
        const index = state.chats.findIndex(c => c.targetId === targetId)

        // Fonction utilitaire pour comparer les messages
        const isSameMessage = (m1: MessageType, m2: MessageType) =>
            JSON.stringify(m1) === JSON.stringify(m2)

        // chat n'existe pas → création
        if (index === -1) {
            return {
                chats: [
                    ...state.chats,
                    {
                        targetId,
                        targetName: message.senderName,
                        messages: [message],
                    }
                ]
            }
        }

        const existingChat = state.chats[index]

        // Vérifie si le message existe déjà
        const alreadyExists = existingChat.messages.some(m =>
            isSameMessage(m, message)
        )

        // Si doublon → ne rien changer
        if (alreadyExists) {
            return state
        }

        const updatedChats = [...state.chats]
        updatedChats[index] = {
            ...existingChat,
            messages: [...existingChat.messages, message]
        }

        return { chats: updatedChats }
    }),

    setMessages: (targetId, messages) =>
        set((state) => {
            const index = state.chats.findIndex(c => c.targetId === targetId)
            if (index === -1) return state

            const updatedChats = [...state.chats]
            updatedChats[index] = {
                ...updatedChats[index],
                messages
            }

            return { chats: updatedChats }
        }),

    removeChat: (targetId) =>
        set((state) => ({
            chats: state.chats.filter(c => c.targetId !== targetId)
        })),
}))