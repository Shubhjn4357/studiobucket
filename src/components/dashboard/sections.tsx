import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Analytics } from "@/components/dashboard/analytics"
import { QueueStatus } from "@/components/dashboard/queue-status"
import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"

const videoService = new VideoService()

interface VideoWithStats {
  id: string
  title: string
  description: string | null
  thumbnailPath: string | null
  duration: number | null
  createdAt: number
  status: string
  views: number
  likes: number
}

export async function LatestVideoSection({ userId }: { userId: string }) {
  const videos = await videoService.getUserVideos(userId, undefined, undefined, 1) as unknown as VideoWithStats[]
  const video = videos[0]

  if (!video) return null

  return (
    <Card className="border-border bg-card/50 overflow-hidden cyber-card group">
      <div className="flex flex-col md:flex-row p-5 gap-8">
        <div className="w-full md:w-[360px] aspect-video rounded-2xl bg-slate-900 relative group/thumb overflow-hidden shrink-0 border border-white/5 shadow-2xl">
           {video.thumbnailPath ? (
             <img src={video.thumbnailPath} className="h-full w-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                <Icons.video className="h-12 w-12 text-muted-foreground/10" />
             </div>
           )}
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <Link href={`/dashboard/studio?id=${video.id}`}>
                <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest px-8 shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                  Launch Studio
                </Button>
              </Link>
           </div>
           {video.duration && (
             <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-white border border-white/10">
               {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">System Live</span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(video.createdAt).toLocaleDateString()}</span>
             </div>
             <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">{video.title}</h3>
             <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-70">{video.description || "No transmission data available for this sector."}</p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-white/5">
             <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Signal Reach</span>
                <span className="text-xl font-black text-foreground italic">{video.views?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Affirmations</span>
                <span className="text-xl font-black text-foreground italic">{video.likes?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</span>
                <span className={cn(
                  "text-xl font-black italic uppercase",
                  video.status === "published" ? "text-emerald-500" : "text-amber-500"
                )}>{video.status}</span>
             </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export async function AnalyticsSection({ userId }: { userId: string }) {
  const analyticsData = await videoService.getAnalyticsData(userId)
  return <Analytics initialData={analyticsData} />
}

export async function QueueSection({ userId }: { userId: string }) {
  const queueData = await videoService.getQueueStatus(userId)
  const activeJobs = await videoService.getActiveJobs(userId)
  return <QueueStatus initialData={queueData} activeJobs={activeJobs} />
}

export async function InsightsSection({ userId }: { userId: string }) {
  const insights = await videoService.getChannelInsights(userId)
  
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Icons.lightbulb className="h-4 w-4 text-amber-500" />
          Channel Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-2">Gathering data for analysis...</p>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
              <h4 className="text-xs font-bold mb-1">{insight.title}</h4>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
