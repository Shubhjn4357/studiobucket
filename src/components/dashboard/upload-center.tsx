"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useUpload } from "@/providers/upload-provider"

export function UploadCenter() {
  const { files, isUploading, addFiles, removeFile, startUpload } = useUpload()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles)
  }, [addFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
  })

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-px bg-border/20">
        {/* Interaction Zone */}
        <div className="lg:col-span-4 p-4 md:p-8 space-y-6 md:space-y-8 bg-card border-b lg:border-b-0 lg:border-r border-border">
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square lg:aspect-auto lg:h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group relative overflow-hidden",
              isDragActive ? "bg-primary/5 border-primary" : "bg-muted/10 border-border hover:border-primary/30"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center p-6 md:p-8 relative z-10">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 shadow-inner">
                <Icons.cloudUpload className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-sm md:text-base font-bold text-foreground">Drag & Drop Files</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">MP4, MOV, AVI (2GB MAX)</p>
              </div>
              <Button variant="outline" className="font-bold rounded-xl h-10 md:h-11 px-6 md:px-8 border-border hover:bg-background transition-all text-xs">
                Browse Files
              </Button>
            </div>
          </div>

          <Button 
            onClick={startUpload}
            disabled={isUploading || files.length === 0 || files.every(f => f.status === "completed")}
            className="w-full h-14 md:h-16 font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isUploading ? (
              <><Icons.refreshCw className="animate-spin h-5 w-5 mr-3" /> Uploading...</>
            ) : (
              <><Icons.zap className="h-5 w-5 mr-3" /> Start Upload</>
            )}
          </Button>
        </div>

        {/* Status Dashboard */}
        <div className="lg:col-span-8 flex flex-col min-h-[400px] md:min-h-[500px] bg-card">
          <div className="px-6 md:px-8 py-4 md:py-6 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <Icons.layers className="h-4 w-4 text-primary" />
               <h3 className="font-bold text-sm">Upload Monitor</h3>
            </div>
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                 {files.length} {files.length === 1 ? 'Job' : 'Jobs'} Active
               </span>
            </div>
          </div>

          <ScrollArea className="flex-1 max-h-[600px]">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 md:py-32 opacity-20 px-6 text-center">
                <Icons.inbox className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Monitor is clear</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                <AnimatePresence mode="popLayout">
                  {files.map((file) => (
                    <motion.div 
                      key={file.id} 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 md:p-8 group hover:bg-muted/10 transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="flex items-center gap-4 md:gap-5 min-w-0">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0">
                            <Icons.video className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div className="space-y-1 md:space-y-1.5 min-w-0">
                            <p className="text-xs md:text-sm font-bold truncate max-w-[200px] md:max-w-[400px]">{file.file.name}</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                               <Badge variant="outline" className="h-4 md:h-5 px-1.5 md:px-2 bg-muted/50 border-border/50 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                                 {(file.file.size / (1024 * 1024)).toFixed(1)} MB
                               </Badge>
                               <span className={cn(
                                 "text-[9px] md:text-[10px] font-bold uppercase tracking-widest",
                                 file.status === 'completed' ? "text-green-500" : 
                                 file.status === 'failed' ? "text-red-500" : "text-muted-foreground/40"
                               )}>
                                 {file.status}
                               </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFile(file.id)} 
                          disabled={file.status === "uploading" && isUploading}
                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-red-500/10 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
                        >
                          <Icons.x className="h-4 w-4" />
                        </Button>
                      </div>

                      {file.status === "uploading" && (
                        <div className="space-y-3 md:space-y-4">
                          <div className="relative h-1.5 md:h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                             <motion.div 
                               className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                               initial={{ width: 0 }}
                               animate={{ width: `${file.progress}%` }}
                               transition={{ duration: 0.5 }}
                             />
                          </div>
                          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <div className="flex items-center gap-2 md:gap-4">
                               <span className="flex items-center gap-1.5">
                                 <Icons.refreshCw className="h-3 w-3 animate-spin" />
                                 {((file.speed || 0) / (1024 * 1024)).toFixed(1)} MB/s
                               </span>
                               <span className="opacity-30">•</span>
                               <span>ETA: {file.eta || 0}s</span>
                            </div>
                            <span className="text-foreground">{file.progress}%</span>
                          </div>
                        </div>
                      )}
                      
                      {file.status === "completed" && (
                        <div className="flex items-center gap-2 md:gap-3 text-green-500 bg-green-500/5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-green-500/10 w-fit">
                          <Icons.checkCircle className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Upload Complete</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
