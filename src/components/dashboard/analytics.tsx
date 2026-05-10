"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function Analytics({ initialData }: { initialData?: { totalViews: number, totalLikes: number, totalComments: number, totalVideos: number } }) {
  const displayStats = [
    { label: "Views", value: initialData?.totalViews || 0, growth: "+12%", icon: Icons.eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Likes", value: initialData?.totalLikes || 0, growth: "+8%", icon: Icons.heart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Comments", value: initialData?.totalComments || 0, growth: "+5%", icon: Icons.messageCircle, color: "text-accent", bg: "bg-accent/10" },
    { label: "Videos", value: initialData?.totalVideos || 0, growth: "+2", icon: Icons.video, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  return (
    <Card className="cyber-card border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-foreground italic">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.barChart className="h-5 w-5 text-primary" />
              </div>
              Real-time Analytics
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">Live performance metrics.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-border bg-muted/50 text-[9px] font-black uppercase tracking-widest hover:bg-muted text-foreground transition-all">
            Last 30 Days
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {stat.growth}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground tracking-tighter italic">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative p-6 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Icons.trendingUp className="h-32 w-32 text-foreground" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-background/50 border border-border mb-2">
                <Icons.zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[8px] font-black text-foreground uppercase tracking-widest">AI Strategy</span>
              </div>
              <h4 className="text-lg font-black text-foreground uppercase tracking-tighter italic">Optimization Protocol</h4>
              <p className="text-[10px] text-muted-foreground font-medium max-w-[240px] leading-relaxed uppercase tracking-wide">
                Your content is trending in &quot;AI Automation&quot;. Deploy 2 more Shorts to maximize impact.
              </p>
            </div>
            <Button size="sm" className="bg-foreground text-background hover:opacity-90 rounded-xl h-9 text-[9px] font-black uppercase tracking-widest px-6 transition-transform hover:scale-105 active:scale-95">
              Activate Autopilot
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
