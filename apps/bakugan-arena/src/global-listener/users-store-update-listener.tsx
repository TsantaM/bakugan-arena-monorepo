'use client'

import ConnectedUsersListener from "../sockets/useConnectedUsers"

export default function UsersStoreUpdateListener() {
    ConnectedUsersListener()
    return null 
}