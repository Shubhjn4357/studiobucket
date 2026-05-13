import { Worker, Job } from "bullmq"
import Redis from "ioredis"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import pino from "pino"
import { spawn } from "child_process"
import ffmpegStatic from "ffmpeg-static"
import path from "path"
import fs from "fs"

const logger = pino({ level: "info" })
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export class TranscodeWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      "transcode-queue",
      async (job: Job) => {
        await this.processTranscode(job)
      },
      {
        connection,
        concurrency: 1,
      }
    )
  }

  private async processTranscode(job: Job) {
    const { videoId, filePath } = job.data
    const { getStoragePath } = await import("@/lib/storage-utils")
    const absoluteInputPath = getStoragePath("uploads", filePath)
    const hlsOutputDir = getStoragePath("hls", videoId)

    if (!fs.existsSync(hlsOutputDir)) {
      fs.mkdirSync(hlsOutputDir, { recursive: true })
    }


    const ffmpegPath = ffmpegStatic || "ffmpeg"

    try {
      await db.update(videos)
        .set({ status: "processing", updatedAt: Date.now() })
        .where(eq(videos.id, videoId))

      // Adaptive Bitrate Strategy (1080p, 720p, 480p)
      const args = [
        "-i", absoluteInputPath,
        "-filter_complex", 
        "[0:v]split=3[v1,v2,v3]; [v1]scale=w=1920:h=1080[v1out]; [v2]scale=w=1280:h=720[v2out]; [v3]scale=w=854:h=480[v3out]",
        
        // 1080p
        "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "5000k", "-maxrate:v:0", "5350k", "-bufsize:v:0", "7500k",
        // 720p
        "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "2800k", "-maxrate:v:1", "2996k", "-bufsize:v:1", "4200k",
        // 480p
        "-map", "[v3out]", "-c:v:2", "libx264", "-b:v:2", "1400k", "-maxrate:v:2", "1498k", "-bufsize:v:2", "2100k",
        
        "-map", "0:a", "-c:a", "aac", "-b:a", "128k", "-ac", "2",
        
        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-master_pl_name", "master.m3u8",
        "-hls_segment_filename", path.join(hlsOutputDir, "v%v/segment%d.ts"),
        path.join(hlsOutputDir, "v%v/playlist.m3u8")
      ]

      // Ensure subdirectories for variants exist
      ;["v0", "v1", "v2"].forEach(v => {
        const dir = path.join(hlsOutputDir, v)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      })

      return new Promise((resolve, reject) => {
        const transcodeProcess = spawn(ffmpegPath, args)

        transcodeProcess.stderr.on("data", (data) => {
           const output = data.toString()
           const timeMatch = output.match(/time=(\d{2}:\d{2}:\d{2}.\d{2})/)
           if (timeMatch) {
             logger.info(`Transcoding ABR ${videoId} progress: ${timeMatch[1]}`)
           }
        })

        transcodeProcess.on("close", async (code) => {
          if (code === 0) {
            logger.info(`ABR HLS generation finished for ${videoId}`)
            
            await db.update(videos)
              .set({ 
                hlsPath: process.env.NODE_ENV === "production" ? `/storage/hls/${videoId}/master.m3u8` : `/hls/${videoId}/master.m3u8`,
                status: "uploaded",
                updatedAt: Date.now() 
              })
              .where(eq(videos.id, videoId))
              
            resolve(true)
          } else {
            reject(new Error(`FFmpeg ABR failure code ${code}`))
          }
        })

        transcodeProcess.on("error", (err) => {
          reject(err)
        })
      })

    } catch (error) {
      logger.error(error, `ABR Transcoding failed for ${videoId}:`)
      await db.update(videos)
        .set({ 
          status: "failed", 
          errorMessage: error instanceof Error ? error.message : "ABR Transcoding failed",
          updatedAt: Date.now() 
        })
        .where(eq(videos.id, videoId))
      throw error
    }
  }

  async close() {
    await this.worker.close()
  }
}
