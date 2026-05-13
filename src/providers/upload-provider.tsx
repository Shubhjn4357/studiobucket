"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface FileWithProgress {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "failed"
  speed?: number
  eta?: number
  startTime?: number
  videoId?: string
}

interface UploadContextType {
  files: FileWithProgress[]
  isUploading: boolean
  addFiles: (newFiles: File[]) => void
  removeFile: (id: string) => void
  startUpload: () => Promise<void>
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const activeXhrs = useRef<Map<string, XMLHttpRequest>>(new Map())

  const addFiles = useCallback((acceptedFiles: File[]) => {
    const now = Date.now()
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `upload-${now}-${index}`,
      file,
      progress: 0,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`Added ${acceptedFiles.length} ${acceptedFiles.length === 1 ? 'video' : 'videos'} to queue`)
  }, [])

  const removeFile = useCallback((id: string) => {
    const xhr = activeXhrs.current.get(id)
    if (xhr) {
      xhr.abort()
      activeXhrs.current.delete(id)
    }
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const startUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    
    try {
      // Process one by one for reliability
      for (const fileItem of files) {
        if (fileItem.status === "completed" || fileItem.status === "uploading") continue

        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f))

        const initRes = await fetch("/api/upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: fileItem.file.name,
            fileType: fileItem.file.type || "video/mp4",
            fileSize: fileItem.file.size,
            title: fileItem.file.name.split('.')[0]
          })
        })

        if (!initRes.ok) throw new Error("Failed to initialize upload")
        
        const { uploadUrl, videoId } = await initRes.json()

        const xhr = new XMLHttpRequest()
        activeXhrs.current.set(fileItem.id, xhr)
        
        const uploadPromise = new Promise((resolve, reject) => {
          const startTime = Date.now()
          
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              const elapsedTime = (Date.now() - startTime) / 1000 || 0.1
              const speed = event.loaded / elapsedTime
              const remainingBytes = event.total - event.loaded
              const eta = speed > 0 ? Math.round(remainingBytes / speed) : 0
              
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { 
                ...f, 
                progress, 
                status: "uploading",
                speed,
                eta
              } : f))
            }
          })

          xhr.addEventListener("load", async () => {
            activeXhrs.current.delete(fileItem.id)
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const finalizeRes = await fetch("/api/upload/finalize", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ videoId })
                })
                if (!finalizeRes.ok) throw new Error("Finalization failed")
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "completed", progress: 100, eta: 0, videoId } : f))
                resolve(true)
              } catch (err) { reject(err) }
            } else reject(new Error(`Upload error: ${xhr.status}`))
          })

          xhr.addEventListener("error", () => {
            activeXhrs.current.delete(fileItem.id)
            reject(new Error("Network error during upload"))
          })
          
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", fileItem.file.type || "application/octet-stream")
          xhr.send(fileItem.file)
        })

        await uploadPromise
      }
      toast.success("All uploads completed successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      logger.error(error, "Upload Failure")
      toast.error(`Upload failed: ${errorMessage}`)
      setFiles(prev => prev.map(f => f.status === "uploading" ? { ...f, status: "failed" } : f))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <UploadContext.Provider value={{ files, isUploading, addFiles, removeFile, startUpload }}>
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider")
  }
  return context
}
