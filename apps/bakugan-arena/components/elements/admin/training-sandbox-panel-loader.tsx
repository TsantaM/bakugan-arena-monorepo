"use client"

import dynamic from "next/dynamic"

const TrainingSandboxPanel = dynamic(
    () => import("./training-sandbox-panel"),
    { ssr: false },
)

export default function TrainingSandboxPanelLoader() {
    return <TrainingSandboxPanel />
}
