import fs from "fs"
import path from "path"
import { spawn } from "child_process"

export class ThumbnailService {
  async generateVariations(videoPath: string, outputDir: string, count = 3): Promise<string[]> {
    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true })
    }

    const thumbnails: string[] = []
    
    // Get duration
    const duration = await this.getDuration(videoPath)
    
    for (let i = 0; i < count; i++) {
      const timestamp = (duration / (count + 1)) * (i + 1)
      const fileName = `thumb_${Date.now()}_${i}.jpg`
      const outputPath = path.join(outputDir, fileName)
      
      await this.extractFrame(videoPath, outputPath, timestamp)
      thumbnails.push(outputPath)
    }

    return thumbnails
  }

  private async getDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        videoPath
      ])

      let output = ""
      ffprobe.stdout.on("data", (data) => output += data.toString())
      ffprobe.on("close", (code) => {
        if (code === 0) resolve(parseFloat(output))
        else reject(new Error("ffprobe failed to get duration"))
      })
    })
  }

  private async extractFrame(videoPath: string, outputPath: string, timestamp: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-ss", timestamp.toString(),
        "-i", videoPath,
        "-vframes", "1",
        "-q:v", "2",
        outputPath,
        "-y"
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`FFmpeg frame extraction failed with code ${code}`))
      })
    })
  }
}
