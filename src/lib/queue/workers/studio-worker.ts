import { Worker, Job } from "bullmq"
import { redis as redisConnection } from "@/lib/redis"
import { logger } from "@/lib/logger"
import { VideoProcessor } from "@/lib/editor/ffmpeg"
import { TranscriptionService } from "@/lib/ai/transcription"
import { ThumbnailService } from "@/lib/ai/thumbnail"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const processor = new VideoProcessor()
const transcriptionService = new TranscriptionService()
const thumbnailService = new ThumbnailService()

interface StudioJobData {
  videoId: string
  inputPath: string
  outputPath: string
  options?: any
  type: "auto-cut" | "super-resolution" | "interpolation" | "transcribe" | "generate-thumbnails" | "render"
}

export const studioWorker = redisConnection ? new Worker(
  "studio-queue",
  async (job: Job<StudioJobData>) => {
    const { videoId, inputPath, outputPath, options, type } = job.data

    try {
      if (type === "auto-cut") {
        logger.info(`Starting auto-cut detection for video: ${videoId}`)
        const cuts = await processor.detectScenes(inputPath)
        
        // Update job progress and store results
        await job.updateProgress(100)
        return { cuts }
      }

      if (type === "super-resolution") {
        logger.info(`Starting super-resolution for video: ${videoId}`)
        await processor.superResolution(inputPath, outputPath)
        await job.updateProgress(100)
        return { success: true, outputPath }
      }

      if (type === "interpolation") {
        logger.info(`Starting frame interpolation for video: ${videoId}`)
        await processor.interpolateFrames(inputPath, outputPath)
        await job.updateProgress(100)
        return { success: true, outputPath }
      }

      if (type === "transcribe") {
        logger.info(`Starting AI transcription for video: ${videoId}`)
        const result = await transcriptionService.transcribe(inputPath)
        await job.updateProgress(100)
        return { success: true, ...result }
      }

      if (type === "generate-thumbnails") {
        logger.info(`Generating AI thumbnails for video: ${videoId}`)
        const thumbnails = await thumbnailService.generateVariations(inputPath, "./public/thumbnails")
        await job.updateProgress(100)
        return { success: true, thumbnails }
      }

      if (type === "render") {
        logger.info(`Starting render for video: ${videoId}`)
        
        // Simulate progress updates for telemetry
        for (let i = 0; i <= 100; i += 10) {
          await job.updateProgress(i)
          // Actually do the processing in chunks or just track the process
          if (i === 0) {
             await processor.processVideo(inputPath, outputPath, options)
          }
          await new Promise(r => setTimeout(r, 500))
        }

        // Update database status
        await db.update(videos)
          .set({ status: "published" })
          .where(eq(videos.id, videoId))

        return { success: true, outputPath }
      }
    } catch (error) {
      logger.error({ error }, `Studio job ${job.id} failed:`)
      throw error
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
) : null

if (studioWorker) {
  studioWorker.on("completed", (job) => {
    logger.info(`Studio job ${job.id} completed`)
  })

  studioWorker.on("failed", (job, err) => {
    logger.error(`Studio job ${job?.id} failed: ${err.message}`)
  })

  // Suppress connection spam
  studioWorker.on("error", (err) => {
    const error = err as NodeJS.ErrnoException
    if (error.code !== "ECONNREFUSED") {
      logger.error({ err }, "Worker unexpected error:")
    }
  })
}
