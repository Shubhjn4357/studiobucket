import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import { db } from "@/lib/db"
import { downloadJobs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import pino from "pino"

const logger = pino({ level: "info" })


export interface DownloadOptions {
  format?: string
  quality?: string
  extractAudio?: boolean
  audioFormat?: string
  outputDir?: string
  metadata?: boolean
  subtitles?: boolean
  embedThumbnail?: boolean
}

export interface VideoInfo {
  id: string
  title: string
  duration: number
  uploader: string
  uploadDate: string
  viewCount: number
  likeCount: number
  description: string
  thumbnail: string
  formats: Array<{
    formatId: string
    ext: string
    quality: string
    fps?: number
    size?: number
  }>
}

export class DownloadService {
  private ytDlpPath: string

  constructor() {
    this.ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const args = [
      "--dump-json",
      "--no-download",
      url,
    ]

    return new Promise((resolve, reject) => {
      const process = spawn(this.ytDlpPath, args)
      let output = ""
      let errorOutput = ""

      process.stdout.on("data", (data) => {
        output += data.toString()
      })

      process.stderr.on("data", (data) => {
        errorOutput += data.toString()
      })

      process.on("close", (code) => {
        if (code !== 0) {
          logger.error(`yt-dlp info extraction failed: ${errorOutput}`)
          reject(new Error(`Failed to get video info: ${errorOutput}`))
          return
        }

        try {
          const info = JSON.parse(output)
          resolve({
            id: info.id,
            title: info.title,
            duration: info.duration,
            uploader: info.uploader,
            uploadDate: info.upload_date,
            viewCount: info.view_count,
            likeCount: info.like_count,
            description: info.description,
            thumbnail: info.thumbnail,
            formats: info.formats || [],
          })
        } catch (error: unknown) {
          reject(new Error(`Failed to parse video info: ${error instanceof Error ? error.message : String(error)}`))
        }
      })

      process.on("error", (error) => {
        reject(new Error(`yt-dlp process error: ${error.message}`))
      })
    })
  }

  async downloadVideo(
    url: string,
    outputPath: string,
    options: DownloadOptions = {}
  ): Promise<{ filePath: string; metadata: VideoInfo }> {
    const {
      format = "best[height<=1080]",
      extractAudio = false,
      audioFormat = "mp3",
      outputDir = "./downloads",
      metadata = true,
      subtitles = false,
      embedThumbnail = true,
    } = options

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true })

    // Build yt-dlp arguments
    const args = [
      "--format", format,
      "--output", path.join(outputDir, "%(title)s.%(ext)s"),
      "--no-playlist",
      "--progress",
    ]

    if (extractAudio) {
      args.push("--extract-audio", "--audio-format", audioFormat)
    }

    if (metadata) {
      args.push("--add-metadata", "--embed-chapters")
    }

    if (subtitles) {
      args.push("--write-sub", "--write-auto-sub", "--sub-lang", "en")
    }

    if (embedThumbnail) {
      args.push("--embed-thumbnail")
    }

    args.push(url)

    return new Promise((resolve, reject) => {
      const process = spawn(this.ytDlpPath, args)
      let errorOutput = ""
      let filePath = ""

      process.stdout.on("data", (data) => {
        const outputStr = data.toString()

        // Extract file path from output
        const pathMatch = outputStr.match(/\[download\] Destination: (.+)/)
        if (pathMatch) {
          filePath = pathMatch[1]
        }
      })

      process.stderr.on("data", (data) => {
        errorOutput += data.toString()
      })

      process.on("close", async (code) => {
        if (code !== 0) {
          logger.error(`yt-dlp download failed: ${errorOutput}`)
          reject(new Error(`Download failed: ${errorOutput}`))
          return
        }

        try {
          // Get video metadata
          const videoInfo = await this.getVideoInfo(url)

          resolve({
            filePath: filePath || path.join(outputDir, `${videoInfo.title}.mp4`),
            metadata: videoInfo,
          })
        } catch (error: unknown) {
          reject(new Error(`Failed to get metadata: ${error instanceof Error ? error.message : String(error)}`))
        }
      })

      process.on("error", (error) => {
        reject(new Error(`yt-dlp process error: ${error.message}`))
      })
    })
  }

  async downloadPlaylist(
    url: string,
    outputDir: string,
    options: DownloadOptions = {}
  ): Promise<{ videos: Array<{ filePath: string; metadata: VideoInfo }> }> {
    const {
      format = "best[height<=1080]",
      extractAudio = false,
      audioFormat = "mp3",
      metadata = true,
      subtitles = false,
      embedThumbnail = true,
    } = options

    await fs.promises.mkdir(outputDir, { recursive: true })

    const args = [
      "--format", format,
      "--output", path.join(outputDir, "%(playlist_title)s/%(title)s.%(ext)s"),
      "--yes-playlist",
      "--progress",
    ]

    if (extractAudio) {
      args.push("--extract-audio", "--audio-format", audioFormat)
    }

    if (metadata) {
      args.push("--add-metadata", "--embed-chapters")
    }

    if (subtitles) {
      args.push("--write-sub", "--write-auto-sub", "--sub-lang", "en")
    }

    if (embedThumbnail) {
      args.push("--embed-thumbnail")
    }

    args.push(url)

    return new Promise((resolve, reject) => {
      const process = spawn(this.ytDlpPath, args)
      let output = ""
      let errorOutput = ""
      const downloadedVideos: Array<{ filePath: string; metadata: VideoInfo }> = []

      process.stdout.on("data", (data) => {
        output += data.toString()
      })

      process.stderr.on("data", (data) => {
        errorOutput += data.toString()
      })

      process.on("close", async (code) => {
        if (code !== 0) {
          logger.error(`yt-dlp playlist download failed: ${errorOutput}`)
          reject(new Error(`Playlist download failed: ${errorOutput}`))
          return
        }

        // Parse downloaded files from output
        const lines = output.split('\n')
        for (const line of lines) {
          const pathMatch = line.match(/\[download\] Destination: (.+)/)
          if (pathMatch) {
            try {
              const videoInfo = await this.getVideoInfo(url)
              downloadedVideos.push({
                filePath: pathMatch[1],
                metadata: videoInfo,
              })
            } catch (error: unknown) {
              logger.warn(`Failed to get metadata for ${pathMatch[1]}: ${error instanceof Error ? error.message : String(error)}`)
            }
          }
        }

        resolve({ videos: downloadedVideos })
      })

      process.on("error", (error) => {
        reject(new Error(`yt-dlp process error: ${error.message}`))
      })
    })
  }

  async downloadChannelVideos(
    channelId: string,
    outputDir: string,
    maxVideos = 50,
    options: DownloadOptions = {}
  ): Promise<{ videos: Array<{ filePath: string; metadata: VideoInfo }> }> {
    const channelUrl = `https://www.youtube.com/channel/${channelId}/videos`

    const args = [
      "--format", options.format || "best[height<=1080]",
      "--output", path.join(outputDir, "%(channel)s/%(title)s.%(ext)s"),
      "--playlist-end", maxVideos.toString(),
      "--yes-playlist",
      "--progress",
    ]

    if (options.extractAudio) {
      args.push("--extract-audio", "--audio-format", options.audioFormat || "mp3")
    }

    if (options.metadata) {
      args.push("--add-metadata", "--embed-chapters")
    }

    args.push(channelUrl)

    return new Promise((resolve, reject) => {
      const process = spawn(this.ytDlpPath, args)
      let errorOutput = ""
      const downloadedVideos: Array<{ filePath: string; metadata: VideoInfo }> = []

      let output = ""
      process.stdout.on("data", (data) => {
        output += data.toString()
      })

      process.stderr.on("data", (data) => {
        errorOutput += data.toString()
      })

      process.on("close", async (code) => {
        if (code !== 0) {
          logger.error(`yt-dlp channel download failed: ${errorOutput}`)
          reject(new Error(`Channel download failed: ${errorOutput}`))
          return
        }

        // Parse downloaded files from output
        const lines = output.split('\n')
        for (const line of lines) {
          const pathMatch = line.match(/\[download\] Destination: (.+)/)
          if (pathMatch) {
            downloadedVideos.push({
              filePath: pathMatch[1],
              metadata: {} as VideoInfo,
            })
          }
        }

        resolve({ videos: downloadedVideos })
      })

      process.on("error", (error: Error) => {
        reject(new Error(`yt-dlp process error: ${error.message}`))
      })
    })
  }

  async checkYtDlpInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn(this.ytDlpPath, ["--version"])
      process.on("close", (code) => {
        resolve(code === 0)
      })
      process.on("error", () => {
        resolve(false)
      })
    })
  }

  async updateYtDlp(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ytDlpPath, ["--update"])

      process.on("close", (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error("Failed to update yt-dlp"))
        }
      })

      process.on("error", (error) => {
        reject(new Error(`yt-dlp update error: ${error.message}`))
      })
    })
  }
}

// Factory function to create download service
export function createDownloadService() {
  return new DownloadService()
}

// Database integration functions
export async function createDownloadJob(
  userId: string,
  sourceUrl: string,
  sourceType: "video" | "playlist" | "channel",
  outputPath: string,
  options: DownloadOptions = {}
) {
  const downloadJob = await db.insert(downloadJobs).values({
    id: `dl_${crypto.randomUUID()}`,
    userId,
    sourceUrl,
    sourceType,
    outputPath,
    status: "pending",
    metadata: JSON.stringify(options),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  return downloadJob
}

export async function updateDownloadJobStatus(
  jobId: string,
  status: "pending" | "downloading" | "completed" | "failed",
  progress?: number,
  errorMessage?: string
) {
  return await db.update(downloadJobs)
    .set({
      status,
      updatedAt: Date.now(),
      ...(progress !== undefined && { progress }),
      ...(errorMessage && { errorMessage }),
      ...(status === "completed" && { completedAt: Date.now() }),
    })
    .where(eq(downloadJobs.id, jobId))
}
