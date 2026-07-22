export const ELO_DECAY_GRACE_DAYS = 15
export const ELO_DECAY_PER_WEEK = 25
export const ELO_MIN = 1000

export function computeDecayedElo(storedElo: number, lastRankedAt: Date | null): number {
    if (storedElo <= ELO_MIN || !lastRankedAt) return storedElo

    const msPerDay = 1000 * 60 * 60 * 24
    const daysInactive = (Date.now() - lastRankedAt.getTime()) / msPerDay

    if (daysInactive <= ELO_DECAY_GRACE_DAYS) return storedElo

    const weeksOverGrace = Math.floor((daysInactive - ELO_DECAY_GRACE_DAYS) / 7)
    return Math.max(ELO_MIN, storedElo - weeksOverGrace * ELO_DECAY_PER_WEEK)
}
