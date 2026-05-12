import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { addTranscodeJob } from "@/lib/queue"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 })
    }

    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, session.user.id)))

    if (!video) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Update status and trigger transcode
    await db.update(videos)
      .set({ 
        status: "queued",
        updatedAt: Date.now()
      })
      .where(eq(videos.id, videoId))

    await addTranscodeJob({
      videoId: video.id,
      filePath: video.filePath!
    })

    logger.info(`Upload finalized: ${videoId}. Pipeline initiated.`)

    return NextResponse.json({
      success: true,
      status: "queued"
    })
  } catch (error) {
    logger.error(error, "Upload Finalize failure")
    return NextResponse.json({ error: "Pipeline synchronization failed" }, { status: 500 })
  }
}
