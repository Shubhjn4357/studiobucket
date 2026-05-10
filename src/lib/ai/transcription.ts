import fs from "fs"
import path from "path"
import { logger } from "@/lib/logger"
import { spawn } from "child_process"

export class TranscriptionService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
  }

  async extractAudio(videoPath: string, audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", videoPath,
        "-vn",
        "-acodec", "libmp3lame",
        "-ar", "16000",
        "-ac", "1",
        audioPath,
        "-y"
      ])

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`FFmpeg audio extraction failed with code ${code}`))
      })

      ffmpeg.on("error", (err) => reject(err))
    })
  }

  async transcribe(videoPath: string): Promise<{ text: string; srt: string }> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY not configured")
    }

    const audioPath = videoPath.replace(path.extname(videoPath), ".mp3")
    
    try {
      logger.info(`Extracting audio from ${videoPath}...`)
      await this.extractAudio(videoPath, audioPath)

      logger.info(`Sending audio to OpenAI Whisper...`)
      const formData = new FormData()
      formData.append("file", new Blob([await fs.promises.readFile(audioPath)]), "audio.mp3")
      formData.append("model", "whisper-1")
      formData.append("response_format", "verbose_json")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API Error: ${JSON.stringify(error)}`)
      }

      const data = await response.json()
      
      // Generate SRT from segments if response_format was verbose_json
      const srt = this.convertToSrt(data.segments)

      return {
        text: data.text,
        srt
      }
    } catch (error) {
      logger.error(error, "Transcription failed:")
      throw error
    } finally {
      if (fs.existsSync(audioPath)) {
        await fs.promises.unlink(audioPath)
      }
    }
  }

  private convertToSrt(segments: Array<{ start: number; end: number; text: string }>): string {
    return segments.map((segment, index) => {
      const start = this.formatSrtTime(segment.start)
      const end = this.formatSrtTime(segment.end)
      return `${index + 1}\n${start} --> ${end}\n${segment.text.trim()}\n`
    }).join("\n")
  }

  private formatSrtTime(seconds: number): string {
    const date = new Date(0)
    date.setSeconds(seconds)
    const ms = Math.floor((seconds % 1) * 1000)
    return date.toISOString().substr(11, 8) + "," + ms.toString().padStart(3, "0")
  }
}
