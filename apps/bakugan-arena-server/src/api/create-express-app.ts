import express from "express"
import { GetReplay } from "./replay/get-replay"
import { GetReplayMeta } from "./replay/get-replay-meta"
import { PostReplay } from "./replay/post-replay"

function applyCors(req: express.Request, res: express.Response, next: express.NextFunction) {
    const configuredOrigins = process.env.SOCKET_CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? ["*"]
    const requestOrigin = req.headers.origin

    if (requestOrigin && (configuredOrigins.includes("*") || configuredOrigins.includes(requestOrigin))) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin)
    } else if (configuredOrigins.includes("*")) {
        res.setHeader("Access-Control-Allow-Origin", "*")
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.sendStatus(204)
        return
    }

    next()
}

export function createExpressApp() {
    const app = express()

    app.use(applyCors)
    app.use(express.json({ limit: "50mb" }))

    app.get("/health", (_req, res) => {
        res.json({ ok: true })
    })
    app.post("/api/replay", PostReplay)
    app.get("/api/replay/:replayId/meta", GetReplayMeta)
    app.get("/api/replay/:replayId", GetReplay)

    return app
}
