import { Worker, Job } from "bullmq"
import Redis from "ioredis"
import { UploadJobSchema } from "../index"
import { db } from "@/lib/db"
import { videos, uploadJobs, users, notifications, analytics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { google } from "googleapis"
import pino from "pino"
import { videoProcessor } from "@/lib/editor/ffmpeg"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const logger = pino({ level: "info" })
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export class UploadWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      "upload-queue",
      async (job: Job) => {
        await this.processUpload(job)
      },
      {
        connection,
        concurrency: 3,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    )

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.worker.on("completed", (job) => {
      logger.info(`Upload job completed: ${job?.id}`)
    })

    this.worker.on("failed", (job, err) => {
      logger.error(err, `Upload job failed: ${job?.id}`)
    })

    this.worker.on("error", (error) => {
      logger.error(error, "Upload worker error:")
    })
  }

  private async processUpload(job: Job) {
    try {
      const data = UploadJobSchema.parse(job.data)

      // Update video status to processing
      await db.update(videos)
        .set({
          status: "processing",
          updatedAt: Date.now()
        })
        .where(eq(videos.id, data.videoId))

      // Update job status
      await db.update(uploadJobs)
        .set({
          status: "active",
          progress: 10,
          updatedAt: Date.now()
        })
        .where(eq(uploadJobs.id, job.id as string))

      // Get user's OAuth tokens
      const userRecord = await db.query.users.findFirst({
        where: eq(users.id, data.userId),
        with: {
          accounts: true
        }
      })

      if (!userRecord?.accounts[0]?.access_token) {
        throw new Error("No OAuth tokens found for user")
      }

      const accessToken = userRecord.accounts[0].access_token
      const refreshToken = userRecord.accounts[0].refresh_token

      // Initialize YouTube API
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      })

      // Update progress
      await db.update(uploadJobs)
        .set({ progress: 30 })
        .where(eq(uploadJobs.id, job.id as string))

      // Upload video
      const res = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: data.title,
            description: data.description || "",
            tags: data.tags || [],
            categoryId: data.categoryId || "22", // Default to "People & Blogs"
            defaultLanguage: "en",
            defaultAudioLanguage: "en",
          },
          status: {
            privacyStatus: data.privacy,
            publishAt: data.publishAt ? new Date(data.publishAt).toISOString() : undefined,
          },
        },
        media: {
          body: await import("fs").then(fs => fs.createReadStream(data.filePath)),
        },
      })

      // Update progress
      await db.update(uploadJobs)
        .set({ progress: 80 })
        .where(eq(uploadJobs.id, job.id as string))

      const videoData = res.data
      if (!videoData.id) {
        throw new Error("Failed to upload video")
      }

      // Update video record with YouTube video ID
      await db.update(videos)
        .set({
          youtubeVideoId: videoData.id,
          status: "uploaded",
          uploadedAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(eq(videos.id, data.videoId))

      // Post-processing: Generate thumbnail
      try {
        const { getStoragePath } = await import("@/lib/storage-utils")
        const thumbnailDir = getStoragePath("thumbnails")
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true })
        }
        const thumbName = `${data.videoId}.jpg`
        const thumbnailPath = path.join(thumbnailDir, thumbName)
        const isProd = process.env.NODE_ENV === "production"
        const publicThumbnailPath = isProd ? `/storage/thumbnails/${thumbName}` : `/thumbnails/${thumbName}`
        
        await videoProcessor.generateThumbnail(data.filePath, thumbnailPath)
        await db.update(videos)
          .set({ thumbnailPath: publicThumbnailPath })
          .where(eq(videos.id, data.videoId))
          
        logger.info(`Generated thumbnail for video: ${data.videoId}`)
      } catch (thumbError) {
        logger.error(`Thumbnail generation failed for ${data.videoId}: ${thumbError}`)
      }

      // Create Success Notification
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: data.userId,
        title: "Upload Successful",
        description: `Video "${data.title}" has been uploaded to YouTube.`,
        type: "success",
        createdAt: Date.now(),
      })

      // Create initial analytics record
      await db.insert(analytics).values({
        id: crypto.randomUUID(),
        userId: data.userId,
        channelId: data.channelId,
        videoId: data.videoId,
        date: new Date().toISOString().split("T")[0],
        views: 0,
        likes: 0,
        comments: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update job status
      await db.update(uploadJobs)
        .set({
          status: "completed",
          progress: 100,
          completedAt: Date.now(),
          updatedAt: Date.now(),
          result: JSON.stringify({ videoId: videoData.id }),
        })
        .where(eq(uploadJobs.id, job.id as string))

      logger.info(`Successfully uploaded video: ${data.videoId} -> ${videoData.id}`)

      return { videoId: videoData.id }

    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Upload failed: ${error.message}`)
        // Update video status to failed
        await db.update(videos)
          .set({
            status: "failed",
            errorMessage: error.message,
            updatedAt: Date.now()
          })
          .where(eq(videos.id, job.data.videoId))
  
        // Update job status
        await db.update(uploadJobs)
          .set({
            status: "failed",
            error: error.message,
            updatedAt: Date.now()
          })
          .where(eq(uploadJobs.id, job.id as string))
      } else {
        logger.error(`Upload failed: ${error}`)
      }
      throw error
    }
  }

  async close() {
    await this.worker.close()
  }
}

// Create and export worker instance
export const uploadWorker = new UploadWorker()
