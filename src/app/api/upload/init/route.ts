import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { StorageEngine } from "@/lib/storage"
import { randomUUID } from "crypto"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, fileType, fileSize, title, description } = await request.json()

    if (!filename || !fileType) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
    }

    logger.info(`Initialising upload for user ${session.user.id}: ${filename} (${formatSize(fileSize)})`)

    const videoId = randomUUID()
    const storageKey = `${Date.now()}-${filename}`
    
    // Get Pre-signed URL or direct upload path
    logger.debug(`Generating presigned URL for ${storageKey}`)
    const { url } = await StorageEngine.getPresignedUrl(storageKey, fileType)
    const storedPath = StorageEngine.getUrl(storageKey)

    // Create initial DB record
    logger.debug(`Inserting video record ${videoId} into DB`)
    try {
      await db.insert(videos).values({
        id: videoId,
        userId: session.user.id,
        title: title || filename,
        description: description || "",
        filePath: storedPath,
        fileSize: fileSize,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    } catch (dbError) {
      logger.error(dbError, `DB insertion failed for video ${videoId}`)
      throw new Error("Database synchronization failure during protocol initialization")
    }

    logger.info(`Upload initialized: ${videoId}. Strategy: ${url.includes('api/upload') ? 'Local' : 'Cloud'}`)

    return NextResponse.json({
      success: true,
      videoId,
      uploadUrl: url,
      storedPath
    })
  } catch (error: unknown) {
    const err = error as Error
    logger.error(err, "Upload Init failure")
    return NextResponse.json({ 
      error: err.message || "Protocol initialization failed" 
    }, { status: 500 })
  }
}

function formatSize(bytes: number) {
    if (!bytes) return "0B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}
