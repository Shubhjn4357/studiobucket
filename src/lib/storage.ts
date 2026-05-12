import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import fs from "fs"
import path from "path"
import { logger } from "./logger"

const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY
const R2_SECRET_KEY = process.env.R2_SECRET_KEY
const R2_BUCKET = process.env.R2_BUCKET
const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, "")

const isCloudEnabled = !!(R2_ACCESS_KEY && R2_SECRET_KEY && R2_BUCKET && R2_ENDPOINT)

const s3Client = isCloudEnabled ? new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY!,
    secretAccessKey: R2_SECRET_KEY!,
  },
}) : null

export class StorageEngine {
  /**
   * Uploads a file to Cloudflare R2 or local fallback
   * @param filePath Path to the local file to upload
   * @param key Desired key (filename/path) in storage
   * @param contentType MIME type of the file
   */
  static async uploadFile(filePath: string, key: string, contentType?: string): Promise<string> {
    try {
      if (isCloudEnabled && s3Client) {
        logger.info(`Cloud Storage Protocol: Initiating R2 upload for ${key}`)
        
        // Use stream for memory efficiency on large video files
        const fileStream = fs.createReadStream(filePath)
        
        await s3Client.send(new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: contentType,
        }))
        
        return `${R2_PUBLIC_URL}/${key}`
      } else {
        logger.info(`Local Storage Protocol: Fallback enabled for ${key}`)
        const localDest = path.join(process.cwd(), "public", "uploads", key)
        const destDir = path.dirname(localDest)
        
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
        
        // If we are already there (e.g. download worker), skip copy
        if (path.resolve(filePath) !== path.resolve(localDest)) {
           fs.copyFileSync(filePath, localDest)
        }
        
        return `/uploads/${key}`
      }
    } catch (error) {
      logger.error(error, `Storage Engine Failure during upload of ${key}`)
      throw error
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      if (isCloudEnabled && s3Client) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        }))
      } else {
        const localPath = path.join(process.cwd(), "public", "uploads", key)
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
      }
    } catch (error) {
      logger.error(error, `Storage Engine Failure during deletion of ${key}`)
    }
  }

  /**
   * Returns the accessible URL for a stored key
   */
  static getUrl(key: string): string {
    if (isCloudEnabled) {
      return `${R2_PUBLIC_URL}/${key}`
    }
    return `/uploads/${key}`
  }

  static async getPresignedUrl(key: string, contentType: string): Promise<{ url: string; fields?: Record<string, string> }> {
    if (!isCloudEnabled || !s3Client) {
      // Local fallback doesn't support pre-signed URLs in the same way
      return { url: `/api/upload/direct?key=${key}&type=${contentType}` }
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return { url }
  }
}
