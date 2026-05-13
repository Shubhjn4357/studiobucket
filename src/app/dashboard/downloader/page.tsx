"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

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
    <PageContainer maxWidth="6xl">
      <PageHeader 
        title="Downloader" 
        description="Ingest video assets from various source endpoints into the studio registry." 
        iconName="download"
      />

      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4 group">
        <div className="relative flex-1 w-full">
          <Icons.link className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste source URL (YouTube, Vimeo, etc.)..."
            className="pl-14 h-16 rounded-2xl text-lg border-border focus-visible:ring-primary/10 transition-all bg-muted/20"
          />
        </div>
        <Button 
          onClick={handleAddDownload} 
          disabled={isProcessing || !url}
          className="w-full md:w-auto px-10 h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing ? <Icons.refreshCw className="animate-spin h-5 w-5 mr-3" /> : <Icons.zap className="h-5 w-5 mr-3" />}
          Initialize
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/20 transition-all group/card"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate group-hover/card:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icons.link className="h-3 w-3 shrink-0" />
                    <p className="text-[10px] font-medium truncate max-w-[200px] uppercase tracking-wider">{job.url}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                  job.status === "completed" ? "bg-green-500/10 text-green-500" :
                  job.status === "failed" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary animate-pulse"
                )}>
                  {job.status}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Registry Write Status</span>
                    <span className="text-foreground">{Math.round(job.progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                    onClick={() => purgeJob(job.id)}
                  >
                    Purge
                  </Button>
                  <Link href={`/dashboard/studio?id=${job.id}`} className="flex-1">
                    <Button 
                      size="sm" 
                      disabled={job.status !== "completed"}
                      className="w-full rounded-xl h-10 text-[10px] font-black uppercase tracking-widest shadow-md"
                    >
                      Initialize Editor
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {jobs.length === 0 && !isProcessing && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground opacity-30">
          <Icons.inbox className="h-16 w-16 mb-6" />
          <p className="font-black uppercase tracking-[0.4em] text-xs">No Active Ingress Streams</p>
        </div>
      )}
    </PageContainer>
  )
}
