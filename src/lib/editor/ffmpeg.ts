import ezffmpeg from "ezffmpeg"
import fs from "fs"
import { spawn } from "child_process"
import * as path from "path"
import ffmpegStatic from "ffmpeg-static"
// Resolve static paths safely
const FFMPEG_PATH = ffmpegStatic || "ffmpeg"
// Inject into PATH so ezffmpeg and raw spawn can find them
if (ffmpegStatic) {
  const ffmpegDir = path.dirname(ffmpegStatic)
  process.env.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH}`
}

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
  isShorts?: boolean
}

export class VideoProcessor {
  async processVideo(
    inputPath: string,
    outputPath: string,
    options: VideoTransformOptions
  ): Promise<string> {
    const width = options.quality === "4k" ? 3840 : options.quality === "1080p" ? 1920 : 1280
    const height = options.quality === "4k" ? 2160 : options.quality === "1080p" ? 1080 : 720
    
    // ezffmpeg project-based approach
    const project = new ezffmpeg({
      width: options.isShorts ? height : width,
      height: options.isShorts ? width : height,
      fps: 30
    })

    const clips: Array<{ type: "video" | "audio" | "text"; url: string; position: number; cutFrom?: number; end: number }> = []

    // Add intro if exists
    let currentPos = 0
    if (options.introPath && fs.existsSync(options.introPath)) {
      // In a real scenario we'd need duration, but we'll simplify
      clips.push({
        type: "video",
        url: options.introPath,
        position: 0,
        end: 5 // Placeholder 5s intro
      })
      currentPos = 5
    }

    // Add main video
    clips.push({
      type: "video",
      url: inputPath,
      position: currentPos,
      cutFrom: options.trimStart || 0,
      end: currentPos + (options.trimEnd ? options.trimEnd - (options.trimStart || 0) : 10) // Placeholder duration
    })

    await project.load(clips)
    await project.export({ outputPath })
    
    return outputPath
  }

  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    time = "00:00:01"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(FFMPEG_PATH, [
        "-ss", time,
        "-i", inputPath,
        "-vframes", "1",
        "-q:v", "2",
        "-s", "1280x720",
        outputPath,
        "-y"
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve(outputPath)
        else reject(new Error(`Thumbnail generation failed with code ${code}`))
      })

      ffmpeg.on("error", reject)
    })
  }

  async superResolution(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(FFMPEG_PATH, [
        "-i", inputPath,
        "-vf", "scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:1.0:5:5:0.0",
        outputPath,
        "-y"
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve(outputPath)
        else reject(new Error(`Super-Resolution failed with code ${code}`))
      })
      ffmpeg.on("error", reject)
    })
  }

  async interpolateFrames(inputPath: string, outputPath: string, targetFps = 60): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(FFMPEG_PATH, [
        "-i", inputPath,
        "-vf", `minterpolate=fps=${targetFps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsfm=1`,
        outputPath,
        "-y"
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve(outputPath)
        else reject(new Error(`Interpolation failed with code ${code}`))
      })
      ffmpeg.on("error", reject)
    })
  }

  async detectScenes(inputPath: string, threshold = 0.3): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const sceneCuts: number[] = []
      const ffmpeg = spawn(FFMPEG_PATH, [
        "-i", inputPath,
        "-vf", `scdet=s=${threshold}:t=1`,
        "-f", "null",
        "-"
      ])

      ffmpeg.stderr.on("data", (data) => {
        const line = data.toString()
        const match = line.match(/lavfi\.scdet\.pts:\s+([\d.]+)/)
        if (match) {
          sceneCuts.push(parseFloat(match[1]))
        }
      })

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve(sceneCuts)
        else reject(new Error(`Scene detection failed with code ${code}`))
      })
      ffmpeg.on("error", reject)
    })
  }
}

export const videoProcessor = new VideoProcessor()
