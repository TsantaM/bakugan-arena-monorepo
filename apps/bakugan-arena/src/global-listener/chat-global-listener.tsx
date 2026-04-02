'use client'

import useChat from "../sockets/useChat"


export default function ChatListener() {
    useChat()
    return null
}