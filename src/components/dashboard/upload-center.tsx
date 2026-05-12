"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface FileWithProgress {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "failed"
  speed?: number // bytes per second
  eta?: number // seconds remaining
  startTime?: number
  videoId?: string
}

export function UploadCenter() {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const now = Date.now()
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `upload-${now}-${index}`,
      file,
      progress: 0,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`${acceptedFiles.length} assets staged for deployment`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const initializePipeline = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    
    try {
      for (const fileItem of files) {
        if (fileItem.status === "completed") continue

        // 1. Initialize Protocol (Get Pre-signed URL)
        const initRes = await fetch("/api/upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: fileItem.file.name,
            fileType: fileItem.file.type,
            fileSize: fileItem.file.size,
            title: fileItem.file.name.split('.')[0]
          })
        })

        if (!initRes.ok) throw new Error("Protocol initialization failed")
        const { uploadUrl, videoId } = await initRes.json()

        // 2. Execute Transmission (Direct to Storage)
        const xhr = new XMLHttpRequest()
        const startTime = Date.now()
        
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              const elapsedTime = (Date.now() - startTime) / 1000 || 0.1 // avoid div by 0
              const speed = event.loaded / elapsedTime
              const remainingBytes = event.total - event.loaded
              const eta = speed > 0 ? Math.round(remainingBytes / speed) : 0
              
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { 
                ...f, 
                progress, 
                status: "uploading",
                speed: speed,
                eta: eta
              } : f))
            }
          })

          xhr.addEventListener("load", async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // 3. Finalize Protocol (Trigger Pipeline)
              await fetch("/api/upload/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId })
              })
              
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "completed", progress: 100, eta: 0, videoId } : f))
              resolve(true)
            } else {
              reject(new Error(`Transmission error: ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network protocol interrupted")))
          
          // Direct PUT to pre-signed URL is much faster
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", fileItem.file.type)
          xhr.send(fileItem.file)
        })

        await uploadPromise
      }
      toast.success("All assets synchronized with global grid")
    } catch (error) {
      logger.error(error, "Deployment Pipeline Error")
      toast.error("Pipeline failure detected. Protocol aborted.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatETA = (seconds: number) => {
    if (!seconds || seconds === Infinity) return "Calculating..."
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Card className="backdrop-blur-3xl bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-full shadow-2xl">
      <CardHeader className="p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-white italic">
              <div className="h-12 w-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center border border-white/5">
                <Icons.upload className="h-6 w-6 text-primary" />
              </div>
              Command Center
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[8px] opacity-40">Asset Ingestion • Global Grid Synchronization</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-10 p-10 pt-4 overflow-hidden">
        {/* Pro Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] transition-all duration-700 cursor-pointer group min-h-[300px]",
            isDragActive
              ? "border-primary bg-primary/5 shadow-[0_0_50px_rgba(var(--primary),0.1)]"
              : "border-white/5 hover:border-primary/20 bg-white/[0.01]"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative z-10 flex flex-col items-center gap-6 text-center p-12">
            <motion.div 
              animate={isDragActive ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
              className={cn(
                "h-20 w-20 rounded-[2rem] bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/5 transition-all duration-700 shadow-2xl",
                isDragActive ? "border-primary/40 text-primary" : "text-muted-foreground group-hover:border-primary/20"
              )}
            >
              <Icons.cloudUpload className="h-10 w-10" />
            </motion.div>
            <div>
              <p className="text-xl font-black text-white uppercase tracking-tighter italic">
                {isDragActive ? "Initialize Ingestion" : "Stage Assets Here"}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-3 opacity-60">
                ProRes • H.265 • 8K Raw Compatible
              </p>
            </div>
            <Button variant="outline" className="mt-4 h-12 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-10 text-white transition-all shadow-xl">
              Select Transmissions
            </Button>
          </div>
        </div>

        {/* Upload Staging Area */}
        {files.length > 0 && (
          <div className="space-y-6 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Staging Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[8px] font-black text-muted-foreground">{files.length}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])}
                className="h-8 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 rounded-xl"
              >
                Clear Uplink
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4 pb-4">
              <AnimatePresence initial={false}>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all duration-500 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-5 overflow-hidden">
                        <div className="h-12 w-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                          <Icons.video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-white truncate uppercase tracking-tighter italic">{file.file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{formatSize(file.file.size)}</span>
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              file.status === "uploading" ? "text-primary animate-pulse" : 
                              file.status === "completed" ? "text-emerald-500" : 
                              file.status === "failed" ? "text-red-500" : "text-muted-foreground"
                            )}>
                              {file.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {file.status === "uploading" && (
                        <div className="flex flex-col items-end mr-6">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">ETA: {formatETA(file.eta || 0)}</span>
                           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1">
                             {( (file.speed || 0) / (1024 * 1024) ).toFixed(2)} MB/s
                           </span>
                        </div>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === "uploading"}
                        className="h-10 w-10 text-muted-foreground hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
                      >
                        <Icons.trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="relative pt-2">
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-linear-to-r from-primary to-accent shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                        />
                      </div>
                      <div className="flex justify-between mt-3 px-1">
                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Bitrate Protocol ACTIVE</span>
                        <span className="text-[10px] font-black text-white italic">{file.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Button 
              onClick={initializePipeline}
              disabled={isUploading || files.length === 0 || files.every(f => f.status === "completed")}
              className="w-full bg-linear-to-br from-primary to-accent hover:opacity-90 text-white rounded-[1.5rem] h-16 font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] italic text-[11px]"
            >
              {isUploading ? (
                <Icons.refreshCw className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <Icons.zap className="h-5 w-5 mr-3" />
              )}
              Initialize Deployment Pipeline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
