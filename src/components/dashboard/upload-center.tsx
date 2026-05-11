"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { createUploadJob } from "@/app/dashboard/upload/actions"
import { logger } from "@/lib/logger"

interface FileWithProgress {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "failed"
}

export function UploadCenter() {
  const [files, setFiles] = useState<FileWithProgress[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const now = Date.now()
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `upload-${now}-${index}`,
      file,
      progress: 0,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`${acceptedFiles.length} videos added to staging`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
  })

  const [isUploading, setIsUploading] = useState(false)

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const initializePipeline = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    
    try {
      for (const fileItem of files) {
        const formData = new FormData()
        formData.append("file", fileItem.file)
        formData.append("title", fileItem.file.name)

        const xhr = new XMLHttpRequest()
        
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress, status: "uploading" } : f))
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "completed", progress: 100 } : f))
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error(xhr.responseText || "Upload failed"))
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network error")))
          xhr.open("POST", "/api/upload")
          xhr.send(formData)
        })

        await uploadPromise
      }
      toast.success("Operational pipeline initialized")
    } catch (error) {
      logger.error(error, "Pipeline initialization failed:")
      toast.error("Pipeline initialization failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="cyber-card border-border overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-foreground italic">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.upload className="h-5 w-5 text-primary" />
              </div>
              Command Center
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">Asset deployment and synchronization.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div
          {...getRootProps()}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-500 cursor-pointer group min-h-[240px]",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30 bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative z-10 flex flex-col items-center gap-4 text-center p-8">
            <motion.div 
              animate={isDragActive ? { scale: 1.1, rotate: 12 } : { scale: 1, rotate: 0 }}
              className={cn(
                "h-16 w-16 rounded-2xl bg-background flex items-center justify-center border border-border transition-colors duration-500",
                isDragActive ? "border-primary/50" : "group-hover:border-primary/30"
              )}
            >
              <Icons.cloudUpload className={cn("h-8 w-8 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
            </motion.div>
            <div>
              <p className="text-lg font-black text-foreground uppercase tracking-tighter italic">
                {isDragActive ? "Initiate Transfer" : "Drop Assets Here"}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                4K HDR • ProRes • H.264 Support
              </p>
            </div>
            <Button variant="outline" className="mt-2 h-9 rounded-xl border-border bg-background text-[10px] font-black uppercase tracking-widest hover:bg-muted px-8 text-foreground transition-all">
              Browse Files
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Staging Queue</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])}
                className="h-6 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/10"
              >
                Reset Staging
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence initial={false}>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 rounded-xl bg-muted/50 border border-border group hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                          <Icons.video className="h-4 w-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tight italic">{file.file.name}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB • {file.status}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(file.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
                      >
                        <Icons.trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="relative pt-1">
                      <Progress value={file.progress} className="h-1 bg-muted" />
                      <div className="flex justify-between mt-2">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest",
                          file.status === "uploading" ? "text-primary animate-pulse" : 
                          file.status === "completed" ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          {file.status}
                        </span>
                        <span className="text-[9px] font-black text-foreground">{file.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Button 
              onClick={initializePipeline}
              disabled={isUploading || files.every(f => f.status === "completed")}
              className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isUploading ? (
                <Icons.refreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icons.zap className="h-4 w-4 mr-2" />
              )}
              Initialize Deployment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
