"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
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
            title: j.status === "completed" ? "Archive Recovered" : "Transmission Active",
            status: j.status,
            progress: j.progress || 0
          })))
        }
      } catch (error) {
        console.error("Failed to load jobs:", error)
      }
    }
    loadJobs()
  }, [])

  const handleAddDownload = async () => {
    if (!url) return
    setIsProcessing(true)
    
    try {
      let sourceType: "video" | "playlist" | "channel" = "video"
      const normalizedUrl = url.trim()
      
      if (normalizedUrl.includes("list=") || normalizedUrl.includes("/playlists")) sourceType = "playlist"
      else if (normalizedUrl.includes("/channel/") || normalizedUrl.includes("/@")) sourceType = "channel"

      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sourceUrl: normalizedUrl, 
          sourceType: sourceType 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Handshake Failure")
      }
      
      const { data } = await response.json()
      const newJobs: DownloadJob[] = []
      
      if (data.jobs && Array.isArray(data.jobs)) {
          data.jobs.forEach((job: RawDownloadJob) => {
              newJobs.push({
                  id: job.id,
                  url: job.sourceUrl,
                  title: "Initializing Node...",
                  status: "pending",
                  progress: 0,
              })
              pollJobStatus(job.id)
          })
      } else if (data.downloadJob) {
          newJobs.push({
              id: data.downloadJob.id,
              url: normalizedUrl,
              title: "Initializing Node...",
              status: "pending",
              progress: 0,
          })
          pollJobStatus(data.downloadJob.id)
      }
      
      setJobs(prev => [...newJobs, ...prev])
      setUrl("")
      toast.success(newJobs.length > 1 ? `Deployment of ${newJobs.length} units initiated` : "Download protocol initiated")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Uplink synchronization failed"
      toast.error(message)
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
            title: job.status === "completed" ? "Archive Recovered" : j.title 
          } : j))

          if (job.status === "completed" || job.status === "failed") {
            clearInterval(interval)
            if (job.status === "completed") toast.success("Asset Recovered")
            else toast.error("Asset Recovery Failed")
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 2000)
  }

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Deck */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative group"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Icons.download className="h-12 w-12 text-white relative z-10" />
          </motion.div>
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Recovery_Stream_Live</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Asset_Ingestion</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Global_Grid // Resource_Recovery_Node</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end gap-3 border-l border-white/5 pl-12">
           <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Network_Link</span>
              <span className="text-[10px] font-mono font-black text-emerald-500 italic">SECURE_SYNC_10G</span>
           </div>
           <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-primary/40 shadow-[0_0_15px_var(--color-primary)]"
                animate={{ width: ["20%", "80%", "45%"] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
           </div>
        </div>
      </div>

      {/* Industrial Ingestion Terminal */}
      <div className="max-w-5xl mx-auto w-full px-4 relative z-10">
        <div className="backdrop-blur-3xl bg-black/60 border border-white/10 rounded-[3.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 group focus-within:border-primary/40 transition-all duration-700 relative overflow-hidden">
          {/* Internal Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none bg-[size:100%_4px] opacity-10" />
          
          <div className="relative flex-1 w-full">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-8 text-white/10 flex items-center justify-center transition-colors group-focus-within:text-primary">
              <Icons.link className="h-full w-full" />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Inject_Resource_URL..."
              className="bg-black/20 border-white/5 pl-20 h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-tight text-white placeholder:text-white/10 focus-visible:ring-primary/20 transition-all italic"
            />
          </div>
          <Button 
            onClick={handleAddDownload} 
            disabled={isProcessing || !url}
            className="w-full md:w-auto bg-white text-black px-16 h-20 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-white/90 active:scale-[0.98] transition-all italic border border-white/20 group/btn relative overflow-hidden"
          >
            {isProcessing ? <Icons.refreshCw className="animate-spin h-6 w-6" /> : (
              <>
                <Icons.zap className="h-6 w-6 mr-4 group-hover/btn:scale-125 transition-transform" />
                Initiate_Protocol
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          <div className="flex items-center gap-4 hover:text-primary transition-colors cursor-default group"><Icons.shieldCheck className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" /> Security: Verified</div>
          <div className="flex items-center gap-4 hover:text-primary transition-colors cursor-default group"><Icons.zap className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" /> Speed: Unlimited</div>
          <div className="flex items-center gap-4 hover:text-primary transition-colors cursor-default group"><Icons.layers className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" /> Load: Distributed</div>
        </div>
      </div>

      {/* Recovered Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 px-4 relative z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden group hover:border-primary/40 transition-all duration-700 shadow-2xl relative flex flex-col h-full">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                
                <div className="aspect-video bg-black relative overflow-hidden border-b border-white/5">
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    <Icons.download className={cn("h-24 w-24 text-white/5 transition-all duration-1000", job.status === "downloading" && "text-primary/20 scale-110")} />
                  </div>
                  
                  {/* Status Node Overlay */}
                  <div className="absolute top-10 left-10 flex items-center gap-4">
                     <div className="flex items-center gap-3 px-6 py-2 bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                        <span className={cn(
                          "h-2 w-2 rounded-full animate-pulse",
                          job.status === "completed" ? "bg-emerald-500 shadow-emerald-500/40" :
                          job.status === "failed" ? "bg-red-500 shadow-red-500/40" : "bg-amber-500 shadow-amber-500/40"
                        )} />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest italic">NODE_{job.id.slice(0, 4).toUpperCase()}</span>
                     </div>
                  </div>

                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-3">
                    <p className="text-3xl font-black text-white uppercase tracking-tighter italic truncate group-hover:text-primary transition-colors leading-none">{job.title}</p>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">{job.status}_PROTOCOL</span>
                      <span className="text-4xl font-black text-white italic font-mono tracking-tighter">{Math.round(job.progress)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-12 space-y-12 flex-1 flex flex-col justify-between relative z-10">
                  <div className="relative pt-2">
                    <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner p-1">
                       <motion.div 
                          className="h-full rounded-full bg-primary shadow-[0_0_30px_var(--color-primary)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                       />
                    </div>
                    <div className="flex justify-between mt-6 px-1">
                      <div className="flex items-center gap-3">
                         <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Signal_Locked</span>
                      </div>
                      <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] italic">ID_{job.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                    <Button variant="ghost" className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all italic text-white/30">
                      Purge_Task
                    </Button>
                    <Button 
                      disabled={job.status !== "completed"}
                      className={cn(
                        "h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all italic border",
                        job.status === "completed" ? "bg-white text-black shadow-2xl border-white/20" : "bg-black/40 text-white/5 border-white/5"
                      )}
                    >
                      <Icons.zap className="h-4 w-4 mr-3" />
                      Studio_Sync
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State Illustration */}
      {jobs.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-48 relative z-10"
        >
          <div className="h-48 w-48 rounded-[3.5rem] border border-dashed border-white/10 flex items-center justify-center mb-12 relative overflow-hidden">
             <div className="absolute inset-0 rounded-[3.5rem] bg-white/5 blur-3xl opacity-20" />
             <Icons.inbox className="h-20 w-20 text-white/5 relative z-10" />
          </div>
          <div className="space-y-4 text-center">
            <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20 italic block">Queue_Matrix_De-Synchronized</span>
            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">Awaiting_Ingestion_Commands...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
