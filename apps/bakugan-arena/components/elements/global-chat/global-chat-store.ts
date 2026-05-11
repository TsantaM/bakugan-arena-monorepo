import { GlobalChatMessage } from "@bakugan-arena/game-data"
import { create } from "zustand"

type GlobalChatMessageStore = {
    messages: GlobalChatMessage[]

    setMessages: (params: {
        messages: GlobalChatMessage[]
    }) => void

    addMessage: (params: {
        message: GlobalChatMessage
    }) => void

    updateMessage: (params: {
        id: string
        message: GlobalChatMessage
    }) => void

    updateMessageViewers: (params: {
        id: string
        viewers: string[]
    }) => void
}

const sortMessagesByDate = (messages: GlobalChatMessage[]) => {
    return [...messages].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

export const useGlobalChatMessageStore = create<GlobalChatMessageStore>((set) => ({
    messages: [],

    setMessages: ({ messages }) => {
        set({
            messages: sortMessagesByDate(messages)
        })
    },

    addMessage: ({ message }) => {
        set((state) => ({
            messages: sortMessagesByDate([
                ...state.messages,
                message
            ])
        }))
    },

    updateMessage: ({ id, message }) => {
        set((state) => ({
            messages: sortMessagesByDate(
                state.messages.map((msg) =>
                    msg.id === id ? message : msg
                )
            )
        }))
    },

    updateMessageViewers: ({ id, viewers }) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.id === id
                    ? {
                          ...msg,
                          viewers
                      }
                    : msg
            )
        }))
    }
}))