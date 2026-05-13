"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { pauseQueueAction, resumeQueueAction, removeQueueAction } from "@/app/dashboard/actions"
import { useTelemetry } from "@/hooks/use-telemetry"
import { UploadJob } from "@/schemas"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

interface Job extends Omit<UploadJob, "data" | "result" | "error" | "status"> {
  status: "waiting" | "active" | "completed" | "failed" | "delayed"
  data?: string | null
}

function JobCard({ job }: { job: Job }) {
  const liveData = useTelemetry(job.id)
  const currentProgress = liveData?.progress ?? job.progress
  const currentStatus = (liveData?.status ?? job.status) as Job["status"]

  let jobName = "Untitled Task"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="bg-card border-border hover:border-primary/20 transition-all rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 md:gap-8">
            {/* Status Icon */}
            <div className={cn(
              "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border shadow-inner transition-colors",
              currentStatus === "active" ? "bg-primary/10 text-primary border-primary/20" :
              currentStatus === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
              currentStatus === "failed" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted text-muted-foreground border-border"
            )}>
              {job.queueName?.includes("upload") ? <Icons.upload className="h-5 w-5 md:h-6 md:w-6" /> : <Icons.zap className="h-5 w-5 md:h-6 md:w-6" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-1 md:gap-3">
                <h4 className="text-sm md:text-base font-bold text-foreground truncate w-full md:max-w-[200px] lg:max-w-[400px]">{jobName}</h4>
                <div className={cn(
                  "px-2 md:px-3 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border",
                  currentStatus === "active" ? "bg-primary/10 text-primary border-primary/20" :
                  currentStatus === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  "bg-muted text-muted-foreground border-border"
                )}>
                  {currentStatus}
                </div>
              </div>
              <p className="text-[8px] md:text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate opacity-60">
                {job.queueName?.split("-").join(" ")} • {getTimeAgo(job.createdAt)}
              </p>
            </div>

            <div className="w-full md:w-48 lg:w-64 space-y-2 md:space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[8px] md:text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Progress</span>
                <span className="text-xs md:text-sm font-black text-foreground tabular-nums">{currentProgress}%</span>
              </div>
              <div className="h-1 md:h-1.5 w-full bg-muted rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${currentProgress}%` }}
                   className={cn(
                     "h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] transition-all duration-1000",
                     currentStatus === "completed" && "bg-green-500 shadow-none"
                   )}
                 />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 md:pt-0">
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                <Icons.trash2 className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function QueueClient({ initialJobs }: { 
  initialJobs: Job[], 
  initialStats: { active: number, completed: number, failed: number, waiting: number } 
}) {
  const [jobs] = useState(initialJobs)
  const [isPaused, setIsPaused] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handlePause = async () => {
    try {
      if (isPaused) {
        await resumeQueueAction()
        toast.success("Processing resumed")
      } else {
        await pauseQueueAction()
        toast.success("Processing paused")
      }
      setIsPaused(!isPaused)
    } catch {
      toast.error("Failed to update queue status")
    }
  }

  const handleRemove = async () => {
    try {
      await removeQueueAction()
      setShowClearDialog(false)
      toast.success("All tasks cleared from queue")
    } catch {
      toast.error("Failed to clear queue")
    }
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Processing Queue" 
        description="Monitor and manage background tasks and automated uploads." 
        iconName="activity"
      >
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handlePause}
            className="flex-1 sm:flex-none font-bold rounded-xl h-10 md:h-11 px-4 md:px-6 border-border"
          >
            {isPaused ? <Icons.play className="h-4 w-4 mr-2" /> : <Icons.pause className="h-4 w-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button 
            onClick={() => setShowClearDialog(true)}
            variant="destructive"
            className="flex-1 sm:flex-none font-bold rounded-xl h-10 md:h-11 px-4 md:px-6 shadow-lg shadow-red-500/10"
          >
            <Icons.trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 md:py-32 text-center bg-card border border-dashed border-border rounded-[2rem] md:rounded-[2.5rem]"
            >
              <div className="flex flex-col items-center gap-6 px-4">
                 <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-muted flex items-center justify-center">
                   <Icons.inbox className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground opacity-30" />
                 </div>
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">No active tasks in processing</p>
              </div>
            </motion.div>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmDialog 
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleRemove}
        title="Clear Entire Queue?"
        description="This will permanently cancel and remove all pending and active tasks from the processing engine."
        confirmText="Clear All Tasks"
        requireWordConfirm="CLEAR"
      />
    </PageContainer>
  )
}
