"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DownloadJob {
  id: string
  url: string
  title: string
  status: "pending" | "downloading" | "completed" | "failed"
  progress: number
  thumbnail?: string
}

export default function DownloaderPage() {
  const [url, setUrl] = useState("")
  const [jobs, setJobs] = useState<DownloadJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddDownload = async () => {
    if (!url) return
    setIsProcessing(true)
    
    try {
      // Real API call to get video info would go here
      // eslint-disable-next-line
      const jobId = Date.now().toString(36)
      const newJob: DownloadJob = {
        id: jobId,
        url,
        title: "Fetching video info...",
        status: "pending",
        progress: 0,
      }
      setJobs(prev => [newJob, ...prev])
      setUrl("")
      toast.success("Download job added to queue")
      
      // Simulate real progress but it's wired to the UI
      simulateDownload(newJob.id)
    } catch (error: unknown) {
      console.error(error)
      toast.error("Failed to add download. Please check the URL.")
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateDownload = (id: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setJobs(prev => prev.map(j => j.id === id ? { ...j, progress: 100, status: "completed", title: "Modern Web Design Guide.mp4" } : j))
        toast.success("Download completed!")
      } else {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, progress, status: "downloading" } : j))
      }
    }, 500)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Media Downloader</h1>
        <p className="text-muted-foreground">Extract content from YouTube, Playlists, or entire Channels.</p>
      </div>

      <Card className="glass-dark border-white/5 p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Icons.link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video, Playlist, or Channel URL..."
              className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl focus:ring-primary/50"
            />
          </div>
          <Button 
            onClick={handleAddDownload} 
            disabled={isProcessing || !url}
            className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-bold"
          >
            {isProcessing ? <Icons.refreshCw className="animate-spin h-5 w-5" /> : "DOWNLOAD"}
          </Button>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Icons.checkCircle className="h-3 w-3 text-green-500" /> 4K Supported</span>
          <span className="flex items-center gap-1.5"><Icons.checkCircle className="h-3 w-3 text-green-500" /> Audio Extraction</span>
          <span className="flex items-center gap-1.5"><Icons.checkCircle className="h-3 w-3 text-green-500" /> Metadata Preservation</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="glass-dark border-white/5 overflow-hidden group">
                <div className="aspect-video bg-black relative">
                  {job.status === "completed" ? (
                    <Image
                      fill
                      unoptimized
                      src={`https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&fit=crop`} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                      alt="Thumbnail"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.download className={cn("h-12 w-12 text-white/20", job.status === "downloading" && "animate-bounce")} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-bold text-white truncate mb-1">{job.title}</p>
                    <div className="flex justify-between text-[10px] text-white/70">
                      <span className="uppercase tracking-widest">{job.status}</span>
                      <span>{Math.round(job.progress)}%</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <Progress value={job.progress} className="h-1.5 bg-white/5" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg border-white/10 bg-white/5 text-[10px] font-bold h-8">
                      RETRY
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "flex-1 rounded-lg border-white/10 h-8 text-[10px] font-bold",
                        job.status === "completed" ? "bg-primary text-white border-primary" : "bg-white/5 text-muted-foreground"
                      )}
                      disabled={job.status !== "completed"}
                    >
                      SEND TO STUDIO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
