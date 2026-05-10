import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { VideoService } from "@/lib/services/video-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const videoService = new VideoService()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          const [notifications, queueStatus] = await Promise.all([
            videoService.getNotifications(userId, 5),
            videoService.getQueueStatus(userId)
          ])

          const data = JSON.stringify({ notifications, queueStatus, timestamp: Date.now() })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch (err) {
          console.error("SSE Update Error:", err)
        }
      }

      // Initial send
      await sendUpdate()

      // Set up interval
      const interval = setInterval(sendUpdate, 3000) // 3 seconds for "Mission Control" feel

      req.signal.onabort = () => {
        clearInterval(interval)
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
