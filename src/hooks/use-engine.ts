"use client"

import { useState } from "react"
import { VideoTransformOptions } from "@/lib/editor/ffmpeg"
import { toast } from "sonner"

export function useEngine() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastOutput, setLastOutput] = useState<string | null>(null)

  const processVideo = async (inputPath: string, options: VideoTransformOptions) => {
    setIsProcessing(true)
    try {
      // Logic to trigger server action that uses VideoProcessor
      const response = await fetch("/api/video/process", {
        method: "POST",
        body: JSON.stringify({ inputPath, options })
      })
      const { outputPath } = await response.json()
      setLastOutput(outputPath)
      toast.success("Video processed successfully")
      return outputPath
    } catch (_err) {
      toast.error("Processing engine failed")
      throw _err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    lastOutput,
    processVideo
  }
}
