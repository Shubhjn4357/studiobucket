"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
    toast.success(`Registered ${acceptedFiles.length} new tactical assets`)
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

        if (!initRes.ok) throw new Error("Protocol initialization failed")
        
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
                speed: speed,
                eta: eta
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
            } else reject(new Error(`Transmission error: ${xhr.status}`))
          })

          xhr.addEventListener("error", () => {
            activeXhrs.current.delete(fileItem.id)
            reject(new Error("Uplink failed"))
          })
          
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", fileItem.file.type || "application/octet-stream")
          xhr.send(fileItem.file)
        })

        await uploadPromise
      }
      toast.success("Tactical synchronization complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Protocol aborted"
      logger.error(error, "Ingestion Pipeline Failure")
      toast.error(`Pipeline failure: ${errorMessage}`)
      setFiles(prev => prev.map(f => f.status === "uploading" ? { ...f, status: "failed" } : f))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-3">
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Drop Zone - High Density */}
        <div className="col-span-3 flex flex-col gap-3">
          <div
            {...getRootProps()}
            className={cn(
              "flex-1 flex flex-col items-center justify-center border border-dashed transition-all duration-200 cursor-pointer group relative overflow-hidden hud-corner",
              isDragActive ? "bg-primary/5 border-primary" : "bg-surface border-border hover:border-primary/40"
            )}
          >
            <input {...getInputProps()} />
            <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
            <div className="flex flex-col items-center gap-2 text-center p-4 relative z-10">
              <Icons.cloudUpload className={cn("h-6 w-6 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground">Inject_New_Asset</p>
                <p className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 italic">Local Assets_Only</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={initializePipeline}
            disabled={isUploading || files.length === 0 || files.every(f => f.status === "completed")}
            className="w-full bg-primary hover:bg-primary/90 text-white h-8 text-[9px] font-black uppercase tracking-[0.3em] italic shadow-sm rounded-sm"
          >
            {isUploading ? "Sync_Active..." : "Initialize_Ingestion"}
          </Button>
        </div>

        {/* Tactical Registry */}
        <div className="col-span-9 flex flex-col bg-surface border border-border overflow-hidden min-h-0 shadow-sm relative hud-corner">
          <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
          
          <div className="px-4 h-8 border-b border-border flex items-center justify-between bg-muted/20 relative z-10">
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black text-foreground tracking-[0.3em] uppercase italic">Telemetry_Stream_Live</span>
            </div>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">Content_Inventory_Node</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative z-10">
            {files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                <Icons.layers className="h-8 w-8 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Registry_Empty</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface border-b border-border z-20">
                  <tr className="bg-muted/10">
                    <th className="px-4 py-2 text-[7px] font-black uppercase tracking-widest text-muted-foreground">Asset_ID</th>
                    <th className="px-4 py-2 text-[7px] font-black uppercase tracking-widest text-muted-foreground">Protocol_Status</th>
                    <th className="px-4 py-2 text-[7px] font-black uppercase tracking-widest text-muted-foreground">Payload_Size</th>
                    <th className="px-4 py-2 text-[7px] font-black uppercase tracking-widest text-muted-foreground">Transmission_Metrics</th>
                    <th className="px-4 py-2 text-[7px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {files.map((file) => (
                    <tr key={file.id} className="group hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] font-black text-primary/40 uppercase tracking-tighter">NODE_{file.id.split('-').pop()?.toUpperCase()}</span>
                          <span className="text-[9px] font-black text-foreground uppercase truncate italic max-w-[120px]">{file.file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider",
                            file.status === "completed" ? "text-success" : 
                            file.status === "failed" ? "text-error" : 
                            file.status === "uploading" ? "text-primary animate-pulse" : "text-muted-foreground"
                          )}>{file.status}</span>
                          {file.status === "uploading" && (
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[60px] border border-border/30">
                              <div className="h-full bg-primary" style={{ width: `${file.progress}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-[8px] text-muted-foreground font-mono uppercase">
                        {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="px-4 py-2">
                        {file.status === "uploading" ? (
                          <div className="flex gap-3 items-center">
                            <span className="text-[7px] font-black text-primary uppercase">{(file.speed! / (1024 * 1024)).toFixed(1)} MB/s</span>
                            <span className="text-[7px] text-muted-foreground uppercase opacity-40">ETA: {file.eta}s</span>
                          </div>
                        ) : (
                          <span className="text-[7px] text-muted-foreground uppercase italic opacity-20">Idle</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFile(file.id)} 
                          disabled={file.status === "uploading" && !isUploading}
                          className="h-5 w-5 rounded-sm hover:bg-error/10 hover:text-error text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Icons.x className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

