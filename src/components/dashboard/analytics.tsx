"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function Analytics({ initialData }: { initialData?: { totalViews: number, totalLikes: number, totalComments: number, totalVideos: number } }) {
  const displayStats = [
    { label: "Views", value: initialData?.totalViews || 0, growth: "+12%", icon: Icons.eye, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Likes", value: initialData?.totalLikes || 0, growth: "+8%", icon: Icons.heart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Comments", value: initialData?.totalComments || 0, growth: "+5%", icon: Icons.messageCircle, color: "text-accent", bg: "bg-accent/10" },
    { label: "Videos", value: initialData?.totalVideos || 0, growth: "+2", icon: Icons.video, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ]

  return (
    <Card className="cyber-card border-white/5 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-white">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.barChart className="h-5 w-5 text-primary" />
              </div>
              Real-time Analytics
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">Global performance across all synchronized channels.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white transition-all">
            Last 30 Days
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  {stat.growth}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tighter">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative p-6 rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 border border-white/10 overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Icons.trendingUp className="h-32 w-32 text-white" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/10 border border-white/10 mb-2">
                <Icons.zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Suggestion</span>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tighter">Optimize Pipeline</h4>
              <p className="text-xs text-slate-300 font-medium max-w-[240px] leading-relaxed">
                Your content is trending in &quot;AI Automation&quot;. Upload 2 more Shorts to maximize reach.
              </p>
            </div>
            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest px-6 transition-transform hover:scale-105 active:scale-95">
              AUTOPILOT ON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
