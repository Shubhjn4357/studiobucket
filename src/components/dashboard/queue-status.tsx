"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface QueueData {
  active: number
  completed: number
  failed: number
  waiting: number
}

const activeJobs = [
  { id: "1", name: "Modern Architecture.mp4", progress: 65, status: "uploading", eta: "2m remaining" },
  { id: "2", name: "SaaS Blueprint.mov", progress: 30, status: "processing", eta: "5m remaining" },
]

export function QueueStatus({ initialData }: { initialData?: QueueData }) {
  const stats = [
    { label: "Active", value: initialData?.active || 0, icon: Icons.activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Waiting", value: initialData?.waiting || 0, icon: Icons.clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Done", value: initialData?.completed || 0, icon: Icons.checkCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Error", value: initialData?.failed || 0, icon: Icons.alertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  ]

  return (
    <Card className="cyber-card border-white/5 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-white">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.list className="h-5 w-5 text-primary" />
              </div>
              Queue Monitor
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-xs">Live monitoring of the processing engine.</CardDescription>
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
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:border-white/10 transition-colors"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div>
                <p className="text-lg font-black text-white leading-none">{stat.value}</p>
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Transmissions</span>
          </div>
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div key={job.id} className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                      <Icons.video className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[120px] uppercase tracking-tight">{job.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{job.status}</span>
                </div>
                <div className="space-y-2">
                  <Progress value={job.progress} className="h-1 bg-white/5" />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-white">{job.progress}% Complete</span>
                    <span className="text-slate-500">{job.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
