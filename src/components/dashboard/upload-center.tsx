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
    toast.success(`${acceptedFiles.length} videos added to queue`)
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
        // 1. Create the database entries
        await createUploadJob({
          title: fileItem.file.name,
          fileSize: fileItem.file.size,
        })

        // 2. Simulate progress for UI feedback while job is "queued"
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 15
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 100, status: "completed" } : f))
          } else {
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: Math.floor(progress), status: "uploading" } : f))
          }
        }, 300)
      }
      toast.success("Pipeline initialized. Jobs added to global queue.")
    } catch {
      toast.error("Failed to initialize pipeline")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="cyber-card border-white/5 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-white">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.upload className="h-5 w-5 text-primary" />
              </div>
              Command Center
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-xs">Batch upload and process your content.</CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div
          {...getRootProps()}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-500 cursor-pointer group min-h-[240px]",
            isDragActive
              ? "border-primary bg-primary/5 shadow-[inset_0_0_40px_rgba(255,0,0,0.1)]"
              : "border-white/5 hover:border-white/10 bg-white/5"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1),transparent_70%)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 text-center p-8">
            <motion.div 
              animate={isDragActive ? { scale: 1.1, rotate: 12 } : { scale: 1, rotate: 0 }}
              className={cn(
                "h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 transition-colors duration-500",
                isDragActive ? "border-primary/50" : "group-hover:border-white/20"
              )}
            >
              <Icons.cloudUpload className={cn("h-8 w-8 transition-colors", isDragActive ? "text-primary" : "text-slate-400")} />
            </motion.div>
            <div>
              <p className="text-lg font-black text-white uppercase tracking-tighter">
                {isDragActive ? "Release to Launch" : "Drop Files to Upload"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                MP4, MOV, or AVI (Max 2GB)
              </p>
            </div>
            <Button variant="outline" className="mt-2 h-9 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-8 text-white transition-all">
              Select Assets
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Transmissions</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])}
                className="h-6 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/10"
              >
                Clear All
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
                    className="p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          <Icons.video className="h-4 w-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{file.file.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB • {file.status}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(file.id)}
                        className="h-7 w-7 text-slate-500 hover:text-primary transition-colors hover:bg-primary/10"
                      >
                        <Icons.trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="relative pt-1">
                      <Progress value={file.progress} className="h-1 bg-white/5 shadow-inner" />
                      <div className="flex justify-between mt-2">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          file.status === "uploading" ? "text-primary" : 
                          file.status === "completed" ? "text-green-500" : "text-slate-500"
                        )}>
                          {file.status}
                        </span>
                        <span className="text-[9px] font-black text-white">{file.progress}%</span>
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
              Initialize Pipeline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
