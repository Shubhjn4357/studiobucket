"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"

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
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <PageHeader 
        title="Video Analytics" 
        description="Track your channel growth and video performance in real-time." 
        icon={Icons.barChart}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="font-bold rounded-xl h-10">
            <Icons.download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm" className="font-bold rounded-xl h-10 px-6 shadow-md transition-all">
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-card border-border shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1",
                  metric.trending === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {metric.trending === "up" ? <Icons.arrowUp className="h-3 w-3" /> : <Icons.arrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Viewing Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-end gap-3 pb-8 px-8 pt-12">
            {dailyStats.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm font-bold text-muted-foreground">No data available yet</p>
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
                        animate={{ height: `${Math.max(height, 5)}%` }}
                        className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all relative group/bar"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {Number(stat.views || 0).toLocaleString()} Views
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{day[0]}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Audience Retention</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { label: "Direct", value: 85, color: "bg-primary" },
              { label: "Search", value: 45, color: "bg-blue-500" },
              { label: "Suggested", value: 65, color: "bg-green-500" },
              { label: "Other", value: 30, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">{item.label}</span>
                  <span className="text-xs font-bold text-primary">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className={cn("h-full rounded-full", item.color)} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos Table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Recent Video Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/10 border-b border-border">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Video</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Views</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Reach</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Retention</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <p className="text-sm font-bold text-muted-foreground">No video data found</p>
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-16 rounded-lg bg-muted border border-border shrink-0" />
                          <span className="text-sm font-bold text-foreground line-clamp-1 max-w-[240px]">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-center">{video.views}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-primary">{video.reach}</span>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: video.reach }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-green-500 text-center">{video.retention}</td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-xs text-primary hover:bg-primary/10">
                          View Details
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
