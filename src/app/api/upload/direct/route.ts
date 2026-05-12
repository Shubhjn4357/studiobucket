import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import fs from "fs"
import path from "path"


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

    const localDest = path.join(process.cwd(), "public", "uploads", key)
    const destDir = path.dirname(localDest)
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // Direct stream from request to file
    const reader = request.body?.getReader()
    if (!reader) {
      throw new Error("No request body")
    }

    const writeStream = fs.createWriteStream(localDest)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      writeStream.write(value)
    }

    writeStream.end()

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
