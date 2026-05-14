import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { getStoragePath } from "@/lib/storage-utils"
import { addTranscodeJob } from "@/lib/queue"
import { logger } from "@/lib/logger"
import * as fs from "fs"
import * as path from "path"
import { pipeline } from "stream/promises"
import { createWriteStream } from "fs"

// Disable body parsing, we handle it raw with standard web APIs
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadDir = getStoragePath("uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const results = []

    for (const file of files) {
      // Create a unique filename
      const ext = path.extname(file.name) || '.mp4'
      const baseName = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${baseName}_${Date.now()}${ext}`
      const fullPath = path.join(uploadDir, filename)
      const relativePath = `uploads/${filename}`

      // Convert File to Node.js Readable stream and write to disk
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      fs.writeFileSync(fullPath, buffer)

      // Insert into DB
      const [newVideo] = await db.insert(videos).values({
        userId: session.user.id,
        title: file.name,
        filePath: relativePath,
        fileSize: file.size,
        status: 'queued', // Automatically queue it for HLS transcoding
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }).returning()

      // Queue for processing
      await addTranscodeJob({
        videoId: newVideo.id,
        filePath: relativePath
      })

      results.push({
        id: newVideo.id,
        name: file.name,
        status: 'processing'
      })
      
      logger.info(`File uploaded successfully: ${filename}`)
    }

    return NextResponse.json({ success: true, uploaded: results })
  } catch (error) {
    logger.error(error, "Upload API failure")
    return NextResponse.json({ error: "File upload failed" }, { status: 500 })
  }
}
