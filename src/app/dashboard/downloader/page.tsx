"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

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
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)

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

  const removeJob = async () => {
    if (!deleteJobId) return
    const id = deleteJobId
    setDeleteJobId(null)
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success("Download removed from list")
  }

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader 
        title="Video Downloader" 
        description="Import video content from any URL into your library for quick editing and publishing." 
        iconName="download"
      />

      <div className="bg-card border border-border p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-4 md:mt-8 group animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative flex-1 w-full">
          <Icons.link className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground/30 transition-colors group-focus-within:text-primary" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste source URL here..."
            className="pl-12 md:pl-16 h-12 md:h-16 rounded-xl md:rounded-2xl text-sm md:text-lg border-border focus-visible:ring-primary/10 transition-all bg-muted/20 placeholder:text-muted-foreground/30"
          />
        </div>
        <Button 
          onClick={handleAddDownload} 
          disabled={isProcessing || !url}
          className="w-full md:w-auto px-8 md:px-12 h-12 md:h-16 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isProcessing ? <Icons.refreshCw className="animate-spin h-5 w-5 mr-3" /> : <Icons.zap className="h-5 w-5 mr-3" />}
          Import
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:border-primary/20 transition-all group/card relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="font-bold text-lg md:text-xl text-foreground truncate group-hover/card:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground/50">
                    <Icons.link className="h-3 w-3 shrink-0" />
                    <p className="text-[9px] md:text-[10px] font-bold truncate max-w-[200px] md:max-w-[300px] uppercase tracking-widest">{job.url}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shrink-0",
                  job.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  job.status === "failed" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20 animate-pulse"
                )} variant="outline">
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    <span>Transfer Progress</span>
                    <span className="text-foreground">{Math.round(job.progress)}%</span>
                  </div>
                  <div className="h-1 md:h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                    <motion.div 
                      className="h-full bg-primary shadow-lg shadow-primary/20 transition-all duration-1000"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-xl md:rounded-2xl h-10 md:h-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                    onClick={() => setDeleteJobId(job.id)}
                  >
                    Remove
                  </Button>
                  <Link href={`/dashboard/studio?id=${job.id}`} className="flex-1">
                    <Button 
                      size="sm" 
                      disabled={job.status !== "completed"}
                      className="w-full rounded-xl md:rounded-2xl h-10 md:h-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:scale-[1.05] active:scale-95"
                    >
                      Open Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {jobs.length === 0 && !isProcessing && (
        <div className="flex flex-col items-center justify-center py-20 md:py-40 text-muted-foreground opacity-30 border border-dashed border-border rounded-[2rem] md:rounded-[3rem] mt-8 md:mt-12 bg-muted/5">
          <Icons.download className="h-16 w-16 md:h-20 md:w-20 mb-6 md:mb-8" />
          <p className="font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px]">No active downloads detected</p>
        </div>
      )}

      <DeleteConfirmDialog 
        open={!!deleteJobId}
        onOpenChange={(open) => !open && setDeleteJobId(null)}
        onConfirm={removeJob}
        title="Remove Download?"
        description="This will stop the transfer and remove it from your active list. Any partial data will be cleared."
        confirmText="Remove Download"
      />
    </PageContainer>
  )
}
