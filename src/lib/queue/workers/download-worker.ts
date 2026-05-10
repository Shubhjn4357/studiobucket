import { Worker, Job } from "bullmq"
import Redis from "ioredis"
import { DownloadJobSchema } from "../index"
import { db } from "@/lib/db"
import { downloadJobs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import pino from "pino"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)
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
    const outputDir = path.join(process.cwd(), "public", "uploads")
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputFileName = `download-${job.id}.mp4`
    const outputPath = path.join(outputDir, outputFileName)

    try {
      await db.update(downloadJobs)
        .set({ status: "downloading", updatedAt: Math.floor(Date.now() / 1000) })
        .where(eq(downloadJobs.id, job.id as string))

      // Use yt-dlp to download
      // Format: mp4, best quality
      const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${data.sourceUrl}"`
      
      logger.info(`Starting download: ${data.sourceUrl}`)
      
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr && !stdout) {
        logger.warn(`yt-dlp warning: ${stderr}`)
      }

      await db.update(downloadJobs)
        .set({ 
          status: "completed", 
          outputPath: `/uploads/${outputFileName}`,
          updatedAt: Math.floor(Date.now() / 1000) 
        })
        .where(eq(downloadJobs.id, job.id as string))

      logger.info(`Download completed: ${outputPath}`)
      return { outputPath: `/uploads/${outputFileName}` }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(error, "Download failed:")
      await db.update(downloadJobs)
        .set({ 
          status: "failed", 
          errorMessage,
          updatedAt: Math.floor(Date.now() / 1000) 
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
