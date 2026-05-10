"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const mockJobs = [
  { id: "1", type: "upload", name: "vlog_01.mp4", status: "active", progress: 65, createdAt: "10 mins ago" },
  { id: "2", type: "download", name: "https://youtube.com/watch?v=...", status: "waiting", progress: 0, createdAt: "15 mins ago" },
  { id: "3", type: "render", name: "Project_SaaS_Redesign", status: "failed", progress: 12, createdAt: "1 hour ago", error: "FFmpeg exit code 1" },
  { id: "4", type: "upload", name: "tutorial_nextjs.mp4", status: "completed", progress: 100, createdAt: "2 hours ago" },
]

export default function QueuePage() {
  const [jobs, setJobs] = useState(mockJobs)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Queue Management</h1>
          <p className="text-muted-foreground">Monitor and control your background automation tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-xs font-bold h-10">
            PAUSE ALL
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-10 px-6">
            CLEAR COMPLETED
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className={cn(
                "glass-dark border-white/5 overflow-hidden transition-all duration-300",
                job.status === "failed" && "border-primary/20 bg-primary/5"
              )}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Status Indicator */}
                    <div className={cn(
                      "w-1 md:w-2 shrink-0",
                      job.status === "active" ? "bg-primary animate-pulse" :
                      job.status === "completed" ? "bg-green-500" :
                      job.status === "failed" ? "bg-red-500" : "bg-white/10"
                    )} />

                    <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                        job.type === "upload" ? "bg-primary/10 text-primary" :
                        job.type === "download" ? "bg-blue-500/10 text-blue-500" :
                        "bg-purple-500/10 text-purple-500"
                      )}>
                        {job.type === "upload" ? <Icons.upload className="h-6 w-6" /> :
                         job.type === "download" ? <Icons.download className="h-6 w-6" /> :
                         <Icons.video className="h-6 w-6" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{job.name}</h4>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                            job.status === "active" ? "bg-primary/20 text-primary" :
                            job.status === "completed" ? "bg-green-500/20 text-green-500" :
                            job.status === "failed" ? "bg-red-500/20 text-red-500" : "bg-white/10 text-muted-foreground"
                          )}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                          {job.type} • Created {job.createdAt}
                        </p>
                      </div>

                      <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-1.5 bg-white/5" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white">
                          {job.status === "active" ? <Icons.pause className="h-4 w-4" /> : <Icons.play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary">
                          <Icons.trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {job.status === "failed" && (
                    <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/10 flex items-center gap-2">
                      <Icons.alertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-500 font-medium">{job.error}</span>
                      <Button variant="ghost" size="sm" className="ml-auto h-7 text-[10px] font-bold text-red-500 hover:bg-red-500/20">
                        RETRY JOB
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
