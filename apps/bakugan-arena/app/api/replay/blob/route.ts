import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request): Promise<Response> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: HandleUploadBody

    try {
        body = (await request.json()) as HandleUploadBody
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: ["application/json"],
                maximumSizeInBytes: 100 * 1024 * 1024,
            }),
            onUploadCompleted: async () => {},
        })

        return Response.json(jsonResponse)
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 400 },
        )
    }
}
