"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"

interface DownloadJob {
  id: string
  url: string
  title: string
  status: "pending" | "downloading" | "completed" | "failed"
  progress: number
}

interface RawDownloadJob {
  id: string
  sourceUrl: string
  status: "pending" | "downloading" | "completed" | "failed"
  progress: number | null
}

export default function DownloaderPage() {
  const [url, setUrl] = useState("")
  const [jobs, setJobs] = useState<DownloadJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Load initial jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch("/api/download")
        const { data } = await response.json()
        if (data) {
          setJobs(data.map((j: RawDownloadJob) => ({
            id: j.id,
            url: j.sourceUrl,
            title: j.status === "completed" ? "Download Finished" : "Downloading...",
            status: j.status,
            progress: j.progress || 0
          })))
        }
      } catch (error) {
        console.error("Failed to load downloads:", error)
      }
    }
    loadJobs()
  }, [])

  const handleAddDownload = async () => {
    if (!url) return
    setIsProcessing(true)
    
    try {
      let sourceType: "video" | "playlist" | "channel" = "video"
      let normalizedUrl = url.trim()
      
      if (normalizedUrl.includes("youtu.be/")) {
        const id = normalizedUrl.split("youtu.be/")[1]?.split("?")[0]
        if (id) normalizedUrl = `https://www.youtube.com/watch?v=${id}`
      }

      if (normalizedUrl.includes("list=") || normalizedUrl.includes("/playlists")) sourceType = "playlist"
      else if (normalizedUrl.includes("/channel/") || normalizedUrl.includes("/@")) sourceType = "channel"

      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: normalizedUrl, sourceType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start download")
      }
      
      const { data } = await response.json()
      const newJobs: DownloadJob[] = []
      
      if (data.jobs && Array.isArray(data.jobs)) {
          data.jobs.forEach((job: RawDownloadJob) => {
              newJobs.push({
                  id: job.id,
                  url: job.sourceUrl,
                  title: "Preparing...",
                  status: "pending",
                  progress: 0,
              })
              pollJobStatus(job.id)
          })
      } else if (data.downloadJob) {
          newJobs.push({
              id: data.downloadJob.id,
              url: normalizedUrl,
              title: "Preparing...",
              status: "pending",
              progress: 0,
          })
          pollJobStatus(data.downloadJob.id)
      }
      
      setJobs(prev => [...newJobs, ...prev])
      setUrl("")
      toast.success(newJobs.length > 1 ? `Started ${newJobs.length} downloads` : "Download started")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start download")
    } finally {
      setIsProcessing(false)
    }
  }

  const pollJobStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/download?id=${id}`)
        const { data } = await response.json()
        const job = (data || []).find((j: RawDownloadJob) => j.id === id)

        if (job) {
          setJobs(prev => prev.map(j => j.id === id ? { 
            ...j, 
            status: job.status, 
            progress: job.progress || 0,
            title: job.status === "completed" ? "Download Finished" : j.title 
          } : j))

          if (job.status === "completed" || job.status === "failed") {
            clearInterval(interval)
            if (job.status === "completed") toast.success("Download complete")
            else toast.error("Download failed")
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 2000)
  }

  const purgeJob = async (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success("Download removed from list")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <PageHeader 
        title="Video Downloader" 
        description="Download videos from YouTube and other platforms easily." 
        icon={Icons.download}
      />

      {/* Input Section */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Icons.link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube link here..."
            className="pl-12 h-14 rounded-xl text-lg border-border focus-visible:ring-primary/20"
          />
        </div>
        <Button 
          onClick={handleAddDownload} 
          disabled={isProcessing || !url}
          className="w-full md:w-auto px-8 h-14 rounded-xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isProcessing ? <Icons.refreshCw className="animate-spin h-5 w-5 mr-2" /> : <Icons.zap className="h-5 w-5 mr-2" />}
          Start Download
        </Button>
      </div>

      {/* Downloads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/40 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{job.url}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  job.status === "completed" ? "bg-green-500/10 text-green-500" :
                  job.status === "failed" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {job.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(job.progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg text-xs font-bold"
                    onClick={() => purgeJob(job.id)}
                  >
                    Remove
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={job.status !== "completed"}
                    className="flex-1 rounded-lg text-xs font-bold"
                  >
                    Open in Editor
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
          <Icons.inbox className="h-16 w-16 mb-4" />
          <p className="font-bold">No active downloads</p>
        </div>
      )}
    </div>
  )
}
