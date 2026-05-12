import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addUploadJob, addTranscodeJob } from "@/lib/queue"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { randomUUID } from "crypto"
import fs from "fs"
import path from "path"
import { StorageEngine } from "@/lib/storage"

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
    
    // Write the file to a temp location first
    const tempPath = path.join(process.cwd(), "public", "uploads", `temp-${fileName}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(tempPath, buffer)

    // Upload to Storage Engine (R2 or Local Fallback)
    const storedPath = await StorageEngine.uploadFile(tempPath, fileName, file.type)
    
    // Cleanup temp file if it's different from the stored path
    if (tempPath !== path.join(process.cwd(), "public", storedPath)) {
        fs.unlinkSync(tempPath)
    }

    logger.info(`Upload initiated: ${videoId} for user ${session.user.id}. File saved to ${storedPath}`)

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
        filePath: storedPath,
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
      filePath: storedPath,
      title: title,
      description: description,
      tags: tags ? tags.split(",") : [],
      categoryId: categoryId,
      privacy: privacy as "public" | "private" | "unlisted",
      publishAt: publishAt
        ? Math.floor(new Date(publishAt).getTime() / 1000)
        : undefined,
    })

    // Enqueue HLS Transcoding
    await addTranscodeJob({
      videoId: videoId,
      filePath: storedPath
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
