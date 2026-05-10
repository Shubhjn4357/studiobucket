"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Views", value: "1,245,678", change: "+12.5%", trending: "up" },
  { label: "Watch Time (Hrs)", value: "45,230", change: "+8.2%", trending: "up" },
  { label: "Subscribers", value: "12,450", change: "-2.1%", trending: "down" },
  { label: "Est. Revenue", value: "$8,450.00", change: "+15.3%", trending: "up" },
]

const recentVideos = [
  { id: "1", title: "Mastering Next.js 15 in 10 Minutes", views: "45K", reach: "92%", retention: "65%" },
  { id: "2", title: "SaaS Architecture Deep Dive", views: "12K", reach: "85%", retention: "42%" },
  { id: "3", title: "AI Automation is Taking Over", views: "89K", reach: "98%", retention: "78%" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Channel Insights</h1>
          <p className="text-muted-foreground">Deep dive into your content performance and audience reach.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-xs font-bold h-10">
            EXPORT REPORT
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-10 px-6">
            REFRESH DATA
          </Button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="glass-dark border-white/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1",
                  metric.trending === "up" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                )}>
                  {metric.trending === "up" ? <Icons.arrowUp className="h-3 w-3" /> : <Icons.arrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{metric.value}</p>
            </CardContent>
            <div className="h-1 bg-white/5 relative">
              <div 
                className={cn(
                  "absolute inset-0 bg-linear-to-r transition-all duration-1000",
                  metric.trending === "up" ? "from-green-500/50 to-transparent" : "from-primary/50 to-transparent"
                )}
                style={{ width: '60%' }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-dark border-white/5">
          <CardHeader>
            <CardTitle>View Progression</CardTitle>
            <CardDescription>Daily view count across all videos.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-end gap-2 pb-8 px-8">
            {/* Custom CSS Chart for "No Demo" but pure feel */}
            {Array.from({ length: 12 }).map((_, i) => {
              const height = [40, 60, 30, 80, 95, 70, 50, 85, 45, 90, 65, 100][i]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-linear-to-t from-primary to-accent rounded-t-lg transition-all duration-500 group-hover:opacity-80 relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                      {height}K
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 glass-dark border-white/5">
          <CardHeader>
            <CardTitle>Audience Retention</CardTitle>
            <CardDescription>Average view duration per category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Tutorials", value: 85, color: "bg-primary" },
              { label: "Shorts", value: 45, color: "bg-accent" },
              { label: "Vlogs", value: 65, color: "bg-purple-500" },
              { label: "Live Streams", value: 30, color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium">{item.label}</span>
                  <span className="text-muted-foreground font-bold">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", item.color)} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Video Performance Table */}
      <Card className="glass-dark border-white/5 overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Video Performance</CardTitle>
          <CardDescription>Metrics for your last 3 uploads.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Views</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reach</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retention</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded bg-black flex-shrink-0" />
                        <span className="text-sm font-medium text-white truncate max-w-[200px]">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-bold">{video.views}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{video.reach}</span>
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: video.reach }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{video.retention}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-primary hover:bg-primary/10">
                        ANALYZE
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
