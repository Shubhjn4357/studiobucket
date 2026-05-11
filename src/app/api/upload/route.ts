import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addUploadJob } from "@/lib/queue"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const categoryId = formData.get("categoryId") as string
    const privacy = (formData.get("privacy") as string) || "private"
    const publishAt = formData.get("publishAt") as string

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      )
    }

    const videoId = randomUUID()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `/tmp/${fileName}`

    logger.info(`Upload initiated: ${videoId} for user ${session.user.id}`)

    const now = Math.floor(Date.now() / 1000)
    const newVideo = await db
      .insert(videos)
      .values({
        id: videoId,
        userId: session.user.id,
        title: title,
        description: description,
        tags: tags,
        categoryId: categoryId,
        privacyStatus: privacy as "public" | "private" | "unlisted",
        filePath: filePath,
        fileSize: file.size,
        status: "queued",
        publishAt: publishAt
          ? new Date(publishAt).getTime()
          : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning()

    const job = await addUploadJob({
      videoId: videoId,
      userId: session.user.id,
      channelId: session.user.id,
      filePath: filePath,
      title: title,
      description: description,
      tags: tags ? tags.split(",") : [],
      categoryId: categoryId,
      privacy: privacy as "public" | "private" | "unlisted",
      publishAt: publishAt
        ? Math.floor(new Date(publishAt).getTime() / 1000)
        : undefined,
    })

    if (job) {
      logger.info(`Upload job queued: ${job.id}`)
    } else {
      logger.warn("Upload job created in DB but queue is unavailable.")
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          video: newVideo[0],
          jobId: job?.id || null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error(error, "Upload error:")
    return NextResponse.json(
      { error: "Failed to upload video" },
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
    const status = searchParams.get("status")

    const conditions = [eq(videos.userId, session.user.id)]
    if (status) {
      conditions.push(eq(videos.status, status))
    }

    const userVideos = await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .limit(50)
      .orderBy(desc(videos.createdAt))

    logger.info(`Retrieved ${userVideos.length} upload videos for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: userVideos
    })
  } catch (error) {
    logger.error(error, "Upload GET error:")
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}
