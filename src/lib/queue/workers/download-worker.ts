import { Worker, Job } from "bullmq"
import Redis from "ioredis"
import { DownloadJobSchema, addTranscodeJob } from "../index"
import { db } from "@/lib/db"
import { downloadJobs, videos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"
import pino from "pino"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

const logger = pino({ level: "info" })
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export class DownloadWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      "download-queue",
      async (job: Job) => {
        await this.processDownload(job)
      },
      {
        connection,
        concurrency: 2,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    )

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.worker.on("completed", (job) => {
      logger.info(`Download job completed: ${job?.id}`)
    })

    this.worker.on("failed", (job, err) => {
      logger.error(err, `Download job failed: ${job?.id}`)
    })
  }

  private async processDownload(job: Job) {
    const data = DownloadJobSchema.parse(job.data)
    const outputDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputFileName = `download-${job.id}.mp4`
    const outputPath = path.join(outputDir, outputFileName)

    try {
      await db.update(downloadJobs)
        .set({ status: "downloading", updatedAt: Date.now() })
        .where(eq(downloadJobs.id, job.id as string))

      const args = [
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--newline",
        "-o", outputPath,
        data.sourceUrl
      ]

      logger.info(`Starting download: ${data.sourceUrl}`)

      const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"
      const downloadProcess = spawn(ytDlpPath, args)

      downloadProcess.stdout.on("data", async (dataBuffer) => {
        const output = dataBuffer.toString()
        const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/)
        if (progressMatch) {
          const progress = Math.round(parseFloat(progressMatch[1]))
          await db.update(downloadJobs)
            .set({ progress, updatedAt: Date.now() })
            .where(eq(downloadJobs.id, job.id as string))
        }
      })

      const exitCode = await new Promise((resolve) => {
        downloadProcess.on("close", resolve)
      })

      if (exitCode !== 0) {
        throw new Error(`yt-dlp exited with code ${exitCode}`)
      }

      await db.update(downloadJobs)
        .set({ 
          status: "completed", 
          progress: 100,
          outputPath: `/uploads/${outputFileName}`,
          updatedAt: Date.now() 
        })
        .where(eq(downloadJobs.id, job.id as string))

      // Create a video record for the library
      const videoId = randomUUID()
      await db.insert(videos).values({
        id: videoId,
        userId: data.userId,
        title: `Downloaded Asset ${job.id}`,
        filePath: `uploads/${outputFileName}`,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Enqueue HLS Transcoding
      await addTranscodeJob({
        videoId: videoId,
        filePath: `uploads/${outputFileName}`
      })

      logger.info(`Download completed: ${outputPath}. Transcode job queued.`)
      return { videoId, outputPath: `/uploads/${outputFileName}` }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(error, "Download failed:")
      await db.update(downloadJobs)
        .set({ 
          status: "failed", 
          errorMessage,
          updatedAt: Date.now() 
        })
        .where(eq(downloadJobs.id, job.id as string))
      throw error
    }
  }

  async close() {
    await this.worker.close()
  }
}

export const downloadWorker = new DownloadWorker()
