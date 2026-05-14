"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface DownloadState {
  url: string
  progress: number
  status: "idle" | "downloading" | "completed" | "failed"
  fileName?: string
}

export function useDownload() {
  const [download, setDownload] = useState<DownloadState>({
    url: "",
    progress: 0,
    status: "idle"
  })

  const startDownload = async (url: string) => {
    setDownload({ url, progress: 0, status: "downloading" })
    try {
      toast.info("Download initiated")
      
      const response = await fetch(url)
      if (!response.ok) throw new Error("Network response was not ok")
      if (!response.body) throw new Error("ReadableStream not supported")

      const contentLength = response.headers.get("Content-Length")
      const total = contentLength ? parseInt(contentLength, 10) : 0
      let loaded = 0

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        chunks.push(value)
        loaded += value.length
        
        if (total) {
           setDownload(prev => ({ ...prev, progress: Math.round((loaded / total) * 100) }))
        } else {
           // Fallback if no content-length
           setDownload(prev => ({ ...prev, progress: Math.min(99, prev.progress + 5) }))
        }
      }

      // Create blob and download
      const blob = new Blob(chunks as BlobPart[])
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      const fallbackName = url.split("/").pop() || "download.mp4"
      a.download = fallbackName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      setDownload(prev => ({ ...prev, progress: 100, status: "completed" }))
      toast.success("Download complete")
    } catch (err) {
      console.error(err)
      setDownload(prev => ({ ...prev, status: "failed" }))
      toast.error("Download failed")
    }
  }

  return {
    download,
    startDownload
  }
}
