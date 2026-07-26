import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(duration)
dayjs.extend(relativeTime)

export type PlayerTimerEvent = {
    userId: string
    remaining: number
    deadlineAt?: number | null
    serverNow?: number
    running?: boolean
}

type ClockState = {
    remaining: number
    deadlineAt: number | null
    running: boolean
    skewMs: number
}

const clocks = new Map<string, ClockState>()
let localUserId: string | null = null
let rafId: number | null = null

function formatSeconds(totalSeconds: number) {
    const safe = Math.max(0, totalSeconds)
    const d = dayjs.duration(safe, "seconds")
    return `${String(d.minutes()).padStart(2, "0")}:${String(d.seconds()).padStart(2, "0")}`
}

function remainingFor(clock: ClockState, now = Date.now()) {
    if (clock.running && clock.deadlineAt != null) {
        // deadlineAt already adjusted for skew at apply time
        return Math.max(0, Math.ceil((clock.deadlineAt - now) / 1000))
    }
    return Math.max(0, clock.remaining)
}

function paint(userId: string, seconds: number) {
    if (!localUserId) return
    const el = document.getElementById(userId === localUserId ? "left-timer" : "right-timer")
    if (!el) return
    el.textContent = formatSeconds(seconds)
}

function tick() {
    const now = Date.now()
    for (const [userId, clock] of clocks) {
        paint(userId, remainingFor(clock, now))
    }
    const anyRunning = [...clocks.values()].some((c) => c.running && c.deadlineAt != null)
    if (anyRunning) {
        rafId = window.setTimeout(tick, 250) as unknown as number
    } else {
        rafId = null
    }
}

function ensureTicking() {
    if (rafId != null) return
    const anyRunning = [...clocks.values()].some((c) => c.running && c.deadlineAt != null)
    if (anyRunning) tick()
}

export function setLocalTimerUserId(userId: string) {
    localUserId = userId
}

export function applyPlayerTimer(event: PlayerTimerEvent) {
    const skewMs =
        typeof event.serverNow === "number" ? Date.now() - event.serverNow : 0
    const running =
        event.running ?? (event.deadlineAt != null && event.deadlineAt > 0)
    const rawDeadline = running ? (event.deadlineAt ?? null) : null
    const deadlineAt = rawDeadline != null ? rawDeadline + skewMs : null

    clocks.set(event.userId, {
        remaining: event.remaining,
        deadlineAt,
        running: Boolean(running && deadlineAt != null),
        skewMs,
    })

    paint(event.userId, remainingFor(clocks.get(event.userId)!))
    ensureTicking()
}

export function applyTimerSnapshots(
    timers: Array<{
        userId: string
        timer: number
        deadlineAt?: number | null
        running?: boolean
        serverNow?: number
    }>,
) {
    for (const t of timers) {
        applyPlayerTimer({
            userId: t.userId,
            remaining: t.timer,
            deadlineAt: t.deadlineAt ?? null,
            running: t.running,
            serverNow: t.serverNow,
        })
    }
}

export function clearPlayerTimers() {
    clocks.clear()
    if (rafId != null) {
        clearTimeout(rafId)
        rafId = null
    }
}
