'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import { ConnectedUsersStore } from "../store/connected-users-store"

export default function ConnectedUsersListener() {
    const socket = useSocket()
    const setUsers = ConnectedUsersStore((state) => state.setUsers)
    const users = ConnectedUsersStore((state) => state.users)

    useEffect(() => {
        if (!socket) return
        socket.on('update-connected-users', (users: string[]) => {
            setUsers(users)
        })

    }, [socket])

    return null
}