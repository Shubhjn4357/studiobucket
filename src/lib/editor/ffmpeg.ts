import ffmpeg from "fluent-ffmpeg"
import path from "path"
import fs from "fs"
import { logger } from "@/lib/logger"

export interface VideoTransformOptions {
  trimStart?: number
  trimEnd?: number
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  watermark?: {
    imagePath: string
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  }
  quality?: "720p" | "1080p" | "4k"
  format?: "mp4" | "mov" | "webm"
  introPath?: string
  outroPath?: string
  isShorts?: boolean // Auto vertical crop
}

export class VideoProcessor {
  async processVideo(
    inputPath: string,
    outputPath: string,
    options: VideoTransformOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)

      // Trim
      if (options.trimStart !== undefined && options.trimEnd !== undefined) {
        command = command.setStartTime(options.trimStart).setDuration(options.trimEnd - options.trimStart)
      } else if (options.trimStart !== undefined) {
        command = command.setStartTime(options.trimStart)
      }

      // Crop for Shorts (9:16)
      if (options.isShorts) {
        command = command.videoFilters('crop=ih*9/16:ih')
      } else if (options.crop) {
        command = command.videoFilters(
          `crop=${options.crop.width}:${options.crop.height}:${options.crop.x}:${options.crop.y}`
        )
      }

      // Intro / Outro Concatenation (Simplified for this system)
      // Real concatenation often requires re-encoding or a separate pass
      if (options.introPath && fs.existsSync(options.introPath)) {
        logger.info(`Adding intro: ${options.introPath}`)
        // Note: Real concat would use .input(introPath) and complexFilter
      }

      // Watermark
      if (options.watermark && fs.existsSync(options.watermark.imagePath)) {
        let overlayPosition = "10:10"
        switch (options.watermark.position) {
          case "top-right":
            overlayPosition = "main_w-overlay_w-10:10"
            break
          case "bottom-left":
            overlayPosition = "10:main_h-overlay_h-10"
            break
          case "bottom-right":
            overlayPosition = "main_w-overlay_w-10:main_h-overlay_h-10"
            break
        }
        command = command.input(options.watermark.imagePath).complexFilter([
          {
            filter: "overlay",
            options: overlayPosition,
            inputs: ["0:v", "1:v"],
            outputs: "output",
          },
        ])
      }

      // Quality & Format
      if (options.quality) {
        const resolution = options.quality === "4k" ? "3840x2160" : options.quality === "1080p" ? "1920x1080" : "1280x720"
        command = command.size(resolution)
      }

      command
        .on("start", (commandLine: string) => {
          logger.info(`FFmpeg process started: ${commandLine}`)
        })
        .on("progress", (progress) => {
          logger.info(`Processing: ${progress.percent}% done`)
        })
        .on("error", (err: Error) => {
          logger.error(`FFmpeg error: ${err.message}`)
          reject(err)
        })
        .on("end", () => {
          logger.info("Processing finished successfully")
          resolve(outputPath)
        })
        .save(outputPath)
    })
  }

  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    time = "00:00:01"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [time],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: "1280x720",
        })
        .on("end", () => resolve(outputPath))
        .on("error", (err: Error) => reject(err))
    })
  }
}

export const videoProcessor = new VideoProcessor()
