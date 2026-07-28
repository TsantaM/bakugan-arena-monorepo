import { readFile } from "node:fs/promises"
import path from "node:path"

const DOC_PATH = path.join(
    process.cwd(),
    "content/admin/game-logs-documentation.md",
)

export async function readGameLogsDocumentation(): Promise<string> {
    return readFile(DOC_PATH, "utf-8")
}
