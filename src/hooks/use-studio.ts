"use client"

import { useState } from "react"
import { Track } from "@/types/video"
import { triggerThumbnailGen, triggerAutoCut, triggerTranscription } from "@/app/dashboard/studio/actions"
import { toast } from "sonner"

export function useStudio(videoId: string) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeJob, setActiveJob] = useState<string | null>(null)

  const generateThumbnails = async () => {
    setIsProcessing(true)
    try {
      const { jobId } = await triggerThumbnailGen(videoId)
      setActiveJob(jobId)
      return jobId
    } catch (_err) {
      toast.error("Failed to initiate thumbnail generation")
      throw _err
    } finally {
      setIsProcessing(false)
    }
  }

  const runAutoCut = async () => {
    setIsProcessing(true)
    try {
      const { jobId } = await triggerAutoCut(videoId)
      setActiveJob(jobId)
      return jobId
    } catch (_err) {
      toast.error("Failed to initiate auto-cut")
      throw _err
    } finally {
      setIsProcessing(false)
    }
  }

  const runTranscription = async () => {
    setIsProcessing(true)
    try {
      const { jobId } = await triggerTranscription(videoId)
      setActiveJob(jobId)
      return jobId
    } catch (_err) {
      toast.error("Failed to initiate transcription")
      throw _err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    tracks,
    setTracks,
    isProcessing,
    activeJob,
    generateThumbnails,
    runAutoCut,
    runTranscription,
  }
}
