"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export function UploadCenter() {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const activeXhrs = useRef<Map<string, XMLHttpRequest>>(new Map())

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const now = Date.now()
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `upload-${now}-${index}`,
      file,
      progress: 0,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`Added ${acceptedFiles.length} files to queue`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
  })

  const removeFile = (id: string) => {
    const xhr = activeXhrs.current.get(id)
    if (xhr) {
      xhr.abort()
      activeXhrs.current.delete(id)
    }
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const startUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    
    try {
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
      logger.error(error, "Upload Pipeline Failure")
      toast.error(`Upload error: ${errorMessage}`)
      setFiles(prev => prev.map(f => f.status === "uploading" ? { ...f, status: "failed" } : f))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Drop Zone */}
        <div className="md:col-span-1 space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group relative overflow-hidden",
              isDragActive ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/40"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4 text-center p-6 relative z-10">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icons.cloudUpload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground">Drag & Drop Videos</p>
                <p className="text-xs text-muted-foreground">MP4, MOV, AVI up to 2GB</p>
              </div>
              <Button variant="outline" size="sm" className="font-bold rounded-lg mt-2">
                Browse Files
              </Button>
            </div>
          </div>

          <Button 
            onClick={startUpload}
            disabled={isUploading || files.length === 0 || files.every(f => f.status === "completed")}
            className="w-full h-12 font-bold rounded-xl shadow-lg transition-all"
          >
            {isUploading ? (
              <><Icons.refreshCw className="animate-spin h-4 w-4 mr-2" /> Uploading...</>
            ) : (
              <><Icons.zap className="h-4 w-4 mr-2" /> Start Upload</>
            )}
          </Button>
        </div>

        {/* Upload List */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold text-sm">Upload Queue</h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {files.length} {files.length === 1 ? 'File' : 'Files'}
            </span>
          </div>

          <ScrollArea className="flex-1">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <Icons.layers className="h-12 w-12 mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">Queue is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {files.map((file) => (
                  <div key={file.id} className="p-6 group hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <Icons.video className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold truncate max-w-[300px]">{file.file.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB • {file.status}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(file.id)} 
                        disabled={file.status === "uploading" && isUploading}
                        className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    </div>

                    {file.status === "uploading" && (
                      <div className="space-y-3">
                        <Progress value={file.progress} className="h-1.5" />
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                          <span>{(file.speed! / (1024 * 1024)).toFixed(1)} MB/s</span>
                          <span>ETA: {file.eta}s • {file.progress}%</span>
                        </div>
                      </div>
                    )}
                    
                    {file.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-500">
                        <Icons.checkCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase">Upload Complete</span>
                      </div>
                    )}
                    
                    {file.status === "failed" && (
                      <div className="flex items-center gap-2 text-red-500">
                        <Icons.alertCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase">Upload Failed</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
