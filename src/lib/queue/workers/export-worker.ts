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
import { VideoProject } from "@/types/video"

const logger = pino({ level: "info" })
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export class ExportWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      "export-queue",
      async (job: Job) => {
        await this.processExport(job)
      },
      {
        connection,
        concurrency: 1,
      }
    )
  }

  private async processExport(job: Job) {
    const { videoId, project }: { videoId: string, project: VideoProject } = job.data
    const { getStoragePath } = await import("@/lib/storage-utils")
    const exportDir = getStoragePath("exports")
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true })

    const outputPath = path.join(exportDir, `${videoId}-final.mp4`)
    const ffmpegPath = ffmpegStatic || "ffmpeg"

    try {
      await db.update(videos).set({ status: "processing" }).where(eq(videos.id, videoId))

      const inputs: string[] = []
      let filterComplex = ""
      let inputIdx = 0

      // PRE-PROCESS CLIPS & TRANSITIONS
      project.tracks.forEach(track => {
        track.clips.forEach(clip => {
          const inputPath = getStoragePath("uploads", clip.assetId || "")
          if (fs.existsSync(inputPath)) {
             inputs.push("-ss", clip.offset.toString(), "-t", clip.duration.toString(), "-i", inputPath)
             
             const volume = clip.volume ?? 1
             const fadeDuration = 0.5 // Standard 500ms fade
             
             // Base filter for the clip: Scale, Format, and Opacity
             let clipFilter = `[${inputIdx}:v]setpts=PTS-STARTPTS, scale=${project.resolution.width}:${project.resolution.height}, format=yuva420p`
             
             // Apply Fade Transitions if specified
             if (clip.transitionIn === "fade") {
               clipFilter += `, fade=t=in:st=0:d=${fadeDuration}`
             }
             if (clip.transitionOut === "fade") {
               clipFilter += `, fade=t=out:st=${clip.duration - fadeDuration}:d=${fadeDuration}`
             }
             
             filterComplex += `${clipFilter}[v${inputIdx}];`
             filterComplex += `[${inputIdx}:a]volume=${volume}[a${inputIdx}];`
             inputIdx++
          }
        })
      })

      // COMPOSITING ENGINE
      let lastVOutput = "v0"
      let lastAOutput = "a0"
      for (let i = 1; i < inputIdx; i++) {
          const nextVOutput = `vout${i}`
          const nextAOutput = `aout${i}`
          // Overlay clips based on their start times (simplified for this linear demo)
          filterComplex += `[${lastVOutput}][v${i}]overlay=eof_action=pass[${nextVOutput}];`
          filterComplex += `[${lastAOutput}][a${i}]amix=inputs=2[${nextAOutput}];`
          lastVOutput = nextVOutput
          lastAOutput = nextAOutput
      }

      const args = [
        ...inputs,
        "-filter_complex", filterComplex.slice(0, -1),
        "-map", `[${lastVOutput}]`,
        "-map", `[${lastAOutput}]`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-y",
        outputPath
      ]

      return new Promise((resolve, reject) => {
        const renderProcess = spawn(ffmpegPath, args)
        
        renderProcess.stderr.on("data", (data) => {
          const log = data.toString()
          const timeMatch = log.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/)
          if (timeMatch) {
             const [h, m, s] = timeMatch[1].split(":").map(parseFloat)
             const progress = Math.min(Math.round(((h * 3600 + m * 60 + s) / project.duration) * 100), 100)
             job.updateProgress(progress)
          }
        })

        renderProcess.on("close", async (code) => {
          if (code === 0) {
            const isProd = process.env.NODE_ENV === "production"
            await db.update(videos).set({ 
              status: "published", 
              filePath: isProd ? `/storage/exports/${videoId}-final.mp4` : `/exports/${videoId}-final.mp4`,
              updatedAt: Date.now() 
            }).where(eq(videos.id, videoId))
            resolve(true)
          } else {
            reject(new Error(`FFmpeg Render Protocol Failure: ${code}`))
          }
        })
      })

    } catch (error) {
      logger.error(error, "Render Engine failure:")
      await db.update(videos).set({ status: "failed", errorMessage: String(error) }).where(eq(videos.id, videoId))
      throw error
    }
  }
}
