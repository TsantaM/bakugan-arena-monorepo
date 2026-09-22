import ReplayPage from "@/components/elements/replay/replay-page"
import { REPLAY_ENABLED } from "@/src/lib/replay/replay-flag"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default function Replay() {
    if (!REPLAY_ENABLED) notFound()

    return (
        <Suspense fallback={null}>
            <ReplayPage />
        </Suspense>
    )
}
