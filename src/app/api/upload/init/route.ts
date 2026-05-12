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

    const videoId = randomUUID()
    const storageKey = `${Date.now()}-${filename}`
    
    // Get Pre-signed URL or direct upload path
    const { url } = await StorageEngine.getPresignedUrl(storageKey, fileType)
    const storedPath = StorageEngine.getUrl(storageKey)

    // Create initial DB record in 'pending' or 'uploading' state
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

    logger.info(`Upload initialized: ${videoId} for user ${session.user.id}. Strategy: ${url.includes('api/upload') ? 'Local' : 'Cloud'}`)

    return NextResponse.json({
      success: true,
      videoId,
      uploadUrl: url,
      storedPath
    })
  } catch (error) {
    logger.error(error, "Upload Init failure")
    return NextResponse.json({ error: "Protocol initialization failed" }, { status: 500 })
  }
}
