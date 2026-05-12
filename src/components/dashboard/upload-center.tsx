"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
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
    toast.success(`${acceptedFiles.length} assets staged for ingestion`)
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

  const initializePipeline = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    
    try {
      for (const fileItem of files) {
        if (fileItem.status === "completed" || fileItem.status === "uploading") continue

        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f))

        // 1. Initialize Protocol
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

        if (!initRes.ok) {
          const errorData = await initRes.json().catch(() => ({ error: "Protocol error" }))
          throw new Error(errorData.error || "Protocol initialization failed")
        }
        
        const { uploadUrl, videoId } = await initRes.json()

        // 2. Execute Transmission
        const xhr = new XMLHttpRequest()
        activeXhrs.current.set(fileItem.id, xhr)
        
        const uploadPromise = new Promise((resolve, reject) => {
          const startTime = Date.now() // Moved inside promise to satisfy purity if possible, or just used in closure
          
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
                speed: speed,
                eta: eta
              } : f))
            }
          })

          xhr.addEventListener("load", async () => {
            activeXhrs.current.delete(fileItem.id)
            if (xhr.status >= 200 && xhr.status < 300) {
              // 3. Finalize Protocol
              try {
                const finalizeRes = await fetch("/api/upload/finalize", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ videoId })
                })
                
                if (!finalizeRes.ok) {
                  throw new Error("Finalization failed")
                }
                
                setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "completed", progress: 100, eta: 0, videoId } : f))
                resolve(true)
              } catch (err) {
                reject(err)
              }
            } else {
              reject(new Error(`Transmission error: ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => {
            activeXhrs.current.delete(fileItem.id)
            reject(new Error("Network connection interrupted"))
          })
          
          xhr.addEventListener("abort", () => {
            activeXhrs.current.delete(fileItem.id)
            reject(new Error("Transmission aborted by user"))
          })
          
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", fileItem.file.type || "application/octet-stream")
          xhr.send(fileItem.file)
        })

        await uploadPromise
      }
      toast.success("All assets synchronized successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Protocol aborted"
      logger.error(error, "Ingestion Pipeline Failure")
      toast.error(`Pipeline failure: ${errorMessage}`)
      setFiles(prev => prev.map(f => f.status === "uploading" ? { ...f, status: "failed" } : f))
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatSpeed = (bytesPerSec: number) => {
    if (!bytesPerSec) return "0 B/s"
    if (bytesPerSec > 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div
            {...getRootProps()}
            className={cn(
              "flex-1 flex flex-col items-center justify-center border border-dashed rounded-md transition-all duration-300 cursor-pointer group relative overflow-hidden",
              isDragActive 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border bg-surface hover:border-primary/40"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
            
            <div className="flex flex-col items-center gap-4 text-center p-6 relative z-10">
              <motion.div 
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                className={cn(
                  "h-12 w-12 rounded-sm flex items-center justify-center border transition-all duration-300",
                  isDragActive 
                    ? "bg-primary text-white border-primary" 
                    : "bg-background text-muted-foreground border-border group-hover:border-primary/20 group-hover:text-primary"
                )}
              >
                <Icons.cloudUpload className="h-6 w-6" />
              </motion.div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-foreground tracking-widest uppercase italic">
                  {isDragActive ? "Release_to_Ingest" : "Stage_New_Assets"}
                </p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                  Raw_Transmission_Capable
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={initializePipeline}
            disabled={isUploading || files.length === 0 || files.every(f => f.status === "completed")}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm h-10 text-[9px] font-black uppercase tracking-widest italic shadow-sm transition-all"
          >
            {isUploading ? (
              <>
                <Icons.refreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronizing_Protocol...
              </>
            ) : (
              <>
                <Icons.zap className="h-4 w-4 mr-2" />
                Initialize_Ingestion
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-8 flex flex-col bg-surface rounded-md border border-border overflow-hidden min-h-0 shadow-sm relative">
          <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
          
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20 relative z-10">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black text-foreground tracking-widest uppercase italic">Ingestion_Queue</span>
            </div>
            {files.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])} 
                disabled={isUploading}
                className="text-[8px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-sm h-6 px-3"
              >
                Purge_Queue
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-10">
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center py-20"
                >
                  <Icons.layers className="h-8 w-8 mb-3 text-muted-foreground/20" />
                  <span className="text-[8px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">No_Assets_Staged</span>
                </motion.div>
              ) : (
                files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={cn(
                      "p-3 rounded-sm border transition-all duration-200 relative overflow-hidden group",
                      file.status === "uploading" ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                          "h-8 w-8 rounded-sm flex items-center justify-center shrink-0 border transition-colors",
                          file.status === "uploading" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
                        )}>
                          {file.status === "completed" ? <Icons.check className="h-4 w-4" /> : <Icons.video className="h-4 w-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tight italic">{file.file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[8px] text-muted-foreground font-bold uppercase">{formatSize(file.file.size)}</span>
                             <span className="text-[8px] text-muted-foreground opacity-30">•</span>
                             <span className={cn(
                               "text-[8px] font-black uppercase tracking-wider",
                               file.status === "completed" ? "text-success" : 
                               file.status === "failed" ? "text-error" : 
                               file.status === "uploading" ? "text-primary animate-pulse" : "text-muted-foreground"
                             )}>{file.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {file.status === "uploading" && (
                          <div className="text-right hidden sm:block">
                             <p className="text-[8px] font-black text-primary uppercase">{formatSpeed(file.speed || 0)}</p>
                             <p className="text-[7px] text-muted-foreground font-bold uppercase opacity-50">ETA: {file.eta || 0}s</p>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFile(file.id)} 
                          disabled={file.status === "uploading" && !isUploading}
                          className="h-7 w-7 rounded-sm hover:bg-error/10 hover:text-error text-muted-foreground transition-all"
                        >
                          <Icons.x className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {file.status === "uploading" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Protocol_Progress</span>
                           <span className="text-[8px] font-black text-primary italic">{file.progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

