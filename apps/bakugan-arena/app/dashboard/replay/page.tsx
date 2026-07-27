import ReplayPage from "@/components/elements/replay/replay-page"
import { Suspense } from "react"

export default function Replay() {
    return (
        <Suspense fallback={null}>
            <ReplayPage />
        </Suspense>
    )
}
