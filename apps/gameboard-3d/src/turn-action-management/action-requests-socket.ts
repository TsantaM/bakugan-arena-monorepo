import type { ActionType, ActivePlayerActionRequestType, InactivePlayerActionRequestType } from '@bakugan-arena/game-data/src/type/actions-serveur-requests'
import { io } from 'socket.io-client'


const socket = io("http://localhost:3005")

let request_list: ActionType[] = []

socket.on('turn-action-request', (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {
    request_list = []

    request.actions.mustDo.forEach((action) => {
        if(request_list.some((request) => request.type === action.type)) return
        request_list.push(action)
    })


})
