import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videoSchedules, videos } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      videoId,
      scheduledAt,
      timezone,
      isRecurring,
      recurrencePattern,
    } = body

    if (!videoId || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const scheduleId = randomUUID()
    const scheduledTime = new Date(scheduledAt).getTime()

    await db.insert(videoSchedules).values({
      id: scheduleId,
      videoId,
      scheduledAt: scheduledTime,
      timezone: timezone || "UTC",
      isRecurring: isRecurring || false,
      recurrencePattern: recurrencePattern
        ? JSON.stringify(recurrencePattern)
        : undefined,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await db
      .update(videos)
      .set({
        status: "scheduled",
        publishAt: scheduledTime,
        updatedAt: Date.now(),
      })
      .where(eq(videos.id, videoId))

    logger.info(`Schedule created: ${scheduleId} for video ${videoId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: scheduleId,
        videoId,
        scheduledAt: scheduledTime,
      },
    })
  } catch (error) {
    logger.error(error, "Schedule API error:")
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    const conditions = [eq(videos.userId, session.user.id)]
    if (videoId) {
      conditions.push(eq(videoSchedules.videoId, videoId))
    }

    const schedules = await db
      .select({
        schedule: videoSchedules,
        video: videos,
      })
      .from(videoSchedules)
      .innerJoin(videos, eq(videoSchedules.videoId, videos.id))
      .where(and(...conditions))
      .limit(limit)
      .orderBy(desc(videoSchedules.scheduledAt))

    logger.info(`Retrieved ${schedules.length} schedules for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: schedules,
    })
  } catch (error) {
    logger.error(error, "Schedule GET error:")
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    )
  }
}
