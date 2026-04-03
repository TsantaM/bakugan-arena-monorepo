import {create} from 'zustand'

type ConnectedUsersStoreType = {
    users: string[],
    setUsers: (users: string[]) => void
}

export const ConnectedUsersStore = create<ConnectedUsersStoreType>((set) => ({
    users: [],
    setUsers: (users) => {
        set({users})
    },
}))