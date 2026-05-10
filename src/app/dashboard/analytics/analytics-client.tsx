"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Intelligence</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Advanced Content Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white transition-all">
            Export Intel
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            Rescan Fleet
          </Button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="cyber-card border-white/5 bg-slate-950/40 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{metric.label}</p>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border",
                  metric.trending === "up" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {metric.trending === "up" ? <Icons.arrowUp className="h-3 w-3" /> : <Icons.arrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-4xl font-black text-white tracking-tighter italic">{metric.value}</p>
            </CardContent>
            <div className="h-1 bg-white/5 relative overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "absolute inset-0 bg-linear-to-r",
                  metric.trending === "up" ? "from-emerald-500/50 to-transparent" : "from-primary/50 to-transparent"
                )}
                style={{ width: '60%' }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 cyber-card border-white/5 bg-slate-950/40">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">Operational Trajectory</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-end gap-3 pb-8 px-8 pt-12">
            {dailyStats.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No trajectory data available</p>
              </div>
            ) : (
              dailyStats.map((stat, i) => {
                const maxViews = Math.max(...dailyStats.map(s => Number(s.views || 0)), 10)
                const height = ((Number(stat.views || 0)) / maxViews) * 100
                const day = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })[0]
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: i * 0.05, duration: 0.8, ease: "backOut" }}
                      className="w-full bg-linear-to-t from-primary to-accent rounded-t-xl transition-all duration-300 group-hover:brightness-125 relative shadow-lg shadow-primary/10"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-white text-black text-[9px] font-black px-2 py-1 rounded-lg shadow-2xl whitespace-nowrap translate-y-2 group-hover:translate-y-0">
                        {Number(stat.views || 0).toLocaleString()} UNITS
                      </div>
                    </motion.div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{day}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 cyber-card border-white/5 bg-slate-950/40">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">Unit Retention</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {[
              { label: "High-Bitrate", value: 85, color: "bg-primary" },
              { label: "Vertical Core", value: 45, color: "bg-accent" },
              { label: "Live Uplink", value: 65, color: "bg-emerald-500" },
              { label: "Legacy Codec", value: 30, color: "bg-slate-700" },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-black text-primary italic">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-lg shadow-current", item.color)} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Video Performance Table */}
      <Card className="cyber-card border-white/5 bg-slate-950/40 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white italic">Mission Log • Recent Assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Ident</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Telemetry</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Reach</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Stability</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No asset data recorded</p>
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-16 rounded-lg bg-slate-900 border border-white/5 flex-shrink-0 group-hover:border-primary/30 transition-all" />
                          <span className="text-[11px] font-black text-white uppercase italic tracking-tight truncate max-w-[240px]">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-white text-center italic">{video.views} UNITS</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-black text-primary italic">{video.reach}</span>
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-primary" style={{ width: video.reach }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-emerald-500 text-center italic">{video.retention}</td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                          ANALYZE
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
