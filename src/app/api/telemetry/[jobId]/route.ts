import { NextRequest } from "next/server"
import { getJobStatus } from "@/lib/queue"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        const status = await getJobStatus("studio-queue", jobId)
        if (!status) return false

        const data = JSON.stringify(status)
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))

        if (status.status === "completed" || status.status === "failed") {
          return false
        }
        return true
      }

      // Initial update
      await sendUpdate()

      const interval = setInterval(async () => {
        const keepGoing = await sendUpdate()
        if (!keepGoing) {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      req.signal.onabort = () => {
        clearInterval(interval)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
