"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface UploadProgress {
  fileName: string
  progress: number
  status: "uploading" | "completed" | "error"
}

export function useUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({})

  const startUpload = (fileName: string) => {
    setUploads(prev => ({
      ...prev,
      [fileName]: { fileName, progress: 0, status: "uploading" }
    }))
  }

  const updateProgress = (fileName: string, progress: number) => {
    setUploads(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], progress }
    }))
  }

  const finishUpload = (fileName: string, error?: string) => {
    setUploads(prev => ({
      ...prev,
      [fileName]: { 
        ...prev[fileName], 
        progress: error ? prev[fileName].progress : 100, 
        status: error ? "error" : "completed" 
      }
    }))
    if (error) toast.error(`Upload failed for ${fileName}: ${error}`)
    else toast.success(`Upload complete: ${fileName}`)
  }

  return {
    uploads,
    startUpload,
    updateProgress,
    finishUpload,
  }
}
