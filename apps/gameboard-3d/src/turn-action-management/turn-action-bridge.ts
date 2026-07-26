import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
    MessageToIframe,
    TurnActionCommitPayload,
} from '@bakugan-arena/game-data'
import type { Socket } from 'socket.io-client'
import * as THREE from 'three'
import {
    notifyParentTurnActionRequest,
} from '../functions/send-message-to-parent'
import {
    cancelTurnTargeting,
    startTurnTargeting,
} from './turn-targeting-controller'
import { clearTurnInterface } from './turn-actions-resolution/action-scope'

type BridgeContext = {
    socket: Socket
    userId: string
    roomId: string
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
}

let ctx: BridgeContext | null = null
let messageListenerAttached = false

function getCtx(): BridgeContext | null {
    return ctx
}

function emitCommit(payload: TurnActionCommitPayload) {
    const current = getCtx()
    if (!current) return

    const { socket, roomId, userId } = current

    switch (payload.actionType) {
        case 'SET_GATE_CARD_ACTION':
        case 'SELECT_GATE_CARD':
            socket.emit('set-gate', {
                roomId,
                gateId: payload.gateId,
                slot: payload.slot,
                userId,
            })
            break
        case 'SET_BAKUGAN':
            socket.emit('set-bakugan', {
                roomId,
                bakuganKey: payload.bakuganKey,
                slot: payload.slot,
                userId,
            })
            break
        case 'USE_ABILITY_CARD':
            socket.emit('use-ability-card', {
                roomId,
                abilityId: payload.abilityId,
                slot: payload.slot,
                userId,
                bakuganKey: payload.bakuganKey,
            })
            break
        case 'OPEN_GATE_CARD':
        case 'ACTIVE_GATE_CARD':
            socket.emit('active-gate-card', {
                roomId,
                gateId: payload.gateId,
                slot: payload.slot,
                userId,
            })
            break
        case 'CHANGE_ATTRIBUTE':
            socket.emit('change-attribut', {
                roomId,
                attribut: payload.attribut,
                bakugan: payload.bakugan,
                userId,
            })
            break
        case 'SELECT_BAKUGAN':
        case 'SELECT_ABILITY_CARD':
            // Sélections mustDoOne sans emit dédié côté serveur actuel
            break
    }
}

function onParentMessage(event: MessageEvent) {
    const data = event.data as MessageToIframe | undefined
    if (!data?.type) return

    const current = getCtx()
    if (!current) return

    const targetingCtx = {
        camera: current.camera,
        scene: current.scene,
        plane: current.plane,
        userId: current.userId,
    }

    switch (data.type) {
        case 'ACTION_PARTIAL_SELECTION':
            startTurnTargeting(data.payload, targetingCtx)
            break
        case 'COMMIT_ACTION':
            cancelTurnTargeting(targetingCtx, false)
            emitCommit(data.payload)
            break
        case 'CANCEL_TARGETING':
            // Parent initie déjà le cancel : pas de notify pour éviter un race UI
            cancelTurnTargeting(targetingCtx, false)
            break
        case 'PASS_TURN':
            cancelTurnTargeting(targetingCtx, false)
            clearTurnInterface()
            current.socket.emit('clean-animation-table', { roomId: current.roomId })
            current.socket.emit('turn-action', {
                roomId: current.roomId,
                userId: current.userId,
            })
            break
        case 'CLEAR_TURN_UI':
            cancelTurnTargeting(targetingCtx, false)
            clearTurnInterface()
            break
        default:
            break
    }
}

function ensureMessageListener() {
    if (messageListenerAttached) return
    window.addEventListener('message', onParentMessage)
    messageListenerAttached = true
}

export function configureTurnActionBridge(next: BridgeContext) {
    ctx = next
    ensureMessageListener()
}

/**
 * Point d'entrée live : forward le request à Next et prépare le bridge 3D.
 * Remplace TurnActionInterfaceBuilder + TurnInteractionController.
 */
export function handleTurnActionRequest(
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
    next: BridgeContext,
) {
    configureTurnActionBridge(next)
    clearTurnInterface()
    cancelTurnTargeting(
        {
            camera: next.camera,
            scene: next.scene,
            plane: next.plane,
            userId: next.userId,
        },
        false,
    )
    notifyParentTurnActionRequest(request)
}
