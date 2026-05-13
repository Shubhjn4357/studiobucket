"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

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
    <PageContainer>
      <PageHeader 
        title="Analytics" 
        description="Monitor real-time performance telemetry and audience engagement vectors." 
        iconName="barChart"
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-bold rounded-xl h-11 px-5 border-border hover:bg-muted transition-all">
            <Icons.download className="h-4 w-4 mr-2 text-muted-foreground" />
            Export Telemetry
          </Button>
          <Button size="sm" className="font-bold rounded-xl h-11 px-8 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            Sync Data
          </Button>
        </div>
      </PageHeader>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-card border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                <div className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5",
                  metric.trending === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {metric.trending === "up" ? <Icons.arrowUp className="h-3 w-3" /> : <Icons.arrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-4xl font-black text-foreground tracking-tighter italic uppercase">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/10 px-8 py-5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Historical Flux (7D)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-end gap-4 pb-8 px-8 pt-16">
            {dailyStats.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground opacity-30">
                <Icons.barChart className="h-10 w-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Telemetry Stream Detected</p>
              </div>
            ) : (
              dailyStats.map((stat, i) => {
                const maxViews = Math.max(...dailyStats.map(s => Number(s.views || 0)), 10)
                const height = ((Number(stat.views || 0)) / maxViews) * 100
                const day = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="w-full h-full flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 8)}%` }}
                        className="w-full bg-primary/10 hover:bg-primary rounded-t-xl transition-all relative group/bar"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-foreground text-background text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-20">
                          {Number(stat.views || 0).toLocaleString()} UNITS
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{day[0]}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-card border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/10 px-8 py-5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Vector Retention</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {[
              { label: "Direct Ingress", value: 85, color: "bg-primary" },
              { label: "Neural Search", value: 45, color: "bg-blue-500" },
              { label: "Algorithmic Suggest", value: 65, color: "bg-green-500" },
              { label: "Other Streams", value: 30, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground">{item.label}</span>
                  <span className="text-[10px] font-black text-primary">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className={cn("h-full rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]", item.color)} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos Table */}
      <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10 px-8 py-5">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Asset Performance Audit</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Video Asset</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Engagement</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Reach Vector</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Retention</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No Audit Data Available</p>
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-16 rounded-xl bg-muted border border-border shrink-0 shadow-inner" />
                          <span className="text-sm font-bold text-foreground line-clamp-1 max-w-[240px] group-hover:text-primary transition-colors">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-center italic">{video.views}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-black text-primary italic">{video.reach}</span>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: video.reach }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-green-500 text-center uppercase tracking-tighter">{video.retention} Retention</td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl px-4 h-9">
                          Audit Log
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
    </PageContainer>
  )
}
