import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import fs from "fs"
import path from "path"
import { pipeline } from "stream/promises"
import { getStoragePath } from "@/lib/storage-utils"


export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 })
    }

    const localDest = getStoragePath("uploads", key)
    const destDir = path.dirname(localDest)
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // Use pipeline for efficient streaming and backpressure handling
    const writeStream = fs.createWriteStream(localDest)
    
    if (!request.body) {
      throw new Error("No request body")
    }

    // Readable.fromWeb(request.body) is needed if request.body is a web stream
    // In Next.js App Router, request.body is already a ReadableStream (web stream)
    // We can pipe it directly in modern Node environments or use Readable.fromWeb
    await pipeline(request.body as any, writeStream)

    logger.info(`Direct upload complete: ${key}`)

    return NextResponse.json({
      success: true,
      path: `/uploads/${key}`
    })
  } catch (error) {
    logger.error(error, "Direct upload failure")
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
