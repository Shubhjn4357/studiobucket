"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Metric {
  label: string
  value: string
  change: string
  trending: "up" | "down"
}

interface VideoRow {
  id: string
  title: string
  views: string
  reach: string
  retention: string
}

interface DailyStat {
  date: string
  views: number | null
  likes: number | null
}

export function AnalyticsClient({ 
  metrics, 
  recentVideos, 
  dailyStats 
}: { 
  metrics: Metric[], 
  recentVideos: VideoRow[], 
  dailyStats: DailyStat[] 
}) {
  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 mt-4 md:mt-8">
      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card border-border shadow-sm rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all h-full">
              <CardContent className="p-4 md:p-8 flex flex-col justify-between h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4 md:mb-8">
                  <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate w-full">{metric.label}</p>
                  <div className={cn(
                    "px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black flex items-center gap-1.5 shrink-0",
                    metric.trending === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {metric.trending === "up" ? <Icons.arrowUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> : <Icons.arrowDown className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-2xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter tabular-nums truncate">{metric.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
        <Card className="lg:col-span-8 bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-4 md:py-6 shrink-0">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                   <CardTitle className="text-base md:text-lg font-bold">Views Trend</CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Daily performance summary</p>
                </div>
                <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-2xl border border-border/50">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Sync</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[400px] flex items-end gap-2 md:gap-4 pb-8 md:pb-12 px-6 md:px-12 pt-12 md:pt-20 overflow-x-auto">
            <div className="flex items-end gap-2 md:gap-5 w-full min-w-[500px] h-full">
              {dailyStats.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 opacity-20">
                  <Icons.barChart className="h-10 w-10 md:h-12 md:w-12" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No data points</p>
                </div>
              ) : (
                dailyStats.map((stat, i) => {
                  const maxViews = Math.max(...dailyStats.map(s => Number(s.views || 0)), 10)
                  const height = ((Number(stat.views || 0)) / maxViews) * 100
                  const day = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 md:gap-4 group h-full">
                      <div className="w-full h-full flex flex-col justify-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 5)}%` }}
                          className="w-full bg-primary/10 hover:bg-primary rounded-t-xl md:rounded-t-2xl transition-all relative group/bar shadow-inner border-t border-primary/20"
                        >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-foreground text-background text-[10px] font-black px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap z-20 pointer-events-none">
                            {Number(stat.views || 0).toLocaleString()} Views
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest shrink-0">{day}</span>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-4 md:py-6 shrink-0">
            <CardTitle className="text-base md:text-lg font-bold">Traffic Source</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Discovery breakdown</p>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
            {[
              { label: "Search Results", value: 85, color: "bg-primary" },
              { label: "Direct Feed", value: 45, color: "bg-blue-500" },
              { label: "Suggested", value: 65, color: "bg-green-500" },
              { label: "Other", value: 30, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-foreground/70">{item.label}</span>
                  <span className="text-[9px] md:text-[10px] font-black text-primary">{item.value}%</span>
                </div>
                <div className="h-1 md:h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className={cn("h-full rounded-full shadow-lg shadow-primary/10", item.color)} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Audit */}
      <Card className="bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-5 md:py-7">
          <CardTitle className="text-base md:text-lg font-bold">Performance Audit</CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Individual asset breakdown</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-6 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asset</th>
                  <th className="px-6 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Views</th>
                  <th className="px-6 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Reach</th>
                  <th className="px-6 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Retention</th>
                  <th className="px-6 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 md:py-32 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                          <Icons.barChart className="h-10 w-10 md:h-12 md:w-12" />
                          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">No performance data found</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="h-10 w-16 md:h-14 md:w-24 rounded-xl bg-muted border border-border shrink-0 shadow-inner overflow-hidden relative">
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Icons.video className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground/30" />
                             </div>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-foreground line-clamp-1 max-w-[200px] md:max-w-[400px] group-hover:text-primary transition-colors">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-xs md:text-base font-black text-center tabular-nums">{video.views}</td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                          <span className="text-[9px] md:text-[10px] font-black text-primary leading-none">{video.reach}</span>
                          <div className="w-16 md:w-24 h-1 md:h-1.5 bg-muted rounded-full overflow-hidden border border-border/30">
                            <div className="h-full bg-primary shadow-lg shadow-primary/20" style={{ width: video.reach }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                         <div className="flex flex-col items-center gap-1 md:gap-2">
                            <span className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest">{video.retention}</span>
                            <div className="flex items-center gap-1">
                               <Icons.trendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                               <span className="text-[7px] md:text-[8px] font-bold text-muted-foreground/40 uppercase">Steady</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                        <Button variant="ghost" size="sm" className="font-black text-[9px] md:text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl px-4 md:px-8 h-9 md:h-11 transition-all border border-transparent hover:border-primary/20">
                          Report
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
