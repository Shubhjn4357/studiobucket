"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { pauseQueueAction, resumeQueueAction, purgeQueueAction } from "@/app/dashboard/actions"
import { useTelemetry } from "@/hooks/use-telemetry"
import { UploadJob } from "@/schemas"

interface Job extends Omit<UploadJob, "data" | "result" | "error" | "status"> {
  status: "waiting" | "active" | "completed" | "failed" | "delayed"
  data?: string | null
}

function JobCard({ job }: { job: Job }) {
  const liveData = useTelemetry(job.id)
  const currentProgress = liveData?.progress ?? job.progress
  const currentStatus = (liveData?.status ?? job.status) as Job["status"]

  let jobName = "Background_Process_Node"
  try {
    if (job.data) {
      const parsed = typeof job.data === "string" ? JSON.parse(job.data) : job.data
      jobName = parsed.title || parsed.fileName || jobName
    }
  } catch {
    // Fallback
  }

  const getTimeAgo = (ts: number) => {
    const seconds = Math.floor(Date.now() / 1000 - ts)
    if (seconds < 60) return "T-SYNC: JUST_NOW"
    if (seconds < 3600) return `T-SYNC: ${Math.floor(seconds / 60)}M_AGO`
    return `T-SYNC: ${Math.floor(seconds / 3600)}H_AGO`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group transition-all duration-700 shadow-2xl relative">
        <div className="flex">
          <div className={cn(
            "w-2 shrink-0 transition-all duration-1000",
            currentStatus === "active" ? "bg-primary animate-pulse" :
            currentStatus === "completed" ? "bg-emerald-500" :
            currentStatus === "failed" ? "bg-red-500" : "bg-white/5"
          )} />
          
          <div className="flex-1 p-8 flex flex-col lg:flex-row items-center gap-12 relative z-10">
            {/* Process Icon HUD */}
            <div className={cn(
              "h-20 w-20 rounded-[1.8rem] flex items-center justify-center shrink-0 border transition-all duration-700 shadow-2xl relative overflow-hidden group-hover:scale-105",
              job.queueName?.includes("upload") 
                ? "bg-primary/10 text-primary border-primary/20" 
                : "bg-accent/10 text-accent border-accent/20"
            )}>
              <div className="absolute inset-0 bg-white/5 opacity-20 group-hover:opacity-40 transition-opacity" />
              {job.queueName?.includes("upload") ? <Icons.upload className="h-8 w-8 relative z-10" /> : <Icons.zap className="h-8 w-8 relative z-10" />}
            </div>

            <div className="flex-1 min-w-0 space-y-3 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-5">
                <h4 className="text-xl font-black text-white uppercase tracking-tighter italic truncate leading-none group-hover:text-primary transition-colors">{jobName}</h4>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border italic transition-all duration-700",
                  currentStatus === "active" ? "border-primary/40 bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" :
                  currentStatus === "completed" ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-500" :
                  "border-white/10 bg-white/5 text-white/20"
                )}>
                  {currentStatus.toUpperCase()}
                </div>
              </div>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] italic leading-none">
                {job.queueName?.toUpperCase()} {"//"} {getTimeAgo(job.createdAt)}
              </p>
            </div>

            <div className="w-full lg:w-96 space-y-4 bg-black/20 p-6 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">Transmission_Sync</p>
                   <p className="text-lg font-black text-white italic leading-none tracking-tighter">{currentProgress}%</p>
                </div>
                {currentStatus === "active" && (
                   <span className="text-[9px] font-black text-primary animate-pulse italic">UPLINK_LIVE</span>
                )}
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${currentProgress}%` }}
                   transition={{ duration: 1, ease: "circOut" }}
                   className={cn(
                     "h-full rounded-full relative",
                     currentStatus === "active" ? "bg-primary" : "bg-white/20"
                   )}
                 >
                    <div className="absolute inset-0 bg-white/20 mix-blend-overlay opacity-30" />
                 </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-l border-white/5 pl-8 hidden lg:flex">
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-red-500/10 text-white/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">
                <Icons.trash2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function QueueClient({ initialJobs, initialStats }: { 
  initialJobs: Job[], 
  initialStats: { active: number, completed: number, failed: number, waiting: number } 
}) {
  const [jobs] = useState(initialJobs)
  const [isPaused, setIsPaused] = useState(false)

  const handlePause = async () => {
    try {
      if (isPaused) {
        await resumeQueueAction()
        toast.success("Global fleet resumed")
      } else {
        await pauseQueueAction()
        toast.success("Global fleet paused")
      }
      setIsPaused(!isPaused)
    } catch {
      toast.error("Handshake interruption")
    }
  }

  const handlePurge = async () => {
    try {
      await purgeQueueAction()
      toast.success("Operational archives purged")
    } catch {
      toast.error("Purge synchronization failed")
    }
  }

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Industrial Header Console */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scanline FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative group">
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Icons.activity className="h-12 w-12 text-white relative z-10" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Queue_Active</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Queue_Control</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Operational_Task_Manager {"//"} Node_Scheduler</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <Button 
            variant="ghost" 
            onClick={handlePause}
            className="hidden lg:flex h-16 rounded-[1.8rem] border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] px-10 hover:bg-white/10 transition-all italic text-white/40"
          >
            {isPaused ? <Icons.play className="h-5 w-5 mr-3" /> : <Icons.pause className="h-5 w-5 mr-3" />}
            {isPaused ? "RESUME_FLEET" : "PAUSE_FLEET"}
          </Button>
          <Button 
            onClick={handlePurge}
            className="h-16 bg-primary text-white hover:scale-[1.05] active:scale-[0.95] rounded-[1.8rem] px-12 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 transition-all italic border border-primary/20"
          >
            <Icons.trash2 className="h-5 w-5 mr-3" />
            PURGE_ARCHIVES
          </Button>
        </div>
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 gap-10 relative z-10 px-4">
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center bg-black/40 backdrop-blur-3xl border border-dashed border-white/10 rounded-[4rem]"
            >
              <div className="flex flex-col items-center gap-8">
                 <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                   <Icons.activity className="h-10 w-10 text-white/10" />
                 </div>
                 <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">Zero_Operational_Tasks_In_Queue</p>
              </div>
            </motion.div>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
