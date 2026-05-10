"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useTelemetry } from "@/hooks/use-telemetry"

interface Job {
  id: string
  status: string
  progress: number
  queueName?: string
  data?: any
  createdAt: number
}

function JobCard({ job }: { job: Job }) {
  const liveData = useTelemetry(job.id)
  const currentProgress = liveData?.progress ?? job.progress
  const currentStatus = liveData?.status ?? job.status

  let jobName = "Background Process"
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
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="cyber-card border-white/5 bg-slate-950/40 overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex">
            <div className={cn(
              "w-2 shrink-0",
              currentStatus === "active" ? "bg-primary animate-pulse" :
              currentStatus === "completed" ? "bg-emerald-500" :
              currentStatus === "failed" ? "bg-red-500" : "bg-slate-800"
            )} />
            
            <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-8">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-xl",
                job.queueName?.includes("upload") ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
              )}>
                {job.queueName?.includes("upload") ? <Icons.upload className="h-6 w-6" /> : <Icons.zap className="h-6 w-6" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight italic truncate">{jobName}</h4>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    currentStatus === "active" ? "border-primary/20 bg-primary/10 text-primary" :
                    currentStatus === "completed" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" :
                    "border-white/10 bg-white/5 text-slate-400"
                  )}>
                    {currentStatus}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                  {job.queueName} • {getTimeAgo(job.createdAt)}
                </p>
              </div>

              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Transmission</span>
                  <span className="text-white">{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-1 bg-white/5" />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                  <Icons.trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function QueueClient({ initialJobs, initialStats }: { initialJobs: any[], initialStats: any }) {
  const [jobs] = useState(initialJobs)

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Queue Control</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Operational Task Manager</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white transition-all">
            Pause Fleet
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            Purge Archives
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center border-2 border-dashed border-white/5 rounded-3xl"
            >
              <div className="flex flex-col items-center gap-4">
                 <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                   <Icons.activity className="h-8 w-8 text-slate-600" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No operational data in queue</p>
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
