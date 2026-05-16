import { NextRequest, NextResponse } from "next/server"
import { getStoragePath } from "@/lib/storage-utils"
import fs from "fs"
import path from "path"
import { logger } from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string[] } }
) {
  try {
    // Join the key segments to form the storage key
    const key = params.key.join("/")

    if (!key) {
      return new NextResponse("Invalid key", { status: 400 })
    }

    // Get the absolute path to the file
    const filePath = getStoragePath("uploads", key)

    // Security check: ensure the file path is within the storage directory
    const storageRoot = getStoragePath("uploads")
    const resolvedPath = path.resolve(filePath)
    const resolvedRoot = path.resolve(storageRoot)

    if (!resolvedPath.startsWith(resolvedRoot)) {
      logger.info(`Path traversal attempt detected: ${key}`)
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      logger.warn(`File not found: ${key}`)
      return new NextResponse("File not found", { status: 404 })
    }

    // Get file stats for headers
    const stats = fs.statSync(resolvedPath)

    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.txt': 'text/plain',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Create read stream
    const fileStream = fs.createReadStream(resolvedPath)

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
    })

    // For Next.js App Router, we can return a Readable stream directly
    // @ts-ignore - Node.js Readable stream is compatible with NextResponse BodyInit in runtime
    return new NextResponse(fileStream as any, { headers })
  } catch (error) {
    logger.error(error, "Storage file serving error")
    return new NextResponse("Internal server error", { status: 500 })
  }
}