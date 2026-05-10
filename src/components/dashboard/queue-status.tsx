"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { useTelemetry } from "@/hooks/use-telemetry"

interface QueueData {
  active: number
  completed: number
  failed: number
  waiting: number
}

interface ActiveJob {
  id: string
  status: string
  progress: number | null
  data?: string | Record<string, unknown> | null
}

function JobRow({ job }: { job: ActiveJob }) {
  const liveData = useTelemetry(job.id)
  const currentProgress = liveData?.progress ?? job.progress ?? 0
  const currentStatus = liveData?.status ?? job.status

  let jobName = "Processing Job"
  try {
    if (job.data) {
      const parsed = typeof job.data === "string" ? JSON.parse(job.data) : job.data
      jobName = parsed.title || parsed.fileName || jobName
    }
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-2 p-3 rounded-xl bg-muted/50 border border-border group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center">
            <Icons.video className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[10px] font-black text-foreground truncate max-w-[120px] uppercase tracking-tight italic">{jobName}</span>
        </div>
        <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">{currentStatus}</span>
      </div>
      <div className="space-y-2">
        <Progress value={currentProgress} className="h-1 bg-muted" />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
          <span className="text-foreground">{currentProgress}% Complete</span>
          <span className="text-muted-foreground flex items-center gap-1">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live
          </span>
        </div>
      </div>
    </div>
  )
}

export function QueueStatus({ 
  initialData, 
  activeJobs = [] 
}: { 
  initialData?: QueueData, 
  activeJobs?: ActiveJob[] 
}) {
  const stats = [
    { label: "Active", value: initialData?.active || 0, icon: Icons.activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Waiting", value: initialData?.waiting || 0, icon: Icons.clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Done", value: initialData?.completed || 0, icon: Icons.checkCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Error", value: initialData?.failed || 0, icon: Icons.alertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  ]

  return (
    <Card className="cyber-card border-border overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-foreground italic">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.list className="h-5 w-5 text-primary" />
              </div>
              Queue Monitor
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">Live monitoring of the processing engine.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3 group hover:border-primary/20 transition-all"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div>
                <p className="text-lg font-black text-foreground leading-none italic">{stat.value}</p>
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Transmissions</span>
          </div>
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-xl">
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">No Active Tasks</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <JobRow key={job.id} job={job} />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
