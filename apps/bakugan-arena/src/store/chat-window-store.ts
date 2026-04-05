import { MessageType } from "@bakugan-arena/game-data"
import { create } from "zustand"

export type ChatWindowType = {
    targetId: string
    targetName: string
    messages: MessageType[]
    chalenge: null | {
        deck: string | undefined,
        waitingForResponse: boolean
    }
    isChalenged: null | {
        deck: string | undefined
        waitingForResponse: boolean
    }
}

type ChatStore = {
    chats: ChatWindowType[]
    focused: string | undefined

    upsertChat: (chat: { targetId: string; targetName: string }) => void
    addMessage: ({ message, targetId }: { targetId: string, message: MessageType }) => void
    setMessages: (targetId: string, messages: MessageType[]) => void
    removeChat: (targetId: string) => void

    // 🔥 nouvelles fonctions
    toggleDeck: (targetId: string, deck: string) => void
    setWaiting: (targetId: string, waiting: boolean) => void
    clearChallenge: (targetId: string) => void
    onReceiveChallenge: (targetId: string) => void
    toggleDeckInIsChalenged: (targetId: string, deck: string) => void
    clearIsChalenged: (targetId: string) => void
    setIsChalengedWaiting: (targetId: string, waiting: boolean) => void

    setFocused: (targetId: string) => void
    clearFocused: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],
    focused: undefined,

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
                        chalenge: null,
                        isChalenged: null
                    }
                ]
            }
        }),

    addMessage: ({ targetId, message }) =>
        set((state) => {
            const index = state.chats.findIndex(c => c.targetId === targetId)

            const isSameMessage = (m1: MessageType, m2: MessageType) =>
                JSON.stringify(m1) === JSON.stringify(m2)

            if (index === -1) {
                return {
                    chats: [
                        ...state.chats,
                        {
                            targetId,
                            targetName: message.senderName || 'Player',
                            messages: [message],
                            chalenge: state.chats[index]?.chalenge || null,
                            isChalenged: state.chats[index]?.isChalenged || null
                        }
                    ]
                }
            }

            const existingChat = state.chats[index]

            const alreadyExists = existingChat.messages.some(m =>
                isSameMessage(m, message)
            )

            if (alreadyExists) return state

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

    // 🔥 toggle deck (logique demandée)
    toggleDeck: (targetId, deck) =>
        set((state) => {
            const chats = state.chats.map(chat => {
                if (chat.targetId !== targetId) return chat

                // si même deck → on reset
                if (chat.chalenge?.deck === deck) {
                    return { ...chat, chalenge: null }
                }

                return {
                    ...chat,
                    chalenge: {
                        deck,
                        waitingForResponse: false
                    }
                }
            })

            return { chats }
        }),

    // 🔥 gérer le waiting
    setWaiting: (targetId, waiting) =>
        set((state) => {
            const chats = state.chats.map(chat => {
                if (chat.targetId !== targetId || !chat.chalenge) return chat

                return {
                    ...chat,
                    chalenge: {
                        ...chat.chalenge,
                        waitingForResponse: waiting
                    }
                }
            })

            return { chats }
        }),

    // 🔥 reset complet
    clearChallenge: (targetId) =>
        set((state) => ({
            chats: state.chats.map(chat =>
                chat.targetId === targetId
                    ? { ...chat, chalenge: null }
                    : chat
            )
        })),

    onReceiveChallenge: (targetId) =>
        set((state) => {
            const chats = state.chats.map(chat => {
                if (chat.targetId !== targetId) return chat

                return {
                    ...chat,
                    isChalenged: {
                        deck: undefined,
                        waitingForResponse: true
                    }
                }
            })

            return { chats }
        }),


    toggleDeckInIsChalenged: (targetId, deck) =>
        set((state) => {
            const chats = state.chats.map(chat => {
                if (chat.targetId !== targetId) return chat

                // même deck → reset
                if (chat.isChalenged?.deck === deck) {
                    return { ...chat, isChalenged: null }
                }

                return {
                    ...chat,
                    isChalenged: {
                        deck,
                        waitingForResponse: false
                    }
                }
            })

            return { chats }
        }),

    setIsChalengedWaiting: (targetId, waiting) =>
        set((state) => {
            const chats = state.chats.map(chat => {
                if (chat.targetId !== targetId || !chat.isChalenged) return chat

                return {
                    ...chat,
                    isChalenged: {
                        ...chat.isChalenged,
                        waitingForResponse: waiting
                    }
                }
            })

            return { chats }
        }),


    clearIsChalenged: (targetId) =>
        set((state) => ({
            chats: state.chats.map(chat =>
                chat.targetId === targetId
                    ? { ...chat, isChalenged: null }
                    : chat
            )
        })),

    clearFocused() {
        set(() => ({
            focused: undefined
        }))
    },

    setFocused(targetId) {
        set(() => ({
            focused: targetId
        }))
    },
}))