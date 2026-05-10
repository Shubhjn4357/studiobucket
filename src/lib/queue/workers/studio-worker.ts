import { Worker, Job } from "bullmq"
import { redis as redisConnection } from "@/lib/redis"
import { logger } from "@/lib/logger"
import { VideoProcessor } from "@/lib/editor/ffmpeg"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const processor = new VideoProcessor()

export const studioWorker = redisConnection ? new Worker(
  "studio-queue",
  async (job: Job) => {
    const { videoId, inputPath, outputPath, options, type } = job.data

    try {
      if (type === "auto-cut") {
        logger.info(`Starting auto-cut detection for video: ${videoId}`)
        const cuts = await processor.detectScenes(inputPath)
        
        // Update job progress and store results
        await job.updateProgress(100)
        return { cuts }
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
}
