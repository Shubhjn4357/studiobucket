import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getQueueStatus, pauseQueue, resumeQueue, clearQueue } from "@/lib/queue"
import { db } from "@/lib/db"
import { uploadJobs } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queueName = searchParams.get("queue") || "upload-queue"

    const status = await getQueueStatus(queueName)
    const jobs = await db
      .select()
      .from(uploadJobs)
      .where(eq(uploadJobs.userId, session.user.id))
      .limit(50)
      .orderBy(desc(uploadJobs.createdAt))

    logger.info(`Queue status retrieved for ${queueName}`)

    return NextResponse.json({
      success: true,
      data: {
        status,
        jobs,
      },
    })
  } catch (error) {
    logger.error(error, "Queue API error:")
    return NextResponse.json(
      { error: "Failed to fetch queue status" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, queueName } = body

    switch (action) {
      case "pause":
        await pauseQueue(queueName)
        logger.info(`Queue paused: ${queueName}`)
        return NextResponse.json({
          success: true,
          message: `Queue ${queueName} paused`,
        })

      case "resume":
        await resumeQueue(queueName)
        logger.info(`Queue resumed: ${queueName}`)
        return NextResponse.json({
          success: true,
          message: `Queue ${queueName} resumed`,
        })

      case "clear":
        await clearQueue(queueName)
        logger.info(`Queue cleared: ${queueName}`)
        return NextResponse.json({
          success: true,
          message: `Queue ${queueName} cleared`,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    logger.error(error, "Queue POST error:")
    return NextResponse.json(
      { error: "Failed to process queue action" },
      { status: 500 }
    )
  }
}
